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
import SceneErrorBoundary from "./SceneErrorBoundary";
import { supportsWebGL } from "./webgl";
import Keychain2 from "./Keychain2";
import { isSoundEnabled, playScrollChime, setSoundEnabled as setSiteSoundEnabled } from "./audio";

const clamp = (value) => Math.min(Math.max(value, 0), 1);

function StoryCanvas({ progress }) {
  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight intensity={2.8} position={[4, 5, 6]} />
      <CharacterRig progress={progress} />
    </>
  );
}

function CharacterRig({ progress }) {
  const group = useRef();
  const firstModel = useRef();
  const firstIntro = useRef(0);
  const firstProgressRef = useRef(0);
  const { viewport } = useThree();
  const fitScale = Math.min(2.55, Math.max(1.2, viewport.width / 2.9));

  useFrame((state, delta) => {
    if (group.current) {
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
    }

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    firstIntro.current = reducedMotion
      ? 1
      : Math.min(1, firstIntro.current + delta / 1.2);

    if (firstModel.current) {
      const introEase = MathUtils.smoothstep(firstIntro.current, 0, 1);
      firstModel.current.scale.setScalar(MathUtils.lerp(1.65, 1, introEase));
    }

    if (firstIntro.current < 1) {
      firstProgressRef.current = MathUtils.lerp(
        0,
        0.45,
        MathUtils.smoothstep(firstIntro.current, 0, 1),
      );
    } else if (progress < 0.12) {
      firstProgressRef.current = 0.45;
    } else if (progress < 0.28) {
      firstProgressRef.current = MathUtils.mapLinear(progress, 0.12, 0.28, 0.45, 0);
    } else if (progress < 0.44) {
      firstProgressRef.current = MathUtils.mapLinear(progress, 0.28, 0.44, 0, 0.45);
    } else if (progress < 0.62) {
      firstProgressRef.current = MathUtils.mapLinear(progress, 0.44, 0.62, 0.45, 0);
    } else {
      firstProgressRef.current = 0;
    }
  });

  const secondProgress = MathUtils.clamp(
    MathUtils.mapLinear(progress, 0.62, 0.82, 0.49, 0.72),
    0,
    1,
  );

  return (
    <group ref={group} position={[1.15, 0.18, 0]} scale={fitScale}>
      <group ref={firstModel} visible={progress < 0.62}>
        <Keychain1 progressRef={firstProgressRef} spreadScale={0.075} />
      </group>
      <group visible={progress >= 0.62}>
        <Keychain2 progress={secondProgress} spreadScale={0.075} />
      </group>
    </group>
  );
}

function MobileModelRig({ Model, stageRef, progressRef }) {
  const group = useRef();
  const { viewport } = useThree();
  const fitScale = MathUtils.clamp(viewport.width * 0.42, 1.35, 1.8);

  useFrame((state, delta) => {
    const stage = stageRef.current;
    if (stage) {
      const bounds = stage.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visibleProgress = clamp(
        (viewportHeight * 0.7 - bounds.top) / (bounds.height + viewportHeight * 0.3),
      );
      progressRef.current = Model === Keychain1
        ? MathUtils.clamp(MathUtils.mapLinear(visibleProgress, 0.2, 0.65, 0.18, 0.42), 0, 1)
        : MathUtils.clamp(MathUtils.mapLinear(visibleProgress, 0.15, 0.7, 0.43, 0.75), 0, 1);
    }

    if (!group.current) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const idleTurn = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.45) * 0.11;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, idleTurn, 3, delta);
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.22) * 0.018,
      3,
      delta,
    );
  });

  return (
    <group ref={group} scale={fitScale} position={[0, 0, 0]}>
      <Model progressRef={progressRef} spreadScale={0.1} />
    </group>
  );
}

function MobileKeychainStage({ Model, label, webglAvailable }) {
  const stageRef = useRef(null);
  const progressRef = useRef(0);

  return (
    <div ref={stageRef} className="mobile-keychain-stage" role="img" aria-label={label}>
      {webglAvailable ? <SceneErrorBoundary fallback={<div className="model-fallback" role="note">3D view unavailable</div>}>
      <Canvas
        camera={{ fov: 42, position: [0, 0, 6.5] }}
        dpr={[1, 1.5]}
        fallback={<div className="scene-fallback" aria-hidden="true" />}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight intensity={2.8} position={[4, 5, 6]} />
        <Suspense fallback={null}>
          <MobileModelRig Model={Model} stageRef={stageRef} progressRef={progressRef} />
        </Suspense>
      </Canvas>
      </SceneErrorBoundary> : <div className="model-fallback" role="note">3D preview unavailable</div>}
    </div>
  );
}

