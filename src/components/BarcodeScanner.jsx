import { useState, useRef } from "react";
import T from "../theme";

export default function BarcodeScanner({ onDetected, onClose }) {
  const [manualCode, setManualCode] = useState("");
  const fileRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    setError("");

    try {
      // Use Grok Vision to read the barcode from the photo
      const apiKey = import.meta.env.VITE_XAI_API_KEY;
      if (!apiKey) { setError("API key not configured"); setProcessing(false); return; }

      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "grok-2-vision-1212",
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: base64 } },
              { type: "text", text: "Read the barcode number from this image. Return ONLY the numeric barcode digits, nothing else. If you can't read it, return 'NONE'." }
            ]
          }],
        }),
      });

      const data = await res.json();
      const code = data.choices?.[0]?.message?.content?.trim().replace(/\D/g, "");

      if (code && code.length >= 8) {
        onDetected(code);
      } else {
        setError("Couldn't read the barcode. Try again or enter it manually.");
      }
    } catch {
      setError("Failed to process image. Try entering the barcode manually.");
    }
    setProcessing(false);
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
      position: "fixed", inset: 0, background: "#000a", zIndex: 200,
      display: "flex", alignItems: "flex-end",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: T.surface, borderRadius: "16px 16px 0 0",
        width: "100%", maxWidth: 480, margin: "0 auto", padding: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, color: T.text }}>Scan Barcode</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textDim, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Camera capture */}
        <input ref={fileRef} type="file" accept="image/*" capture="environment"
          onChange={handlePhoto} style={{ display: "none" }} />

        <button onClick={() => fileRef.current?.click()} disabled={processing} style={{
          width: "100%", padding: "16px 0", borderRadius: 10, marginBottom: 12,
          background: T.accent, border: "none",
          color: "#fff", fontSize: 15, cursor: "pointer", fontFamily: "inherit",
          opacity: processing ? 0.6 : 1,
        }}>
          {processing ? "Reading barcode..." : "📷 Take Photo of Barcode"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 12, color: T.textDim }}>or type it in</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* Manual entry */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={manualCode} onChange={e => setManualCode(e.target.value)}
            placeholder="Enter barcode number..."
            type="tel" inputMode="numeric"
            onKeyDown={e => e.key === "Enter" && handleManual()}
            style={{
              flex: 1, background: T.surfaceHigh, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "12px 14px", color: T.text, fontSize: 15,
              fontFamily: "inherit", outline: "none",
            }} />
          <button onClick={handleManual} style={{
            padding: "12px 16px", borderRadius: 8,
            background: T.green, border: "none",
            color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>Look Up</button>
        </div>

        {error && (
          <div style={{ color: "#e05252", fontSize: 13, textAlign: "center", marginBottom: 8 }}>{error}</div>
        )}

        <div style={{ fontSize: 11, color: T.textDim, textAlign: "center" }}>
          The barcode number is usually printed below the barcode lines
        </div>
      </div>
    </div>
  );
}
