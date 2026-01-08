// BackgroundImage.jsx
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function BackgroundImage({ url, position = [0,0,0], scale = [1,1,1], assetMap }) {
  // Load the texture
  const texture = assetMap.get(url);
  const meshRef = useRef();

  // Start with 0 opacity.
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.opacity =0;
    }
  }, []);

  // Fade in on pointer over.
  const handlePointerOver = () => {
    gsap.to(meshRef.current.material, { opacity: 1, duration: 0.5 });
  };

  // Fade out on pointer out.
  const handlePointerOut = () => {
    gsap.to(meshRef.current.material, { opacity: 0, duration: 0.5 });
  };
   // If the texture isn't ready for some reason, render nothing.
    if (!texture) {
      return null;
    }
  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      renderOrder={-1} // ensure it is rendered behind the SVGs
    >
      {/* Adjust the plane geometry size as needed */}
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent opacity={1}  />
    </mesh>
  );
}