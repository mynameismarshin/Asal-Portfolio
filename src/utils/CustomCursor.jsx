import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useBookStore } from './store';

export function CustomCursor() {
  const { deviceType } = useBookStore();
  
  // Refs for DOM elements (Direct access, no state re-renders)
  const cursorRef = useRef(null); // The big lagging ring
  const dotRef = useRef(null);    // The center instant dot
  
  // Refs for logic
  const mouse = useRef({ x: 0, y: 0 }); // Current real mouse pos
  const delayedMouse = useRef({ x: 0, y: 0 }); // Lagging pos
  const cursorSpeed = 0.15; // The "weight" of the cursor
  const isHovering = useRef(false);

  useEffect(() => {
    // 1. Safety Check: No custom cursor on touch devices
    if (deviceType === 'mobile') return;

    // 2. GSAP SETTERS (High Perf)
    const setCursorX = gsap.quickSetter(cursorRef.current, "x", "px");
    const setCursorY = gsap.quickSetter(cursorRef.current, "y", "px");
    const setDotX = gsap.quickSetter(dotRef.current, "x", "px");
    const setDotY = gsap.quickSetter(dotRef.current, "y", "px");

    // 3. EVENT LISTENERS
    // Passive listener for scrolling performance, though mousemove usually isn't passive.
    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      // Update the instant dot immediately
      setDotX(e.clientX);
      setDotY(e.clientY);
    };

    // 4. ANIMATION LOOP (Runs every frame)
    let animationFrameId;
    const loop = () => {
      // Lerp math for the smooth "lag" effect
      delayedMouse.current.x += (mouse.current.x - delayedMouse.current.x) * cursorSpeed;
      delayedMouse.current.y += (mouse.current.y - delayedMouse.current.y) * cursorSpeed;

      // Update the ring position
      setCursorX(delayedMouse.current.x);
      setCursorY(delayedMouse.current.y);
      
      animationFrameId = requestAnimationFrame(loop);
    };
    loop(); // Start loop

    // 5. INTERACTION HANDLERS
    const onMouseDown = () => {
        // "Cute" Click: Ring shrinks, Dot explodes slightly
        gsap.to(cursorRef.current, { scale: 0.8, duration: 0.15, ease: "power2.out" });
        gsap.to(dotRef.current, { scale: 1.5, duration: 0.15, ease: "power2.out" });
    };

    const onMouseUp = () => {
        // Bounce back
        gsap.to(cursorRef.current, { scale: isHovering.current ? 1.5 : 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
        gsap.to(dotRef.current, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
    };

    // Smart Hover Detection (Delegation)
    const onMouseOver = (e) => {
        const target = e.target;
        // Detect links, buttons, or anything clickable
        const isLink = target.tagName === 'A' || 
                       target.tagName === 'BUTTON' ||
                       target.closest('a') || 
                       target.closest('button') ||
                       target.classList.contains('cursor-pointer') ||
                       target.classList.contains('cursor-grab');

        if (isLink) {
            isHovering.current = true;
            // Hover State: Ring gets bigger, opacity drops slightly to let text show through
            gsap.to(cursorRef.current, { scale: 1.5, opacity: 1, duration: 0.3 });
        }
    };

    const onMouseOut = (e) => {
        const target = e.target;
        const isLink = target.tagName === 'A' || 
                       target.tagName === 'BUTTON' ||
                       target.closest('a') || 
                       target.closest('button') ||
                       target.classList.contains('cursor-pointer') ||
                       target.classList.contains('cursor-grab');
                       
        if (isLink) {
            isHovering.current = false;
            gsap.to(cursorRef.current, { scale: 1, opacity: 1, duration: 0.3 });
        }
    };

    // Attach Listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, [deviceType]);

  if (deviceType === 'mobile') return null;

  return (
    <>
      {/* 1. HIDE DEFAULT CURSOR GLOBALLY */}
      <style>{`
        body, a, button, input, textarea, .cursor-pointer, .cursor-grab {
          cursor: none !important;
        }
        /* CSS Animation for the Orbiting Dot */
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* 2. MAIN RING (The Lagging One) */}
      <div 
        ref={cursorRef}
        // mix-blend-difference makes it WHITE on dark bg, and BLACK on light bg.
        // pointer-events-none is crucial so clicks pass through.
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[10000] mix-blend-difference"
        style={{ 
            transform: 'translate(-50%, -50%)',
            border: '2px solid white' // Thicker border as requested
        }} 
      >
        {/* 3. ORBITING DOT (Child of Ring, rotates with CSS) */}
        <div 
            className="absolute top-0 left-0 w-full h-full"
            style={{ animation: 'orbitSpin 4s linear infinite' }}
        >
            {/* The actual dot sitting on the rim */}
            <div className="w-1.5 h-1.5 bg-white rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2" />
        </div>
      </div>
      
      {/* 4. CENTER DOT (The Instant One) */}
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ transform: 'translate(-50%, -50%)' }} 
      />
    </>
  );
}