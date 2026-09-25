import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { MathUtils } from "three";
import Community from "../ui/Community";
import Docs from "../ui/Docs";
import FAQ from "../ui/FAQ";
import Hero from "../ui/Hero";
import Impact from "../ui/Impact";
import Vision from "../ui/Vision";
import Keychain1 from "./Keychain1";
import Keychain2 from "./Keychain2";

const clamp = (value) => Math.min(Math.max(value, 0), 1);

function StoryCanvas({ progress }) {
  return (
    <>
      <ambientLight intensity={2.2} />
      <directionalLight intensity={3.5} position={[4, 5, 6]} />
      <pointLight
        color="#4A8FE3"
        distance={12}
        intensity={5}
        position={[2, -3, 3]}
      />
      <CharacterRig progress={progress} />
    </>
  );
}

function CharacterRig({ progress }) {
  const group = useRef();
  const { viewport } = useThree();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  const fitScale = isMobile
    ? 1.45
    : Math.min(2.55, Math.max(1.2, viewport.width / 2.9));
  const xOffset = isMobile ? 0.35 : 1.15;

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      state.pointer.x * 0.12,
      4,
      delta,
    );
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      -state.pointer.y * 0.06,
      4,
      delta,
    );
  });

  return (
    <group
      ref={group}
      position={[xOffset, isMobile ? 0.12 : 0.18, 0]}
      scale={fitScale}
    >
      <Keychain1 progress={progress} />
      <Keychain2 progress={progress} />
    </group>
  );
}

function MobileKeychainStage() {
  return (
    <div className="mobile-keychain-stage" aria-label="Rise mascot">
      <Canvas
        camera={{ fov: 48, position: [0, 0, 5.2] }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={2.2} />
        <directionalLight intensity={3.5} position={[4, 5, 6]} />
        <pointLight color="#4A8FE3" distance={12} intensity={5} position={[2, -3, 3]} />
        <Suspense fallback={null}>
          <group scale={1.7} position={[0, -0.05, 0]}>
            <Keychain2 forceVisible />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="edition-nav">
      <a className="edition-brand" href="#hero" onClick={closeMenu}>
        RISE
      </a>
      <button
        className="edition-menu"
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        Menu
      </button>
      <nav
        id="primary-navigation"
        className={isMenuOpen ? "is-open" : ""}
        aria-label="Primary navigation"
      >
        <a href="#vision" onClick={closeMenu}>
          Vision
        </a>
        <a href="#community" onClick={closeMenu}>
          Community
        </a>
        <a href="#docs" onClick={closeMenu}>
          Docs
        </a>
      </nav>
      <a className="edition-cta" href="#docs" onClick={closeMenu}>
        Token details
      </a>
    </header>
  );
}

export default function Background() {
  const stageRef = useRef();
  const [progress, setProgress] = useState(0);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsCompactViewport(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const travel = stage.offsetHeight - window.innerHeight;
      setProgress(
        travel > 0 ? clamp((window.scrollY - stage.offsetTop) / travel) : 0,
      );
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="edition-shell">
      <Navigation />
      <div className="story-stage" ref={stageRef}>
        <div
          className={`story-canvas ${progress < 0.12 ? "story-canvas--hero" : ""}`}
          aria-hidden="true"
        >
          <Canvas
            camera={{ fov: 48, position: [0, 0, 5.2] }}
            dpr={[1, 1.5]}
            fallback={<div className="scene-fallback" />}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
            }}
          >
            <Suspense fallback={null}>
              <StoryCanvas progress={progress} />
            </Suspense>
          </Canvas>
        </div>
        <main className="edition-story" aria-label="Rise story">
          <Hero />
          <section className="edition-section content-section" id="vision">
            <Vision />
            {isCompactViewport && <MobileKeychainStage />}
          </section>
          <section className="edition-section content-section" id="impact">
            <Impact />
          </section>
          <section className="edition-section content-section" id="community">
            <h2>Community</h2>
            <Community />
          </section>
          <section className="edition-section content-section" id="docs">
            <Docs />
          </section>
          <FAQ />
          <footer className="site-footer">
            <p>
              Rise is a fan-made token inspired by NASA&apos;s Artemis II
              mascot. It has no affiliation with NASA, and nothing on this site
              is financial advice.
            </p>
            <div>
              <a
                href="https://t.me/risecoincto"
                rel="noreferrer"
                target="_blank"
              >
                Telegram
              </a>
              <a
                href="https://x.com/risecoincto?s=21"
                rel="noreferrer"
                target="_blank"
              >
                X
              </a>
              <code>CpFJrfYq32Wae2Bt36hEAUwzdyT29WwVLpZmYDF7pump</code>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
