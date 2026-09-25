import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { MathUtils } from "three";

const PARTS = [
  { name: "mascot", offset: [0, -5, -0.8], rotation: [0.5, 0, 0] },
  { name: "lefty", offset: [-5, 0.5, 0.7], rotation: [0.2, 0.4, -1.4] },
  { name: "righty", offset: [5, 0.5, 0.7], rotation: [0.2, -0.4, 1.4] },
  { name: "cap2", offset: [0, 5.2, -0.5], rotation: [0, 1.8, 0.8] },
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

export default function Keychain2({ progress = 0, forceVisible = false, ...props }) {
  const { nodes, materials } = useGLTF("/keychain2-web.glb");
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
    const assemble = forceVisible
      ? 1
      : MathUtils.smoothstep(progress, 0.49, 0.68);
    const explodedAmount = 1 - assemble;
    const shouldReveal =
      forceVisible || (!isCompactViewport && assemble > 0.04 && progress < 0.72);

    for (const part of PARTS) {
      const mesh = partRefs.current[part.name];
      if (!mesh) continue;

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
    materials["tripo_material_8b04a547-5120-452c-aace-29543e5f4919"];

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

useGLTF.preload("/keychain2-web.glb");
