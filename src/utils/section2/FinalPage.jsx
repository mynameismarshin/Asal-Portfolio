import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import { MeshStandardMaterial, DoubleSide } from 'three';
import * as THREE from 'three';
import { easing } from 'maath';
import { degToRad } from 'three/src/math/MathUtils.js';

// --- Page Geometry and Setup ---
const PAGE_WIDTH_P = 1.28;
const PAGE_HEIGHT_P = 1.71;
const PAGE_DEPTH_P = 0.003;
const PAGE_SEGMENTS_P = 30;
const SEGMENT_WIDTH_P = PAGE_WIDTH_P / PAGE_SEGMENTS_P;

const pageGeometry = new THREE.BoxGeometry(PAGE_WIDTH_P, PAGE_HEIGHT_P, PAGE_DEPTH_P, PAGE_SEGMENTS_P, 2);
pageGeometry.translate(PAGE_WIDTH_P / 2, 0, 0);

// Skinning attributes logic
const pos = pageGeometry.attributes.position;
const vertex = new THREE.Vector3();
const skinIndexes = [];
const skinWeights = [];
for (let i = 0; i < pos.count; i++) {
    vertex.fromBufferAttribute(pos, i);
    const x = vertex.x;
    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH_P));
    const skinWeight = (x % SEGMENT_WIDTH_P) / SEGMENT_WIDTH_P;
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}
pageGeometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndexes, 4));
pageGeometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));

// --- UV Remapping Utility ---
function remapUVs(geometry) {
    const uvs = geometry.attributes.uv; 
    const positions = geometry.attributes.position; 
    const vertex = new THREE.Vector3();
    const uv = new THREE.Vector2();
    const threshold = PAGE_DEPTH_P / 2 * 0.99; 

    for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i); 
        uv.fromBufferAttribute(uvs, i); 

        let newU = uv.x; 

        if (vertex.z > threshold) {
            newU = 0 + uv.x * 0.5;
        } 
        else if (vertex.z < -threshold) {
             newU = 0.5 + uv.x * 0.5;
        }
        uvs.setXY(i, newU,  uv.y);
    }
    uvs.needsUpdate = true; 
}

