// src/utils/HtmlContent.jsx

import { useState, useRef, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { useBookStore } from './store';
import InteractiveUI from './section2/InteractiveUI.jsx';
import { ContactSection } from './section3/ContactSection';
import { Section4 } from './section4/Section4';
import Section2UI from './section2/Section2UI.jsx';
import MobileSection2 from './section2/MobileSection2.jsx';
import { UI_LAYOUT_CLASSES, SVG_DRAW_GROUPS, HTML_PUPPET_LAYOUTS  } from './Configs';

// HtmlSection component is defined in HtmlSection.jsx
import { HtmlSection } from './HtmlSection';

/**
 * This component orchestrates all HTML content, passing down
 * the 'currentSection' to each child.
 */
export default function HtmlContent() {
  const { bookState, deviceType, currentSection, isPuppetDrawn,isPuppetReady, setPuppetReady } = useBookStore();
  const isBookInteractive = bookState === 'INTERACTIVE';

  // Get the correct layout class for Section 2 based on device type
  const section2LayoutClass = UI_LAYOUT_CLASSES[deviceType]?.section2 || 'w-full h-full ';

  // --- PUPPET LOGIC ---
  const [dotLottie, setDotLottie] = useState(null);
  const isHoveringRef = useRef(false);
  
  const puppetConfig = SVG_DRAW_GROUPS.find(g => g.isPuppet);
  const puppetUrl = puppetConfig?.lottieUrl;
  const puppetLayout = HTML_PUPPET_LAYOUTS[deviceType]; // Get responsive layout

  // EVENT LISTENERS
  useEffect(() => {
    // If we don't have the player instance yet, do nothing
    if (!dotLottie) return;

    // Define the listeners
    const onLoad = () => {
        console.log("Lottie Loaded: Making visible");
        setPuppetReady(true); // <--- Only hide SVG now!
    };

    const onLoop = () => {
        console.log("Lottie Loop Finished");
        if (!isHoveringRef.current) {
            dotLottie.pause();
        }
    };

    // Attach them
    dotLottie.addEventListener('load', onLoad);
    dotLottie.addEventListener('loop', onLoop);

    // Cleanup when component unmounts
    return () => {
        dotLottie.removeEventListener('load', onLoad);
        dotLottie.removeEventListener('loop', onLoop);
    };
  }, [dotLottie, setPuppetReady]);
  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    dotLottie?.play();
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    // Wait for loop
  };

  
  return (
    <>
      {/* Section 1 (Index 0) */}
      <HtmlSection pageIndex={0} currentSection={currentSection} className="flex justify-center items-center relative">
      

        {/* THE LOTTIE PUPPET (Only renders when 3D drawing is done) */}
        {(isPuppetDrawn || isPuppetReady) && puppetUrl && (
            <div
                style={{
                    position: 'absolute',
                    top: puppetLayout.top,
                    left: puppetLayout.left,
                    width: puppetLayout.width,
                    transform: 'translate(-50%, -50%)', // Centers div on coordinates
                    zIndex: 10, // Above text
                    pointerEvents: 'auto',
                    opacity: isPuppetReady ? 1 : 0,
                    transition: 'opacity 0.2s ease-in'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <DotLottieReact
                    src={puppetUrl}
                    loop
                    autoplay={false}
                    dotLottieRefCallback={setDotLottie}
                    backgroundColor="transparent"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        )}
      </HtmlSection>

      {/* Section 2 (Index 1) - My Works */}
      <HtmlSection 
        pageIndex={1} 
        className={section2LayoutClass} 
        currentSection={currentSection}
      >
        {/* Mobile: Use lightweight image slider, Desktop/Tablet: Use 3D books with UI */}
        {deviceType === 'mobile' ? (
          <MobileSection2 />
        ) : (
          <>
            {/* 2. ADD THE SLIDING UI */}
            {/* It lives in the background of this section */}
            <Section2UI />
            
            {/* 3. Keep the Pagination UI (Only appears when fully interactive) */}
            {isBookInteractive && <InteractiveUI />}
          </>
        )}
      </HtmlSection>

      {/* Section 3 (Index 2) - Contact Slider */}
      <HtmlSection pageIndex={2} currentSection={currentSection}>
        <ContactSection />
      </HtmlSection>

      {/* Section 4 (Index 3) - Signature & Footer */}
      <HtmlSection pageIndex={3} currentSection={currentSection}>
        {/* Section4 component will now contain both signature and footer */}
        <Section4 />
      </HtmlSection>
    </>
  );
}