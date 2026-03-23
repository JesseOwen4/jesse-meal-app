import { useState, useRef } from "react";
import T from "../theme";

export default function BarcodeScanner({ onDetected, onClose }) {
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef(null);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    setError("");

    // Compress and convert to base64
    const base64 = await new Promise(r => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxW = 1200;
          let w = img.width, h = img.height;
          if (w > maxW) { h = (maxW / w) * h; w = maxW; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          r(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    // Try native BarcodeDetector first (fast, no API call)
    if ("BarcodeDetector" in window) {
      try {
        const img = new Image();
        img.src = base64;
        await new Promise(r => { img.onload = r; });
        const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
        const barcodes = await detector.detect(img);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue.replace(/\D/g, "");
          if (code.length >= 8) {
            setProcessing(false);
            onDetected(code);
            return;
          }
        }
      } catch {}
    }

    // Fallback: send to Grok Vision
    try {
      const apiKey = import.meta.env.VITE_XAI_API_KEY;
      if (!apiKey) { setError("API key not configured"); setProcessing(false); return; }

      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "grok-2-vision-1212",
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: base64 } },
              { type: "text", text: "This is a photo of a product barcode. Read the numbers printed BELOW the barcode lines. These are typically 8-13 digits. Also check for any UPC, EAN, or SKU numbers on the packaging. Return ONLY the digits, nothing else. Example: 041420012345" }
            ]
          }],
        }),
      });

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content?.trim() || "";
      // Extract all digit sequences and find the longest one that's 8+ digits
      const digitGroups = raw.match(/\d{8,14}/g);

      if (digitGroups && digitGroups.length > 0) {
        // Use the longest match (most likely the full barcode)
        const code = digitGroups.sort((a, b) => b.length - a.length)[0];
        onDetected(code);
      } else {
        // Try just stripping all non-digits
        const allDigits = raw.replace(/\D/g, "");
        if (allDigits.length >= 8 && allDigits.length <= 14) {
          onDetected(allDigits);
        } else {
          setError("Couldn't read barcode. Try getting closer with good lighting, or enter the number manually.");
        }
      }
    } catch {
      setError("Failed to process. Try again or enter manually.");
    }
    setProcessing(false);
    e.target.value = "";
  };

  const handleManual = () => {
    const code = manualCode.trim().replace(/\D/g, "");
    if (code.length >= 8) {
      onDetected(code);
    } else {
      setError("Enter a valid barcode (at least 8 digits)");
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "#000a", zIndex: 200, display: "flex", alignItems: "flex-end",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: T.surface, borderRadius: "16px 16px 0 0",
        width: "100%", maxWidth: 480, margin: "0 auto", padding: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, color: T.text }}>Scan Barcode</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textDim, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Camera capture — uses iPhone's native camera */}
        <input ref={fileRef} type="file" accept="image/*" capture="environment"
          onChange={handlePhoto} style={{ display: "none" }} />

        <button onClick={() => fileRef.current?.click()} disabled={processing} style={{
          width: "100%", padding: "18px 0", borderRadius: 12, marginBottom: 12,
          background: T.accent, border: "none",
          color: "#fff", fontSize: 16, cursor: "pointer", fontFamily: "inherit",
          opacity: processing ? 0.6 : 1,
        }}>
          {processing ? "Reading barcode..." : "📷 Take Photo of Barcode"}
        </button>

        <div style={{ fontSize: 12, color: T.textDim, textAlign: "center", marginBottom: 16 }}>
          Get close to the barcode — make sure it's in focus
        </div>

        {error && (
          <div style={{ color: "#e05252", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{error}</div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 12, color: T.textDim }}>or type the number</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* Manual entry */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={manualCode} onChange={e => { setManualCode(e.target.value); setError(""); }}
            placeholder="e.g. 041420012345"
            type="tel" inputMode="numeric"
            onKeyDown={e => e.key === "Enter" && handleManual()}
            style={{
              flex: 1, background: T.surfaceHigh, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "14px", color: T.text, fontSize: 18,
              fontFamily: "inherit", outline: "none", letterSpacing: 2, textAlign: "center",
            }} />
          <button onClick={handleManual} style={{
            padding: "14px 18px", borderRadius: 8,
            background: T.green, border: "none",
            color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>Look Up</button>
        </div>

        <div style={{ fontSize: 11, color: T.textDim, textAlign: "center" }}>
          The number is printed below the barcode lines
        </div>
      </div>
    </div>
  );
}
