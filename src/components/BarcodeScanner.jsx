import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import T from "../theme";

export default function BarcodeScanner({ onDetected, onClose }) {
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    const scannerId = "barcode-reader";
    let scanner = null;

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode(scannerId);
        html5QrRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (detectedRef.current) return;
            const code = decodedText.replace(/\D/g, "");
            if (code.length >= 8) {
              detectedRef.current = true;
              scanner.stop().catch(() => {});
              onDetected(code);
            }
          },
          () => {} // ignore errors during scanning
        );
      } catch (err) {
        setError("Camera access denied. You can enter the barcode manually below.");
      }
    };

    startScanner();

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
        html5QrRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const handleClose = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
    }
    onClose();
  };

  const handleManual = () => {
    const code = manualCode.trim().replace(/\D/g, "");
    if (code.length >= 8) {
      if (html5QrRef.current) html5QrRef.current.stop().catch(() => {});
      onDetected(code);
    } else {
      setError("Enter a valid barcode (at least 8 digits)");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: T.bg, zIndex: 200,
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", background: T.surface,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 16, color: T.text }}>Scan Barcode</div>
        <button onClick={handleClose} style={{
          background: "none", border: "none", color: T.textDim, fontSize: 20, cursor: "pointer",
        }}>✕</button>
      </div>

      {/* Camera view */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div id="barcode-reader" style={{
          width: "100%", flex: 1,
        }} />
      </div>

      {/* Bottom panel */}
      <div style={{ padding: "16px 20px", background: T.surface, flexShrink: 0 }}>
        {!error && (
          <div style={{ fontSize: 13, color: T.textDim, textAlign: "center", marginBottom: 12 }}>
            Point camera at a barcode
          </div>
        )}

        {error && (
          <div style={{ fontSize: 13, color: T.accent, textAlign: "center", marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* Manual fallback */}
        <div style={{ display: "flex", gap: 8 }}>
          <input value={manualCode} onChange={e => { setManualCode(e.target.value); setError(""); }}
            placeholder="Or type barcode number..."
            type="tel" inputMode="numeric"
            onKeyDown={e => e.key === "Enter" && handleManual()}
            style={{
              flex: 1, background: T.surfaceHigh, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "12px", color: T.text, fontSize: 14,
              fontFamily: "inherit", outline: "none",
            }} />
          <button onClick={handleManual} style={{
            padding: "12px 16px", borderRadius: 8,
            background: T.green, border: "none",
            color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>Look Up</button>
        </div>
      </div>
    </div>
  );
}
