// src/components/Lamp.jsx
import { useRef } from 'react';
import { SpotLight } from '@react-three/drei';

export function Lamp({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0], assetMap }) {
  // Load the PNG image as a texture
  // Make sure your desk-lamp.png is in your /public directory
  const texture = assetMap.get('/images/light.png');
  const lampRef = useRef();
  // If the texture isn't ready for any reason, render nothing to be safe
  if (!texture) {
    return null;
  }

  return (
    <group ref={lampRef} position={position} scale={scale} rotation={rotation}>
      {/* Plane for the desk lamp image */}
      <mesh>
        <planeGeometry args={[1, 1]} /> {/* Adjust size as needed, texture will cover it */}
        <meshBasicMaterial map={texture} transparent={true} />
      </mesh>

      {/* SpotLight to simulate the lamp's light */}
      <SpotLight
        position={[0, -0.035, 0]}
        scale={2.9} // Position relative to the lamp's pivot (adjust as needed)
        angle={Math.PI /4}   // Narrower angle for a focused spot
        penumbra={12}        // Softness of the edge of the spotLight cone
        intensity={1}         // Brightness of the light (adjust this)
        distance={10}          // Max distance the light will travel
        castShadow  
        anglePower={3} // Diffuse-cone anglePower (default: 5)          // Enable shadow casting from this light
      />
      
      {/* Optional: Helper to visualize the spotlight (only in development) */}
       {/* <spotLightHelper args={[lampRef.current.children[1]]} /> */}
    </group>
  );
}