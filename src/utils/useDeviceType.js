import { useState, useEffect } from 'react';

export function useDeviceType() {
  const getDevice = (width) => {
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  };

  const [device, setDevice] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getDevice(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      const newDevice = getDevice(window.innerWidth);
      setDevice((prev) => (prev !== newDevice ? newDevice : prev));
    };
    // Simple debounce to prevent thrashing
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return device;
}