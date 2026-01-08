// utils/ViewportObserver.jsx
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber'
import { useBookStore } from './store';

export default function ViewportObserver() {
  // Get the 'size' object from R3F
  const { height } = useThree(({ size }) => size);
  // Get the action from our store
  const setViewportHeight = useBookStore((state) => state.setViewportHeight);

  // This effect runs whenever the canvas height changes
  useEffect(() => {
    setViewportHeight(height);
  }, [height, setViewportHeight]);

  return null; // This component renders nothing
}