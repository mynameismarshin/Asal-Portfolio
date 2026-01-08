import { useRef, useMemo, useCallback  } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { useGSAP } from '@gsap/react';
import Pages from './FinalPage';
import { Cover, Spine } from './BookParts.jsx';
import { BOOK_TARGETS } from '../Configs.js';
import { useBookStore } from '../store.js';

const PAGE_WIDTH = 1.28;

export default function Book({ config, assetMap  }) {
    const groupRef = useRef();
    const frontCoverPivot = useRef();
    const backCoverPivot = useRef();
    const spinePivot = useRef();

    const initialPosition = useMemo(() => new THREE.Vector3(...config.position), [config.position]);
    const initialRotation = useMemo(() => new THREE.Euler(...(config.rotation || [0, Math.PI / 2, 0])), [config.rotation]);
    const motion = config.motion || { pullZ: 0.6, flyRotation: [0, Math.PI/2, 0] };

    const { 
        selectedBookId,
        currentPage,
        bookState,
        selectBook,
        deviceType,
        setBookInteractive,
        currentSection,
        resetBookSelection,
        setBookStateToClosing
    } = useBookStore();

    const isSelected = selectedBookId === config.id;
    const targetConfig = BOOK_TARGETS[deviceType];

    const handleSelect = () => {
        if (currentSection === 1 && bookState === 'SHELF') {
            selectBook(config.id, config.pages.length);
        }
    };

    const handleFlipBackComplete = useCallback(() => {
        setBookStateToClosing();
    }, [setBookStateToClosing]);

    useGSAP(() => {
        if (isSelected && bookState === 'OPENING') {
            const tl = gsap.timeline({ onComplete: () => setBookInteractive() });
            
            // 1. PULL OUT (Based on Config)
            tl.to(groupRef.current.position, {
                z: initialPosition.z + motion.pullZ, // Use Config
                duration: 0.4,
                ease: "power2.out"
            });
            // Rotate to "Flight Mode" (Straight spine)
            tl.to(groupRef.current.rotation, {
                x: motion.flyRotation[0],
                y: motion.flyRotation[1],
                z: motion.flyRotation[2],
                duration: 0.3
            }, "<"); 

            // 2. FLY TO CENTER
            tl.to(groupRef.current.position, {
                x: targetConfig.position[0],
                y: targetConfig.position[1],
                duration: 0.8,
                ease: "power2.inOut"
            }, ">-0.1");
            
            // Rotate to Target
            tl.to(groupRef.current.rotation, {
                x: targetConfig.rotation[0],
                y: targetConfig.rotation[1],
                z: targetConfig.rotation[2],
                duration: 0.8,
                ease: "power2.inOut"
            }, "<"); 

            // 3. APPROACH
            tl.to(groupRef.current.position, {
                z: targetConfig.position[2],
                duration: 0.6,
                ease: "power3.out"
            }, ">-0.4");

            // Covers Open
            tl.to(frontCoverPivot.current.rotation, { y: -Math.PI, duration: 1.2, ease: "power2.inOut" }, "-=0.8");
            tl.to(spinePivot.current.rotation, { y: 0, duration: 1.0, ease: "power2.inOut" }, "<" );
        } 
        
        else if (isSelected && bookState === 'CLOSING') {
            const tl = gsap.timeline({
                 onComplete: () => { resetBookSelection() }
            });

            // 1. Close Covers
            tl.to(frontCoverPivot.current.rotation, { y: 0, duration: 0.8, ease: "power2.inOut" });
            tl.to(spinePivot.current.rotation, { y: -Math.PI / 2, duration: 0.5, ease: "power2.inOut" }, "<0.1");
            tl.to(frontCoverPivot.current.position, { z: config.coverOffset.front[2], duration: 0.1 }, "<");
            tl.to(backCoverPivot.current.position, { z: config.coverOffset.back[2], duration: 0.1 }, "<");

            // 2. RETREAT
            tl.to(groupRef.current.position, {
                z: initialPosition.z + motion.pullZ, // Use Config
                duration: 0.5,
                ease: "power2.in"
            }, "<0.3");

            // 3. RETURN FLIGHT
            tl.to(groupRef.current.position, {
                x: initialPosition.x,
                y: initialPosition.y,
                duration: 0.7,
                ease: "power2.inOut"
            });
            // Rotate back to "Flight Mode" for smooth entry
            tl.to(groupRef.current.rotation, {
                x: motion.flyRotation[0],
                y: motion.flyRotation[1],
                z: motion.flyRotation[2],
                duration: 0.7,
                ease: "power2.inOut"
            }, "<");

            // 4. DOCKING
            tl.to(groupRef.current.position, {
                z: initialPosition.z,
                duration: 0.4,
                ease: "back.out(1.2)"
            });
            // Rotate back to Shelf Angle
            tl.to(groupRef.current.rotation, {
                x: initialRotation.x,
                y: initialRotation.y,
                z: initialRotation.z,
                duration: 0.4,
                ease: "power1.out"
            }, "<");
        }
    }, {dependencies: [isSelected, bookState, config]});

    

    return (
        <group 
            ref={groupRef} 
            position={initialPosition} 
            rotation={initialRotation}
            onClick={(e) => {{ e.stopPropagation(); handleSelect(); } }}
        >
            <group ref={backCoverPivot} position={config.coverOffset.back}>
                 <Cover config={config} side="back" assetMap={assetMap} renderOrder={1} />
            </group>
            <group ref={frontCoverPivot} position={config.coverOffset.front} >
                <Cover  config={config} side="front" assetMap={assetMap} renderOrder={config.pages.length + 2} />
            </group>
            <group ref={spinePivot} rotation={[0,Math.PI/2,0]} position={[-PAGE_WIDTH/2,0,0]}>
                <Spine config={config} assetMap={assetMap} />
            </group>
            <group position={[-PAGE_WIDTH/2,0,0.05]} rotation={[0,0,0]}>
                <Pages config={config} assetMap={assetMap} currentPage={isSelected ? currentPage : 0} isBookClosed={!isSelected || bookState !== 'INTERACTIVE'} onFlipBackComplete={handleFlipBackComplete} bookState={bookState}  />
            </group>
        </group>
  );
}