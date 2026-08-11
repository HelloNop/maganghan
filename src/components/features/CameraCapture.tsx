"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Camera, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  isSubmitting?: boolean;
}

export function CameraCapture({
  onCapture,
  isSubmitting = false,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean>(true); // Default ready
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        "Gagal mengakses kamera. Pastikan izin kamera telah diberikan di browser Anda."
      );
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");

    // Downscale / resize to max 800x800 WebP for efficiency
    const maxDim = 800;
    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Mirror image horizontally for front camera
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/webp", 0.85);
      setCapturedPhoto(dataUrl);
      onCapture(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div className="relative w-full aspect-[3/4] bg-black rounded-[32px] overflow-hidden shadow-xl border-4 border-white mb-6">
        {capturedPhoto ? (
          <img
            src={capturedPhoto}
            alt="Captured Selfie"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Face Oval Overlay Guide matching design screenshot */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <div
                className={`w-60 h-80 rounded-[50%] border-2 border-dashed transition-colors duration-300 ${
                  faceDetected ? "border-[#006761] bg-[#006761]/5" : "border-amber-400 bg-amber-500/10"
                }`}
              />
              <div className="absolute top-8 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                {faceDetected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Wajah terdeteksi</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Posisikan wajah di dalam lingkaran</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {cameraError && (
          <div className="absolute inset-0 bg-gray-900/95 p-6 text-center text-white flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
            <p className="text-sm mb-4">{cameraError}</p>
            <Button size="sm" onClick={startCamera}>
              Coba Lagi
            </Button>
          </div>
        )}
      </div>

      {!capturedPhoto ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-gray-500 text-center font-medium">
            Posisikan wajah Anda di dalam area lingkaran
          </p>
          <button
            type="button"
            onClick={handleTakeSnapshot}
            disabled={!faceDetected || isSubmitting || !!cameraError}
            className="w-16 h-16 rounded-full bg-[#006761] text-white flex items-center justify-center shadow-lg shadow-[#006761]/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
          >
            <Camera className="w-8 h-8" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleRetake}
            disabled={isSubmitting}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Foto Ulang
          </Button>
        </div>
      )}
    </div>
  );
}
