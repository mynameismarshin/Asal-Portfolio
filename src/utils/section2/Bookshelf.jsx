
import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
export function BookShelf(props) {
  const { assetMap, ...restProps } = props;
  const { nodes } = useGLTF('./models/shelfcombinednomat4.glb')
  const texMap = assetMap.get('/textures/wood/godLAST2K.jpg');

  useEffect(() => {
    // This one line tells Three.js that your image file uses the sRGB color space.
    // It will automatically convert it to Linear space for correct lighting.
    if (texMap) texMap.colorSpace = THREE.SRGBColorSpace;
  }, [texMap]); // This effect runs once when the colorMap is loaded.



 

  return (
    <group {...restProps} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.randos001.geometry}                
        position={[1.811, 0.645, -3.912]}
      >
      <meshBasicMaterial map={texMap} map-flipY={false} />     
      </mesh>
      
    </group>
  )
}

useGLTF.preload('./models/shelfcombinednomat4.glsb')
