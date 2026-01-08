// GlassCoverMaterial.jsx
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Color } from 'three';

const GlassMaterial = shaderMaterial(
  {
    uTexture: null,
    uGlassColor: new Color(0xbbd8ff),
    uGlassOpacity: 0.45,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uTexture;
    uniform vec3 uGlassColor;
    uniform float uGlassOpacity;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);

      if (texColor.a < 0.5) {
        float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 3.0);
        vec3 finalColor = uGlassColor + fresnel * 0.3;
        gl_FragColor = vec4(finalColor, uGlassOpacity);
      } else {
        gl_FragColor = texColor;
      }
    }
  `
);

extend({ GlassMaterial });

export { GlassMaterial };
