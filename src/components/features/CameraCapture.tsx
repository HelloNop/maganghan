"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import * as faceapi from "face-api.js";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  isSubmitting?: boolean;
  isOutsideRadius?: boolean;
}

export function CameraCapture({
  onCapture,
  isSubmitting = false,
  isOutsideRadius = false,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Load face-api tinyFaceDetector model
  useEffect(() => {
    let isMounted = true;
    async function loadModel() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        if (isMounted) setIsModelLoading(false);
      } catch (err) {
        console.error("Gagal memuat model deteksi wajah:", err);
        if (isMounted) setIsModelLoading(false);
      }
    }
    loadModel();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Real-time Face Detection Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (stream && videoRef.current && !capturedPhoto) {
      interval = setInterval(async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

        try {
          // 1. Coba browser native FaceDetector API (super cepat jika tersedia)
          if ("FaceDetector" in window) {
            const faceDetector = new (window as any).FaceDetector({
              fastMode: true,
              maxFaces: 1,
            });
            const faces = await faceDetector.detect(videoRef.current);
            setFaceDetected(faces.length > 0);
            return;
          }

          // 2. Fallback ke face-api.js tinyFaceDetector
          if (faceapi.nets.tinyFaceDetector.isLoaded) {
            const detection = await faceapi.detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.4,
              })
            );
            setFaceDetected(!!detection);
          } else {
            setFaceDetected(true);
          }
        } catch (e) {
          setFaceDetected(true);
        }
      }, 350);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stream, capturedPhoto]);

  const handleTakeSnapshot = () => {
    if (!videoRef.current || isOutsideRadius) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");

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

            {/* Face Oval Overlay Guide */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <div
                className={`w-60 h-80 rounded-[50%] border-2 border-dashed transition-colors duration-300 ${
                  isOutsideRadius
                    ? "border-rose-400 bg-rose-500/10"
                    : faceDetected
                    ? "border-[#006761] bg-[#006761]/5 shadow-[0_0_20px_rgba(0,103,97,0.2)]"
                    : "border-amber-400 bg-amber-500/10"
                }`}
              />
              <div className="absolute top-8 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-1.5 border border-white/10">
                {isOutsideRadius ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Di luar radius GPS kantor</span>
                  </>
                ) : isModelLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                    <span>Mengecek pendeteksi wajah...</span>
                  </>
                ) : faceDetected ? (
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
            {isOutsideRadius
              ? "Anda berada di luar radius kantor. Foto tidak dapat diambil."
              : faceDetected
              ? "Wajah pas di dalam lingkaran, silakan ambil foto"
              : "Posisikan wajah Anda di dalam area lingkaran"}
          </p>
          <button
            type="button"
            onClick={handleTakeSnapshot}
            disabled={!faceDetected || isSubmitting || !!cameraError || isOutsideRadius}
            className="w-16 h-16 rounded-full bg-[#006761] text-white flex items-center justify-center shadow-lg shadow-[#006761]/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
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
