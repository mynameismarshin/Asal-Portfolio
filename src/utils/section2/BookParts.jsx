// BookParts.jsx
import { Plane, Box } from '@react-three/drei';
import * as THREE from 'three';

// --- Component Constants ---
const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const COVER_THICKNESS = 0.02;
// const SPINE_WIDTH = 0.15;
// const SPINE_THICKNESS = 0.003;
// const PLACEHOLDER_URL = 'https://placehold.co/600x400/cccccc/333333?text=No+Image';

// --- Cover Component ---
export function Cover({  config, side, assetMap }) {
    // FIX: Provide a fallback URL if the props are undefined
    const artTexture = assetMap.get(side === 'front' ? config.coverMap : config.backMap);
    const trickTexture = assetMap.get(config.coverTrickMap);

    // This check is still good practice
    if (artTexture) artTexture.colorSpace = THREE.SRGBColorSpace;
    if (trickTexture) trickTexture.colorSpace = THREE.SRGBColorSpace;

   const isFront = side === 'front';
   const glassColor = new THREE.Color(config.color).lerp(new THREE.Color("white"), 0.7);
   const groupPosition = isFront ? [PAGE_WIDTH / 2, 0, 0] : [0, 0, 0];

    return (
        <group position={groupPosition}>
            <Box args={[PAGE_WIDTH, PAGE_HEIGHT, COVER_THICKNESS]} >
                <meshPhysicalMaterial
                    color={glassColor}
                    transmission={1}
                    opacity={0.8}
                    roughness={0.15}
                    thickness={COVER_THICKNESS * 2}
                    ior={1.42}
                    side={THREE.DoubleSide}
                    depthWrite={false} //ALLOW BACK OBJECTS TO GET RENDERED!
                    specularIntensity={1}
                    clearcoat= {1.0}
                    clearcoatRoughness={0.05}
                    
                    
                />
            </Box>
            {side === 'front' && (
                <>
                    <Plane args={[PAGE_WIDTH, PAGE_HEIGHT]} position-z={0.02}>
                        <meshBasicMaterial  map={artTexture} transparent depthWrite={false} side={THREE.DoubleSide} />
                    </Plane>
                </>
            )}
        </group>
    );
}

// --- Spine Component ---
export function Spine({ config, assetMap  }) {
    // FIX: Also add a fallback here
    const spineTexture = assetMap .get(config.spineMap);

    if(spineTexture) spineTexture.colorSpace = THREE.SRGBColorSpace;

    return (
        <mesh>
            <boxGeometry args={config.spineSize} />
            <meshStandardMaterial
                map={spineTexture}
                metalness={0.}
                roughness={0.5}
            />
        </mesh>
    );
};