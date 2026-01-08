import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBookStore } from './store';

export function CameraRig() {
  const { camera } = useThree();
  const { currentSection, deviceType, exitMode } = useBookStore();

  useFrame(() => {
    if (deviceType === 'mobile') {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.1);
      return;
    }

    let targetX = 0;

    // --- SAFETY GUARD ---
    // If we are in Section 1 (index 0) or Section 4 (index 3), 
    // FORCE targetX to 0. Ignore everything else.
    if (currentSection === 0 || currentSection === 3) {
        targetX = 0;
    }
    // --- SECTION 2 LOGIC ---
    else if (currentSection === 1) {
        if (exitMode === 'EXIT_SEC_2_UP' || exitMode === 'EXIT_SEC_2_DOWN') {
            targetX = 0; // Returning to center for exit
        } else {
            targetX = -1.5; // Panned Left
        }
    } 
    // --- SECTION 3 LOGIC ---
    else if (currentSection === 2) {
        if (exitMode === 'EXIT_SEC_3_UP') {
             targetX = 0; // Prepare for center/pan
             // Note: If you want it to pan to -1.5 explicitly during exit, set it here.
             // But 0 is safer for the transition.
        } else {
             targetX = 1.5; // Panned Right
        }
    }

    // Smooth Lerp
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
  });

  return null;
}