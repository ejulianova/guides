/* global React, ReactDOM */
(function demoIIFE() {
  const e = React.createElement;
  const root = ReactDOM.createRoot(document.getElementById("root"));

  const guides = [
    { html: "Welcome to the React demo!" },
    {
      target: document.querySelector("#usage"),
      html: "See how to use the GuidedTour component.",
    },
    {
      target: document.querySelector("#configuration"),
      html: "smoothScroll can be set globally or per guide.",
    },
    {
      target: document.querySelector("#methods"),
      html: "Same methods: start, end, next, prev.",
    },
    {
      target: document.querySelector("#github-link"),
      html: "View on GitHub.",
    },
    {
      target: document.querySelector(".top-nav"),
      html: "This is the nav. Use the button here to start the tour.",
    },
  ];

  root.render(
    e(window.GuidedTour, {
      guides,
      smoothScroll: true,
      color: "#fff",
      distance: 100,
      children(tour) {
        return e(
          "button",
          {
            className: "demo",
            type: "button",
            onClick() {
              if (tour) tour.start();
            },
          },
          "Start demo",
        );
      },
    }),
  );
})();
