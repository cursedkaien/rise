import { useState } from "react";
import Preloader from "./components/Preloader";
import Background from "./components/Background";
import "./edition.css";

const shouldPlayPreloader = () => {
  if (typeof window === "undefined") return false;

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;

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

  // Replace this shell with the main site once that page is ready.
  return <Background />;
}
