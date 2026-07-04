import Guides from ".";

describe("Guides", () => {
  let guides;

  const getGuidesOptions = (options = {}) => ({
    distance: 100,
    color: "#fff",
    className: "test-class",
    guides: [
      {
        html: "<b>First guide</b>",
        distance: 50,
        color: "red",
      },
      {
        html: "<b>Second guide</b>",
        distance: 75,
        color: "blue",
      },
      {
        html: "<b>Third guide</b>",
      },
    ],
    ...options,
  });

  beforeEach(() => {
    document.body.classList.remove("guides-in-progress");
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (guides && guides.canvas) {
      guides.end();
    }
  });

  describe("constructor", () => {
    it("initializes with default options", () => {
      guides = new Guides();
      expect(guides.options.distance).toBe(100);
      expect(guides.options.color).toBe("#fff");
      expect(guides.options.className).toBe("");
      expect(guides.options.guides).toEqual([]);
    });

    it("initializes with custom options", () => {
      const options = getGuidesOptions();
      guides = new Guides(options);
      expect(guides.options.guides).toHaveLength(3);
      expect(guides.options.distance).toBe(100);
      expect(guides.options.color).toBe("#fff");
    });

    it("initializes with current guide index at 0", () => {
      guides = new Guides(getGuidesOptions());
      expect(guides.current).toBe(0);
    });

    it("initializes inProgress as false", () => {
      guides = new Guides(getGuidesOptions());
      expect(guides.inProgress).toBe(false);
    });

    it("initializes event handlers", () => {
      guides = new Guides(getGuidesOptions());
      expect(guides.eventHandlers).toHaveProperty("start");
      expect(guides.eventHandlers).toHaveProperty("render");
      expect(guides.eventHandlers).toHaveProperty("next");
      expect(guides.eventHandlers).toHaveProperty("prev");
      expect(guides.eventHandlers).toHaveProperty("end");
    });
  });

  describe("start", () => {
    it("creates canvas element", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      expect(guides.canvas).toBeTruthy();
      expect(guides.canvas.classList.contains("guides-canvas")).toBe(true);
      expect(guides.canvas.classList.contains("guides-fade-in")).toBe(true);
    });

    it("adds canvas to document body", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      expect(document.body.contains(guides.canvas)).toBe(true);
    });

    it("adds guides-in-progress class to body", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      expect(document.body.classList.contains("guides-in-progress")).toBe(true);
    });

    it("renders first guide", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      expect(guides.currentGuide).toBeTruthy();
    });

    it("calls start callback", () => {
      const startCallback = jest.fn();
      guides = new Guides(getGuidesOptions({ start: startCallback }));
      guides.start();
      expect(startCallback).toHaveBeenCalled();
    });

    it("does not start if already in progress", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      const currentCanvas = guides.canvas;
      guides.start();
      expect(guides.canvas).toBe(currentCanvas);
    });

    it("binds keyup event listener", () => {
      const bodySpy = jest.spyOn(document.body, "addEventListener");
      guides = new Guides(getGuidesOptions());
      guides.start();
      expect(bodySpy).toHaveBeenCalledWith("keyup", expect.any(Function));
    });

    it("binds click event listener", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      const clickSpy = jest.spyOn(guides, "next");
      guides.canvas.click();
      expect(clickSpy).toHaveBeenCalled();
    });

    it("returns without starting when guides array is empty", () => {
      guides = new Guides(getGuidesOptions({ guides: [] }));
      const result = guides.start();
      expect(result).toBe(guides);
      expect(guides.canvas).toBeUndefined();
      expect(guides.inProgress).toBe(false);
    });

    it("throws when guides is not an array", () => {
      guides = new Guides(getGuidesOptions({ guides: "not an array" }));
      expect(() => guides.start()).toThrow("options.guides must be an array");
    });

    it("throws when guides is null", () => {
      guides = new Guides({ ...getGuidesOptions(), guides: null });
      expect(() => guides.start()).toThrow("options.guides must be an array");
    });
  });

  describe("next", () => {
    beforeEach(() => {
      guides = new Guides(getGuidesOptions());
      guides.start();
    });

    it("increments current guide index", () => {
      expect(guides.current).toBe(0);
      guides.next();
      expect(guides.current).toBe(1);
    });

    it("renders the next guide", () => {
      const firstGuide = guides.currentGuide;
      guides.next();
      expect(guides.currentGuide).not.toBe(firstGuide);
    });

    it("calls next callback", () => {
      const nextCallback = jest.fn();
      guides.off("next");
      guides.on("next", nextCallback);
      guides.next();
      expect(nextCallback).toHaveBeenCalled();
    });

    it("returns this for method chaining", () => {
      const result = guides.next();
      expect(result).toBe(guides);
    });

    it("ends guides when no more guides available", () => {
      const endCallback = jest.fn();
      guides.off("end");
      guides.on("end", endCallback);
      guides.next();
      guides.next();
      guides.next();
      expect(guides.canvas).toBeNull();
    });

    it("does not call next callback when advancing past last guide", () => {
      const nextCallback = jest.fn();
      guides.off("next");
      guides.on("next", nextCallback);
      guides.next();
      guides.next();
      expect(nextCallback).toHaveBeenCalledTimes(2);
      guides.next();
      expect(nextCallback).toHaveBeenCalledTimes(2);
      expect(guides.canvas).toBeNull();
    });
  });

  describe("prev", () => {
    beforeEach(() => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.next();
      guides.next();
    });

    it("decrements current guide index", () => {
      expect(guides.current).toBe(2);
      guides.prev();
      expect(guides.current).toBe(1);
    });

    it("renders the previous guide", () => {
      const { currentGuide } = guides;
      guides.prev();
      expect(guides.currentGuide).not.toBe(currentGuide);
    });

    it("calls prev callback", () => {
      const prevCallback = jest.fn();
      guides.off("prev");
      guides.on("prev", prevCallback);
      guides.prev();
      expect(prevCallback).toHaveBeenCalled();
    });

    it("returns this for method chaining", () => {
      const result = guides.prev();
      expect(result).toBe(guides);
    });

    it("does not go below index 0", () => {
      guides.current = 0;
      guides.prev();
      expect(guides.current).toBe(0);
    });
  });

  describe("end", () => {
    beforeEach(() => {
      guides = new Guides(getGuidesOptions());
      guides.start();
    });

    it("removes canvas from document", () => {
      expect(document.body.contains(guides.canvas)).toBe(true);
      guides.end();
      expect(guides.canvas).toBeNull();
    });

    it("removes guides-in-progress class from body", () => {
      expect(document.body.classList.contains("guides-in-progress")).toBe(true);
      guides.end();
      expect(document.body.classList.contains("guides-in-progress")).toBe(
        false,
      );
    });

    it("destroys current guide", () => {
      guides.end();
      expect(guides.currentGuide).toBeNull();
    });

    it("calls end callback", () => {
      const endCallback = jest.fn();
      guides.off("end");
      guides.on("end", endCallback);
      guides.end();
      expect(endCallback).toHaveBeenCalled();
    });

    it("returns this for method chaining", () => {
      const result = guides.end();
      expect(result).toBe(guides);
    });

    it("unbinds event listeners", () => {
      const bodySpy = jest.spyOn(document.body, "removeEventListener");
      guides.end();
      expect(bodySpy).toHaveBeenCalledWith("keyup", expect.any(Function));
    });

    it("returns without firing end callback when tour was never started", () => {
      const neverStarted = new Guides(getGuidesOptions());
      const endCallback = jest.fn();
      neverStarted.on("end", endCallback);
      neverStarted.end();
      expect(endCallback).not.toHaveBeenCalled();
    });
  });

  describe("event handling", () => {
    beforeEach(() => {
      guides = new Guides(getGuidesOptions());
      guides.start();
    });

    describe("on", () => {
      it("registers event handler", () => {
        const handler = jest.fn();
        guides.on("next", handler);
        expect(guides.eventHandlers.next).toContain(handler);
      });

      it("throws error for unsupported event", () => {
        expect(() => guides.on("unsupported", jest.fn())).toThrow();
      });

      it("returns this for method chaining", () => {
        const result = guides.on("next", jest.fn());
        expect(result).toBe(guides);
      });
    });

    describe("off", () => {
      it("removes specific event handler", () => {
        const handler = jest.fn();
        guides.on("next", handler);
        expect(guides.eventHandlers.next).toContain(handler);
        guides.off("next", handler);
        expect(guides.eventHandlers.next).not.toContain(handler);
      });

      it("does not remove other handlers when passed handler was never added", () => {
        const handlerA = jest.fn();
        const handlerB = jest.fn();
        const neverAdded = jest.fn();
        guides.on("next", handlerA);
        guides.on("next", handlerB);
        guides.off("next", neverAdded);
        expect(guides.eventHandlers.next).toContain(handlerA);
        expect(guides.eventHandlers.next).toContain(handlerB);
        expect(guides.eventHandlers.next).toHaveLength(2);
      });

      it("removes all handlers for event when no handler specified", () => {
        guides.on("next", jest.fn());
        guides.on("next", jest.fn());
        expect(guides.eventHandlers.next).toHaveLength(2);
        guides.off("next");
        expect(guides.eventHandlers.next).toHaveLength(0);
      });

      it("throws error for unsupported event", () => {
        expect(() => guides.off("unsupported", jest.fn())).toThrow();
      });

      it("returns this for method chaining", () => {
        const result = guides.off("next", jest.fn());
        expect(result).toBe(guides);
      });
    });
  });

  describe("keyboard navigation", () => {
    beforeEach(() => {
      guides = new Guides(getGuidesOptions());
      guides.start();
    });

    it("goes to next guide on right arrow key (e.key)", () => {
      const event = new KeyboardEvent("keyup", { key: "ArrowRight" });
      guides.onKeyUp(event);
      expect(guides.current).toBe(1);
    });

    it("goes to next guide on right arrow key (e.which fallback)", () => {
      const event = new KeyboardEvent("keyup", { which: 39 });
      guides.onKeyUp(event);
      expect(guides.current).toBe(1);
    });

    it("goes to next guide on space key", () => {
      const event = new KeyboardEvent("keyup", { key: " " });
      guides.onKeyUp(event);
      expect(guides.current).toBe(1);
    });

    it("goes to previous guide on left arrow key", () => {
      guides.next();
      const event = new KeyboardEvent("keyup", { key: "ArrowLeft" });
      guides.onKeyUp(event);
      expect(guides.current).toBe(0);
    });

    it("goes to previous guide on backspace key", () => {
      guides.next();
      const event = new KeyboardEvent("keyup", { key: "Backspace" });
      guides.onKeyUp(event);
      expect(guides.current).toBe(0);
    });

    it("ends guides on Escape key", () => {
      const event = new KeyboardEvent("keyup", { key: "Escape" });
      guides.onKeyUp(event);
      expect(guides.canvas).toBeNull();
    });
  });

  describe("click navigation", () => {
    beforeEach(() => {
      guides = new Guides(getGuidesOptions());
      guides.start();
    });

    it("goes to next guide on canvas click", () => {
      const event = new MouseEvent("click");
      guides.onClick(event);
      expect(guides.current).toBe(1);
    });
  });

  describe("guide rendering with custom render function", () => {
    it("calls custom render function when provided", () => {
      const renderFn = jest.fn();
      const options = getGuidesOptions({
        guides: [
          {
            html: "<b>Guide</b>",
            render: renderFn,
          },
        ],
      });
      guides = new Guides(options);
      guides.start();
      expect(renderFn).toHaveBeenCalled();
    });

    it("calls render callback when rendering guide", () => {
      const renderCallback = jest.fn();
      const options = getGuidesOptions({ render: renderCallback });
      guides = new Guides(options);
      guides.start();
      expect(renderCallback).toHaveBeenCalled();
    });
  });

  describe("destroy", () => {
    it("ends guides and unbinds events", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      expect(guides.canvas).toBeTruthy();
      const bodySpy = jest.spyOn(document.body, "removeEventListener");
      guides.destroy();
      expect(guides.canvas).toBeNull();
      expect(bodySpy).toHaveBeenCalledWith("keyup", expect.any(Function));
    });

    it("returns this for method chaining", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      const result = guides.destroy();
      expect(result).toBe(guides);
    });
  });

  describe("canvas rendering", () => {
    beforeEach(() => {
      guides = new Guides(getGuidesOptions());
      guides.start();
    });

    it("creates canvas with overlay and mask elements", () => {
      const overlay = guides.canvas.querySelector(".guides-overlay");
      const mask = guides.canvas.querySelector(".guides-mask");
      expect(overlay).toBeTruthy();
      expect(mask).toBeTruthy();
    });
  });

  describe("option merging", () => {
    it("merges guide-specific options with default options", () => {
      const options = getGuidesOptions({
        guides: [
          {
            html: "<b>Guide</b>",
            distance: 200,
            color: "green",
          },
        ],
      });
      guides = new Guides(options);
      guides.start();
      expect(guides.currentGuide.distance).toBe(200);
      expect(guides.currentGuide.color).toBe("green");
    });

    it("does not leak the guides array or lifecycle callbacks onto the guide instance", () => {
      const options = getGuidesOptions({ start: jest.fn(), next: jest.fn() });
      guides = new Guides(options);
      guides.start();
      expect(guides.currentGuide.guide.guides).toBeUndefined();
      expect(guides.currentGuide.guide.start).toBeUndefined();
      expect(guides.currentGuide.guide.next).toBeUndefined();
    });
  });

  describe("navigation guards", () => {
    it("throws when calling next() before the tour has started", () => {
      guides = new Guides(getGuidesOptions());
      expect(() => guides.next()).toThrow("tour is not in progress");
    });

    it("throws when calling prev() before the tour has started", () => {
      guides = new Guides(getGuidesOptions());
      expect(() => guides.prev()).toThrow("tour is not in progress");
    });

    it("throws when calling next() after the tour has ended", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.end();
      expect(() => guides.next()).toThrow("tour is not in progress");
    });
  });

  describe("goTo", () => {
    beforeEach(() => {
      guides = new Guides(getGuidesOptions());
      guides.start();
    });

    it("jumps directly to the given index", () => {
      guides.goTo(2);
      expect(guides.current).toBe(2);
    });

    it("renders the guide at the given index", () => {
      guides.goTo(2);
      expect(guides.currentGuide.guide.html).toBe("<b>Third guide</b>");
    });

    it("throws when the tour is not in progress", () => {
      guides.end();
      expect(() => guides.goTo(1)).toThrow("tour is not in progress");
    });

    it("throws for a negative index", () => {
      expect(() => guides.goTo(-1)).toThrow("non-negative number");
    });

    it("throws for a non-number index", () => {
      expect(() => guides.goTo("1")).toThrow("non-negative number");
    });

    it("throws for an out-of-bounds index", () => {
      expect(() => guides.goTo(99)).toThrow("out of bounds");
    });
  });

  describe("getCurrentGuide", () => {
    it("returns null when the tour is not in progress", () => {
      guides = new Guides(getGuidesOptions());
      expect(guides.getCurrentGuide()).toBeNull();
    });

    it("returns index, guide and total when in progress", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.next();
      expect(guides.getCurrentGuide()).toEqual({
        index: 1,
        guide: guides.currentGuide.guide,
        total: 3,
      });
    });
  });

  describe("getProgress", () => {
    it("reports inactive progress when the tour has not started", () => {
      guides = new Guides(getGuidesOptions());
      expect(guides.getProgress()).toEqual({
        current: null,
        total: 3,
        isActive: false,
        percentage: 0,
      });
    });

    it("reports current position and percentage while active", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.next();
      expect(guides.getProgress()).toEqual({
        current: 1,
        total: 3,
        isActive: true,
        percentage: 67,
      });
    });
  });

  describe("tour progress persistence", () => {
    const storageKey = "guides-tour-progress-test";

    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it("saveTourProgress writes current position to localStorage", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.next();
      const result = guides.saveTourProgress(storageKey);
      expect(result).toBe(true);
      const saved = JSON.parse(localStorage.getItem(storageKey));
      expect(saved.current).toBe(1);
      expect(saved.total).toBe(3);
      expect(saved.completed).toBe(false);
    });

    it("loadTourProgress returns null when nothing was saved", () => {
      guides = new Guides(getGuidesOptions());
      expect(guides.loadTourProgress(storageKey)).toBeNull();
    });

    it("loadTourProgress returns the saved progress", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.next();
      guides.saveTourProgress(storageKey);
      const loaded = guides.loadTourProgress(storageKey);
      expect(loaded.current).toBe(1);
    });

    it("clearTourProgress removes the saved entry", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.saveTourProgress(storageKey);
      expect(guides.clearTourProgress(storageKey)).toBe(true);
      expect(localStorage.getItem(storageKey)).toBeNull();
    });

    it("resumeFromProgress starts the tour directly at the saved index", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.next();
      guides.saveTourProgress(storageKey);
      guides.end();

      const renderSpy = jest.spyOn(guides, "renderGuide");
      const resumed = guides.resumeFromProgress(storageKey);

      expect(resumed).toBe(true);
      expect(guides.current).toBe(1);
      // Only the resumed guide is rendered - no intermediate render of guide 0
      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(renderSpy).toHaveBeenCalledWith(guides.options.guides[1]);
    });

    it("resumeFromProgress returns false when there is nothing saved", () => {
      guides = new Guides(getGuidesOptions());
      expect(guides.resumeFromProgress(storageKey)).toBe(false);
    });

    it("resumeFromProgress returns false when the saved tour was already completed", () => {
      guides = new Guides(getGuidesOptions());
      localStorage.setItem(
        storageKey,
        JSON.stringify({ current: 1, total: 3, completed: true }),
      );
      expect(guides.resumeFromProgress(storageKey)).toBe(false);
    });

    it("resumeFromProgress returns false when the saved index is out of bounds", () => {
      guides = new Guides(getGuidesOptions());
      localStorage.setItem(
        storageKey,
        JSON.stringify({ current: 99, total: 3, completed: false }),
      );
      expect(guides.resumeFromProgress(storageKey)).toBe(false);
    });
  });

  describe("handleResize", () => {
    it("does nothing when the tour is not in progress", () => {
      guides = new Guides(getGuidesOptions());
      expect(() => guides.handleResize()).not.toThrow();
      expect(guides.currentGuide).toBeUndefined();
    });

    it("recreates the current guide in place", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      const before = guides.currentGuide;
      guides.handleResize();
      expect(guides.currentGuide).not.toBe(before);
      expect(guides.current).toBe(0);
    });

    it("is invoked on window resize (debounced)", () => {
      jest.useFakeTimers();
      guides = new Guides(getGuidesOptions());
      guides.start();
      const before = guides.currentGuide;
      window.dispatchEvent(new Event("resize"));
      // Debounced - no effect yet
      jest.advanceTimersByTime(100);
      expect(guides.currentGuide).toBe(before);
      jest.advanceTimersByTime(200);
      expect(guides.currentGuide).not.toBe(before);
      jest.useRealTimers();
    });
  });

  describe("focus management", () => {
    let triggerButton;

    beforeEach(() => {
      triggerButton = document.createElement("button");
      document.body.appendChild(triggerButton);
      triggerButton.focus();
    });

    afterEach(() => {
      triggerButton.remove();
    });

    it("moves focus into the rendered guide tip", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      expect(document.activeElement).toBe(guides.currentGuide.element);
    });

    it("moves focus into each new guide on next()", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.next();
      expect(document.activeElement).toBe(guides.currentGuide.element);
    });

    it("restores focus to the previously focused element on end()", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.end();
      expect(document.activeElement).toBe(triggerButton);
    });

    it("marks background body children inert and aria-hidden while active", () => {
      const sibling = document.createElement("div");
      document.body.appendChild(sibling);

      guides = new Guides(getGuidesOptions());
      guides.start();
      expect(sibling.getAttribute("aria-hidden")).toBe("true");
      expect(sibling.inert).toBe(true);

      guides.end();
      expect(sibling.hasAttribute("aria-hidden")).toBe(false);
      expect(sibling.inert).toBe(false);

      sibling.remove();
    });

    it("does not touch the canvas itself when locking the background", () => {
      guides = new Guides(getGuidesOptions());
      guides.start();
      expect(guides.canvas.hasAttribute("aria-hidden")).toBe(false);
      expect(guides.canvas.inert).toBeFalsy();
    });

    it("preserves a pre-existing aria-hidden attribute after end()", () => {
      const sibling = document.createElement("div");
      sibling.setAttribute("aria-hidden", "true");
      document.body.appendChild(sibling);

      guides = new Guides(getGuidesOptions());
      guides.start();
      guides.end();
      expect(sibling.getAttribute("aria-hidden")).toBe("true");

      sibling.remove();
    });
  });
});