function Navigation({ soundEnabled, onToggleSound }) {
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
        {isMenuOpen ? "Close" : "Menu"}
      </button>
      <nav
        id="primary-navigation"
        className={isMenuOpen ? "is-open" : ""}
        aria-label="Primary navigation"
      >
        <a href="#vision" onClick={closeMenu}>Story</a>
        <a href="#community" onClick={closeMenu}>Community</a>
        <a href="#docs" onClick={closeMenu}>How to buy</a>
      </nav>
      <div className="edition-nav-tools">
        <button
          className="edition-sound"
          type="button"
          aria-pressed={soundEnabled}
          onClick={onToggleSound}
        >
          Sound {soundEnabled ? "on" : "off"}
        </button>
        <a className="edition-cta" href="#docs" onClick={closeMenu}>
          Token details
        </a>
      </div>
    </header>
  );
}

export default function Background() {
  const stageRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isCompactViewport, setIsCompactViewport] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  const [webglAvailable] = useState(supportsWebGL);
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled);
  const soundEnabledRef = useRef(isSoundEnabled());
  const previousProgressRef = useRef(0);
  const playedSoundCuesRef = useRef({ reassembly: false, handoff: false });

  const toggleSound = () => {
    const nextEnabled = !soundEnabledRef.current;
    soundEnabledRef.current = nextEnabled;
    setSiteSoundEnabled(nextEnabled);
    setSoundEnabled(nextEnabled);
  };

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
      const nextProgress = travel > 0
        ? clamp((window.scrollY - stage.offsetTop) / travel)
        : 0;
      const previousProgress = previousProgressRef.current;
      setProgress(nextProgress);

      if (nextProgress > previousProgress && soundEnabledRef.current) {
        if (previousProgress < 0.28 && nextProgress >= 0.28 && !playedSoundCuesRef.current.reassembly) {
          playScrollChime([587.33, 783.99]);
          playedSoundCuesRef.current.reassembly = true;
        }
        if (previousProgress < 0.62 && nextProgress >= 0.62 && !playedSoundCuesRef.current.handoff) {
          playScrollChime([659.25, 880]);
          playedSoundCuesRef.current.handoff = true;
        }
      }
      previousProgressRef.current = nextProgress;
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
      <Navigation soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <div className="story-stage" ref={stageRef}>
        {webglAvailable && !isCompactViewport && (
          <div
            className="story-canvas story-canvas--hero"
            style={{
              "--wordmark-x": `${-20 * progress}vw`,
              "--wordmark-y": `${-22 * progress}vh`,
              "--wordmark-scale": 1 - 0.38 * progress,
              "--wordmark-opacity": Math.max(0, 0.87 * (1 - 1.25 * progress)),
            }}
            aria-hidden="true"
          >
            <SceneErrorBoundary fallback={<div className="scene-fallback" aria-hidden="true"/>}>
            <Canvas
              camera={{ fov: 48, position: [0, 0, 5.2] }}
              dpr={[1, 1.5]}
              fallback={<div className="scene-fallback" aria-hidden="true" />}
              gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
            >
              <Suspense fallback={null}>
                <StoryCanvas progress={progress} />
              </Suspense>
            </Canvas>
            </SceneErrorBoundary>
          </div>
        )}
        <main className="edition-story" aria-label="Rise story">
          <Hero mobileScene={isCompactViewport ? <MobileKeychainStage Model={Keychain1} label="Rise keychain assembling" webglAvailable={webglAvailable} /> : null} />
          <section className="edition-section content-section" id="vision">
            <Vision />
            {isCompactViewport && <MobileKeychainStage Model={Keychain2} label="Rise mascot assembling" webglAvailable={webglAvailable} />}
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
              Rise is a fan-made token inspired by NASA&apos;s Artemis II mascot. It has no affiliation with NASA, and nothing on this site is financial advice.
            </p>
            <div className="site-footer__links">
              <a href="https://t.me/risecoincto" rel="noreferrer" target="_blank">Telegram</a>
              <a href="https://x.com/risecoincto?s=21" rel="noreferrer" target="_blank">X</a>
              <a href="#docs">Token details</a>
              <code className="site-footer__contract">CpFJrfYq32Wae2Bt36hEAUwzdyT29WwVLpZmYDF7pump</code>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
