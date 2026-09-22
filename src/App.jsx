import { useState } from "react";
import Preloader from "./components/Preloader";

export default function App() {
  const [isPreloading, setIsPreloading] = useState(true);

  if (isPreloading) {
    return <Preloader onComplete={() => setIsPreloading(false)} />;
  }

  // Replace this shell with the main site once that page is ready.
  return <main style={{ minHeight: "100vh", background: "#050508" }} />;
}
