import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { MathUtils } from "three";

const PARTS = [
  { name: "main_body", offset: [0, -4, -1], rotation: [0.4, -0.2, 0] },
  { name: "left_leg", offset: [-4, -2.5, 0.8], rotation: [0, 0, -1.2] },
  { name: "right_leg", offset: [4, -2, 0.5], rotation: [0, 0, 1.1] },
  { name: "top", offset: [0.5, 4.2, 1], rotation: [0.8, 0.1, 0] },
  { name: "cap", offset: [-3.8, 4, -0.5], rotation: [0.3, 1.5, -0.8] },
  { name: "strap", offset: [4.5, 1.2, 0.6], rotation: [0, 0.5, 1.4] },
  { name: "charm", offset: [-4.5, 0.8, -1], rotation: [1.2, 0, 0.8] },
  { name: "sec_charm", offset: [3.5, 3.5, -0.6], rotation: [-0.9, 0.6, 0] },
];

function dampPart(mesh, target, offset, rotation, amount, delta) {
  mesh.position.x = MathUtils.damp(
    mesh.position.x,
    target.position[0] + offset[0] * amount,
    8,
    delta,
  );
  mesh.position.y = MathUtils.damp(
    mesh.position.y,
    target.position[1] + offset[1] * amount,
    8,
    delta,
  );
  mesh.position.z = MathUtils.damp(
    mesh.position.z,
    target.position[2] + offset[2] * amount,
    8,
    delta,
  );
  mesh.rotation.x = MathUtils.damp(
    mesh.rotation.x,
    target.rotation[0] + rotation[0] * amount,
    8,
    delta,
  );
  mesh.rotation.y = MathUtils.damp(
    mesh.rotation.y,
    target.rotation[1] + rotation[1] * amount,
    8,
    delta,
  );
  mesh.rotation.z = MathUtils.damp(
    mesh.rotation.z,
    target.rotation[2] + rotation[2] * amount,
    8,
    delta,
  );
}

export default function Keychain1({ progress = 0, progressRef, spreadScale = 1, ...props }) {
  const { nodes, materials } = useGLTF("/keychain1-web.glb");
  const partRefs = useRef({});
  const finalTransforms = useMemo(
    () =>
      Object.fromEntries(
        PARTS.map(({ name }) => {
          const node = nodes[name];
          return [
            name,
            {
              position: node.position.toArray(),
              rotation: node.rotation.toArray(),
              scale: node.scale.toArray(),
            },
          ];
        }),
      ),
    [nodes],
  );

  useFrame((_, delta) => {
    const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const currentProgress = reducedMotion ? 0.32 : (progressRef?.current ?? progress);
    const assemble = MathUtils.smoothstep(currentProgress, 0.02, 0.38);
    const explodedAmount = (1 - assemble) * spreadScale;

    for (const part of PARTS) {
      const mesh = partRefs.current[part.name];
      if (!mesh) continue;

      mesh.visible = true;
      dampPart(
        mesh,
        finalTransforms[part.name],
        part.offset,
        part.rotation,
        explodedAmount,
        delta,
      );
    }
  });

  const material =
    materials["tripo_node_ce525aac-54f1-4aaf-8559-356ad22ae74b_material"];

  return (
    <group {...props} rotation={[0, -Math.PI / 2, 0]} dispose={null}>
      {PARTS.map((part) => (
        <group
          key={part.name}
          ref={(mesh) => {
            partRefs.current[part.name] = mesh;
          }}
          position={finalTransforms[part.name].position}
          rotation={finalTransforms[part.name].rotation}
          scale={finalTransforms[part.name].scale}
        >
          <mesh
            geometry={nodes[part.name].geometry}
            material={material}
            frustumCulled={false}
          />
        </group>
      ))}
    </group>
  );
}

useGLTF.preload("/keychain1-web.glb");
