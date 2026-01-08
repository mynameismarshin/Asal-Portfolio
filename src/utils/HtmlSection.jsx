// HtmlSection.jsx
import { useMemo } from 'react';
import { useBookStore } from './store';

// This component will wrap each section of your HTML UI
export const HtmlSection = ({ children, pageIndex, className, currentSection }) => {
  const { sectionLayouts } = useBookStore();
  
  // Use sectionLayouts from store, fallback to calculated value
  const topClass = useMemo(() => {
    return sectionLayouts[pageIndex]?.topClass ?? `top-[${pageIndex * 100}vh]`;
  }, [sectionLayouts, pageIndex]);
  
  const isVisible = pageIndex === currentSection;

  return (
    <div
      className={`absolute w-screen h-screen pt-20 box-border ${topClass} ${className || ''}`}
      // If this section is NOT the active section,
      // it becomes 'inert', disabling all tabbing and clicks.
      {...(isVisible ? {} : { inert: "true" })}
    >
      {children}
    </div>
  );
};