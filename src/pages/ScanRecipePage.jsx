import { useState, useRef } from "react";
import T from "../theme";
import Icon from "../components/Icon";
import { supabase } from "../supabase";

export default function ScanRecipePage({ setTab, onSaveRecipe }) {
  const [pages, setPages] = useState([]); // array of { file, preview }
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState(null); // parsed recipe data
  const fileRef = useRef(null);

  const addPages = (e) => {
    const files = Array.from(e.target.files || []);
    const newPages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPages(prev => [...prev, ...newPages]);
    e.target.value = "";
  };

  const removePage = (idx) => {
    setPages(prev => prev.filter((_, i) => i !== idx));
  };

  const scanRecipe = async () => {
    if (pages.length === 0) return;
    setScanning(true);
    setError("");

    try {
      // Upload all pages to Supabase Storage
      const imageUrls = [];
      for (const page of pages) {
        const fileName = `recipes/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from("meal-photos")
          .upload(fileName, page.file, { contentType: page.file.type });

        if (uploadErr) throw new Error("Failed to upload image");

        const { data: { publicUrl } } = supabase.storage
          .from("meal-photos")
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // Call Grok Vision API
      const apiKey = import.meta.env.VITE_XAI_API_KEY;
      if (!apiKey) { setError("XAI API key not configured"); setScanning(false); return; }

      const content = [
        ...imageUrls.map(url => ({ type: "image_url", image_url: { url } })),
        {
          type: "text",
          text: `Extract this recipe from the image(s). If there are multiple pages, combine them into one recipe. Return ONLY valid JSON, no other text:
{
  "name": "recipe name",
  "category": "🍳 Breakfast|🎒 Portable Meals|⚡ Snacks & Sides|🥩 Dinner|🥗 Other",
  "macros": "estimated calories and protein if possible, e.g. 680 cal · 52g P, or empty string if unknown",
  "time": "estimated cook time, e.g. 15 min",
  "desc": "brief description of how to make it, 2-3 sentences",
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
  "tip": "optional cooking tip or empty string"
}`
        }
      ];

      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "grok-2-vision-1212",
          messages: [{ role: "user", content }],
        }),
      });

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const jsonStr = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

      try {
        const parsed = JSON.parse(jsonStr);
        setExtracted({
          name: parsed.name || "",
          category: parsed.category || "🥗 Other",
          macros: parsed.macros || "",
          time: parsed.time || "",
          desc: parsed.desc || "",
          ingredients: parsed.ingredients || [],
          tip: parsed.tip || "",
          notes: "",
        });
      } catch {
        setError("Could not parse recipe. Try a clearer photo.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    setScanning(false);
  };

  const updateField = (key, val) => setExtracted(prev => ({ ...prev, [key]: val }));
  const updateIngredient = (i, val) => {
    const next = [...extracted.ingredients];
    next[i] = val;
    updateField("ingredients", next);
  };
  const removeIngredient = (i) => updateField("ingredients", extracted.ingredients.filter((_, idx) => idx !== i));
  const addIngredient = () => updateField("ingredients", [...extracted.ingredients, ""]);

  const saveRecipe = async () => {
    if (!extracted?.name) return;
    const data = { ...extracted, ingredients: extracted.ingredients.filter(i => i.trim()) };
    const ok = await onSaveRecipe(data);
    if (ok) setTab("ideas");
  };

  const inputStyle = {
    width: "100%", background: T.surfaceHigh, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: 13,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 10, color: T.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => setTab("ideas")} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", padding: 4 }}>
          <Icon name="back" size={20} color={T.textDim} />
        </button>
        <div style={{ fontSize: 18, color: T.text }}>Scan Recipe</div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* If we haven't extracted yet, show capture UI */}
        {!extracted ? (
          <>
            <div style={{ fontSize: 12, color: T.textDim, marginBottom: 16 }}>
              Take photos or upload images of a recipe. Add multiple pages if needed.
            </div>

            {/* Page thumbnails */}
            {pages.length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                {pages.map((page, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={page.preview} alt={`Page ${i + 1}`} style={{
                      width: 80, height: 100, objectFit: "cover", borderRadius: 8,
                      border: `1px solid ${T.border}`,
                    }} />
                    <button onClick={() => removePage(i)} style={{
                      position: "absolute", top: -6, right: -6,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "#e05252", border: "none", color: "#fff",
                      fontSize: 12, cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                    <div style={{ fontSize: 10, color: T.textDim, textAlign: "center", marginTop: 4 }}>
                      Page {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Capture buttons */}
            <input ref={fileRef} type="file" accept="image/*" capture="environment"
              onChange={addPages} style={{ display: "none" }} />

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <button onClick={() => fileRef.current?.click()} style={{
                flex: 1, padding: "14px 0", borderRadius: 10,
                background: T.surface, border: `1px solid ${T.border}`,
                color: T.text, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>📷 Take Photo</button>

              <label style={{
                flex: 1, padding: "14px 0", borderRadius: 10,
                background: T.surface, border: `1px solid ${T.border}`,
                color: T.text, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                textAlign: "center",
              }}>
                📁 Upload
                <input type="file" accept="image/*" multiple onChange={addPages} style={{ display: "none" }} />
              </label>
            </div>

            {pages.length > 0 && (
              <button onClick={() => fileRef.current?.click()} style={{
                width: "100%", padding: "10px 0", background: "none",
                border: `1px dashed ${T.border}`, borderRadius: 8,
                color: T.textDim, fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: 16,
              }}>+ Add another page</button>
            )}

            {error && (
              <div style={{ color: "#e05252", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{error}</div>
            )}

            {pages.length > 0 && (
              <button onClick={scanRecipe} disabled={scanning} style={{
                width: "100%", padding: "16px 0", background: T.accent,
                border: "none", borderRadius: 10, color: "#fff",
                fontSize: 15, cursor: "pointer", fontFamily: "inherit",
                opacity: scanning ? 0.6 : 1,
              }}>
                {scanning ? "Scanning..." : `Scan ${pages.length} page${pages.length > 1 ? "s" : ""}`}
              </button>
            )}
          </>
        ) : (
          /* Review/Edit extracted recipe */
          <>
            <div style={{ fontSize: 12, color: T.green, marginBottom: 16 }}>
              ✓ Recipe extracted! Review and edit before saving.
            </div>

            <div style={labelStyle}>Name</div>
            <input value={extracted.name} onChange={e => updateField("name", e.target.value)}
              style={{ ...inputStyle, marginBottom: 12 }} />

            <div style={labelStyle}>Category</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {["🍳 Breakfast", "🎒 Portable Meals", "⚡ Snacks & Sides", "🥩 Dinner", "🥗 Other"].map(c => (
                <button key={c} onClick={() => updateField("category", c)} style={{
                  padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  background: extracted.category === c ? T.accent : T.surfaceHigh,
                  border: `1px solid ${extracted.category === c ? T.accent : T.border}`,
                  color: extracted.category === c ? "#fff" : T.textDim,
                }}>{c}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div>
                <div style={labelStyle}>Macros</div>
                <input value={extracted.macros} onChange={e => updateField("macros", e.target.value)}
                  placeholder="680 cal · 52g P" style={inputStyle} />
              </div>
              <div>
                <div style={labelStyle}>Cook Time</div>
                <input value={extracted.time} onChange={e => updateField("time", e.target.value)}
                  placeholder="15 min" style={inputStyle} />
              </div>
            </div>

            <div style={labelStyle}>Description</div>
            <textarea value={extracted.desc} onChange={e => updateField("desc", e.target.value)}
              rows={3} style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }} />

            <div style={labelStyle}>Ingredients</div>
            {extracted.ingredients.map((ing, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={ing} onChange={e => updateIngredient(i, e.target.value)}
                  style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => removeIngredient(i)} style={{
                  padding: "8px 12px", background: T.surfaceHigh, border: `1px solid ${T.border}`,
                  borderRadius: 8, color: T.textDim, cursor: "pointer", fontSize: 16,
                }}>✕</button>
              </div>
            ))}
            <button onClick={addIngredient} style={{
              width: "100%", padding: "10px 0", background: "none",
              border: `1px dashed ${T.border}`, borderRadius: 8,
              color: T.textDim, fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: 12,
            }}>+ Add ingredient</button>

            <div style={labelStyle}>Tip</div>
            <input value={extracted.tip} onChange={e => updateField("tip", e.target.value)}
              placeholder="Cooking tip..." style={{ ...inputStyle, marginBottom: 12 }} />

            <div style={labelStyle}>Notes</div>
            <textarea value={extracted.notes} onChange={e => updateField("notes", e.target.value)}
              placeholder="Personal notes..." rows={2}
              style={{ ...inputStyle, resize: "vertical", marginBottom: 16 }} />

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <button onClick={() => { setExtracted(null); setPages([]); }} style={{
                flex: 1, padding: "14px 0", borderRadius: 10,
                background: T.surfaceHigh, border: `1px solid ${T.border}`,
                color: T.textDim, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>Re-scan</button>
              <button onClick={saveRecipe} style={{
                flex: 2, padding: "14px 0", background: T.accent,
                border: "none", borderRadius: 10, color: "#fff",
                fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>Save Recipe</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
