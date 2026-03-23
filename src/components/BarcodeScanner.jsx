import { useState, useRef } from "react";
import T from "../theme";

// Decode barcode from an image using ZBar WASM (local, no API call)
async function decodeBarcode(imageFile) {
  // Load ZBar WASM dynamically
  const { scanImageData } = await import("@undecaf/zbar-wasm");

  // Load image into canvas to get ImageData
  const bitmap = await createImageBitmap(imageFile);
  const canvas = document.createElement("canvas");
  // Use a reasonable size — too large is slow, too small loses detail
  const maxW = 1400;
  let w = bitmap.width, h = bitmap.height;
  if (w > maxW) { h = Math.round((maxW / w) * h); w = maxW; }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  // Scan for barcodes
  const symbols = await scanImageData(imageData);

  if (symbols.length > 0) {
    // Return the first barcode found
    const code = symbols[0].decode();
    return code;
  }

  // Try again with higher contrast (helps with poor lighting)
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const val = avg > 128 ? 255 : 0; // threshold to pure black/white
    data[i] = data[i + 1] = data[i + 2] = val;
  }
  ctx.putImageData(imageData, 0, 0);
  const bwImageData = ctx.getImageData(0, 0, w, h);
  const bwSymbols = await scanImageData(bwImageData);

  if (bwSymbols.length > 0) {
    return bwSymbols[0].decode();
  }

  return null;
}

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

    try {
      const code = await decodeBarcode(file);
      if (code) {
        const digits = code.replace(/\D/g, "");
        if (digits.length >= 8) {
          onDetected(digits);
        } else {
          onDetected(code);
        }
      } else {
        setError("Couldn't read barcode. Try getting closer with good lighting, or enter the number below.");
      }
    } catch (err) {
      console.error("Barcode scan error:", err);
      setError("Failed to process image. Try again or enter the number manually.");
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
          {processing ? "⏳ Reading barcode..." : "📷 Take Photo of Barcode"}
        </button>

        <div style={{ fontSize: 12, color: T.textDim, textAlign: "center", marginBottom: 16 }}>
          Hold phone steady, get close, make sure barcode is in focus
        </div>

        {error && (
          <div style={{ color: "#e05252", fontSize: 13, textAlign: "center", marginBottom: 12, padding: "8px", background: "#e0525215", borderRadius: 8 }}>{error}</div>
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
          The number is printed below the barcode lines on the package
        </div>
      </div>
    </div>
  );
}
