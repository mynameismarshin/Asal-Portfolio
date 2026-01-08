// usePagination.js
import { useMemo } from 'react';

export const usePagination = ({
  pageCount,
  siblingCount = 1, // How many pages to show on each side of the current page
  currentPage,
}) => {
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5; // e.g., 1 sibling + first, last, current, 2 ellipses

    // Case 1: Not enough pages to bother with ellipses
    if (totalPageNumbers >= pageCount) {
      return Array.from({ length: pageCount + 1 }, (_, i) => i);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, pageCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < pageCount - 2;

    const firstPageIndex = 0;
    const lastPageIndex = pageCount;

    // Case 2: Right dots are visible, left are not
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount + 1 }, (_, i) => i);
      return [...leftRange, '...', lastPageIndex];
    }

    // Case 3: Left dots are visible, right are not
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from({ length: rightItemCount + 1 }, (_, i) => lastPageIndex - rightItemCount + i);
      return [firstPageIndex, '...', ...rightRange];
    }

    // Case 4: Both dots are visible
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
  }, [pageCount, siblingCount, currentPage]);

  return paginationRange;
};