// --- Single Page Component ---
const SinglePage = ({ number, isOpened, isBookClosed, isTransparentPage, firstPageTexture, pageTexture, totalPages }) => {
   
    const customGeometry = useMemo(() => {
        if (!isTransparentPage && pageTexture) {
            const geom = pageGeometry.clone();
            remapUVs(geom, 0, 0.5);
            return geom;
        }
        return pageGeometry; 
    }, [isTransparentPage, pageTexture])
    
    const manualSkinnedMesh = useMemo(() => {
        const bones = [];
        for (let i = 0; i <= PAGE_SEGMENTS_P; i++) {
            const bone = new THREE.Bone();
            bones.push(bone);
            bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH_P;
            if (i > 0) bones[i - 1].add(bone);
        }
        const skeleton = new THREE.Skeleton(bones);
        
        let frontMaterial, backMaterial;
      
        if (isTransparentPage) {
            const glassProps = {
                transparent: true,
                opacity: 0.85,
                roughness: 0.1,
                metalness: 0.2,
                side: DoubleSide,
            };
            frontMaterial = new MeshStandardMaterial({ ...glassProps, map: firstPageTexture });
            backMaterial = new MeshStandardMaterial({ ...glassProps, map: firstPageTexture });
        } else {
            frontMaterial = new MeshStandardMaterial({ map: pageTexture, roughness: 0.6});
            backMaterial = new MeshStandardMaterial({ map: pageTexture, roughness: 0.6});
        }
       
        const materials = [
            new MeshStandardMaterial({ color: 'white' }),
            new MeshStandardMaterial({ color: 'white' }), 
            new MeshStandardMaterial({ color: 'white' }), 
            new MeshStandardMaterial({ color: 'white' }), 
            frontMaterial,                                 
            backMaterial,                                  
        ];
        const mesh = new THREE.SkinnedMesh(customGeometry, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = false;
        mesh.frustumCulled = false;
        mesh.add(skeleton.bones[0]);
        mesh.bind(skeleton);
        return mesh;
    }, [customGeometry, isTransparentPage, pageTexture, firstPageTexture]);

    // --- Animation Logic ---
    const group = useRef();
    const skinnedMeshRef = useRef();
    const turnedAt = useRef(0);
    const lastOpened = useRef(isOpened);
    const [highlighted, setHighlighted] = useState(false);
    useCursor(highlighted && isBookClosed);

    useFrame((_, delta) => {
        if (!skinnedMeshRef.current) return;
        if (lastOpened.current !== isOpened) {
            turnedAt.current = Date.now();
            lastOpened.current = isOpened;
        }
        let turningTime = Math.min(400, Date.now() - turnedAt.current) / 400;
        turningTime = Math.sin(turningTime * Math.PI);

        let targetRotation = isOpened ? -Math.PI / 2 : Math.PI / 2;
        if (!isBookClosed) targetRotation += degToRad(number * 0.5);

        const bones = skinnedMeshRef.current.skeleton.bones;
        for (let i = 0; i < bones.length; i++) {
            const target = i === 0 ? group.current : bones[i];
            
            // --- ORIGINAL LOGIC  ---
            const insideCurveIntensity = i < 12 ? Math.cos(i * 0.18) : 0;
            const outsideCurveIntensity = i >= 6 ? Math.cos(i * 0.08+0.7) : 0;
            const turningIntensity = Math.sin(i * Math.PI * (1 / bones.length) ) * turningTime;
            
            let rotationAngle = (0.17 * insideCurveIntensity * targetRotation) - (0.06 * outsideCurveIntensity * targetRotation) + (0.09 * turningIntensity * targetRotation);
            let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);

            if (isBookClosed) {
                rotationAngle = i === 0 ? targetRotation : 0;
                foldRotationAngle = 0;
            }
            easing.dampAngle(target.rotation, "y", rotationAngle, 0.5, delta);
            
            const foldIntensity = i > 8 ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime : 0;
            easing.dampAngle(target.rotation, "x", foldRotationAngle * foldIntensity, 0.3, delta);
        }
    });

    return (
        <group ref={group}
            onPointerEnter={(e) => { e.stopPropagation(); setHighlighted(true); }}
            onPointerLeave={() => setHighlighted(false)}>
            <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} position-z={-number * PAGE_DEPTH_P} renderOrder={totalPages - number + 1} />
        </group>
    );
};

// --- Main Pages Component ---
export default function Pages({ config,currentPage, isBookClosed, onFlipAnimationComplete , onFlipBackComplete, bookState, assetMap   }) {
    const [delayedPage, setDelayedPage] = useState(currentPage);

    useEffect(() => {
        if (currentPage === delayedPage) return;
    
        const isClosingSequence = bookState === 'PAGES_CLOSING' && currentPage === 0;
    
        if (isClosingSequence && delayedPage === 1) {
            if (onFlipBackComplete) {
                onFlipBackComplete();
            }
        }
    
        const delay = Math.abs(currentPage - delayedPage) > 2 ? 50 : 150;
    
        const timeout = setTimeout(() => {
            setDelayedPage(p => p + Math.sign(currentPage - p));
        }, delay);
    
        return () => clearTimeout(timeout);
    
    }, [currentPage, delayedPage, onFlipBackComplete, onFlipAnimationComplete, bookState]);

    const firstPageTexture = assetMap.get(config.firstPageMap);
        if (firstPageTexture) { firstPageTexture.colorSpace = THREE.SRGBColorSpace; }

    const totalPages = config.pages.length;
    
    return (
        <group rotation-y={-Math.PI / 2}>
          <SinglePage
            key={-1}
            number={0}
            isTransparentPage={true}
            isOpened={delayedPage > 0} 
            isBookClosed={isBookClosed}
            firstPageTexture={firstPageTexture}
            assetMap={assetMap}
            pageTexture={undefined}
            totalPages={totalPages}
          />
          {config.pages.map((page, index) => {
            const correctPageTexture = assetMap.get(page.pageMap);
            if (correctPageTexture) { correctPageTexture.colorSpace = THREE.SRGBColorSpace; }
            const pageNumber = index + 1;
            return (
              <SinglePage
                key={index}
                number={pageNumber}
                isTransparentPage={false}
                isOpened={delayedPage > pageNumber} 
                isBookClosed={isBookClosed}
                firstPageTexture={undefined}
                assetMap={assetMap}
                pageTexture={correctPageTexture}
                totalPages={totalPages}
              />
            );
          })}
        </group>
      );
}