import { useMemo, useRef } from 'react';
import { useBookStore } from '../store';
import { booksConfigMap } from '../Configs';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function Section2UI() {
  const { deviceType, bookState, selectedBookId, selectBook, currentSection, exitMode } = useBookStore();
  
  const books = useMemo(() => booksConfigMap[deviceType] || [], [deviceType]);
  const stopTouchPropagation = (e) => {
    e.stopPropagation(); 
    // e.nativeEvent.stopImmediatePropagation(); // Use this if the first one fails
  };
  // Include CLOSING so details stay visible during exit animation
  const isBookOpen = ['OPENING', 'INTERACTIVE', 'PAGES_CLOSING', 'CLOSING'].includes(bookState);
  const selectedBook = books.find(b => b.id === selectedBookId);

  const containerRef = useRef();
  const listRef = useRef();
  const detailsRef = useRef();
  const titleRefs = useRef([]); // Refs for the staggered titles

  // 1. SLIDE IN / SLIDE OUT LOGIC (Entry/Exit)
  useGSAP(() => {
    if (!containerRef.current) return;

    // IF: We are in Section 2 AND NOT executing an exit sequence
    if (currentSection === 1 && !exitMode) {
        
        // Slide In (0%)
        gsap.to(containerRef.current, { 
            x: '0%', 
            duration: 1.2, 
            ease: 'power3.out' ,
            delay: 0.2 // Wait for landing
        });

        // Stagger Titles (Only if book isn't already open)
        if (!isBookOpen) {
            gsap.fromTo(titleRefs.current, 
                { x: -50, opacity: 0 }, 
                { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'back.out(1.7)' }
            );
        }
    } 
    // ELSE: Slide Out (-100%)
    else {
        gsap.to(containerRef.current, { 
            x: '-100%', 
            duration: 0.8, 
            ease: 'power3.in' 
        });
    }
  }, { dependencies: [currentSection, exitMode], scope: containerRef });

  // 2. LIST VS DETAILS TOGGLE (Internal State)
  useGSAP(() => {
    if (!listRef.current || !detailsRef.current) return;

    if (isBookOpen && selectedBook) {
        // --- OPENING (Show Details) ---
        gsap.to(listRef.current, { x: '-50%', opacity: 0, duration: 0.5, ease: 'power2.in' });
        
        gsap.fromTo(detailsRef.current, 
            { x: '20%', opacity: 0 },
            { x: '0%', opacity: 1, duration: 0.6, delay: 0.3, ease: 'power2.out' }
        );
    } else {
        // --- CLOSING (Show List) ---
        gsap.to(detailsRef.current, { x: '20%', opacity: 0, duration: 0.4, ease: 'power2.in' });
        
        gsap.to(listRef.current, { x: '0%', opacity: 1, duration: 0.6, delay: 0.2, ease: 'power2.out' });
        
        // 3. RESTORED: THE STAGGER EFFECT!
        // When coming back to the list, we gently stagger the titles back in.
        gsap.fromTo(titleRefs.current,
            { x: -20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, stagger: 0.05, delay: 0.3, ease: 'power2.out' }
        );
    }
  }, { dependencies: [isBookOpen, selectedBookId], scope: containerRef });

  if (deviceType === 'mobile' && isBookOpen) return null;

  return (
    <div 
        ref={containerRef} 
        className="absolute left-0 top-0 h-full w-[20%] md:w-1/3 flex flex-col justify-center px-8 md:px-16 pointer-events-auto bg-gray-200 shadow-2xl -translate-x-full z-10"
        onTouchStart={stopTouchPropagation}
        onTouchMove={stopTouchPropagation} 
        onPointerDown={stopTouchPropagation}
    >
        {/* List View */}
        <div ref={listRef} className="absolute inset-0 flex flex-col justify-center px-2 md:px-16">
            <h2 className="hidden md:block text-xl md:text-2xl font-bold mb-8 text-black/50 uppercase tracking-widest">Collection</h2>
            <div className="flex flex-col space-y-6">
                {books.map((book, index) => (
                    <button 
                        key={book.id}
                        onClick={() => selectBook(book.id, book.pages.length)}
                        className="text-left group"
                        // Connect the ref here!
                        ref={el => titleRefs.current[index] = el}
                    >
                        <span 
                            className="text-lg md:text-5xl font-caveat font-bold transition-all duration-300 group-hover:scale-105 group-hover:translate-x-4 inline-block truncate w-full"
                            style={{ color: book.uiColor || 'black' }}
                        >
                            {deviceType === 'mobile' ? (book.title?.[0] || "B") : (book.title || "Untitled")}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        {/* Details View */}
        <div ref={detailsRef} className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 opacity-0 pointer-events-none">
             {selectedBook && (
                <>
                    <h2 className="text-4xl md:text-6xl font-caveat font-bold mb-4" style={{ color: selectedBook.uiColor || 'black' }}>
                        {selectedBook.title}
                    </h2>
                    <p className="text-lg md:text-xl text-black/80 font-medium max-w-xs leading-relaxed">
                        {selectedBook.description}
                    </p>
                </>
             )}
        </div>
    </div>
  );
}