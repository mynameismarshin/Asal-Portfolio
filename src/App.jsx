
import Home from './utils/Home.jsx';
import { CustomCursor } from './utils/CustomCursor.jsx';
import Loader from './utils/Loader.jsx'; 
import { useBookStore } from './utils/store'; 
import { useScalingLogic } from './utils/useScalingLogic.js'; // <--- IMPORT THIS

export default function App() {
  // 1. RUN SCALING LOGIC HERE (Top Level)
  // This ensures 1rem is calculated correctly BEFORE the scene loads.
  useScalingLogic();

  const isLoadedAndStarted = useBookStore((state) => state.isLoadedAndStarted);
  const setLoadedAndStarted = useBookStore((state) => state.setLoadedAndStarted);

  return (
    <>
      <CustomCursor />
      {/* Loader renders immediately, controls its own visibility */}
      <Loader onEnter={setLoadedAndStarted} />
      {/* Home renders immediately but may be behind loader */}
      {isLoadedAndStarted && <Home />}
    </>
  );
}