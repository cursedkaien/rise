import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { AdditiveBlending, TextureLoader } from "three";

export default function ParticleEarth({ progress = 0 }) {
  const pointsRef = useRef();
  const texture = useLoader(TextureLoader, "/world-map.png");
  const { initialPositions, targetPositions, colors, count } = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = texture.image;

    const width = (canvas.width = image.width || 1000);
    const height = (canvas.height = image.height || 500);

    ctx.drawImage(image, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height).data;

    const initial = [];
    const target = [];
    const particleColors = [];

    const radius = 3;
    const scatterRange = 25;
    const pseudoRandom = (value) => {
      const random = Math.sin(value) * 43758.5453123;
      return random - Math.floor(random);
    };

    const step = 4;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const brightness = imgData[index];

        if (brightness > 120) {
          const u = x / width;
          const v = y / height;

          const lon = u * Math.PI * 2 - Math.PI;
          const lat = v * Math.PI - Math.PI / 2;

          const tx = radius * Math.cos(lat) * Math.sin(lon);
          const ty = -radius * Math.sin(lat);
          const tz = radius * Math.cos(lat) * Math.cos(lon);

          target.push(tx, ty, tz);

          // Derive stable scatter positions from each pixel instead of creating
          // different positions every time React renders this component.
          const seed = x * 12.9898 + y * 78.233;
          const ix = (pseudoRandom(seed) - 0.5) * scatterRange;
          const iy = (pseudoRandom(seed + 1) - 0.5) * scatterRange;
          const iz = (pseudoRandom(seed + 2) - 0.5) * scatterRange;

          initial.push(ix, iy, iz);

          particleColors.push(0.95, 0.95, 0.98);
        }
      }
    }
    return {
      initialPositions: new Float32Array(initial),
      targetPositions: new Float32Array(target),
      colors: new Float32Array(particleColors),
      count: target.length / 3,
    };
  }, [texture]);

  const currentPositions = useMemo(
    () => new Float32Array(initialPositions),
    [initialPositions],
  );

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const currentPositions = posAttr.array;

    pointsRef.current.rotation.y += delta * 0.15;

    for (let i = 0; i < count * 3; i++) {
      const start = initialPositions[i];
      const end = targetPositions[i];

      const currentTarget = start + (end - start) * progress;

      currentPositions[i] += (currentTarget - currentPositions[i]) * 0.08;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[currentPositions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>

      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.85}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
