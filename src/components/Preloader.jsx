import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import GlobeScene from "./GlobeScene";

const BUILD_DURATION = 1800;
const HOLD_DURATION = 700;
const DISPERSE_DURATION = 1500;
const FADE_DURATION = 350;
const TOTAL_DURATION =
  BUILD_DURATION + HOLD_DURATION + DISPERSE_DURATION + FADE_DURATION;

const easeOutCubic = (value) => 1 - (1 - value) ** 3;
const easeInCubic = (value) => value ** 3;
const clamp = (value) => Math.min(Math.max(value, 0), 1);

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const completedRef = useRef(false);

  useEffect(() => {
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
        setProgress(1 - easeInCubic(clamp(disperseElapsed / DISPERSE_DURATION)));
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
  }, [onComplete]);

  return (
    <div
      className="preloader"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#050508",
        opacity,
        transition: "opacity 120ms linear",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#050508"]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={2} />

        <Suspense fallback={null}>
          <GlobeScene progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
