// MeshlinePath.jsx (updated)
import { useRef, useMemo, useEffect } from 'react';
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline';
import * as THREE from 'three';
import { useFrame,extend  } from '@react-three/fiber';

extend({ MeshLineGeometry, MeshLineMaterial })

export default function MeshlinePath({
   path, 
   cx, 
   cy, 
   isActive, 
   onComplete, 
   scaleFactor, 
   forceComplete = false, 
   zOffset = 0.001,
  }) {
  const meshRef = useRef();
  const progress = useRef(1);
  const hasCompleted = useRef(false);


  const points = useMemo(() => {
    if (!path) return [];
    const rawPoints = path.subPaths.flatMap((subPath) =>
      subPath.getPoints().map((p) => {
        const x = (p.x - cx) * scaleFactor;
        const y = -(p.y - cy) * scaleFactor;
        return new THREE.Vector3(x, y, zOffset);
      })
    );
    return rawPoints.reverse(); // Reverse so it draws in the correct direction if needed
  }, [path, scaleFactor, zOffset, cx, cy]);

  const geometry = useMemo(() => {
    const geom = new MeshLineGeometry();
    if (points.length > 0) {
        geom.setPoints(points.flatMap((p) => [p.x, p.y, p.z]));
    }
    return geom;
  }, [points]);

const material = useMemo(
    () =>
      new MeshLineMaterial({
        color: 'black',
        lineWidth: 0.012, // Slightly thicker for visibility on mobile
        transparent: true,
        dashArray: 1,     // The length of the dash relative to line length
        dashOffset: 0,
        dashRatio: 1,     // 1 = fully invisible (all gap), 0 = fully visible
        depthTest: false, // Prevents Z-fighting
        onBeforeCompile: (shader) => {
          shader.uniforms.time = { value: 0 };
          shader.vertexShader = `
            uniform float time;
            varying vec3 vPosition;
            ${shader.vertexShader}
          `.replace(
            `void main() {`,
            `
            void main() {
              vec3 pos = position;
              // Subtle wiggle: Amplitude 0.02, Frequency 10.0
              pos.y += sin(time + position.x * 10.0) * 0.02; 
              vPosition = pos;
            `
          );
          // Store reference to shader so we can update uniforms later
          material.userData.shader = shader;
        },
      }),
    []
  );

  // CLEANUP: When this component dies, kill the geometry and material to free GPU memory.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material;

    // A. Handle Animation Logic (Frame-rate independent)
    // Speed: 1.5 units per second. Adjust '1.5' to change draw speed.
    const speed = 1.5; 

    if (forceComplete) {
       // Instant finish
       if (mat.dashRatio !== 0) mat.dashRatio = 0;
    } else if (isActive) {
      if (progress.current > 0) {
        // Subtract based on TIME, not FRAME
        progress.current -= speed * delta;
        mat.dashRatio = Math.max(0, progress.current);
      } else if (!hasCompleted.current) {
        hasCompleted.current = true;
        if (onComplete) onComplete();
      }
    }

    // B. Handle Wiggle Animation
    if (mat.userData.shader) {
      mat.userData.shader.uniforms.time.value += delta * 2.0; // Wiggle speed
    }
  });

  if (points.length === 0) return null;

  return (
    <mesh ref={meshRef} raycast={raycast}>
      {/* Primitive allows us to pass the raw objects we created */}
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </mesh>
  );

}