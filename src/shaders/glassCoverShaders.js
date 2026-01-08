// src/shaders/glassCoverShaders.js

export const glassCoverVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glassCoverFragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uReflectivity;

  void main() {
    vec3 textureColor = texture2D(uTexture, vUv).rgb;

    // A simple fresnel effect for reflectivity
    vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    float fresnel = 1.0 - max(dot(viewDirection, normal), 0.0);
    fresnel = pow(fresnel, 2.0); // Tweak power for desired effect

    vec3 reflectedColor = vec3(0.95, 0.95, 1.0) * fresnel * uReflectivity;

    gl_FragColor = vec4(textureColor + reflectedColor, uOpacity);
  }
`;