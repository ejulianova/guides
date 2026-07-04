import Arrow from ".";

describe("Arrow", () => {
  beforeEach(() => {
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.5;
    global.Math = mockMath;
    Object.defineProperties(window.HTMLElement.prototype, {
      offsetLeft: {
        get() {
          return parseFloat(window.getComputedStyle(this).marginLeft) || 0;
        },
      },
      offsetTop: {
        get() {
          return parseFloat(window.getComputedStyle(this).marginTop) || 0;
        },
      },
      offsetHeight: {
        get() {
          return parseFloat(window.getComputedStyle(this).height) || 0;
        },
      },
      offsetWidth: {
        get() {
          return parseFloat(window.getComputedStyle(this).width) || 0;
        },
      },
    });
  });

  describe("when position is top", () => {
    it("renders the expected SVG arrow", () => {
      const target = document.createElement("div");
      target.style.marginTop = 500;
      target.style.marginLeft = 500;
      target.style.width = 100;
      target.style.height = 50;
      const guideElement = document.createElement("div");
      guideElement.style.width = "300px";
      guideElement.style.height = "100px";
      const arrow = new Arrow({
        width: 300,
        height: 100,
        distance: 100,
        position: "top",
        color: "#fff",
        target,
        guideElement,
      });
      expect(arrow.element).toMatchSnapshot();
    });
  });

  describe("when position is bottom", () => {
    it("renders the expected SVG arrow", () => {
      const target = document.createElement("div");
      target.style.marginTop = 500;
      target.style.marginLeft = 500;
      target.style.width = 100;
      target.style.height = 50;
      const guideElement = document.createElement("div");
      guideElement.style.width = "300px";
      guideElement.style.height = "100px";
      const arrow = new Arrow({
        width: 300,
        height: 100,
        distance: 100,
        position: "bottom",
        color: "#fff",
        target,
        guideElement,
      });
      expect(arrow.element).toMatchSnapshot();
    });
  });

  describe("when position is left", () => {
    it("renders the expected SVG arrow", () => {
      const target = document.createElement("div");
      target.style.marginTop = 500;
      target.style.marginLeft = 500;
      target.style.width = 100;
      target.style.height = 50;
      const guideElement = document.createElement("div");
      guideElement.style.width = "300px";
      guideElement.style.height = "100px";
      const arrow = new Arrow({
        width: 300,
        height: 100,
        distance: 100,
        position: "left",
        color: "#fff",
        target,
        guideElement,
      });
      expect(arrow.element).toMatchSnapshot();
    });
  });

  describe("when position is right", () => {
    it("renders the expected SVG arrow", () => {
      const target = document.createElement("div");
      target.style.marginTop = 500;
      target.style.marginLeft = 500;
      target.style.width = 100;
      target.style.height = 50;
      const guideElement = document.createElement("div");
      guideElement.style.width = "300px";
      guideElement.style.height = "100px";
      const arrow = new Arrow({
        width: 300,
        height: 100,
        distance: 100,
        position: "right",
        color: "#fff",
        target,
        guideElement,
      });
      expect(arrow.element).toMatchSnapshot();
    });
  });
});
