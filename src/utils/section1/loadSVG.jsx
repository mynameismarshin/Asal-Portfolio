import { useMemo, useState, useEffect, useRef, Suspense } from 'react';
import MeshlinePath from './MeshlinePath.jsx';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function SvgToMeshline({
  svgData,
  isActive,
  onComplete,
  forceComplete = false,
  baseScaleFactor,
  customPivot,
  hoverAnimation,
  isPuppetPart = false,
  onPuppetHover,
 }) {

  const scaleFactor = baseScaleFactor !== undefined ? baseScaleFactor : 0.006;
 
  // Track how many individual paths within this SVG are finished
  const [completedPaths, setCompletedPaths] = useState(0);
  const [isDrawn, setIsDrawn] = useState(forceComplete);

  const animationTimeline = useRef();
  const turbineVelocity = useRef(0);

  const containerRef = useRef();
  const hitAreaRef = useRef();

  // 1. DATA PREP: Safe check for svgData
  const { paths, cx, cy, width, height } = useMemo(() => {
    if (!svgData?.paths) return { paths: [], cx: 0, cy: 0, width: 1, height: 1 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    // Expensive loop - perfectly placed in useMemo
    svgData.paths.forEach((path) =>
      path.subPaths.forEach((subPath) =>
        subPath.getPoints().forEach((p) => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        })
      )
    );

    const w = (maxX - minX) * scaleFactor;
    const h = (maxY - minY) * scaleFactor;
    return { 
      paths: svgData.paths, 
      cx: (minX + maxX) / 2, 
      cy: (minY + maxY) / 2, 
      width: w, 
      height: h 
    };
  }, [svgData, scaleFactor]);

  const pivotOffset = customPivot ? [(cx - customPivot.x) * scaleFactor, -(cy - customPivot.y) * scaleFactor, 0] : [0, 0, 0];

  // 2. HOVER ANIMATIONS (Optimized)
  useGSAP(() => {
    if (!containerRef.current) return;

    if (hoverAnimation === "earthOrbit") {
      animationTimeline.current = gsap.to({ t: 0 }, {
        t: 2 * Math.PI,
        duration: 12,
        ease: "none",
        repeat: -1,
        paused: true,
        onUpdate: function () {
          if (!containerRef.current) return;
          const angle = this.targets()[0].t;
          // Direct manipulation avoids React overhead
          containerRef.current.position.x = 0.5 * Math.cos(angle);
          containerRef.current.position.y = 0.15 * Math.sin(angle);
          const scaleValue = Math.max(0, Math.sin(angle) * 0.8 + 0.2);
          containerRef.current.scale.set(scaleValue, scaleValue, scaleValue);
          containerRef.current.renderOrder = Math.sin(angle) > 0 ? 1 : -1;
        }
      });
    } else if (hoverAnimation === "turbine") {
      const tick = () => {
        if (containerRef.current && turbineVelocity.current > 0.001) {
          containerRef.current.rotation.z += turbineVelocity.current;
          turbineVelocity.current *= 0.98; // Friction
        }
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    }
  }, [hoverAnimation]);

  // 3. COMPLETION LOGIC
  useEffect(() => {
    if (forceComplete && !isDrawn) {
        setIsDrawn(true);
        setCompletedPaths(paths.length); // Ensure sync
    }
  }, [forceComplete, isDrawn, paths.length]);
  
  useEffect(() => {
    // Check if ALL paths in this SVG are done
    if (isActive && !forceComplete && paths.length > 0 && completedPaths >= paths.length) {
      if (onComplete) onComplete();
      if (!isDrawn) setIsDrawn(true);
    }
  }, [completedPaths, isActive, paths.length, onComplete, forceComplete, isDrawn]);

  // 4. INTERACTION HANDLERS
  const handlePointerOver = (e) => {
    e.stopPropagation(); // Be polite, don't trigger things behind it
    if (!isDrawn || !containerRef.current) return;
    
    if (isPuppetPart) {
      onPuppetHover(true);
    } else {
      if (hoverAnimation === 'turbine') {
        turbineVelocity.current += 0.05;
      } else if (animationTimeline.current) {
        animationTimeline.current.play();
      }
    }
  };

  const handlePointerOut = (e) => {
    if (!isDrawn) return;
    if (isPuppetPart) {
      onPuppetHover(false);
    } else {
      if (hoverAnimation !== 'turbine' && animationTimeline.current) {
        animationTimeline.current.pause();
      }
    }
  };

  if (!svgData) return null; // Safe exit

  return (
    <Suspense fallback={null}>
      <group ref={containerRef}>
        {/* Invisible hit area for mouse interaction */}
        <mesh ref={hitAreaRef} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial visible={false} />
        </mesh>
        
        {/* The Drawings */}
        <group position={pivotOffset}>
          {paths.map((path, index) => (
            <MeshlinePath
              key={index}
              path={path}
              cx={cx}
              cy={cy}
              isActive={isActive}
              forceComplete={forceComplete}
              scaleFactor={scaleFactor}
              onComplete={() => setCompletedPaths((prev) => prev + 1)}
            />
          ))}
        </group>
      </group>
    </Suspense>
  );
}