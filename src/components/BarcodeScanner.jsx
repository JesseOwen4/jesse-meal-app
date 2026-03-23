import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import T from "../theme";

export default function BarcodeScanner({ onDetected, onClose }) {
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [started, setStarted] = useState(false);
  const html5QrRef = useRef(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      const el = document.getElementById("barcode-reader");
      if (!el) { setError("Scanner container not found"); return; }

      const scanner = new Html5Qrcode("barcode-reader");
      html5QrRef.current = scanner;

      scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 120 },
        },
        (decodedText) => {
          if (detectedRef.current) return;
          // Accept any decoded text with enough digits
          const code = decodedText.replace(/\D/g, "");
          if (code.length >= 8) {
            detectedRef.current = true;
            scanner.stop().catch(() => {});
            onDetected(code);
          }
        },
        () => {}
      ).then(() => {
        setStarted(true);
      }).catch((err) => {
        console.error("Scanner error:", err);
        setError("Could not access camera. Enter barcode manually below.");
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (html5QrRef.current) {
        try { html5QrRef.current.stop(); } catch {}
        try { html5QrRef.current.clear(); } catch {}
      }
    };
  }, []);

  const handleClose = () => {
    if (html5QrRef.current) {
      try { html5QrRef.current.stop(); } catch {}
    }
    onClose();
  };

  const handleManual = () => {
    const code = manualCode.trim().replace(/\D/g, "");
    if (code.length >= 8) {
      if (html5QrRef.current) try { html5QrRef.current.stop(); } catch {}
      onDetected(code);
    } else {
      setError("Enter a valid barcode (at least 8 digits)");
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: T.bg, zIndex: 200,
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", background: T.surface,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 16, color: T.text }}>Scan Barcode</div>
        <button onClick={handleClose} style={{
          background: "none", border: "none", color: T.textDim, fontSize: 20, cursor: "pointer",
        }}>✕</button>
      </div>

      {/* Camera area — fixed height so html5-qrcode has real dimensions */}
      <div style={{
        width: "100%", height: 350, background: "#000",
        position: "relative", overflow: "hidden",
      }}>
        <div id="barcode-reader" style={{ width: "100%", height: "100%" }} />
        {!started && !error && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ color: T.textDim, fontSize: 14 }}>Starting camera...</div>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div style={{ padding: "20px", background: T.surface, flex: 1 }}>
        {!error && started && (
          <div style={{ fontSize: 13, color: T.green, textAlign: "center", marginBottom: 16 }}>
            📷 Camera active — point at a barcode
          </div>
        )}

        {error && (
          <div style={{ fontSize: 13, color: T.accent, textAlign: "center", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 12, color: T.textDim }}>or enter manually</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* Manual entry */}
        <div style={{ display: "flex", gap: 8 }}>
          <input value={manualCode} onChange={e => { setManualCode(e.target.value); setError(""); }}
            placeholder="Barcode number..."
            type="tel" inputMode="numeric"
            onKeyDown={e => e.key === "Enter" && handleManual()}
            style={{
              flex: 1, background: T.surfaceHigh, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "14px", color: T.text, fontSize: 16,
              fontFamily: "inherit", outline: "none", letterSpacing: 1,
            }} />
          <button onClick={handleManual} style={{
            padding: "14px 18px", borderRadius: 8,
            background: T.green, border: "none",
            color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>Look Up</button>
        </div>

        <div style={{ fontSize: 11, color: T.textDim, textAlign: "center", marginTop: 12 }}>
          The barcode number is printed below the barcode lines on the package
        </div>
      </div>
    </div>
  );
}
