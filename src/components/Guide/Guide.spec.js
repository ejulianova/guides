import Guide from ".";

describe("Guide", () => {
  let canvas;

  const getGuideOptions = (options = {}) => ({
    distance: 100,
    color: "white",
    className: "test-class-name",
    html: "<b>Tip content here</b>",
    ...options,
  });

  const getTarget = (styles = {}) => {
    const target = document.createElement("div");
    target.innerText = "target";
    Object.entries(styles).forEach(([key, value]) => {
      target.style[key] = value;
    });
    document.body.appendChild(target);
    return target;
  };

  beforeEach(() => {
    canvas = document.createElement("div");
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.right = "0";
    canvas.style.bottom = "0";
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    canvas.remove();
    canvas = null;
  });

  describe("when no target is passed", () => {
    it("renders the guide centered", () => {
      const guide = new Guide(canvas, getGuideOptions());
      expect(guide.element.classList.contains("guides-center")).toBe(true);
      expect(guide.element.innerHTML).toContain("<b>Tip content here</b>");
      expect(canvas.contains(guide.element)).toBe(true);
    });

    it("adds guides-center class to element", () => {
      const guide = new Guide(canvas, getGuideOptions());
      expect(guide.element.classList.contains("guides-center")).toBe(true);
    });

    it("appends element to container", () => {
      const guide = new Guide(canvas, getGuideOptions());
      expect(canvas.contains(guide.element)).toBe(true);
    });
  });

  describe("when passed target", () => {
    let target;

    // jsdom does not perform real layout, so getBoundingClientRect() always
    // returns a zero rect regardless of the CSS applied above - these mocks
    // are what actually drive the positioning algorithm in these tests.
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    const mockViewportAndRect = (rect) => {
      Object.defineProperty(window, "innerWidth", {
        value: 1000,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: 1000,
        configurable: true,
      });
      jest.spyOn(target, "getBoundingClientRect").mockReturnValue(rect);
    };

    afterEach(() => {
      target.remove();
      target = null;
      Object.defineProperty(window, "innerWidth", {
        value: originalInnerWidth,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: originalInnerHeight,
        configurable: true,
      });
    });

    describe("is full width", () => {
      describe("and positioned on top of the document", () => {
        it("renders the guide under the target", () => {
          target = getTarget({
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50px",
          });
          mockViewportAndRect({ left: 400, top: 10, width: 100, height: 50 });
          const options = getGuideOptions({ target });
          const guide = new Guide(canvas, getGuideOptions(options));
          expect(guide.element).toBeTruthy();
          expect(guide.element.innerHTML).toContain("<b>Tip content here</b>");
          expect(canvas.contains(guide.element)).toBe(true);
          expect(guide.position).toBe("bottom");
        });

        it("positions guide below target when space above is limited", () => {
          target = getTarget({
            position: "absolute",
            top: "10px",
            left: "50px",
            width: "100px",
            height: "50px",
          });
          mockViewportAndRect({ left: 400, top: 10, width: 100, height: 50 });
          const options = getGuideOptions({ target });
          const guide = new Guide(canvas, options);
          expect(guide.position).toBe("bottom");
        });
      });

      describe("and positioned on the bottom of the document", () => {
        it("renders the guide above the target", () => {
          target = getTarget({
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50px",
          });
          mockViewportAndRect({ left: 400, top: 940, width: 100, height: 50 });
          const options = getGuideOptions({ target });
          const guide = new Guide(canvas, getGuideOptions(options));
          expect(guide.element).toBeTruthy();
          expect(guide.element.innerHTML).toContain("<b>Tip content here</b>");
          expect(canvas.contains(guide.element)).toBe(true);
          expect(guide.position).toBe("top");
        });

        it("positions guide above target when space below is limited", () => {
          target = getTarget({
            position: "absolute",
            bottom: "10px",
            left: "50px",
            width: "100px",
            height: "50px",
          });
          mockViewportAndRect({ left: 400, top: 940, width: 100, height: 50 });
          const options = getGuideOptions({ target });
          const guide = new Guide(canvas, options);
          expect(guide.position).toBe("top");
        });
      });

      describe("and positioned in the middle of the document", () => {
        it("renders the guide with proper positioning", () => {
          target = getTarget({
            position: "absolute",
            top: "200px",
            left: "200px",
            width: "100px",
            height: "100px",
          });
          const options = getGuideOptions({ target });
          const guide = new Guide(canvas, options);
          expect(guide.element).toBeTruthy();
        });
      });
    });

    describe("is full height", () => {
      describe("and positioned on the left of the document", () => {
        it("positions guide on the right of target", () => {
          target = getTarget({
            position: "absolute",
            left: 0,
            top: "100px",
            width: "50px",
            height: "500px",
          });
          mockViewportAndRect({ left: 10, top: 400, width: 50, height: 200 });
          const options = getGuideOptions({ target });
          const guide = new Guide(canvas, options);
          expect(guide.position).toBe("right");
        });
      });

      describe("and positioned on the right of the document", () => {
        it("positions guide on the left of target", () => {
          target = getTarget({
            position: "absolute",
            right: 0,
            top: "100px",
            width: "50px",
            height: "500px",
          });
          mockViewportAndRect({ left: 940, top: 400, width: 50, height: 200 });
          const options = getGuideOptions({ target });
          const guide = new Guide(canvas, options);
          expect(guide.position).toBe("left");
        });
      });

      describe("and positioned in the middle of the document", () => {
        it("renders the guide with proper positioning", () => {
          target = getTarget({
            position: "absolute",
            top: "100px",
            left: "200px",
            width: "50px",
            height: "500px",
          });
          const options = getGuideOptions({ target });
          const guide = new Guide(canvas, options);
          expect(guide.element).toBeTruthy();
        });
      });
    });
  });

  describe("Guide properties", () => {
    it("returns correct distance from guide options", () => {
      const guide = new Guide(canvas, getGuideOptions({ distance: 50 }));
      expect(guide.distance).toBe(50);
    });

    it("returns correct color from guide options", () => {
      const guide = new Guide(canvas, getGuideOptions({ color: "red" }));
      expect(guide.color).toBe("red");
    });

    it("returns correct target from guide options", () => {
      const target = getTarget();
      const guide = new Guide(canvas, getGuideOptions({ target }));
      expect(guide.target).toBe(target);
      target.remove();
    });

    it("builds className with custom classes", () => {
      const guide = new Guide(
        canvas,
        getGuideOptions({ className: "custom-class" }),
      );
      expect(guide.className).toContain("guides-guide");
      expect(guide.className).toContain("guides-fade-in");
      expect(guide.className).toContain("custom-class");
    });

    it("builds className without custom classes", () => {
      const guide = new Guide(canvas, getGuideOptions({ className: "" }));
      expect(guide.className).toBe("guides-fade-in guides-guide ");
    });

    it("wraps html content in span", () => {
      const guide = new Guide(canvas, getGuideOptions({ html: "<b>Test</b>" }));
      expect(guide.content).toBe("<span><b>Test</b></span>");
    });
  });

  describe("Guide interactions", () => {
    it("adds guides-current-element class to target", () => {
      const target = getTarget();
      const guide = new Guide(canvas, getGuideOptions({ target }));
      expect(target.classList.contains("guides-current-element")).toBe(true);
      guide.destroy();
      target.remove();
    });

    it("removes guides-current-element class when hideHighlight is called", () => {
      const target = getTarget();
      target.classList.add("guides-current-element");
      const guide = new Guide(canvas, getGuideOptions({ target }));
      guide.hideHighlight();
      expect(target.classList.contains("guides-current-element")).toBe(false);
      guide.destroy();
      target.remove();
    });

    it("scrolls element into view with behavior auto when smoothScroll is false", () => {
      const target = getTarget();
      const guide = new Guide(canvas, {
        ...getGuideOptions({ target }),
        smoothScroll: false,
      });
      expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
        block: "center",
        behavior: "auto",
      });
      guide.destroy();
      target.remove();
    });

    it("scrolls element into view with behavior smooth and defers positioning when smoothScroll is true", () => {
      jest.useFakeTimers();
      const target = getTarget();

      // Mock scrollend event support
      const originalOnscrollend = window.onscrollend;
      Object.defineProperty(window, "onscrollend", {
        value: null,
        configurable: true,
        writable: true,
      });

      const guide = new Guide(canvas, {
        ...getGuideOptions({ target }),
        smoothScroll: true,
      });

      expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
        block: "center",
        behavior: "smooth",
      });
      expect(canvas.contains(guide.element)).toBe(false);

      // Simulate scrollend event
      const scrollEndEvent = new Event("scrollend");
      document.dispatchEvent(scrollEndEvent);

      // Positioning is deferred to the next animation frame
      expect(canvas.contains(guide.element)).toBe(false);
      jest.runAllTimers();
      expect(canvas.contains(guide.element)).toBe(true);

      // Restore
      if (originalOnscrollend !== undefined) {
        Object.defineProperty(window, "onscrollend", {
          value: originalOnscrollend,
          configurable: true,
          writable: true,
        });
      }

      jest.useRealTimers();
      guide.destroy();
      target.remove();
    });

    it("does not scroll into view when target has position fixed", () => {
      const target = getTarget({ position: "fixed" });
      const getComputedStyleSpy = jest
        .spyOn(window, "getComputedStyle")
        .mockReturnValue({ position: "fixed" });
      const guide = new Guide(canvas, getGuideOptions({ target }));
      expect(getComputedStyleSpy).toHaveBeenCalledWith(target);
      expect(
        window.HTMLElement.prototype.scrollIntoView,
      ).not.toHaveBeenCalled();
      getComputedStyleSpy.mockRestore();
      guide.destroy();
      target.remove();
    });

    it("destroys guide properly", () => {
      const target = getTarget();
      const guide = new Guide(canvas, getGuideOptions({ target }));
      expect(canvas.contains(guide.element)).toBe(true);
      expect(target.classList.contains("guides-current-element")).toBe(true);
      guide.destroy();
      expect(canvas.contains(guide.element)).toBe(false);
      expect(guide.element).toBeNull();
      expect(target.classList.contains("guides-current-element")).toBe(false);
      target.remove();
    });
  });

  describe("positioning edge cases", () => {
    it("centers the guide and warns when the target is no longer in the DOM", () => {
      const target = getTarget();
      target.remove(); // detach before Guide is constructed
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const guide = new Guide(canvas, getGuideOptions({ target }));

      expect(guide.element.classList.contains("guides-center")).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("no longer in DOM"),
      );

      warnSpy.mockRestore();
      guide.destroy();
    });

    it("falls back to centered positioning when positioning throws", () => {
      const target = getTarget();
      const rectSpy = jest
        .spyOn(target, "getBoundingClientRect")
        .mockImplementation(() => {
          throw new Error("boom");
        });
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const guide = new Guide(canvas, getGuideOptions({ target }));

      expect(guide.element.classList.contains("guides-center")).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error positioning guide"),
        expect.any(Error),
      );

      rectSpy.mockRestore();
      errorSpy.mockRestore();
      guide.destroy();
      target.remove();
    });

    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    afterEach(() => {
      Object.defineProperty(window, "innerWidth", {
        value: originalInnerWidth,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: originalInnerHeight,
        configurable: true,
      });
    });

    it("positions the guide to the left when left space is largest", () => {
      const target = getTarget();
      Object.defineProperty(window, "innerWidth", {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: 500,
        configurable: true,
      });
      jest.spyOn(target, "getBoundingClientRect").mockReturnValue({
        left: 400,
        top: 200,
        width: 50,
        height: 50,
      });

      const guide = new Guide(canvas, getGuideOptions({ target }));

      expect(guide.position).toBe("left");
      guide.destroy();
      target.remove();
    });

    it("positions the guide on top when top space is largest", () => {
      const target = getTarget();
      Object.defineProperty(window, "innerWidth", {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: 500,
        configurable: true,
      });
      jest.spyOn(target, "getBoundingClientRect").mockReturnValue({
        left: 200,
        top: 400,
        width: 50,
        height: 50,
      });

      const guide = new Guide(canvas, getGuideOptions({ target }));

      expect(guide.position).toBe("top");
      guide.destroy();
      target.remove();
    });
  });

  describe("focus management", () => {
    it("is focusable via tabindex -1", () => {
      const guide = new Guide(canvas, getGuideOptions());
      expect(guide.element.getAttribute("tabindex")).toBe("-1");
      guide.destroy();
    });

    it("moves focus to the element once positioning finishes", () => {
      const guide = new Guide(canvas, getGuideOptions());
      expect(document.activeElement).toBe(guide.element);
      guide.destroy();
    });
  });
});
