// store.js
import { create } from 'zustand';
import { SCROLL_CONFIG } from './Configs.js'; // 1. Import config into the store

export const useBookStore = create((set, get) => ({
  // State
  selectedBookId: null,
  currentPage: 0,
  pageCount: 0,
  currentSection: 0, // This represents the main scroll section
  scrollToSection: null, // State to trigger a scroll to a specific section
  deviceType: 'desktop',
  bookState: 'SHELF', // Initial state
  sectionLayouts: SCROLL_CONFIG.desktop.sections, // Default layout
  isLoadedAndStarted: false,
  isPuppetDrawn: false,
  isPuppetReady: false,
  pendingBook: null,
  exitMode: false,
  // Actions
    // Called once from Home.jsx to set the correct responsive layout.
    setDeviceType: (device) => {
      const newConfig = SCROLL_CONFIG[device] || SCROLL_CONFIG.desktop;
      set({ 
        deviceType: device,
        sectionLayouts: newConfig.sections // Update layout when device changes
      });
    },
  setCurrentSection: (index) => set({ currentSection: index }),
  setScrollToSection: (index) => set({ scrollToSection: index  }),
  setBookState: (state) => set({ bookState: state }),

  selectBook: (id, count) => {
    const { selectedBookId, bookState, closeBook } = get();
   
    // CASE A: IF A BOOK IS ALREADY OPEN (and it's not the same one)
    if (selectedBookId && selectedBookId !== id && bookState !== 'SHELF') {
      console.log(`Queuing book ${id} because ${selectedBookId} is open`);
      
      // Queue the new book
      set({ pendingBook: { id, count } });
      
      // Trigger the close sequence for the current book.
      // (This starts the chain: PAGES_CLOSING -> CLOSING -> resetBookSelection)
      closeBook();
      
      return;
    }

    // CASE B: STANDARD OPEN (Shelf is empty)
    // If we click the SAME book, do nothing or maybe just ensure it's open.
    if (selectedBookId === id) return;

    set({
      bookState: 'OPENING',
      selectedBookId: id,
      currentPage: 0,
      pageCount: count,
      pendingBook: null, // Ensure queue is clear
    });
  },

  // This action is called by the 3D component when the opening animation finishes.
  setBookInteractive: () => {
    if (get().bookState === 'OPENING') {
      set({ bookState: 'INTERACTIVE' });
    }
  },

  // This action's only job is to start the process by closing the pages.
  closeBook: () => {
    const { currentPage, bookState } = get();
    if (bookState !== 'INTERACTIVE') return;

    if (currentPage === 0) {
      // If already on page 0, skip straight to the final closing state
      get().setBookStateToClosing();
    } else {
      // If pages are open, start the sequence with our new unambiguous state
      set({ bookState: 'PAGES_CLOSING', currentPage: 0 });
    }
  },

  // This action is called AFTER the pages have finished closing.
  setBookStateToClosing: () => {
    set({ bookState: 'CLOSING' });
  },
 // This action is called by the 3D component when the closing animation is done.
 resetBookSelection: () => {
  const { pendingBook } = get();

  if (pendingBook) {
    // IF WE HAVE A QUEUED BOOK:
    // Don't go to SHELF. Immediately switch to the new book!
    console.log(`Launching queued book: ${pendingBook.id}`);
    set({
      bookState: 'OPENING', // Start opening animation immediately
      selectedBookId: pendingBook.id,
      currentPage: 0,
      pageCount: pendingBook.count,
      pendingBook: null, // Clear the queue
    });
  } else {
    // STANDARD RESET: No queue, go back to shelf.
    set({
      bookState: 'SHELF',
      selectedBookId: null,
      currentPage: 0,
      pageCount: 0,
    });
  }
},

   
setPage: (page) => {
  const { currentPage, pageCount } = get();

  // Check if the requested page is out of bounds
  if (page < 0 || page > pageCount) {
    // If so, call the deselectBook action
    get().closeBook(); 
    return; // And stop further execution
  }

  // Otherwise, if the page is valid and different, set it
  if (page !== currentPage) {
    set({ currentPage: page });
  }
},

setLoadedAndStarted: () => set({ isLoadedAndStarted: true }),

setPuppetDrawn: (status) => set({ isPuppetDrawn: status }),

setPuppetReady: (status) => set({ isPuppetReady: status }),

setExitMode: (status) => set({ exitMode: status }),

}));

