import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import SceneErrorBoundary from "./SceneErrorBoundary";
import GlobeScene from "./GlobeScene";

const BUILD_DURATION = 1200;
const HOLD_DURATION = 1500;
const DISPERSE_DURATION = 900;
const FADE_DURATION = 250;
const TOTAL_DURATION =
  BUILD_DURATION + HOLD_DURATION + DISPERSE_DURATION + FADE_DURATION;
const SCENE_TIMEOUT = 12_000;

const easeOutCubic = (value) => 1 - (1 - value) ** 3;
const easeInCubic = (value) => value ** 3;
const clamp = (value) => Math.min(Math.max(value, 0), 1);

function SceneReady({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return null;
}

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [sceneReady, setSceneReady] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!sceneReady) return undefined;

    let frameId;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;

      if (elapsed < BUILD_DURATION) {
        setProgress(easeOutCubic(clamp(elapsed / BUILD_DURATION)));
      } else if (elapsed < BUILD_DURATION + HOLD_DURATION) {
        setProgress(1);
      } else if (elapsed < BUILD_DURATION + HOLD_DURATION + DISPERSE_DURATION) {
        const disperseElapsed = elapsed - BUILD_DURATION - HOLD_DURATION;
        setProgress(
          1 - easeInCubic(clamp(disperseElapsed / DISPERSE_DURATION)),
        );
      } else {
        setProgress(0);
        setOpacity(
          1 -
            clamp(
              (elapsed - BUILD_DURATION - HOLD_DURATION - DISPERSE_DURATION) /
                FADE_DURATION,
            ),
        );
      }

      if (elapsed < TOTAL_DURATION) {
        frameId = requestAnimationFrame(animate);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [onComplete, sceneReady]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSceneReady(true), SCENE_TIMEOUT);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div
      className="preloader"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#11161C",
        opacity,
        transition: "opacity 120ms linear",
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (completedRef.current) return;
          completedRef.current = true;
          onComplete?.();
        }}
        style={{
          background: "transparent",
          border: 0,
          color: "rgba(243, 240, 232, 0.72)",
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          padding: "16px",
          position: "absolute",
          right: "2vw",
          textTransform: "uppercase",
          top: "2vh",
          zIndex: 2,
        }}
      >
        Skip
      </button>

      <SceneErrorBoundary onError={() => setSceneReady(true)} fallback={null}>
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#11161C"]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={2} />

        <Suspense fallback={null}>
          <GlobeScene progress={progress} />
          <SceneReady onReady={() => setSceneReady(true)} />
        </Suspense>
      </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
