import { useEffect, useRef, useState } from "react";
import Quagga from "@ericblade/quagga2";
import T from "../theme";

export default function BarcodeScanner({ onDetected, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const detectedRef = useRef(false);

  useEffect(() => {
    if (!scannerRef.current) return;

    Quagga.init({
      inputStream: {
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      },
      decoder: {
        readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"],
      },
      locate: true,
    }, (err) => {
      if (err) {
        setError("Camera access denied or not available");
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      if (detectedRef.current) return;
      const code = result.codeResult?.code;
      if (code && code.length >= 8) {
        detectedRef.current = true;
        Quagga.stop();
        onDetected(code);
      }
    });

    return () => {
      try { Quagga.stop(); } catch {}
    };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000", zIndex: 200,
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", background: T.surface,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        zIndex: 10,
      }}>
        <div style={{ fontSize: 16, color: T.text }}>Scan Barcode</div>
        <button onClick={() => { try { Quagga.stop(); } catch {} onClose(); }} style={{
          background: "none", border: "none", color: T.textDim, fontSize: 20, cursor: "pointer",
        }}>✕</button>
      </div>

      {error ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ color: T.textDim, fontSize: 14, textAlign: "center" }}>
            {error}<br /><br />
            <button onClick={onClose} style={{
              padding: "10px 20px", background: T.accent, border: "none",
              borderRadius: 8, color: "#fff", fontSize: 14, cursor: "pointer",
            }}>Go Back</button>
          </div>
        </div>
      ) : (
        <>
          <div ref={scannerRef} style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {/* Quagga renders the video here */}
          </div>
          <div style={{ padding: "16px 20px", background: T.surface, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: T.textDim }}>Point camera at a barcode</div>
          </div>
        </>
      )}
    </div>
  );
}
