/**
 * Configuration for a single guide step
 */
export interface GuideOptions {
  /**
   * The HTML content to display in the guide tip
   * WARNING: This content is rendered using innerHTML. Sanitize user-provided content to prevent XSS attacks.
   */
  html: string;

  /**
   * The DOM element to highlight and attach the guide to
   * If omitted, the guide will be centered on the screen
   */
  target?: HTMLElement | null;

  /**
   * The color of the arrow and text (CSS color value)
   * If omitted, uses the global color setting
   */
  color?: string;

  /**
   * Custom CSS class name(s) to add to the guide element
   */
  className?: string;

  /**
   * If true, uses smooth scrolling when bringing the target into view
   * If false, uses instant scrolling
   */
  smoothScroll?: boolean;

  /**
   * Custom render callback for this specific guide
   * Called before the guide is rendered
   */
  render?: (event: GuideEvent) => void;
}

/**
 * Event object passed to callback functions
 */
export interface GuideEvent {
  /**
   * The Guides instance that triggered the event
   */
  sender: Guides;

  /**
   * The current guide configuration (undefined for start/end events without a guide)
   */
  guide?: GuideOptions;
}

/**
 * Current guide information returned by getCurrentGuide()
 */
export interface CurrentGuideInfo {
  /**
   * The index of the current guide (0-based)
   */
  index: number;

  /**
   * The current guide configuration
   */
  guide: GuideOptions;

  /**
   * Total number of guides in the tour
   */
  total: number;
}

/**
 * Progress information returned by getProgress()
 */
export interface ProgressInfo {
  /**
   * Current guide index (0-based), or null if tour is not active
   */
  current: number | null;

  /**
   * Total number of guides in the tour
   */
  total: number;

  /**
   * Whether the tour is currently active
   */
  isActive: boolean;

  /**
   * Completion percentage (0-100)
   */
  percentage: number;
}

/**
 * Saved tour progress for persistence
 */
export interface SavedProgress {
  /**
   * The guide index where the tour was saved
   */
  current: number;

  /**
   * Total number of guides when saved
   */
  total: number;

  /**
   * Whether the tour was completed
   */
  completed: boolean;

  /**
   * Timestamp when progress was saved
   */
  timestamp: number;
}

/**
 * Configuration options for the Guides instance
 */
export interface GuidesOptions {
  /**
   * Array of guide steps to display
   * @required
   */
  guides: GuideOptions[];

  /**
   * Distance in pixels between the guide tip and the highlighted element
   * @default 100
   */
  distance?: number;

  /**
   * Default color for arrows and text (CSS color value)
   * @default "#fff"
   */
  color?: string;

  /**
   * Default CSS class name(s) to add to guide elements
   */
  className?: string;

  /**
   * Callback function called when the tour starts
   */
  start?: (event: GuideEvent) => void;

  /**
   * Callback function called when the tour ends
   */
  end?: (event: GuideEvent) => void;

  /**
   * Callback function called after moving to the next guide
   */
  next?: (event: GuideEvent) => void;

  /**
   * Callback function called after moving to the previous guide
   */
  prev?: (event: GuideEvent) => void;

  /**
   * Callback function called before each guide is rendered
   */
  render?: (event: GuideEvent) => void;
}

/**
 * Main Guides class for creating guided tours
 *
 * @example
 * ```typescript
 * import Guides from 'guides';
 *
 * const tour = new Guides({
 *   color: "#007bff",
 *   distance: 100,
 *   guides: [
 *     {
 *       html: "Welcome to our app!",
 *     },
 *     {
 *       target: document.querySelector("nav"),
 *       html: "This is the navigation menu",
 *     },
 *   ],
 *   start: (event) => console.log("Tour started"),
 *   end: (event) => console.log("Tour ended"),
 * });
 *
 * tour.start();
 * ```
 */
export default class Guides {
  /**
   * Creates a new Guides instance
   * @param options - Configuration options for the guided tour
   */
  constructor(options: GuidesOptions);

  /**
   * Starts the guided tour
   * Shows the guide at `index` (defaults to the first guide) and enables keyboard navigation
   * Moves focus into the guide tip and makes the rest of the page inert until the tour ends
   * @param index - The 0-based index to start at (default: 0)
   * @returns The Guides instance for method chaining
   */
  start(index?: number): this;

  /**
   * Ends the guided tour
   * Removes all guide elements, cleans up event listeners, and restores focus
   * to whichever element was focused before the tour started
   * @returns The Guides instance for method chaining
   */
  end(): this;

