import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import HandController from "./components/HandController";

const ROUND_DURATION = 60;
const SABER_COLORS = ["#ff3158", "#26f6e8", "#ffd447"];

function NeonSaber({ position }: { position: [number, number, number] }) {
  const saberRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (saberRef.current) {
      saberRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 5) * 0.08;
    }
  });

  return (
    <group ref={saberRef} position={position}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.4, 16]} />
        <meshStandardMaterial
          color="#26f6e8"
          emissive="#26f6e8"
          emissiveIntensity={5}
        />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

interface Block {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
}

function createBlock(id: number, z: number): Block {
  return {
    id,
    x: (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.7),
    y: 0.8 + Math.random() * 1.5,
    z,
    color: SABER_COLORS[Math.floor(Math.random() * SABER_COLORS.length)],
  };
}

function BlocksManager({
  isPlaying,
  saberPosition,
  onBlockHit,
  onBlockMiss,
}: {
  isPlaying: boolean;
  saberPosition: [number, number, number];
  onBlockHit: () => void;
  onBlockMiss: () => void;
}) {
  const meshes = useRef<Array<THREE.Mesh | null>>([]);
  const blocks = useRef([
    createBlock(1, -7),
    createBlock(2, -11),
    createBlock(3, -15),
    createBlock(4, -19),
  ]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    blocks.current.forEach((block, index) => {
      const mesh = meshes.current[index];
      if (!mesh) return;

      block.z += delta * 4.5;
      mesh.position.set(block.x, block.y, block.z);

      if (block.z >= -0.25 && block.z <= 0.35) {
        const withinBladeWidth = Math.abs(block.x - saberPosition[0]) < 0.72;
        const withinBladeHeight =
          block.y >= saberPosition[1] - 0.25 &&
          block.y <= saberPosition[1] + 2.1;

        if (withinBladeWidth && withinBladeHeight) {
          onBlockHit();
          Object.assign(block, createBlock(block.id, -20 - Math.random() * 5));
        }
      }

      if (block.z > 2.5) {
        onBlockMiss();
        Object.assign(block, createBlock(block.id, -20 - Math.random() * 5));
      }
    });
  });

  return (
    <group>
      {blocks.current.map((block, index) => (
        <mesh
          key={block.id}
          ref={(mesh) => {
            meshes.current[index] = mesh;
          }}
          position={[block.x, block.y, block.z]}
        >
          <boxGeometry args={[0.82, 0.82, 0.82]} />
          <meshStandardMaterial
            color={block.color}
            emissive={block.color}
            emissiveIntensity={2.5}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function App() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">(
    "ready",
  );
  const [saberPosition, setSaberPosition] = useState<[number, number, number]>([
    0, 1, 0,
  ]);
  const [roundId, setRoundId] = useState(0);
  const deadline = useRef(0);

  const handleHandMove = useCallback((x: number, y: number) => {
    const nextPosition: [number, number, number] = [x * 2.5, y * 1.5 + 1.5, 0];
    setSaberPosition((current) =>
      Math.abs(current[0] - nextPosition[0]) < 0.025 &&
      Math.abs(current[1] - nextPosition[1]) < 0.025
        ? current
        : nextPosition,
    );
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setCombo(0);
    setTimeLeft(ROUND_DURATION);
    setRoundId((current) => current + 1);
    deadline.current = Date.now() + ROUND_DURATION * 1000;
    setGameState("playing");
  }, []);

  const handleBlockHit = useCallback(() => {
    setScore((current) => current + 100);
    setCombo((current) => current + 1);
  }, []);

  const handleBlockMiss = useCallback(() => setCombo(0), []);

  useEffect(() => {
    if (gameState !== "playing") return;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
      if (remaining === 0) setGameState("finished");
    };
    const timer = window.setInterval(updateTimer, 200);
    return () => window.clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && gameState !== "playing") {
        event.preventDefault();
        startGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, startGame]);

  const overlayVisible = gameState !== "playing";

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#020509",
        color: "#f4fbff",
      }}
    >
      <Canvas camera={{ position: [0, 1.5, 4], fov: 75 }}>
        <color attach="background" args={["#020509"]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[0, 5, 2]} intensity={2} color="#26f6e8" />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <gridHelper
          args={[40, 40, "#ff3158", "#15525b"]}
          position={[0, -0.35, -5]}
        />
        <NeonSaber position={saberPosition} />
        <BlocksManager
          key={roundId}
          isPlaying={gameState === "playing"}
          saberPosition={saberPosition}
          onBlockHit={handleBlockHit}
          onBlockMiss={handleBlockMiss}
        />
      </Canvas>

      <header
        style={{
          position: "absolute",
          inset: "22px 24px auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          pointerEvents: "none",
          fontFamily: "monospace",
          textShadow: "0 0 14px #26f6e8",
        }}
      >
        <div>
          <div style={{ color: "#26f6e8", fontSize: 13, letterSpacing: 2 }}>
            CYBER / SABER
          </div>
          <div style={{ marginTop: 8, fontSize: 28 }}>
            {score.toLocaleString()}{" "}
            <span style={{ color: "#91a6ad", fontSize: 11 }}>PTS</span>
          </div>
          <div style={{ color: "#ff6580", fontSize: 12 }}>COMBO {combo}</div>
        </div>
        <div
          style={{
            color: timeLeft <= 10 ? "#ff6580" : "#f4fbff",
            fontSize: 22,
          }}
        >
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </div>
      </header>

      <HandController onHandMove={handleHandMove} />

      {overlayVisible && (
        <section
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 24,
            background: "rgba(2, 5, 9, 0.42)",
          }}
        >
          <div
            style={{
              width: "min(420px, 100%)",
              padding: "32px 28px",
              border: "1px solid rgba(38, 246, 232, 0.45)",
              background: "rgba(5, 15, 21, 0.94)",
              boxShadow: "0 0 48px rgba(38, 246, 232, 0.12)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#ff6580",
                font: "12px monospace",
                letterSpacing: 2,
              }}
            >
              NEON ARENA // 01
            </div>
            <h1
              style={{
                margin: "12px 0 8px",
                color: "#26f6e8",
                font: "700 32px monospace",
              }}
            >
              {gameState === "finished" ? "SESI SELESAI" : "CYBER SABER"}
            </h1>
            <p
              style={{ margin: "0 0 24px", color: "#a8bec5", lineHeight: 1.6 }}
            >
              {gameState === "finished"
                ? `Skor akhir ${score.toLocaleString()} poin dengan combo ${combo}.`
                : "Tebas kubus neon saat mendekat. Gerakkan tangan di depan kamera atau gunakan mouse."}
            </p>
            <button
              onClick={startGame}
              style={{
                minHeight: 48,
                padding: "0 24px",
                border: 0,
                background: "#26f6e8",
                color: "#041013",
                font: "700 14px monospace",
                cursor: "pointer",
              }}
            >
              {gameState === "finished" ? "MAIN LAGI" : "MULAI BERMAIN"}
            </button>
            <div
              style={{
                marginTop: 14,
                color: "#71878f",
                font: "11px monospace",
              }}
            >
              60 DETIK · SPACE UNTUK MULAI
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
