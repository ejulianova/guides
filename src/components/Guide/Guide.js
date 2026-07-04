import Arrow from "../Arrow";

const SMOOTH_SCROLL_FALLBACK_MS = 1000; // Fallback timeout for browsers without scrollend

class Guide {
  constructor(container, guide) {
    this.scrollTimeout = null;
    this.scrollEndHandler = null;
    this.guide = guide;
    this.container = container;
    this.highlightTarget();
    this.render();
  }

  get distance() {
    return this.guide.distance;
  }

  get color() {
    return this.guide.color;
  }

  get className() {
    const customClassNames = this.guide.className || "";
    return `guides-fade-in guides-guide ${customClassNames}`;
  }

  get target() {
    return this.guide.target;
  }

  get content() {
    return `<span>${this.guide.html}</span>`;
  }

  highlightTarget() {
    if (this.target) {
      this.target.classList.add("guides-current-element");
    }
  }

  hideHighlight() {
    if (this.target) {
      this.target.classList.remove("guides-current-element");
    }
  }

  render() {
    this.element = document.createElement("div");
    this.element.className = this.className;
    this.element.setAttribute("role", "tooltip");
    this.element.setAttribute("aria-live", "polite");
    this.element.setAttribute("tabindex", "-1");

    // innerHTML is intentional — guide.html supports markup; callers must sanitize user input
    this.element.innerHTML = this.content;

    if (
      this.target &&
      window.getComputedStyle(this.target).position !== "fixed"
    ) {
      this.scrollIntoView();
      if (this.guide.smoothScroll) {
        this.waitForScrollEnd();
        return;
      }
    }
    this.finishPositioning();
  }

  waitForScrollEnd() {
    const supportsScrollEnd = "onscrollend" in window;

    if (supportsScrollEnd) {
      this.scrollEndHandler = () => {
        this.cleanupScrollListeners();
        // Defer to next animation frame so positions are read after the browser
        // has committed the final scroll position to layout
        requestAnimationFrame(() => {
          if (this.element) {
            this.finishPositioning();
          }
        });
      };

      document.addEventListener("scrollend", this.scrollEndHandler, {
        once: true,
      });

      // Safety net in case scrollend never fires (e.g. target already in view)
      this.scrollTimeout = setTimeout(() => {
        this.cleanupScrollListeners();
        if (this.element) {
          this.finishPositioning();
        }
      }, SMOOTH_SCROLL_FALLBACK_MS);
    } else {
      this.scrollTimeout = setTimeout(() => {
        this.scrollTimeout = null;
        if (this.element) {
          this.finishPositioning();
        }
      }, SMOOTH_SCROLL_FALLBACK_MS);
    }
  }

  cleanupScrollListeners() {
    if (this.scrollEndHandler) {
      document.removeEventListener("scrollend", this.scrollEndHandler);
      this.scrollEndHandler = null;
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }
  }

  finishPositioning() {
    if (this.target) {
      this.attachToTarget();
    } else {
      this.center();
    }
    // Move focus into the tip so screen reader users land on the new step
    // and keyboard users aren't left focused on now-inert background content.
    this.element.focus({ preventScroll: true });
  }

  center() {
    this.element.classList.add("guides-center");
    this.container.appendChild(this.element);
  }

  attachToTarget() {
    // Check if target still exists in DOM
    if (!this.target || !document.body.contains(this.target)) {
      // eslint-disable-next-line no-console
      console.warn(
        "Guides.js: Target element no longer in DOM, centering guide instead",
      );
      this.center();
      return;
    }

    try {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const boundingClientRect = this.target.getBoundingClientRect();
      const leftSpace = boundingClientRect.left;
      const topSpace = boundingClientRect.top;
      const targetWidth = boundingClientRect.width;
      const targetHeight = boundingClientRect.height;
      const rightSpace = viewportWidth - leftSpace - targetWidth;
      const bottomSpace = viewportHeight - topSpace - targetHeight;
      const css = {
        color: this.color,
        top: viewportHeight / 2 > topSpace ? `${topSpace}px` : "auto",
        left: viewportWidth / 2 > leftSpace ? `${leftSpace}px` : "auto",
        right:
          viewportWidth / 2 > leftSpace
            ? "auto"
            : `${viewportWidth - leftSpace - targetWidth}px`,
        bottom: viewportHeight / 2 > topSpace ? "auto" : `${bottomSpace}px`,
      };

      switch (Math.max(leftSpace, rightSpace, topSpace, bottomSpace)) {
        case leftSpace:
          this.position = "left";
          css.paddingRight = `${this.distance}px`;
          css.right = `${viewportWidth - leftSpace}px`;
          css.left = "auto";
          break;
        case topSpace:
          this.position = "top";
          css.paddingBottom = `${this.distance}px`;
          css.bottom = `${viewportHeight - topSpace}px`;
          css.top = "auto";
          break;
        case rightSpace:
          this.position = "right";
          css.paddingLeft = `${this.distance}px`;
          css.left = `${leftSpace + targetWidth}px`;
          css.right = "auto";
          break;
        default:
          this.position = "bottom";
          css.paddingTop = `${this.distance}px`;
          css.top = `${topSpace + targetHeight}px`;
          css.bottom = "auto";
          break;
      }
      this.element.classList.add(`guides-${this.position}`);
      Object.entries(css).forEach(([prop, value]) => {
        this.element.style[prop] = value;
      });
      this.container.appendChild(this.element);
      this.renderArrow();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Guides.js: Error positioning guide:", error);
      this.center();
    }
  }

  renderArrow() {
    const arrow = new Arrow({
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
      distance: this.distance,
      position: this.position,
      color: this.color,
      target: this.target,
      guideElement: this.element,
    });
    this.element.appendChild(arrow.element);
  }

  scrollIntoView() {
    const behavior = this.guide.smoothScroll ? "smooth" : "auto";
    this.target?.scrollIntoView({ block: "center", behavior });
  }

  destroy() {
    this.cleanupScrollListeners();
    this.hideHighlight();
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

export default Guide;
