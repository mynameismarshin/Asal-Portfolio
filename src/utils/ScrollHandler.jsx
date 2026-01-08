import { useEffect, useRef } from 'react';
import { useScroll } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useBookStore } from './store';
import { SCROLL_CONFIG } from './Configs.js';

export default function ScrollHandler() {
  const scroll = useScroll();
  const { size } = useThree(); 
  
  const isLocked = useRef(false);
  const touchStartY = useRef(0);
  const scrollFunctionsRef = useRef(null);

  const {
    currentSection,
    setCurrentSection,
    setExitMode,
    deviceType,
    scrollToSection,
    setScrollToSection,
  } = useBookStore();

  const config = SCROLL_CONFIG[deviceType] || SCROLL_CONFIG.desktop;
  const pages = config.pages;
  const scrollDenominator = Math.max(1, pages - 1);

  useEffect(() => {
    const el = scroll.el;

    // --- EXECUTE SCROLL ---
    const performScroll = (targetPage) => {
      const targetScrollTop = (targetPage / scrollDenominator) * (scroll.el.scrollHeight - size.height);

      gsap.to(scroll.el, {
        scrollTop: targetScrollTop,
        duration: 1.2,
        ease: 'power3.inOut',
        onComplete: () => {
          setCurrentSection(targetPage);
          setExitMode(null);
          // Unlock ONLY after animation is fully done
          isLocked.current = false;
        },
      });
    };

    // --- SEQUENCER (Wait then Scroll) ---
    const sequenceExit = (exitSignal, targetPage) => {
        setExitMode(exitSignal); 
        
        // Wait 0.8s
        gsap.to({}, {
            duration: 0.8,
            onComplete: () => performScroll(targetPage)
        });
    };

    // --- PARALLEL (Scroll Immediately) ---
    const parallelExit = (exitSignal, targetPage) => {
        setExitMode(exitSignal);
        performScroll(targetPage);
    };

    // --- INTERNAL HANDLER (used by both user input and navigation) ---
    const handleScrollAttemptInternal = (direction, event, explicitTarget = null) => {
      // 1. HARD LOCK: If moving, REJECT ALL INPUT (unless explicit target)
      if (isLocked.current && explicitTarget === null) {
          if (event && event.cancelable) event.preventDefault();
          return;
      }

      let targetPage = explicitTarget !== null ? explicitTarget : currentSection;
      if (explicitTarget === null) {
        if (direction === 'down') targetPage = Math.min(currentSection + 1, pages - 1);
        if (direction === 'up') targetPage = Math.max(currentSection - 1, 0);
      }

      if (targetPage === currentSection) return;

      // 2. LOCK IMMEDIATELY
      if (event && event.cancelable) event.preventDefault();
      if (!isLocked.current) isLocked.current = true;

      // --- TRANSITION RULES ---

      // 1. Sec 2 -> Sec 1 (UP): SEQUENTIAL (Wait for UI)
      if (currentSection === 1 && targetPage === 0) {
          sequenceExit('EXIT_SEC_2_UP', 0);
          return;
      }

      // 2. Sec 2 -> Sec 3 (DOWN): PARALLEL (Smooth flow)
      if (currentSection === 1 && targetPage === 2) {
          parallelExit('EXIT_SEC_2_DOWN', 2);
          return;
      }

      // 3. Sec 3 -> Sec 2 (UP): PARALLEL (Smooth flow)
      if (currentSection === 2 && targetPage === 1) {
          parallelExit('EXIT_SEC_3_UP', 1);
          return;
      }

      // 4. Sec 3 -> Sec 4 (DOWN): SEQUENTIAL (Wait for UI to hide)
      if (currentSection === 2 && targetPage === 3) {
          sequenceExit('EXIT_SEC_3_DOWN', 3);
          return;
      }

      // Default: Just Scroll
      performScroll(targetPage);
    };

    // Store functions in ref for navigation handler
    scrollFunctionsRef.current = { performScroll, handleScrollAttemptInternal };

    // --- INPUT HANDLER (user scroll) ---
    const handleScrollAttempt = (direction, event) => {
      handleScrollAttemptInternal(direction, event, null);
    };
    
    // --- LISTENERS ---
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > 20) {
          handleScrollAttempt(e.deltaY > 0 ? 'down' : 'up', e);
      } else if (isLocked.current && e.cancelable) {
          e.preventDefault(); // Kill small jitters if locked
      }
    };
    const handleTouchStart = (e) => touchStartY.current = e.touches[0].clientY;
    const handleTouchEnd = (e) => {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 50) handleScrollAttempt(delta > 0 ? 'down' : 'up', e);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scroll, currentSection, size, setExitMode, pages, scrollDenominator, setCurrentSection]);

  // Handle navigation from Header
  useEffect(() => {
    if (scrollToSection === null || scrollToSection === currentSection) return;
    if (isLocked.current) return; // Don't interrupt ongoing scroll
    if (!scrollFunctionsRef.current) return; // Functions not ready yet

    const targetPage = scrollToSection;
    const fromSection = currentSection;
    
    // Determine if we should skip camera animations (jumping sections)
    const shouldSkipAnimations = 
      (fromSection === 0 && targetPage > 1) || // Jumping from 1 to 3 or 4
      (fromSection === 1 && targetPage === 3) || // Jumping from 2 to 4
      (fromSection === 3 && targetPage === 1) || // Jumping from 4 to 2
      (fromSection === 0 && targetPage === 3); // Jumping from 1 to 4

    isLocked.current = true;
    setScrollToSection(null); // Clear the trigger

    if (shouldSkipAnimations) {
      // Direct scroll without exit animations
      const targetScrollTop = (targetPage / scrollDenominator) * (scroll.el.scrollHeight - size.height);
      gsap.to(scroll.el, {
        scrollTop: targetScrollTop,
        duration: 1.0,
        ease: 'power3.inOut',
        onComplete: () => {
          setCurrentSection(targetPage);
          setExitMode(null);
          isLocked.current = false;
        },
      });
    } else {
      // Use normal transition rules via internal handler
      const direction = targetPage - fromSection > 0 ? 'down' : 'up';
      scrollFunctionsRef.current.handleScrollAttemptInternal(direction, null, targetPage);
    }
  }, [scrollToSection, currentSection, scroll, size, scrollDenominator, setCurrentSection, setExitMode, setScrollToSection]);

  return null;
}
