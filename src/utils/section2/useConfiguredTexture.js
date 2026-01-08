// hooks/useConfiguredTexture.js
import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping, SRGBColorSpace } from 'three';

export function useConfiguredTexture({ map, normalMap, roughnessMap }) {
  const textureURLs = useMemo(() => {
    return [map, normalMap, roughnessMap].filter(Boolean);
  }, [map, normalMap, roughnessMap]);

  const textures = useTexture(textureURLs);

  useEffect(() => {
    if (!textures.length) return;
    
    textures.forEach((texture, index) => {
      // The first texture is always the color map
      const isColorMap = index === 0;
      if (isColorMap) {
        texture.colorSpace = SRGBColorSpace;
      }
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.needsUpdate = true;
    });
  }, [textures]);

  return {
    map: textures[0] || null,
    normalMap: textures[1] || null,
    roughnessMap: textures[2] || null,
  };
}