import { Canvas, extend, useThree } from "@react-three/fiber";
import { Suspense } from "react";
import ParticleEarth from "./ParticleEarth";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

extend({ OrbitControls });

function CameraControls() {
  const { camera, gl } = useThree();

  return <orbitControls args={[camera, gl.domElement]} enableZoom={false} />;
}

export default function Preloader() {
  return (
    <div
      className="prelaoder"
      style={{ width: "100vw", height: "100vh", background: "#050508" }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={["#050508"]} />

        <Suspense fallback={null}>
          <ParticleEarth progress={1} />
        </Suspense>

        <CameraControls />
      </Canvas>
    </div>
  );
}
