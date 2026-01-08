// MyWorksFinal.jsx
import { useMemo } from "react";

import { booksConfigMap, SHELF_LAYOUTS, SHELF_GROUP_LAYOUTS } from '../Configs.js';
import Book from './Book.jsx';
import { BookShelf } from './Bookshelf.jsx'; 
import { useBookStore } from '../store';
//import * as THREE from 'three'
export default function MyWorks(props) {
  const { assetMap, ...restProps } = props;
  const device = useBookStore((state) => state.deviceType);

  const booksConfig = useMemo(() => booksConfigMap[device] || [], [device]);
  const shelfConfig = useMemo(() => SHELF_LAYOUTS[device] || {}, [device]);
  // const bgConfig = useMemo(() => BG_LAYOUTS[device] || {}, [device]);

  //  Get the Master Group Config
  const groupConfig = useMemo(() => SHELF_GROUP_LAYOUTS[device] || {}, [device]);
  // --- Background Texture ---
  // const bgMap = assetMap.get(bgConfig.map);
  // const bgNormal = assetMap.get(bgConfig.normalMap);
  // const bgRough = assetMap.get(bgConfig.roughnessMap);

  // useEffect(() => {
  //   [bgMap, bgNormal, bgRough].forEach(tex => {
  //     if (!tex) return;
  //     tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  //     tex.repeat.set(1.5, 1.5);
  //     tex.needsUpdate = true;                   // NEED TO BE DONE ON WALL TEXTURE!!
  //     tex.anisotropy = 16;
  //     tex.minFilter = THREE.LinearMipMapLinearFilter;
  //     tex.magFilter = THREE.LinearFilter;
  //   });
  // }, [bgMap, bgNormal, bgRough]);

  return (
    <group {...restProps}>
      {/* Background */}
      {/* <mesh receiveShadow castShadow position={bgConfig.position} scale={bgConfig.scale}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={bgMap} normalMap={bgNormal} roughnessMap={bgRough}  />
      </mesh> */}

        {/* --- 3. THE MASTER GROUP --- */}
      <group 
        position={groupConfig.position} 
        scale={[groupConfig.scale || 1, groupConfig.scale || 1, groupConfig.scale || 1]}
      >
      {/* Shelf */}
        <BookShelf position={shelfConfig.position} scale={shelfConfig.scale} assetMap={assetMap} >
          {/* <meshStandardMaterial color={"#333"} /> */}
        </BookShelf>
      

      {/* Books */}
      {booksConfig.map((cfg) => (
        <Book key={cfg.id} config={cfg} assetMap={assetMap}/>
      ))}
    </group>
    </group>
  );
}