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

    // Convert to base64
    const base64 = await new Promise(r => {
      const reader = new FileReader();
      reader.onload = () => r(reader.result);
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
              { type: "text", text: "Find and read the barcode number in this image. Look for UPC, EAN, or other product barcodes. Return ONLY the numeric digits. If no barcode found, return NONE." }
            ]
          }],
        }),
      });

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content?.trim() || "";
      const code = raw.replace(/\D/g, "");

      if (code.length >= 8) {
        onDetected(code);
      } else {
        setError("Couldn't read barcode. Try a closer, well-lit photo or enter the number manually.");
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
