import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Box3, MathUtils } from "three";

const START_Y = 8;
const FINAL_SCALE = 2;
const MASCOT_Y_ROTATION = -Math.PI / 2;

export default function Mascot({ progress = 0, earthCenterY = 0, earthRadius = 3 }) {
  const { scene } = useGLTF("/mascot-mobile.glb");
  const mascotRef = useRef();
  const { model, restingY } = useMemo(() => {
    const clonedModel = scene.clone(true);
    const bounds = new Box3().setFromObject(clonedModel);

    return {
      model: clonedModel,
      // Put the bottom of the model on the particle Earth's radius, rather
      // than placing its centre inside the globe.
      restingY: earthCenterY + earthRadius - bounds.min.y * FINAL_SCALE,
    };
  }, [earthCenterY, earthRadius, scene]);

  useFrame((_, delta) => {
    if (!mascotRef.current) return;
    const landingProgress = MathUtils.clamp((progress - 0.65) / 0.35, 0, 1);
    const easedProgress = 1 - (1 - landingProgress) ** 3;
    const targetY = MathUtils.lerp(START_Y, restingY, easedProgress);

    mascotRef.current.position.y = MathUtils.damp(
      mascotRef.current.position.y,
      targetY,
      7,
      delta,
    );
    mascotRef.current.scale.setScalar(FINAL_SCALE * easedProgress);
  });

  return (
    <primitive
      ref={mascotRef}
      object={model}
      position={[0, START_Y, 0]}
      rotation={[0, MASCOT_Y_ROTATION, 0]}
    />
  );
}

useGLTF.preload("/mascot-mobile.glb");
