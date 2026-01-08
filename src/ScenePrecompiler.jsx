// src/ScenePrecompiler.jsx

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * This component's sole purpose is to traverse the scene graph
 * after it has been populated and force the GPU to compile all the shaders
 * for all the materials. This prevents a "jank" or "pause" on the first
 * interaction that uses a new material.
 */
export default function ScenePrecompiler() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    // This is a one-time command to the WebGL renderer
    gl.compile(scene, camera);
  }, [gl, scene, camera]); // It runs once when the component mounts

  // This component renders nothing to the screen
  return null;
}