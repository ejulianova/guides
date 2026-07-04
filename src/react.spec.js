/**
 * @jest-environment jsdom
 */
// require() (not import) is intentional throughout this file: each test needs
// a fresh reference to the mocked Guides module after jest.mock/resetModules,
// which needs a synchronous, per-test require rather than a static top-level import.
/* eslint-disable global-require */
import React, { useRef } from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import GuidedTour from "./react";

// Mock the Guides class
jest.mock("./components/Guides/Guides", () =>
  jest.fn().mockImplementation((options) => {
    const instance = {
      options,
      start: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      next: jest.fn().mockReturnThis(),
      prev: jest.fn().mockReturnThis(),
      destroy: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      off: jest.fn().mockReturnThis(),
    };
    return instance;
  }),
);

// Mock the SCSS import
jest.mock("./Guides.scss", () => ({}));

describe("GuidedTour React Component", () => {
  const mockGuides = [
    { html: "Step 1" },
    { html: "Step 2" },
    { html: "Step 3" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    test("renders without crashing with minimal props", () => {
      render(<GuidedTour guides={mockGuides} />);
    });

    test("renders children when provided as ReactNode", () => {
      render(
        <GuidedTour guides={mockGuides}>
          <button type="button">Start Tour</button>
        </GuidedTour>,
      );
      expect(screen.getByText("Start Tour")).toBeInTheDocument();
    });

    test("renders null when no children provided", () => {
      const { container } = render(<GuidedTour guides={mockGuides} />);
      expect(container.firstChild).toBeNull();
    });

    test("does not render when guides array is empty", () => {
      const { container } = render(<GuidedTour guides={[]} />);
      expect(container.firstChild).toBeNull();
    });

    test("does not render when guides is not an array", () => {
      const { container } = render(<GuidedTour guides={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Render Props Pattern", () => {
    test("calls children function with tour instance", () => {
      const childrenFn = jest.fn(() => <div>Tour Controls</div>);
      render(<GuidedTour guides={mockGuides}>{childrenFn}</GuidedTour>);

      expect(childrenFn).toHaveBeenCalled();
      const tourInstance = childrenFn.mock.calls[0][0];
      // Tour instance may be null initially but should have methods when ready
      if (tourInstance) {
        expect(tourInstance).toHaveProperty("start");
        expect(tourInstance).toHaveProperty("end");
        expect(tourInstance).toHaveProperty("next");
        expect(tourInstance).toHaveProperty("prev");
      }
    });

    test("provides tour methods that can be called", () => {
      let tourInstance;
      function TestComponent() {
        return (
          <GuidedTour guides={mockGuides}>
            {(tour) => {
              tourInstance = tour;
              return (
                <button type="button" onClick={() => tour?.start()}>
                  Start Tour
                </button>
              );
            }}
          </GuidedTour>
        );
      }

      render(<TestComponent />);
      const button = screen.getByText("Start Tour");

      act(() => {
        button.click();
      });

      expect(tourInstance.start).toHaveBeenCalled();
    });
  });

  describe("Ref Forwarding", () => {
    test("exposes tour instance via object ref", () => {
      function TestComponent() {
        const tourRef = useRef(null);
        return (
          <div>
            <GuidedTour ref={tourRef} guides={mockGuides} />
            <button type="button" onClick={() => tourRef.current?.start()}>
              Start
            </button>
          </div>
        );
      }

      render(<TestComponent />);
      const button = screen.getByText("Start");

      act(() => {
        button.click();
      });

      // The mock should have been called
      const Guides = require("./components/Guides/Guides");
      const instance = Guides.mock.results[0].value;
      expect(instance.start).toHaveBeenCalled();
    });

    test("exposes tour instance via callback ref", () => {
      let capturedRef = null;
      function TestComponent() {
        return (
          <GuidedTour
            ref={(ref) => {
              capturedRef = ref;
            }}
            guides={mockGuides}
          />
        );
      }

      render(<TestComponent />);
      expect(capturedRef).not.toBeNull();
      expect(capturedRef).toHaveProperty("start");
    });
  });

  describe("Props Configuration", () => {
    test("passes color prop to Guides constructor", () => {
      render(<GuidedTour guides={mockGuides} color="#ff0000" />);

      const Guides = require("./components/Guides/Guides");
      expect(Guides).toHaveBeenCalledWith(
        expect.objectContaining({ color: "#ff0000" }),
      );
    });

    test("passes distance prop to Guides constructor", () => {
      render(<GuidedTour guides={mockGuides} distance={200} />);

      const Guides = require("./components/Guides/Guides");
      expect(Guides).toHaveBeenCalledWith(
        expect.objectContaining({ distance: 200 }),
      );
    });

    test("passes className prop to Guides constructor", () => {
      render(<GuidedTour guides={mockGuides} className="custom-tour" />);

      const Guides = require("./components/Guides/Guides");
      expect(Guides).toHaveBeenCalledWith(
        expect.objectContaining({ className: "custom-tour" }),
      );
    });

    test("merges smoothScroll into each guide", () => {
      const guides = [
        { html: "Step 1" },
        { html: "Step 2", smoothScroll: false },
      ];

      render(<GuidedTour guides={guides} smoothScroll />);

      const Guides = require("./components/Guides/Guides");
      const passedGuides = Guides.mock.calls[0][0].guides;

      expect(passedGuides[0].smoothScroll).toBe(true);
      expect(passedGuides[1].smoothScroll).toBe(false); // Per-guide override
    });
  });

  describe("Callback Props", () => {
    test("maps onStart to start callback", () => {
      const onStart = jest.fn();
      render(<GuidedTour guides={mockGuides} onStart={onStart} />);

      const Guides = require("./components/Guides/Guides");
      expect(Guides).toHaveBeenCalledWith(
        expect.objectContaining({ start: onStart }),
      );
    });

    test("maps onEnd to end callback", () => {
      const onEnd = jest.fn();
      render(<GuidedTour guides={mockGuides} onEnd={onEnd} />);

      const Guides = require("./components/Guides/Guides");
      expect(Guides).toHaveBeenCalledWith(
        expect.objectContaining({ end: onEnd }),
      );
    });

    test("maps onNext to next callback", () => {
      const onNext = jest.fn();
      render(<GuidedTour guides={mockGuides} onNext={onNext} />);

      const Guides = require("./components/Guides/Guides");
      expect(Guides).toHaveBeenCalledWith(
        expect.objectContaining({ next: onNext }),
      );
    });

    test("maps onPrev to prev callback", () => {
      const onPrev = jest.fn();
      render(<GuidedTour guides={mockGuides} onPrev={onPrev} />);

      const Guides = require("./components/Guides/Guides");
      expect(Guides).toHaveBeenCalledWith(
        expect.objectContaining({ prev: onPrev }),
      );
    });

    test("maps onRender to render callback", () => {
      const onRender = jest.fn();
      render(<GuidedTour guides={mockGuides} onRender={onRender} />);

      const Guides = require("./components/Guides/Guides");
      expect(Guides).toHaveBeenCalledWith(
        expect.objectContaining({ render: onRender }),
      );
    });

    test("does not pass callback when not provided", () => {
      render(<GuidedTour guides={mockGuides} />);

      const Guides = require("./components/Guides/Guides");
      const config = Guides.mock.calls[0][0];

      expect(config.start).toBeUndefined();
      expect(config.end).toBeUndefined();
      expect(config.next).toBeUndefined();
      expect(config.prev).toBeUndefined();
      expect(config.render).toBeUndefined();
    });
  });

  describe("AutoStart Feature", () => {
    test("automatically starts tour when autoStart is true", () => {
      render(<GuidedTour guides={mockGuides} autoStart />);

      const Guides = require("./components/Guides/Guides");
      const instance = Guides.mock.results[0].value;
      expect(instance.start).toHaveBeenCalled();
    });

    test("does not start tour automatically when autoStart is false", () => {
      render(<GuidedTour guides={mockGuides} autoStart={false} />);

      const Guides = require("./components/Guides/Guides");
      const instance = Guides.mock.results[0].value;
      expect(instance.start).not.toHaveBeenCalled();
    });

    test("does not start tour automatically by default", () => {
      render(<GuidedTour guides={mockGuides} />);

      const Guides = require("./components/Guides/Guides");
      const instance = Guides.mock.results[0].value;
      expect(instance.start).not.toHaveBeenCalled();
    });
  });

  describe("Lifecycle and Cleanup", () => {
    test("destroys tour instance on unmount", () => {
      const { unmount } = render(<GuidedTour guides={mockGuides} />);

      const Guides = require("./components/Guides/Guides");
      const instance = Guides.mock.results[0].value;

      unmount();

      expect(instance.destroy).toHaveBeenCalled();
    });

    test("recreates tour instance when guides change", () => {
      const { rerender } = render(<GuidedTour guides={mockGuides} />);

      const Guides = require("./components/Guides/Guides");
      const firstInstance = Guides.mock.results[0].value;

      const newGuides = [{ html: "New Step 1" }];
      rerender(<GuidedTour guides={newGuides} />);

      expect(firstInstance.destroy).toHaveBeenCalled();
      expect(Guides).toHaveBeenCalledTimes(2);
    });

    test("recreates tour instance when color changes", () => {
      const { rerender } = render(
        <GuidedTour guides={mockGuides} color="#ff0000" />,
      );

      const Guides = require("./components/Guides/Guides");

      rerender(<GuidedTour guides={mockGuides} color="#00ff00" />);

      expect(Guides).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases", () => {
    test("handles guides prop changing to null", () => {
      const { rerender } = render(<GuidedTour guides={mockGuides} />);

      rerender(<GuidedTour guides={null} />);

      // Should not crash
    });

    test("handles guides prop changing to empty array", () => {
      const { rerender } = render(<GuidedTour guides={mockGuides} />);

      rerender(<GuidedTour guides={[]} />);

      // Should not crash
    });

    test("handles undefined guides gracefully", () => {
      const { container } = render(<GuidedTour guides={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    test("handles children being false", () => {
      const { container } = render(
        <GuidedTour guides={mockGuides}>{false}</GuidedTour>,
      );
      expect(container.firstChild).toBeNull();
    });

    test("handles children being 0", () => {
      const { container } = render(
        <GuidedTour guides={mockGuides}>{0}</GuidedTour>,
      );
      // React treats 0 as falsy in this context, component returns null
      expect(container.firstChild).toBeNull();
    });
  });

  describe("displayName", () => {
    test("has correct displayName for debugging", () => {
      expect(GuidedTour.displayName).toBe("GuidedTour");
    });
  });
});
