import { useEffect } from 'react';

export function useScalingLogic() {
  
  useEffect(() => {
    const updateRootFontSize = () => {
      // Get the device's scaling factor (e.g., 1, 1.5, 2)
      const pixelRatio = window.devicePixelRatio || 1;
      
      // We want 1rem to *always* equal 16 logical pixels.
      // By dividing 16px by the ratio, we counteract the browser's
      // automatic scaling of 'rem' units.
      const logicalFontSize = 16 / pixelRatio;
      
      document.documentElement.style.fontSize = `${logicalFontSize}px`;
    };

    // Run it on mount
    updateRootFontSize();

    // Re-run it if the user drags the window to a different monitor
    const mediaQuery = `(resolution: ${window.devicePixelRatio}dppx)`;
    const mediaQueryList = window.matchMedia(mediaQuery);
    
    // The modern, clean way.
    mediaQueryList.addEventListener('change', updateRootFontSize);
    return () => mediaQueryList.removeEventListener('change', updateRootFontSize);
    
  }, []);
}