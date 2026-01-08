// MobileSection2.jsx - Lightweight mobile version with simple image slider
import { useState, useRef, useEffect, useMemo } from 'react';
import { useBookStore } from '../store';
import { booksConfigMap } from '../Configs';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function MobileSection2() {
  const { deviceType, currentSection, exitMode } = useBookStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  
  // Get mobile book config (only has mobile-showcase book)
  const books = useMemo(() => booksConfigMap[deviceType] || [], [deviceType]);
  const currentBook = books[currentIndex] || books[0];
  const pages = useMemo(() => currentBook?.pages || [], [currentBook]);

  // Handle slide in/out based on section
  useGSAP(() => {
    if (!containerRef.current) return;

    if (currentSection === 1 && !exitMode) {
      gsap.to(containerRef.current, {
        x: '0%',
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2
      });
    } else {
      gsap.to(containerRef.current, {
        x: '-100%',
        duration: 0.8,
        ease: 'power3.in'
      });
    }
  }, { dependencies: [currentSection, exitMode], scope: containerRef });

  // Handle page navigation
  const nextPage = () => {
    if (pages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % pages.length);
    }
  };

  const prevPage = () => {
    if (pages.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + pages.length) % pages.length);
    }
  };

  // Animate page transitions
  useEffect(() => {
    if (!sliderRef.current) return;
    gsap.to(sliderRef.current, {
      x: `-${currentIndex * 100}%`,
      duration: 0.5,
      ease: 'power2.inOut'
    });
  }, [currentIndex]);

  if (currentSection !== 1 && exitMode) return null;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-0 h-full w-full bg-gray-200 -translate-x-full z-10"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Page Slider */}
        <div
          ref={sliderRef}
          className="flex h-full transition-transform duration-500"
          style={{ width: `${pages.length * 100}%` }}
        >
          {pages.map((page, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full h-full flex items-center justify-center"
              style={{ width: `${100 / pages.length}%` }}
            >
              <img
                src={page.pageMap}
                alt={`Page ${index + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {pages.length > 1 && (
          <>
            <button
              onClick={prevPage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full z-20 hover:bg-black/70 transition-colors"
              aria-label="Previous page"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextPage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full z-20 hover:bg-black/70 transition-colors"
              aria-label="Next page"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Page Indicator */}
        {pages.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-black w-8' : 'bg-black/30'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Book Title */}
        {currentBook && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 text-center">
            <h2
              className="text-2xl md:text-3xl font-caveat font-bold"
              style={{ color: currentBook.uiColor || 'black' }}
            >
              {currentBook.title}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}

