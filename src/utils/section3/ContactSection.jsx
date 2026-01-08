import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SECTION_3_ASSETS } from '../Configs';
import { useBookStore } from '../store';
import { useGSAP } from '@gsap/react';

export function ContactSection() {
  const [isOpen, setIsOpen] = useState(false);
  const { deviceType, currentSection, exitMode } = useBookStore();
  const containerRef = useRef(null);

  const touchStartX = useRef(0);
  const isSwiping = useRef(false);

  // 1. SETUP: Set initial state immediately
  // We remove 'translate-x-full' from CSS and do it here to avoid conflicts
  useGSAP(() => {
    const panel = containerRef.current.querySelector('.white-panel');
    // Start completely off-screen (100%)
    if (panel) gsap.set(panel, { x: '100%' });
  }, { scope: containerRef });

  // 2. ANIMATION LOOP
  useEffect(() => {
    const isMobile = deviceType === 'mobile';
    const isActive = currentSection === 2 && !exitMode;

    const q = (selector) => containerRef.current?.querySelector(selector);
    const targets = {
      panel: q('.white-panel'),
      leftCol: q('.left-column'),
      img: q('.profile-img'),
      content: q('.content-right'),
      textWrapper: q('.text-wrapper'),
      button: q('.swipe-button')
    };

    if (!targets.panel) return;

    // --- CASE 1: EXIT (User scrolled away) ---
    if (!isActive) {
      // Move completely off-screen (use 100% to ensure full exit)
      gsap.to(targets.panel, { x: '100%', duration: 0.8, ease: 'power3.in', overwrite: true });
      
      // Reset Left Column
      if (!isMobile) {
        gsap.to(targets.leftCol, { width: '75%', opacity: 1, duration: 0.8, overwrite: true });
        gsap.to(targets.textWrapper, { scale: 1, x: 0, duration: 0.8, overwrite: true });
      } else {
        // Reset mobile image position
        if (targets.img) gsap.to(targets.img, { x: 0, opacity: 1, duration: 0.6, overwrite: true });
      }
      if (isOpen) setIsOpen(false);
      return;
    }

    // --- CASE 2: ACTIVE (User is on Section 3) ---
    if (isOpen) {
      // === OPEN STATE ===
      gsap.to(targets.content, { opacity: 1, duration: 0.5, delay: 0.3, stagger: 0.1, overwrite: true });

      if (!isMobile) {
        // Desktop Open
        gsap.to(targets.panel, { x: '0%', width: '66.67%', duration: 1.0, ease: 'power2.inOut', overwrite: true });
        gsap.to(targets.leftCol, { width: '33.33%', duration: 1.0, ease: 'power2.inOut', overwrite: true });
        gsap.to(targets.textWrapper, { scale: 0.8, x: 0, duration: 1.0, ease: 'power2.inOut', overwrite: true });
      } else {
        // Mobile Open
        gsap.to(targets.panel, { x: '0%', duration: 0.8, ease: 'power2.inOut', overwrite: true });
        gsap.to(targets.img, { x: '-100%', opacity: 0, duration: 0.6, overwrite: true });
        gsap.to(targets.textWrapper, { scale: 0.9, duration: 0.8, overwrite: true });
      }
    } 
    else {
      // === PREVIEW STATE (The default view when you arrive) ===
      gsap.to(targets.content, { opacity: 0, duration: 0.3, overwrite: true }); 

      if (!isMobile) {
        // Desktop Preview: Stick out 8rem
        // calc(100% - 8rem) ensures exactly 8rem is visible
        gsap.to(targets.panel, { x: 'calc(100% - 8rem)', width: '25%', duration: 1.2, ease: 'power3.out', overwrite: true });
        
        gsap.to(targets.leftCol, { width: '75%', duration: 1.2, overwrite: true });
        gsap.to(targets.textWrapper, { scale: 1, x: 0, duration: 1.2, overwrite: true });
      } else {
        // Mobile Preview: Stick out 30% (more visible)
        gsap.to(targets.panel, { x: '70%', duration: 1.2, ease: 'power3.out', overwrite: true });
        gsap.to(targets.img, { x: 0, opacity: 1, duration: 0.6, overwrite: true });
        gsap.to(targets.textWrapper, { scale: 1, duration: 1.2, overwrite: true });
      }
    }
  }, [currentSection, isOpen, deviceType, exitMode]);

  // --- HANDLERS (Stop Propagation added) ---
  const stopProp = (e) => e.stopPropagation();

  const handlePointerDown = (e) => {
    stopProp(e);
    e.target.setPointerCapture(e.pointerId);
    touchStartX.current = e.clientX;
    isSwiping.current = false;
  };

  const handlePointerUp = (e) => {
    stopProp(e);
    e.target.releasePointerCapture(e.pointerId);
    if (Math.abs(e.clientX - touchStartX.current) > 50) {
      isSwiping.current = true;
      setIsOpen(e.clientX < touchStartX.current);
    }
  };

  const handleClick = (e) => {
    stopProp(e);
    if (!isSwiping.current) setIsOpen(!isOpen);
    isSwiping.current = false;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      
      {/* LEFT CONTENT */}
      <div className="left-column absolute top-0 left-0 h-full z-10 flex items-center w-full md:w-[75%] overflow-hidden">
        <div className="text-wrapper hover-text-focus p-4 pt-10 md:p-16 md:mt-0 w-[90%] md:w-[80%] flex flex-col justify-center cursor-default origin-left">
          <img src="/images/logo.png" alt="Logo" className="w-16 h-16 md:w-48 md:h-48 mb-4 md:mb-10 pointer-events-none" />
          <h1 className="text-2xl md:text-6xl font-bold text-black max-w-4xl mb-2">ASAL KOJVARZADEH NOBARI</h1>
          <h2 className="text-lg md:text-3xl underline mt-1 md:mt-2 font-bold text-black mb-8 inline-block">Architect</h2>
          <div className="mt-4 md:mt-8">
            <h3 className="text-base md:text-xl font-bold mb-2 text-black/80">About Me</h3>
            <p className="text-xs md:text-xl lg:text-xl text-black font-bold max-w-full md:max-w-7xl leading-relaxed">
              I am an architect who is enthusiastic about sustainable architecture...
            </p>
          </div>
        </div>
      </div>

      {/* WHITE PANEL */}
      {/* IMPORTANT: Removed 'translate-x-full' class to let GSAP handle X position */}
      <div
        className="white-panel absolute top-0 right-0 h-full bg-white z-20 w-full md:w-[25%] cursor-grab active:cursor-grabbing touch-pan-y"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onTouchStart={stopProp} 
        onTouchMove={stopProp}
      >
        <img src="/images/asali.jpg" alt="Portrait" className="profile-img absolute top-16 md:top-36 left-1/2 w-20 h-20 md:w-64 md:h-64 rounded-full border-4 border-white transform -translate-x-1/2 z-30 pointer-events-none" />
        <img src={SECTION_3_ASSETS.indesignLayoutSvg} alt="Contact Info" className="content-right opacity-0 w-full h-full object-contain p-4 md:p-16 pointer-events-none" />

        <button
          className="swipe-button absolute top-1/2 -translate-y-1/2 -left-12 z-40 flex items-center space-x-2 text-black p-2 cursor-pointer w-32"
          onPointerDown={handlePointerDown} // Let button drag too
        >
          <svg className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-500 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 18L5 12L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold text-lg md:text-2xl select-none">{isOpen ? 'BACK' : 'SWIPE'}</span>
        </button>

      </div>
    </div>
  );
}