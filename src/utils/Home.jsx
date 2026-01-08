// src/utils/Home.jsx
import { Suspense, useMemo, memo, useEffect } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { ScrollControls, Scroll, Preload, useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Hooks
import { useDeviceType } from './useDeviceType.js';
import { useBookStore } from './store';
import { collectAssetPaths } from '../assetCollector.js';

// Components
import Header from './Header.jsx';
import ScenePrecompiler from '../ScenePrecompiler.jsx';
import { LAMP_LAYOUTS, BG_LAYOUTS } from './Configs.js'; 
import { CameraRig } from './CameraRig.jsx';
import ScrollHandler from './ScrollHandler.jsx';
import MyWorksFinal from './section2/MyWorksFinal.jsx';
import SvgDraw from './section1/SvgDraw.jsx';
import HtmlContent from './HtmlContent.jsx';
import { Lamp } from './section1/Lamp.jsx';

// ==============================================
// 1. THE CONCRETE WALL (Now Respects BG_LAYOUTS)
// ==============================================
const ConcreteBackground = memo(({ assetMap, device }) => {
  // Get config for this device
  const bgConfig = BG_LAYOUTS[device]; 
  
  // 1. TEXTURES
  const map = assetMap?.get(bgConfig?.map);
  const normalMap = assetMap?.get(bgConfig?.normalMap);
  const roughnessMap = assetMap?.get(bgConfig?.roughnessMap);

  // 2. TRANSFORM (Position & Scale from Config)
  // If config is missing, fall back to safe defaults (Z = -1.4 as requested)
  const position = bgConfig?.position || [0, 0, -1.4];
  const scale = bgConfig?.scale || [20, 20, 1]; // Fallback large scale if config missing

  if (!map) return null;

  return (
    <mesh 
      position={position} 
      scale={scale}
      receiveShadow 
    >
      <planeGeometry args={[1, 1]} /> {/* Scale is applied to mesh, so geometry is 1x1 */}
      
      <meshStandardMaterial 
        map={map}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        roughness={0.8} 
        envMapIntensity={0.5}
        color="#ffffff" 
      />
    </mesh>
  );
});
ConcreteBackground.displayName = "ConcreteBackground";


// ==============================================
// SCENE LOADER
// ==============================================
const SceneLoader = memo(() => {
  const device = useDeviceType();
  const setDeviceType = useBookStore((state) => state.setDeviceType);

  useEffect(() => { setDeviceType(device); }, [device, setDeviceType]);

  const { texturePaths, modelPaths, svgPaths } = useMemo(() => collectAssetPaths(device), [device]);

  useGLTF.preload(modelPaths);
  const textures = useTexture(texturePaths);
  const svgs = useLoader(SVGLoader, svgPaths);

  const assetMap = useMemo(() => {
    const map = new Map();
    const texArray = Array.isArray(textures) ? textures : [textures];
    const svgArray = Array.isArray(svgs) ? svgs : [svgs];

    texturePaths.forEach((path, i) => { if(texArray[i]) map.set(path, texArray[i]); });
    svgPaths.forEach((path, i) => { if(svgArray[i]) map.set(path, svgArray[i]); });
    return map;
  }, [texturePaths, textures, svgPaths, svgs]);

  return <SceneContent assetMap={assetMap} device={device} />;
});
SceneLoader.displayName = "SceneLoader";


// ==============================================
// SCENE CONTENT
// ==============================================
const SceneContent = memo(({ assetMap, device }) => {
  const boardLayouts = LAMP_LAYOUTS[device]; 
  const isMobile = device === 'mobile';

  return (
    <>
      <ScrollHandler />
      <CameraRig />
      
      {/* Wall is rendered first, at the Z-depth specified in Configs.js */}
      <ConcreteBackground assetMap={assetMap} device={device} />

      <Scroll>
        <group>
           <SvgDraw assetMap={assetMap} />
           <Lamp {...boardLayouts} assetMap={assetMap} />
        </group>
        {/* Only render 3D books on non-mobile devices */}
        {!isMobile && <MyWorksFinal assetMap={assetMap} />}
      </Scroll>
      <Scroll html>
        <HtmlContent />
      </Scroll>
    </>
  );
});
SceneContent.displayName = "SceneContent";


// ==============================================
// MAIN HOME COMPONENT
// ==============================================
export default function Home() {
  const isLoadedAndStarted = useBookStore((state) => state.isLoadedAndStarted);
  const device = useDeviceType();
  const isMobile = device === 'mobile';

  return (
    <>
      <Header />
      <div className={`fixed w-full h-screen transition-colors duration-1000 ${isLoadedAndStarted ? 'bg-white' : 'bg-zinc-900'}`}>
        <Canvas
          flat 
          shadows={!isMobile} 
          dpr={[1, 2]} 
          camera={{ position: [0, 0, 5], fov: 50, far: 10, near: 0.01 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight 
            castShadow={!isMobile} 
            position={[5, 2, 5]} 
            intensity={1.2} 
            shadow-bias={-0.0005} 
            shadow-mapSize={[1024, 1024]} 
          />
          <Suspense fallback={null}>
            <ScrollControls pages={4} damping={0.2}>
              <SceneLoader />
            </ScrollControls>
            <ScenePrecompiler /> 
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}