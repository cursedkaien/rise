import { useState } from "react";
import Preloader from "./components/Preloader";
import Background from "./components/Background";
import { supportsWebGL } from "./components/webgl";
import "./edition.css";

const shouldPlayPreloader = () => {
  if (typeof window === "undefined") return false;

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;

  if (!supportsWebGL()) return false;

  // Replay the sequence during review with: ?preloader
  if (new URLSearchParams(window.location.search).has("preloader")) return true;
  if (import.meta.env.DEV) return true;

  return window.sessionStorage.getItem("rise-preloader-seen") !== "true";
};

export default function App() {
  const [isPreloading, setIsPreloading] = useState(shouldPlayPreloader);

  if (isPreloading) {
    return <Preloader onComplete={() => {
      window.sessionStorage.setItem("rise-preloader-seen", "true");
      setIsPreloading(false);
    }} />;
  }

  return <Background />;
}
