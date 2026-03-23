import { useEffect, useRef, useState } from "react";
import T from "../theme";

export default function BarcodeScanner({ onDetected, onClose }) {
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanningRef = useRef(true);

  // Start camera directly with getUserMedia
  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        if (mounted) setError("Could not access camera. Enter barcode manually below.");
      }
    }

    startCamera();

    return () => {
      mounted = false;
      scanningRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Periodically capture frames and send to BarcodeDetector API (if available)
  // or use html5-qrcode's static scan as fallback
  useEffect(() => {
    if (!cameraReady) return;

    // Check if browser has native BarcodeDetector
    const hasNative = "BarcodeDetector" in window;
    let detector = null;

    if (hasNative) {
      try {
        detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
      } catch {}
    }

    if (!detector) {
      // No native detector — fall back to manual only
      return;
    }

    const interval = setInterval(async () => {
      if (!scanningRef.current || !videoRef.current || !detector) return;

      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue.replace(/\D/g, "");
          if (code.length >= 8) {
            scanningRef.current = false;
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            onDetected(code);
          }
        }
      } catch {}
    }, 300);

    return () => clearInterval(interval);
  }, [cameraReady]);

  const handleClose = () => {
    scanningRef.current = false;
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    onClose();
  };

  const handleManual = () => {
    const code = manualCode.trim().replace(/\D/g, "");
    if (code.length >= 8) {
      scanningRef.current = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      onDetected(code);
    } else {
      setError("Enter a valid barcode (at least 8 digits)");
    }
  };

  // Capture frame and use Grok to read barcode
  const [capturing, setCapturing] = useState(false);
  const captureAndRead = async () => {
    if (!videoRef.current) return;
    setCapturing(true);
    setError("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

      const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.9));
      const base64 = await new Promise(r => {
        const reader = new FileReader();
        reader.onload = () => r(reader.result);
        reader.readAsDataURL(blob);
      });

      const apiKey = import.meta.env.VITE_XAI_API_KEY;
      if (!apiKey) { setError("API key not configured"); setCapturing(false); return; }

      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "grok-2-vision-1212",
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: base64 } },
              { type: "text", text: "Read the barcode number from this image. Return ONLY the numeric digits of the barcode, nothing else. If you cannot find or read a barcode, return exactly: NONE" }
            ]
          }],
        }),
      });

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content?.trim() || "";
      const code = raw.replace(/\D/g, "");

      if (code.length >= 8) {
        scanningRef.current = false;
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        onDetected(code);
      } else {
        setError("Couldn't read barcode. Try holding steadier or enter it manually.");
      }
    } catch {
      setError("Failed to read. Try again or enter manually.");
    }
    setCapturing(false);
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

      {/* Camera feed */}
      <div style={{ width: "100%", height: 300, background: "#000", position: "relative", overflow: "hidden" }}>
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Scanning guide overlay */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 260, height: 100,
          border: `2px solid ${T.accent}`,
          borderRadius: 8,
          pointerEvents: "none",
        }} />
        {!cameraReady && !error && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ color: T.textDim, fontSize: 14 }}>Starting camera...</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: "16px 20px", background: T.surface, flex: 1, overflowY: "auto" }}>
        {cameraReady && (
          <button onClick={captureAndRead} disabled={capturing} style={{
            width: "100%", padding: "14px 0", borderRadius: 10, marginBottom: 16,
            background: T.accent, border: "none",
            color: "#fff", fontSize: 15, cursor: "pointer", fontFamily: "inherit",
            opacity: capturing ? 0.6 : 1,
          }}>
            {capturing ? "Reading..." : "📸 Capture & Read Barcode"}
          </button>
        )}

        {error && (
          <div style={{ fontSize: 13, color: "#e05252", textAlign: "center", marginBottom: 12 }}>{error}</div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 12, color: T.textDim }}>or type it in</span>
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
      </div>
    </div>
  );
}
