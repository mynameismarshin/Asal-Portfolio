// Header.jsx
import  { useState } from 'react';
import { useBookStore } from './store';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const SECTIONS = ['Home', 'My Works', 'About Me', 'Contact'];

export default function Header() {
  const isLoadedAndStarted = useBookStore((state) => state.isLoadedAndStarted);
  const { currentSection, setScrollToSection } = useBookStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (index) => {
    setScrollToSection(index);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 h-20 w-full p-4 z-50 bg-black/5 backdrop-blur-lg 
                    transition-opacity duration-1000 ease-in-out 
                    ${isLoadedAndStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center h-8">
            <img 
              src="/images/logo.png" /* Path to your logo in the `public` folder */
              alt="Logo"
              href="#" 
              className="h-14 w-14 mr-9" /* Adjust size and margin as needed */
            />
          <a href="#" className="text-4xl  text-black  font-caveat">
            
            {/* 2. Add your name */ }
            <span>Asal Kojvarzade Nobari</span>
          </a>
          </div>
          {/* Desktop Navigation */}
          {/* ## 1. Spacing Increased ## */}
          <nav className="hidden md:flex justify-center space-x-12 font-caveat">
            {SECTIONS.map((sectionName, index) => (
              <button
                key={sectionName}
                onClick={() => handleNavClick(index)}
                // ## 2. Active color is now 'text-white' ##
                className={`px-3 py-1 text-3xl transition-colors
                  ${currentSection === index 
                    ? 'text-white' // Active style
                    : 'text-black hover:text-white' // Inactive style
                  }`}
              >
                {sectionName}
              </button>
            ))}
          </nav>

          {/* Hamburger Menu Button (Mobile) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-2xl text-white z-50"
            aria-label="Open navigation menu"
          >
            {isMenuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-40 
                     flex flex-col items-center justify-center md:hidden"
        >
          <nav className="flex flex-col items-center space-y-8">
            {SECTIONS.map((sectionName, index) => (
              <button
                key={sectionName}
                onClick={() => handleNavClick(index)}
                // ## 3. Active color is also 'text-white' here ##
                className={`text-3xl font-semibold transition-colors font-ink-free
                  ${currentSection === index 
                    ? 'text-white' // Active style
                    : 'text-black hover:text-white' // Inactive style
                  }`}
              >
                {sectionName}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}