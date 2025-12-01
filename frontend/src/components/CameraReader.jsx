import { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import { Camera, Scan, Loader2 } from "lucide-react";

export default function CameraReader({ onPlateDetected }) {
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⬆️ Activar cámara trasera en HD
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setStreaming(true);
    } catch (err) {
      alert("Error accediendo a la cámara");
      console.error(err);
    }
  };

  const capturePlate = async () => {
    if (!videoRef.current) return;

    setLoading(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");

    // 📸 Capturar la imagen original
    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // 📌 Recortar zona central (donde suele estar la matrícula)
    const cropHeight = canvas.height * 0.35;
    const cropY = canvas.height * 0.32;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = canvas.width;
    croppedCanvas.height = cropHeight;

    const cropCtx = croppedCanvas.getContext("2d");

    cropCtx.drawImage(
      canvas,
      0,
      cropY,
      canvas.width,
      cropHeight,
      0,
      0,
      canvas.width,
      cropHeight
    );

    // 🎚️ Mejorar contraste + blanco/negro
    let imgData = cropCtx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height);
    let d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];

      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const highContrast = gray > 130 ? 255 : 0; // binarizado simple

      d[i] = d[i + 1] = d[i + 2] = highContrast;
    }
    cropCtx.putImageData(imgData, 0, 0);

    // 🎯 OCR optimizado solo para placas
    const result = await Tesseract.recognize(
      croppedCanvas.toDataURL("image/png"),
      "eng",
      {
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        tessedit_pageseg_mode: 7
      }
    );

    let text = result.data.text.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    console.log("OCR:", text);

    if (text.length >= 6) {
      onPlateDetected(text);
    } else {
      alert("No se detectó una matrícula válida");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">

      {!streaming && (
        <button
          onClick={startCamera}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center gap-2"
        >
          <Camera size={20} />
          Encender cámara
        </button>
      )}

      <video
        ref={videoRef}
        className="w-full max-w-md rounded shadow border"
        style={{
          filter: "contrast(1.3) brightness(1.1)",
          imageRendering: "crisp-edges"
        }}
      />

      {streaming && (
        <button
          onClick={capturePlate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Scan size={20} />
              Leer matrícula
            </>
          )}
        </button>
      )}
    </div>
  );
}
