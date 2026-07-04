import Guide from "../Guide";

const DEFAULTS = {
  distance: 100,
  color: "#fff",
  className: "",
  guides: [],
};

const RESIZE_DEBOUNCE_MS = 250;

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Prefer e.key; fallback to e.which for older browsers
const KEY_MAP = {
  27: "Escape",
  32: " ",
  37: "ArrowLeft",
  39: "ArrowRight",
  8: "Backspace",
};

const SUPPORTED_EVENTS = {
  START: "start",
  RENDER: "render",
  NEXT: "next",
  PREV: "prev",
  END: "end",
};

function initEventHandlers() {
  return Object.values(SUPPORTED_EVENTS).reduce((handlers, eventName) => {
    handlers[eventName] = [];
    return handlers;
  }, {});
}

function renderCanvas() {
  const canvas = document.createElement("div");
  canvas.className = "guides-canvas guides-fade-in";
  canvas.setAttribute("role", "dialog");
  canvas.setAttribute("aria-modal", "true");
  canvas.setAttribute("aria-label", "Guided tour");
  canvas.innerHTML =
    '<div class="guides-overlay" aria-hidden="true"></div><div class="guides-mask" aria-hidden="true"></div>';
  document.body.appendChild(canvas);
  return canvas;
}

class Guides {
  constructor(options) {
    this.options = { ...DEFAULTS, ...options };
    this.current = 0;
    this.inProgress = false;
    this.onClick = this.onClick.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onResize = debounce(this.handleResize.bind(this), RESIZE_DEBOUNCE_MS);
    this.eventHandlers = initEventHandlers();
  }

  start(index = 0) {
    if (this.inProgress) {
      return this;
    }
    if (!Array.isArray(this.options.guides)) {
      throw new Error("Guides: options.guides must be an array.");
    }
    if (this.options.guides.length === 0) {
      return this;
    }
    this.inProgress = true;
    this.current = index;
    this.previouslyFocusedElement = document.activeElement;
    this.canvas = renderCanvas();
    this.lockBackground();
    this.bind();
    document.body.classList.add("guides-in-progress");
    this.renderGuide(this.options.guides[this.current]);
    this.callback("start");
    return this;
  }

  // Makes everything outside the tour canvas unreachable to pointer, keyboard
  // and screen reader navigation, so aria-modal="true" is actually true.
  lockBackground() {
    this.inertElements = Array.from(document.body.children).filter(
      (el) => el !== this.canvas,
    );
    this.inertElements.forEach((el) => {
      el.dataset.guidesHadAriaHidden = el.hasAttribute("aria-hidden")
        ? "1"
        : "0";
      el.setAttribute("aria-hidden", "true");
      el.inert = true;
    });
  }

  unlockBackground() {
    if (!this.inertElements) return;
    this.inertElements.forEach((el) => {
      if (el.dataset.guidesHadAriaHidden === "0") {
        el.removeAttribute("aria-hidden");
      }
      delete el.dataset.guidesHadAriaHidden;
      el.inert = false;
    });
    this.inertElements = null;
  }

  renderGuide(guide) {
    if (!guide) {
      // no more guides
      this.end();
      return;
    }

    if (this.currentGuide) {
      this.currentGuide.destroy();
    }

    this.callback("render", guide);

    if (typeof guide.render === "function") {
      guide.render.apply(this, [guide]);
    }

    this.currentGuide = new Guide(this.canvas, this.mergeGuideOptions(guide));
  }

  // Only pass through the tour-level defaults Guide/Arrow actually read.
  // Avoids leaking the full guides array and lifecycle callbacks into each guide instance.
  mergeGuideOptions(guide) {
    const { distance, color, className, smoothScroll } = this.options;
    return { distance, color, className, smoothScroll, ...guide };
  }

  onClick() {
    this.next();
  }

  onKeyUp(e) {
    const key = e.key || KEY_MAP[e.which];
    switch (key) {
      case "Escape":
        this.end();
        break;
      case "ArrowRight":
      case " ":
        this.next();
        break;
      case "ArrowLeft":
      case "Backspace":
        e.preventDefault();
        this.prev();
        break;
      default:
        break;
    }
  }

  bind() {
    this.canvas.addEventListener("click", this.onClick);
    document.body.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("resize", this.onResize);
  }

  unbind() {
    if (this.canvas) {
      this.canvas.removeEventListener("click", this.onClick);
    }
    document.body.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("resize", this.onResize);
  }

  handleResize() {
    if (!this.inProgress || !this.currentGuide) {
      return;
    }
    // Re-render current guide to reposition it
    this.currentGuide.destroy();
    this.currentGuide = new Guide(
      this.canvas,
      this.mergeGuideOptions(this.options.guides[this.current]),
    );
  }

  next() {
    if (!this.inProgress) {
      throw new Error("Guides: Cannot navigate when tour is not in progress.");
    }
    this.current += 1;
    const nextGuide = this.options.guides[this.current];
    this.renderGuide(nextGuide);
    if (nextGuide) {
      this.callback("next");
    }
    return this;
  }

