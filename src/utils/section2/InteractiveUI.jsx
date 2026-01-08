// InteractiveUI.jsx
import { useBookStore } from '../store';
import { usePagination } from '../usePagination';
import { IoChevronBack, IoChevronForward, IoCloseOutline } from "react-icons/io5";
import clsx from 'clsx'; 
// This helper component can stay the same
const Button = ({ children, onClick, isActive, isDisabled, isDots, isNav }) => {
  if (isDots) return <span className="w-10 h-10 flex items-center justify-center text-white/50">...</span>;

  const numberButtonStyle = {
    margin: '0 8px',
    backgroundColor: isActive ? '#3B82F6' : 'rgba(255, 255, 255, 0.2)',
    borderRadius: '0.5rem',
    border: '1px solid rgba(0, 0, 0, 0.4)',
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={!isNav && !isDots ? numberButtonStyle : {}}
      className={`w-10 h-10 flex items-center justify-center transition-all duration-200 disabled:opacity-50
                ${isNav ? 'rounded-lg hover:bg-black/20' : ''}`}
    >
      <span className={`text-lg font-bold ${isActive && !isNav ? 'text-white' : 'text-black'}`}>
        {children}
      </span>
    </button>
  );
};


export default function InteractiveUI() {
  const { currentPage, pageCount, setPage, closeBook } = useBookStore();
  const paginationRange = usePagination({ currentPage, pageCount, siblingCount: 1 });

  const onNext = () => setPage(currentPage + 1);
  const onPrevious = () => setPage(currentPage - 1);

  const closeButtonStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'black',
    borderRadius: '0.5rem',
    fontSize: '1.5rem',
    padding: '0.5rem',
    border: '1px solid rgba(0, 0, 0, 1)',
  };

  return (
    // Main container: A simple, full-screen positioning context. No flexbox here.
    <div 
      className={clsx(
        "absolute top-0 right-0 h-full", // Align to right
        "w-[80%] md:w-[66%]", // Fill the REMAINING width (100 - 20 = 80, 100 - 33 = 66)
        "cursor-wait"
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >

      {/* Close Button: Positioned absolutely in the top-right corner. */}
      <button
        onClick={closeBook}
        style={closeButtonStyle}
        className="absolute top-19 lg:top-25 right-4 lg:right-10 z-20" // Use top and right for positioning
      >
        <IoCloseOutline />
      </button>

      {/* Click areas for page turning */}
      <div className="absolute left-0 top-0 w-1/2 h-full cursor-pointer z-10" onClick={onPrevious}></div>
      <div className="absolute right-0 top-0 w-1/2 h-full cursor-pointer z-10" onClick={onNext}></div>
      
      {/* Pagination Wrapper: Positioned absolutely at the bottom, centering its content. */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
        {/* This inner div now correctly holds and centers the buttons */}
        <div className="flex items-center">
            <Button onClick={onPrevious} isDisabled={currentPage === 0} isNav>
              <IoChevronBack />
            </Button>
            {paginationRange.map((pageNumber, index) => (
              <Button
                key={index}
                isDots={pageNumber === '...'}
                isActive={pageNumber === currentPage}
                onClick={() => { if (pageNumber !== '...') setPage(pageNumber) }}
              >
                {pageNumber === 0 ? 'C' : pageNumber}
              </Button>
            ))}
            <Button onClick={onNext} isNav>
              <IoChevronForward />
            </Button>
        </div>
      </div>
    </div>
  );
}