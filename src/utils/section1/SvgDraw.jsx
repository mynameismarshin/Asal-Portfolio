// src/section1/SvgDraw.jsx
import { useState, useRef, useMemo } from 'react';
import { Plane } from '@react-three/drei';
import SvgToMeshline from "./loadSVG.jsx";
import BackgroundImage from './BackgroundImage.jsx';
import { 
  BOARD_LAYOUTS, 
  SVG_DRAW_BG_IMAGES, 
  SVG_DRAW_GROUPS, 
  SVG_DRAW_LAYOUTS 
} from '../Configs.js';
import { useBookStore } from '../store.js';

export default function SvgDraw({ assetMap }) {
  const isStarted = useBookStore((state) => state.isLoadedAndStarted);
  const deviceType = useBookStore((state) => state.deviceType);
  const setPuppetDrawn = useBookStore((state) => state.setPuppetDrawn);
  const isPuppetReady = useBookStore((state) => state.isPuppetReady);  

  const [activeGroup, setActiveGroup] = useState(0);
  const [activePart, setActivePart] = useState(0);
  
  // Memoize configs to prevent lookups on every frame (minor opt)
  const layouts = useMemo(() => SVG_DRAW_LAYOUTS[deviceType], [deviceType]);
  const boardLayouts = useMemo(() => BOARD_LAYOUTS[deviceType], [deviceType]);

  const handleSvgComplete = () => {
    const currentGroup = SVG_DRAW_GROUPS[activeGroup];
    
    // Puppet Completion Logic
    if (currentGroup.isPuppet && activePart === currentGroup.parts.length - 1) {
       setPuppetDrawn(true);
    }

    // Sequence Logic
    if (activePart < currentGroup.parts.length - 1) {
      setActivePart(prev => prev + 1);
    } else {
      if (activeGroup < SVG_DRAW_GROUPS.length - 1) {
        setActiveGroup(prev => prev + 1);
        setActivePart(0);
      }
    }
  };

  return (
    <>
      {/* Whiteboard Background */}
      <group>
        <Plane scale={boardLayouts.scale} position={boardLayouts.position} receiveShadow>
          <meshStandardMaterial color="white" roughness={0.5} />
        </Plane>
      </group>

      {SVG_DRAW_GROUPS.map((group, groupIndex) => {
        const groupLayoutConfig = layouts[groupIndex];
        if (!groupLayoutConfig) return null;
        
        // PERFORMANCE: If puppet is ready, unmount these heavy lines instantly.
        if (group.isPuppet && isPuppetReady) return null;
        
        const baseScaleFactor = groupLayoutConfig.baseScaleFactor;

        // --- PUPPET GROUP LOGIC ---
        if (group.isPuppet) {
          const partUrl = group.parts[0]; 
          const svgData = assetMap?.get(partUrl);
          const pos = groupLayoutConfig.position || [0, 0, 0];
          const scl = groupLayoutConfig.scale || 1;

          const isActive = isStarted && groupIndex === activeGroup;
          const forceComplete = groupIndex < activeGroup;

          return (
            <group key={groupIndex} position={pos} scale={[scl, scl, scl]}>
              <SvgToMeshline 
                  svgData={svgData} 
                  isActive={isActive} 
                  forceComplete={forceComplete} 
                  onComplete={handleSvgComplete} 
                  baseScaleFactor={baseScaleFactor} 
                  isPuppetPart={true}
                  onPuppetHover={() => {}} // Puppet parts might not need hover logic here
              />
            </group>
          );
        }

        // --- STANDARD IMAGE/SVG LOGIC ---
        const bgConfig = SVG_DRAW_BG_IMAGES[groupIndex];
        const bgLayout = bgConfig ? bgConfig.layouts[deviceType] : null;
        const groupPartsLayout = groupLayoutConfig.parts || [];
        
        return (
            <group key={groupIndex}> 
              {bgLayout && (
                <BackgroundImage 
                  url={bgConfig.url} 
                  position={bgLayout.position} 
                  scale={bgLayout.scale}  
                  assetMap={assetMap} 
                />
              )} 
              
              {group.parts.map((part, partIndex) => { 
                 const layout = groupPartsLayout[partIndex] || { position: [0, 0, 0], scale: 1 }; 
                 const { position, scale, pivot, hoverAnimation } = layout; 
                 const customPivot = pivot ? { x: pivot[0], y: pivot[1] } : undefined; 
                 const url = typeof part === 'string' ? part : part.url;
                 const svgData = assetMap?.get(url);

                 const isActive = isStarted && groupIndex === activeGroup && partIndex === activePart;
                 const forceComplete = groupIndex < activeGroup || (groupIndex === activeGroup && partIndex < activePart);
                 
                 return (
                  <group key={partIndex} position={position} scale={[scale, scale, scale]}>
                    <SvgToMeshline 
                      svgData={svgData}
                      isActive={isActive} 
                      forceComplete={forceComplete} 
                      onComplete={handleSvgComplete} 
                      baseScaleFactor={baseScaleFactor} 
                      customPivot={customPivot} 
                      hoverAnimation={hoverAnimation} 
                    />
                  </group>
                ); 
              })}
            </group>
        );
      })}
    </>
  );
}