  prev() {
    if (!this.inProgress) {
      throw new Error("Guides: Cannot navigate when tour is not in progress.");
    }
    if (!this.current) {
      return this;
    }
    this.current -= 1;
    this.renderGuide(this.options.guides[this.current]);
    this.callback("prev");
    return this;
  }

  goTo(index) {
    if (!this.inProgress) {
      throw new Error("Guides: Cannot navigate when tour is not in progress.");
    }
    if (typeof index !== "number" || index < 0) {
      throw new Error(
        `Guides: goTo() requires a non-negative number, got: ${index}`,
      );
    }
    if (index >= this.options.guides.length) {
      throw new Error(
        `Guides: Index ${index} is out of bounds. Total guides: ${this.options.guides.length}`,
      );
    }
    this.current = index;
    this.renderGuide(this.options.guides[this.current]);
    return this;
  }

  getCurrentGuide() {
    if (!this.inProgress || !this.currentGuide) {
      return null;
    }
    return {
      index: this.current,
      guide: this.currentGuide.guide,
      total: this.options.guides.length,
    };
  }

  getProgress() {
    return {
      current: this.inProgress ? this.current : null,
      total: this.options.guides.length,
      isActive: this.inProgress,
      percentage: this.inProgress
        ? Math.round(((this.current + 1) / this.options.guides.length) * 100)
        : 0,
    };
  }

  saveTourProgress(storageKey = "guides-tour-progress") {
    if (typeof localStorage === "undefined") {
      // eslint-disable-next-line no-console
      console.warn("Guides.js: localStorage not available");
      return false;
    }
    try {
      const progress = {
        current: this.current,
        total: this.options.guides.length,
        completed: !this.inProgress,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(progress));
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Guides.js: Failed to save tour progress", error);
      return false;
    }
  }

  // Doesn't use `this` — kept as an instance method (not static) for API
  // symmetry with saveTourProgress/resumeFromProgress, which do.
  // eslint-disable-next-line class-methods-use-this
  loadTourProgress(storageKey = "guides-tour-progress") {
    if (typeof localStorage === "undefined") {
      return null;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        return null;
      }
      return JSON.parse(saved);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Guides.js: Failed to load tour progress", error);
      return null;
    }
  }

  // Same rationale as loadTourProgress above.
  // eslint-disable-next-line class-methods-use-this
  clearTourProgress(storageKey = "guides-tour-progress") {
    if (typeof localStorage === "undefined") {
      return false;
    }
    try {
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Guides.js: Failed to clear tour progress", error);
      return false;
    }
  }

  resumeFromProgress(storageKey = "guides-tour-progress") {
    const progress = this.loadTourProgress(storageKey);
    if (!progress || progress.completed) {
      return false;
    }
    // Validate progress data
    if (
      typeof progress.current !== "number" ||
      progress.current < 0 ||
      progress.current >= this.options.guides.length
    ) {
      return false;
    }
    // Start the tour directly at the saved position (avoids a flash of guide 0)
    this.start(progress.current);
    return true;
  }

  end() {
    if (!this.inProgress) return this;
    this.unlockBackground();
    if (this.canvas) {
      document.body.removeChild(this.canvas);
      document.body.classList.remove("guides-in-progress");
      this.canvas = null;
    }
    this.unbind();
    if (this.currentGuide) {
      this.currentGuide.destroy();
      this.currentGuide = null;
    }
    this.inProgress = false;
    this.restoreFocus();
    this.callback("end");
    return this;
  }

  restoreFocus() {
    const target = this.previouslyFocusedElement;
    this.previouslyFocusedElement = null;
    if (
      target &&
      typeof target.focus === "function" &&
      document.body.contains(target)
    ) {
      target.focus();
    }
  }

  on(eventName, eventHandler) {
    const handlers = this.eventHandlers[eventName];
    if (!handlers) throw new Error(`Unsupported event ${eventName}.`);
    handlers.push(eventHandler);
    return this;
  }

  off(eventName, eventHandler) {
    const handlers = this.eventHandlers[eventName];
    if (!handlers) throw new Error(`Unsupported event ${eventName}.`);
    if (eventHandler) {
      const index = handlers.indexOf(eventHandler);
      if (index !== -1) handlers.splice(index, 1);
    } else {
      this.eventHandlers[eventName] = [];
    }
    return this;
  }

  callback(eventName, guide = this.currentGuide && this.currentGuide.guide) {
    const callback = this.options[eventName];
    const eventObject = { sender: this, guide };

    if (typeof callback === "function") {
      callback.apply(this, [eventObject]);
    }

    // Call all event handlers registered with .on()
    const handlers = this.eventHandlers[eventName];
    if (handlers) {
      handlers.forEach((handler) => {
        handler.apply(this, [eventObject]);
      });
    }
  }

  destroy() {
    this.end();
    return this;
  }
}

export default Guides;
