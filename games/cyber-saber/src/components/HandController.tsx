import React, { useEffect, useRef } from "react";

interface HandControllerProps {
  onHandMove?: (x: number, y: number) => void;
}

declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

export default function HandController({ onHandMove }: HandControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let camera: any = null;
    let hands: any = null;
    let isTrackingActive = false;

    // A. Inisialisasi MediaPipe Hands AI
    if (window.Hands && window.Camera && videoRef.current) {
      try {
        hands = new window.Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        hands.onResults((results: any) => {
          if (
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0
          ) {
            isTrackingActive = true;
            const landmarks = results.multiHandLandmarks[0];
            // Ambil koordinat ujung jari telunjuk (Landmark 8)
            const tip = landmarks[8];
            // Normalisasi ke rentang -1 sampai 1 (dibalik karena cermin webcam)
            const x = -(tip.x * 2 - 1);
            const y = -(tip.y * 2 - 1) + 0.5;
            if (onHandMove) {
              onHandMove(x, y);
            }
          }
        });

        camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 320,
          height: 240,
        });
        camera.start();
      } catch (e) {
        console.error("MediaPipe initialization error:", e);
      }
    }

    // B. Dual Fallback: Mouse Control (agar game tetap bisa dikendalikan jika AI butuh waktu load)
    const handleMouseMove = (e: MouseEvent) => {
      if (!isTrackingActive && onHandMove) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        onHandMove(x, y);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (camera) {
        try {
          camera.stop();
        } catch {}
      }
      if (hands) {
        try {
          hands.close();
        } catch {}
      }
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [onHandMove]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 160,
        height: 120,
        zIndex: 100,
        border: "2px solid #0ff",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#000",
        boxShadow: "0 0 15px rgba(0,255,255,0.5)",
      }}
    >
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
        }}
        playsInline
        muted
      />
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          color: "#0ff",
          fontSize: "9px",
          fontFamily: "monospace",
          background: "rgba(0,0,0,0.7)",
          padding: "2px 4px",
          borderRadius: "4px",
        }}
      >
        AI HAND TRACKING
      </div>
    </div>
  );
}
