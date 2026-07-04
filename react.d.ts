import { ForwardRefExoticComponent, RefAttributes, ReactNode } from 'react';
import Guides, { GuideOptions, GuideEvent } from './index';

/**
 * Props for the GuidedTour React component
 */
export interface GuidedTourProps {
  /**
   * Array of guide steps to display
   * @required
   */
  guides: GuideOptions[];

  /**
   * Default color for arrows and text (CSS color value)
   * @default "#fff"
   */
  color?: string;

  /**
   * Distance in pixels between the guide tip and the highlighted element
   * @default 100
   */
  distance?: number;

  /**
   * Custom CSS class name(s) to add to guide elements
   */
  className?: string;

  /**
   * If true, uses smooth scrolling when bringing targets into view
   * Individual guides can override this with their own smoothScroll property
   * @default false
   */
  smoothScroll?: boolean;

  /**
   * If true, automatically starts the tour when the component mounts
   * @default false
   */
  autoStart?: boolean;

  /**
   * Callback function called when the tour starts
   */
  onStart?: (event: GuideEvent) => void;

  /**
   * Callback function called when the tour ends
   */
  onEnd?: (event: GuideEvent) => void;

  /**
   * Callback function called after moving to the next guide
   */
  onNext?: (event: GuideEvent) => void;

  /**
   * Callback function called after moving to the previous guide
   */
  onPrev?: (event: GuideEvent) => void;

  /**
   * Callback function called before each guide is rendered
   */
  onRender?: (event: GuideEvent) => void;

  /**
   * Render function that receives the tour instance as an argument
   * Use this to access tour control methods (start, next, prev, end)
   *
   * @example
   * ```tsx
   * <GuidedTour guides={guides}>
   *   {(tour) => (
   *     <button onClick={() => tour?.start()}>
   *       Start Tour
   *     </button>
   *   )}
   * </GuidedTour>
   * ```
   */
  children?: ((tour: Guides | null) => ReactNode) | ReactNode;
}

/**
 * React component wrapper for Guides.js
 *
 * Provides a React-friendly interface to the Guides library with hooks support.
 * Supports both ref-based and render-prop patterns for controlling the tour.
 *
 * @example Using with refs
 * ```tsx
 * import { useRef } from 'react';
 * import GuidedTour from 'guides/react';
 *
 * function App() {
 *   const tourRef = useRef<Guides>(null);
 *
 *   return (
 *     <>
 *       <GuidedTour
 *         ref={tourRef}
 *         guides={[
 *           { html: 'Welcome!' },
 *           { target: document.querySelector('header'), html: 'This is the header' }
 *         ]}
 *         color="#007bff"
 *         onStart={() => console.log('Tour started')}
 *       />
 *       <button onClick={() => tourRef.current?.start()}>
 *         Start Tour
 *       </button>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Using with render props
 * ```tsx
 * import GuidedTour from 'guides/react';
 *
 * function App() {
 *   return (
 *     <GuidedTour
 *       guides={[
 *         { html: 'Welcome!' },
 *         { target: document.querySelector('header'), html: 'Header section' }
 *       ]}
 *     >
 *       {(tour) => (
 *         <div>
 *           <button onClick={() => tour?.start()}>Start</button>
 *           <button onClick={() => tour?.next()}>Next</button>
 *           <button onClick={() => tour?.prev()}>Previous</button>
 *           <button onClick={() => tour?.end()}>End</button>
 *         </div>
 *       )}
 *     </GuidedTour>
 *   );
 * }
 * ```
 */
declare const GuidedTour: ForwardRefExoticComponent<GuidedTourProps & RefAttributes<Guides>>;

export default GuidedTour;
