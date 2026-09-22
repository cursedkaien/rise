import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils } from "three";
import ParticleEarth from "./ParticleEarth";
import Mascot from "./Mascot";

const GLOBE_SCALE = 0.7;
const GLOBE_Y = -1.35;

export default function GlobeScene({ progress }) {
  const earthRef = useRef();

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <>
      <group ref={earthRef}>
      <group position={[0, GLOBE_Y, 0]} scale={GLOBE_SCALE}>
        <ParticleEarth
          progress={MathUtils.clamp(progress / 0.7, 0, 1)}
          opacity={0.58}
          size={0.028}
        />
      </group>
      </group>
      <Mascot
        progress={progress}
        earthCenterY={GLOBE_Y}
        earthRadius={3 * GLOBE_SCALE}
      />
    </>
  );
}
