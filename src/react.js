import { useEffect, useRef, forwardRef, useState } from "react";
import Guides from "./components/Guides/Guides";
import "./Guides.scss";

// React wrapper around the vanilla Guides class. Props are typed in
// react.d.ts (the source of truth) and documented in the README; see those
// rather than duplicating prop docs here, since duplicated docs drift.
/* eslint-disable react/prop-types */
const GuidedTour = forwardRef(
  (
    {
      guides,
      color,
      distance,
      className,
      smoothScroll,
      onStart,
      onEnd,
      onNext,
      onPrev,
      onRender,
      autoStart = false,
      children,
    },
    ref,
  ) => {
    const guidesRef = useRef(null);
    const [tour, setTour] = useState(null);

    useEffect(() => {
      if (!guides || !Array.isArray(guides) || guides.length === 0) {
        setTour(null);
        return undefined;
      }

      // Merge smoothScroll into each guide (per-guide smoothScroll overrides)
      const guidesWithSmooth = guides.map((g) => ({
        ...g,
        smoothScroll: g.smoothScroll ?? smoothScroll,
      }));

      // Create the Guides instance with callbacks
      const tourInstance = new Guides({
        guides: guidesWithSmooth,
        ...(color && { color }),
        ...(distance && { distance }),
        ...(className && { className }),
        ...(onStart && { start: onStart }),
        ...(onEnd && { end: onEnd }),
        ...(onNext && { next: onNext }),
        ...(onPrev && { prev: onPrev }),
        ...(onRender && { render: onRender }),
      });

      guidesRef.current = tourInstance;
      setTour(tourInstance);

      // Expose the tour instance via ref (ref omitted from deps - it's stable)
      if (ref) {
        if (typeof ref === "function") {
          ref(tourInstance);
        } else {
          ref.current = tourInstance;
        }
      }

      // Auto-start if requested
      if (autoStart) {
        tourInstance.start();
      }

      // Cleanup on unmount
      return () => {
        setTour(null);
        if (guidesRef.current) {
          guidesRef.current.destroy();
          guidesRef.current = null;
        }
      };
      // ref is intentionally omitted from dependencies - it's stable and doesn't need to trigger re-creation
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      guides,
      color,
      distance,
      className,
      smoothScroll,
      onStart,
      onEnd,
      onNext,
      onPrev,
      onRender,
      autoStart,
    ]);

    // If children is a render function, pass the tour instance
    if (typeof children === "function") {
      return children(tour);
    }

    return children || null;
  },
);
/* eslint-enable react/prop-types */

GuidedTour.displayName = "GuidedTour";

// No manual window assignment needed - the UMD build (see webpack.config.js)
// attaches this to the global automatically when loaded via a plain <script>
// tag, and correctly no-ops that branch under require()/import instead.
export default GuidedTour;
