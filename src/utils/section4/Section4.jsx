import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { HandwrittenSignature } from './HandwrittenSignature';
import { SECTION_4_ASSETS } from '../Configs';
import { useBookStore } from '../store';

export function Section4() {
  const currentSection = useBookStore((state) => state.currentSection);
  const footerRef = useRef(null);
  const contentRef = useRef(null);

  // We keep signature state just for the drawing itself, unrelated to footer
  const [signatureDone, setSignatureDone] = useState(false);

  useGSAP(() => {
    // 1. IF WE ARE IN SECTION 4
    if (currentSection === 3) {
        
        // A. Footer Slides UP (Immediate)
        gsap.to(footerRef.current, {
            y: '0%', 
            duration: 1.0,
            ease: 'power3.out'
        });

        // B. Contact Links: "Alive" Animation
        // Stagger them in nicely
        gsap.fromTo('.contact-item', 
            { y: 30, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'back.out(1.7)' }
        );

        // C. Title Animation (Disappear then Reappear fixed)
        // We just fade it in once.
        gsap.fromTo('.contact-title',
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.1 }
        );

    } 
    // 2. IF WE LEAVE (Reset for next time)
    else {
        // Footer Slides DOWN
        gsap.to(footerRef.current, {
            y: '100%', 
            duration: 0.8,
            ease: 'power3.in'
        });
        
        // Reset items so they can animate in again
        gsap.to('.contact-item', { opacity: 0, duration: 0.3 });
        gsap.to('.contact-title', { opacity: 0, duration: 0.3 });
    }
  }, [currentSection]);

  // Click Animation: Nice "Press" feel
  const handleLinkClick = (e) => {
    gsap.fromTo(e.currentTarget, 
        { scale: 0.9 }, 
        { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-200 relative overflow-hidden">

      {/* Main Content */}
      <div ref={contentRef} className="flex-grow p-8 md:p-16 flex flex-col justify-center items-center text-center pb-32">
        <div className="w-full max-w-2xl mb-8">
          <HandwrittenSignature onComplete={() => setSignatureDone(true)} />
        </div>
        
        {/* Contact Links Area */}
        <div className="flex flex-col items-center">
            <h2 className="contact-title text-3xl font-bold mb-8 opacity-0">Get in touch!</h2>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-12 justify-center items-center w-full px-4">
              
              {/* Email Link */}
              <a 
                href="mailto:your.email@example.com" 
                onClick={handleLinkClick} 
                className="contact-item flex items-center space-x-3 text-base md:text-lg group opacity-0 cursor-pointer p-3 md:p-2 rounded-xl hover:bg-white/50 transition-colors w-full md:w-auto justify-center md:justify-start max-w-sm"
              >
                <div className="p-2 md:p-3 bg-white rounded-full shadow-md transition-transform group-hover:scale-110 group-hover:-rotate-12 flex-shrink-0">
                    <img src={SECTION_4_ASSETS.emailIcon} alt="Email" className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="group-hover:text-blue-600 transition-colors font-medium text-center md:text-left break-all md:break-normal">your.email@example.com</span>
              </a>
              
              {/* LinkedIn Link */}
              <a 
                href="#" 
                onClick={handleLinkClick} 
                className="contact-item flex items-center space-x-3 text-base md:text-lg group opacity-0 cursor-pointer p-3 md:p-2 rounded-xl hover:bg-white/50 transition-colors w-full md:w-auto justify-center md:justify-start max-w-sm"
              >
                <div className="p-2 md:p-3 bg-white rounded-full shadow-md transition-transform group-hover:scale-110 group-hover:-rotate-12 flex-shrink-0">
                    <img src={SECTION_4_ASSETS.linkedinIcon} alt="LinkedIn" className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="group-hover:text-blue-600 transition-colors font-medium">LinkedIn</span>
              </a>

               {/* Instagram Link */}
               <a 
                href="#" 
                onClick={handleLinkClick} 
                className="contact-item flex items-center space-x-3 text-base md:text-lg group opacity-0 cursor-pointer p-3 md:p-2 rounded-xl hover:bg-white/50 transition-colors w-full md:w-auto justify-center md:justify-start max-w-sm"
              >
                <div className="p-2 md:p-3 bg-white rounded-full shadow-md transition-transform group-hover:scale-110 group-hover:-rotate-12 flex-shrink-0">
                    <img src={SECTION_4_ASSETS.instagramIcon} alt="Instagram" className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="group-hover:text-blue-600 transition-colors font-medium">Instagram</span>
              </a>

            </div>
        </div>
      </div>

      {/* SLIDING FOOTER */}
      <div
        ref={footerRef}
        className="absolute bottom-0 left-0 w-full h-[15vh] flex flex-col md:flex-row items-center justify-between px-8 md:px-16 text-gray-400 bg-zinc-900 z-50 translate-y-full"
        style={{ 
            background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.5)'
        }}
      >
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <img src="/images/R1 option 2.png" alt="Logo" className="h-55 w-auto" />
            <span className="text-sm md:text-base">© 2026 Red Pixel Studio</span>
        </div>
        
        
      </div>

    </div>
  );
}