import React, { useState, useEffect, useRef } from "react";
import T from "../theme";
import Icon from "../components/Icon";
import { supabase } from "../supabase";

export default function ReceiptScanPage({ setTab, pantryActions }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [extractedItems, setExtractedItems] = useState(null);
  const [history, setHistory] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    supabase
      .from("price_history")
      .select("*")
      .order("date", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setHistory(data);
      });
  }, []);

  const scanReceipt = async (file) => {
    setScanning(true);
    setError(null);
    // Upload to Supabase Storage
    const fileName = `receipts/${Date.now()}-receipt.jpg`;
    const { data: uploadData } = await supabase.storage
      .from("meal-photos")
      .upload(fileName, file);
    const {
      data: { publicUrl },
    } = supabase.storage.from("meal-photos").getPublicUrl(fileName);

    // Call xAI Grok Vision
    const apiKey = import.meta.env.VITE_XAI_API_KEY;
    if (!apiKey) {
      setError("XAI API key not configured");
      setScanning(false);
      return;
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-vision-1212",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: publicUrl } },
              {
                type: "text",
                text: 'Extract every grocery item and its price from this receipt. Return ONLY valid JSON array: [{"name": "item name", "price": 0.00, "quantity": 1}]. No other text.',
              },
            ],
          },
        ],
      }),
    });

    const data = await res.json();
    // Parse the JSON from the response
    const content = data.choices?.[0]?.message?.content || "[]";
    try {
      const items = JSON.parse(
        content
          .replace(/```json?\n?/g, "")
          .replace(/```/g, "")
          .trim()
      );
      setExtractedItems(
        items.map((i) => ({ ...i, addToPantry: true }))
      );
    } catch {
      setError("Could not parse receipt. Try a clearer photo.");
    }
    setScanning(false);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) scanReceipt(file);
  };

  const updateItem = (idx, field, value) => {
    setExtractedItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (idx) => {
    setExtractedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!extractedItems || extractedItems.length === 0) return;
    const today = new Date().toISOString().split("T")[0];

    // Insert into price_history
    const historyRows = extractedItems.map((item) => ({
      name: item.name,
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      date: today,
    }));

    await supabase.from("price_history").insert(historyRows);

    // Add to pantry for checked items
    for (const item of extractedItems) {
      if (!item.addToPantry) continue;
      // Try to find existing pantry item
      const { data: existing } = await supabase
        .from("pantry")
        .select("*")
        .ilike("name", `%${item.name}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        const match = existing[0];
        await pantryActions.updateItem({
          ...match,
          quantity: (match.quantity || 0) + (parseInt(item.quantity) || 1),
        });
      } else {
        await pantryActions.addItem({
          name: item.name,
          quantity: parseInt(item.quantity) || 1,
          category: "Other",
        });
      }
    }

    // Refresh history
    const { data: freshHistory } = await supabase
      .from("price_history")
      .select("*")
      .order("date", { ascending: false })
      .limit(50);
    if (freshHistory) setHistory(freshHistory);

    setExtractedItems(null);
  };

  // Group history by date
  const groupedHistory = history.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 20px 10px",
          gap: 12,
        }}
      >
        <span
          onClick={() => setTab("more")}
          style={{ cursor: "pointer", fontSize: 22 }}
        >
          <Icon name="arrow-left" size={22} color={T.text} />
        </span>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          Receipt Scanner
        </h1>
      </div>

      {/* Scan button */}
      {!scanning && !extractedItems && (
        <div style={{ padding: "16px 20px" }}>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileRef}
            onChange={handleFile}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: 12,
              border: "none",
              background: T.accent,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Scan Receipt
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px 20px",
            color: "#e53935",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Processing state */}
      {scanning && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: T.textDim,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: `3px solid ${T.accent}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 14px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 15 }}>Analyzing receipt...</div>
        </div>
      )}

      {/* Review screen */}
      {extractedItems && (
        <div style={{ padding: "0 20px" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Review Items ({extractedItems.length})
          </div>

          {extractedItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 0",
                borderBottom: `1px solid ${T.border || "#333"}`,
              }}
            >
              <input
                type="checkbox"
                checked={item.addToPantry}
                onChange={(e) =>
                  updateItem(idx, "addToPantry", e.target.checked)
                }
                style={{ accentColor: T.accent }}
                title="Add to Pantry"
              />
              <input
                value={item.name}
                onChange={(e) => updateItem(idx, "name", e.target.value)}
                style={{
                  flex: 2,
                  background: T.card,
                  color: T.text,
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 8px",
                  fontSize: 13,
                }}
              />
              <input
                value={item.price}
                onChange={(e) => updateItem(idx, "price", e.target.value)}
                style={{
                  width: 60,
                  background: T.card,
                  color: T.text,
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 8px",
                  fontSize: 13,
                  textAlign: "right",
                }}
                placeholder="$"
              />
              <input
                value={item.quantity}
                onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                style={{
                  width: 40,
                  background: T.card,
                  color: T.text,
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 8px",
                  fontSize: 13,
                  textAlign: "center",
                }}
                placeholder="Qty"
              />
              <button
                onClick={() => removeItem(idx)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#e53935",
                  fontSize: 18,
                  cursor: "pointer",
                  padding: "0 4px",
                }}
              >
                x
              </button>
            </div>
          ))}

          <button
            onClick={handleSave}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              border: "none",
              background: T.accent,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              marginTop: 16,
            }}
          >
            Save
          </button>
        </div>
      )}

      {/* Price history */}
      {Object.keys(groupedHistory).length > 0 && (
        <div style={{ padding: "20px 20px 40px" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Price History
          </div>
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.textDim,
                  marginBottom: 6,
                }}
              >
                {date}
              </div>
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    fontSize: 13,
                  }}
                >
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span style={{ color: T.textDim }}>
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
