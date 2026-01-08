import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LOGO_SVG_URL = "/svg/loading-svg.svg"; 
const BUTTON_LOTTIE_URL = "/Button-forward.lottie"; 

const Loader = ({ onEnter }) => {
  const { progress } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [scale, setScale] = useState(1);

  // Responsive Scaling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setScale(0.7);
      else if (window.innerWidth < 1024) setScale(0.85);
      else setScale(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth Progress
  useEffect(() => {
    if (displayProgress < progress) {
      const diff = progress - displayProgress;
      const inc = diff > 0 ? Math.ceil(diff / 5) : 0;
      const t = setTimeout(() => setDisplayProgress(p => Math.min(p + inc, 100)), 20);
      return () => clearTimeout(t);
    }
  }, [progress, displayProgress]);

  // Ready State
  useEffect(() => {
    if (displayProgress === 100) {
      const t = setTimeout(() => setIsReady(true), 500);
      return () => clearTimeout(t);
    }
  }, [displayProgress]);

  // Click Handler
  const handleClick = () => {
    setIsFading(true);
    setTimeout(() => onEnter(), 1000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 1s ease-in-out",
        opacity: isFading ? 0 : 1,
        pointerEvents: isFading ? "none" : "auto",
        cursor: "none", 
        visibility: isFading ? "hidden" : "visible",
      }}
    >
      <div style={{ transform: `scale(${scale})`, transition: "transform 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
        
        {/* Instant Logo */}
        <img src={LOGO_SVG_URL} alt="Logo" style={{ width: "250px", height: "auto", display: "block", marginBottom: "10px" }} />

        {/* Loading Bar */}
        {!isReady && (
          <div style={{ width: "250px", height: "4px" }}>
            <svg width="100%" height="100%" viewBox="0 0 250 4">
              <rect width="250" height="4" fill="#e0e0e0" rx="2" />
              <rect width={`${(displayProgress / 100) * 250}`} height="4" fill="#000000" rx="2" style={{ transition: "width 0.1s linear" }} />
            </svg>
          </div>
        )}

        {/* Enter Button */}
        {isReady && (
          <div onClick={handleClick} style={{ width: 150, height: 150, marginTop: "-10px", animation: "fadeIn 0.5s ease-in-out" }}>
             <DotLottieReact src={BUTTON_LOTTIE_URL}  autoplay style={{ width: '100%', height: '100%' }} />
             <div className="text-sm font-bold tracking-widest text-black text-center mt-2 uppercase">Enter</div>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};
export default Loader;