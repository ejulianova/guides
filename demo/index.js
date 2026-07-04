import Guides from "../src/index";

const guidedTour = new Guides({
  smoothScroll: true,
  guides: [
    {
      html: "Welcome to Guides.js",
    },
    {
      target: document.querySelector("#usage"),
      html: "See how to get started",
    },
    {
      target: document.querySelector("#configuration"),
      html: "See all configuration options",
    },
    {
      target: document.querySelector("#methods"),
      html: "See all supported methods",
    },
    {
      target: document.querySelector("#github-link"),
      html: "View on Github",
    },
    {
      target: document.querySelector(".top-nav"),
      html: "This is a fixed navigation bar at the top of the page.",
    },
  ],
});

document
  .querySelectorAll(".demo")
  .forEach((button) =>
    button.addEventListener("click", () => guidedTour.start()),
  );