  /**
   * Moves to the next guide in the tour
   * If already on the last guide, ends the tour
   * @returns The Guides instance for method chaining
   * @throws {Error} If the tour is not in progress
   */
  next(): this;

  /**
   * Moves to the previous guide in the tour
   * If already on the first guide, does nothing
   * @returns The Guides instance for method chaining
   * @throws {Error} If the tour is not in progress
   */
  prev(): this;

  /**
   * Jumps directly to a specific guide by index
   * @param index - The 0-based index of the guide to jump to
   * @returns The Guides instance for method chaining
   * @throws {Error} If tour is not active, index is invalid, or out of bounds
   *
   * @example
   * ```typescript
   * tour.start();
   * tour.goTo(2); // Jump to the third guide
   * ```
   */
  goTo(index: number): this;

  /**
   * Gets information about the current guide
   * @returns Current guide information, or null if tour is not active
   *
   * @example
   * ```typescript
   * const current = tour.getCurrentGuide();
   * if (current) {
   *   console.log(`Guide ${current.index + 1} of ${current.total}`);
   * }
   * ```
   */
  getCurrentGuide(): CurrentGuideInfo | null;

  /**
   * Gets the current tour progress
   * @returns Progress information including current position and percentage
   *
   * @example
   * ```typescript
   * const progress = tour.getProgress();
   * console.log(`${progress.percentage}% complete`);
   * ```
   */
  getProgress(): ProgressInfo;

  /**
   * Saves the current tour progress to localStorage
   * @param storageKey - The localStorage key to use (default: 'guides-tour-progress')
   * @returns true if saved successfully, false otherwise
   *
   * @example
   * ```typescript
   * tour.saveTourProgress(); // Uses default key
   * tour.saveTourProgress('my-app-tour'); // Custom key
   * ```
   */
  saveTourProgress(storageKey?: string): boolean;

  /**
   * Loads saved tour progress from localStorage
   * @param storageKey - The localStorage key to use (default: 'guides-tour-progress')
   * @returns Saved progress object, or null if not found
   *
   * @example
   * ```typescript
   * const saved = tour.loadTourProgress();
   * if (saved && !saved.completed) {
   *   console.log(`Resume from guide ${saved.current}`);
   * }
   * ```
   */
  loadTourProgress(storageKey?: string): SavedProgress | null;

  /**
   * Clears saved tour progress from localStorage
   * @param storageKey - The localStorage key to use (default: 'guides-tour-progress')
   * @returns true if cleared successfully, false otherwise
   *
   * @example
   * ```typescript
   * tour.clearTourProgress();
   * ```
   */
  clearTourProgress(storageKey?: string): boolean;

  /**
   * Resumes tour from saved progress
   * Automatically starts the tour and jumps to the saved position
   * @param storageKey - The localStorage key to use (default: 'guides-tour-progress')
   * @returns true if resumed successfully, false if no valid progress found
   *
   * @example
   * ```typescript
   * if (tour.resumeFromProgress()) {
   *   console.log('Resumed tour from saved position');
   * } else {
   *   tour.start(); // Start from beginning
   * }
   * ```
   */
  resumeFromProgress(storageKey?: string): boolean;

  /**
   * Registers an event handler for a specific event
   * @param eventName - The name of the event ('start', 'end', 'next', 'prev', 'render')
   * @param handler - The callback function to execute when the event occurs
   * @returns The Guides instance for method chaining
   *
   * @example
   * ```typescript
   * tour.on('next', (event) => {
   *   console.log('Moved to guide:', event.guide);
   * });
   * ```
   */
  on(eventName: 'start' | 'end' | 'next' | 'prev' | 'render', handler: (event: GuideEvent) => void): this;

  /**
   * Removes an event handler for a specific event
   * @param eventName - The name of the event
   * @param handler - The specific handler to remove. If omitted, removes all handlers for this event.
   * @returns The Guides instance for method chaining
   *
   * @example
   * ```typescript
   * const handler = (event) => console.log(event);
   * tour.on('next', handler);
   * tour.off('next', handler); // Remove specific handler
   * tour.off('next'); // Remove all 'next' handlers
   * ```
   */
  off(eventName: 'start' | 'end' | 'next' | 'prev' | 'render', handler?: (event: GuideEvent) => void): this;

  /**
   * Destroys the Guides instance
   * Alias for end() - cleans up all resources
   * @returns The Guides instance for method chaining
   */
  destroy(): this;
}
