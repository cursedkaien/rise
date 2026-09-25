import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
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

export default function Keychain1({ progress = 0, ...props }) {
  const { nodes, materials } = useGLTF("/keychain1-web.glb");
  const partRefs = useRef({});
  const [isCompactViewport, setIsCompactViewport] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
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

  useEffect(() => {
    const updateViewport = () => setIsCompactViewport(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useFrame((_, delta) => {
    const openingRelease = MathUtils.smoothstep(progress, 0.04, 0.13);
    const laterAssembly = MathUtils.smoothstep(progress, 0.14, 0.32);
    const assemble = isCompactViewport
      ? 1
      : progress < 0.14
        ? 1 - openingRelease
        : laterAssembly;
    const disperse = isCompactViewport ? 0 : MathUtils.smoothstep(progress, 0.43, 0.55);
    const explodedAmount = 1 - assemble + disperse;

    for (const [index, part] of PARTS.entries()) {
      const mesh = partRefs.current[part.name];
      if (!mesh) continue;

      const revealAt = index * 0.055;
      const shouldReveal =
        isCompactViewport || (assemble >= revealAt && disperse < 0.98);
      mesh.visible = shouldReveal;
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
