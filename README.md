# guides.js

Guides.js is a lightweight javascript library for guided website tours. It finds the element you want to highlight, creates a "tip" using the html you specified pointing to the highlighted element.

> **Upgrading from v1?** v2 is a breaking rewrite that drops the jQuery dependency. See [MIGRATION.md](MIGRATION.md).

## Demo

[http://ejulianova.github.io/guides/](http://ejulianova.github.io/guides/)

## Installation

```shell
npm i guides
```

## Usage

```javascript
import Guides from "guides";

const tour = new Guides({
  color: "white",
  distance: 100,
  guides: [
    {
      html: "Welcome to Guides.js",
    },
    {
      target: document.querySelector("nav"),
      html: "Navigate through guides.js website",
    },
    {
      target: document.querySelector(".demo"),
      html: "See how it works",
    },
    {
      target: document.querySelector("#installation"),
      html: "Check out how to get started with guides.js",
    },
  ],
  render: (event) => console.log(event),
  start: (event) => console.log(event),
  end: (event) => console.log(event),
  next: (event) => console.log(event),
  prev: (event) => console.log(event),
});

document.querySelectorAll(".demo").forEach((button) => {
  button.addEventListener("click", () => tour.start());
});
```

Now the tour will start every time any of the `.demo` buttons are clicked.

## Security

**Important:** Guides.js uses `innerHTML` to render guide content, which allows rich HTML formatting. However, this means **you must sanitize any user-provided content** to prevent XSS (Cross-Site Scripting) attacks.

### Safe Usage

```javascript
// ✅ Safe - developer-controlled content
const tour = new Guides({
  guides: [
    { html: "Welcome to <strong>our app</strong>!" },
    { html: "Navigate through <em>guides.js</em> website" },
  ],
});

// ❌ Unsafe - user input without sanitization
const userInput = getUserInput(); // Could contain malicious scripts
const tour = new Guides({
  guides: [{ html: userInput }], // XSS vulnerability!
});

// ✅ Safe - sanitized user input
import DOMPurify from "dompurify";
const userInput = getUserInput();
const tour = new Guides({
  guides: [{ html: DOMPurify.sanitize(userInput) }],
});
```

**Recommendation:** If your guide content includes user-generated data, use a sanitization library like [DOMPurify](https://github.com/cure53/DOMPurify) to clean the HTML before passing it to Guides.js.

## Configuration

| Option         | Type     | Default | Description                                                              |
| -------------- | -------- | ------- | ------------------------------------------------------------------------- |
| `guides`       | array    | —       | _required_ List of guides                                                |
| `distance`     | number   | 100     | Distance between the tip and the highlighted element                     |
| `color`        | string   | '#fff'  | Arrows and text color                                                    |
| `className`    | string   | —       | Custom CSS class name(s) added to every guide element                    |
| `smoothScroll` | boolean  | false   | Use smooth scrolling when bringing a target into view (see note below)   |
| `start`        | function | —       | Callback function called when the tour starts                            |
| `end`          | function | —       | Callback function called when the tour ends                              |
| `next`         | function | —       | Callback function called after moving to the next tip                    |
| `prev`         | function | —       | Callback function called after moving to the previous tip                |
| `render`       | function | —       | Callback function called before a guide is rendered                      |

`smoothScroll` defaults to `false` (instant jump) because it keeps positioning simple: with smooth scrolling, the tip has to wait for the scroll to actually finish (via the `scrollend` event, with a 1s fallback timeout) before it can measure the target's final position. Instant scrolling has no such wait. Turn on `smoothScroll: true` for the nicer motion — the demo does.

For each guide in the `guides` array, you can specify:

| Option         | Type     | Description                                                       |
| -------------- | -------- | -------------------------------------------------------------------- |
| `html`         | string   | _required_ The tip's content (plain text or HTML markup)          |
| `target`       | DOM node | The element to highlight; if omitted, the guide will be centered  |
| `color`        | string   | Arrows and text color; if omitted, uses the global color          |
| `className`    | string   | Custom CSS class name(s); if omitted, uses the global className   |
| `smoothScroll` | boolean  | Overrides the global `smoothScroll` setting for this guide only   |

## Methods

| Method    | Description                                                              |
| --------- | ------------------------------------------------------------------------- |
| `start(index?)` | Starts the guided tour, optionally at a given step (default: 0)     |
| `end()`   | Exits the guided tour                                                     |
| `next()`  | Moves to the next tip. Throws if the tour isn't in progress               |
| `prev()`  | Moves to the previous tip. Throws if the tour isn't in progress           |

## Accessibility

The tour canvas is marked `role="dialog"` with `aria-modal="true"`. While a tour is active, Guides.js:

- Moves focus into each guide tip as it renders (and back out again as you navigate).
- Makes the rest of the page `inert` (unreachable by mouse, keyboard, and screen readers) so the modal claim is actually true.
- Restores focus to whatever element was focused before `start()` was called once the tour ends.

If your guide `html` includes interactive elements (buttons, links), keep in mind Tab does not loop back to the first one — there's no full focus trap, since guide tips are meant to hold brief content rather than complex forms.

## React

Guides.js includes a React component wrapper for easier integration with React applications.

### Installation

The React component is available from the main package:

```shell
npm i guides
```

### Usage

```jsx
import { useRef } from "react";
import GuidedTour from "guides/react";

function App() {
  const tourRef = useRef();

  return (
    <div>
      <GuidedTour
        ref={tourRef}
        guides={[
          {
            html: "Welcome to our app!",
          },
          {
            target: document.querySelector("header"),
            html: "This is the header section",
          },
          {
            target: document.querySelector("main"),
            html: "Here's the main content area",
          },
        ]}
        color="#007bff"
        distance={100}
        onStart={() => console.log("Tour started")}
        onEnd={() => console.log("Tour ended")}
      >
        {(tour) => <button onClick={() => tour?.start()}>Start Tour</button>}
      </GuidedTour>

      <header>Header Content</header>
      <main>Main Content</main>
    </div>
  );
}

export default App;
```

> **Performance tip:** `<GuidedTour>` re-creates the underlying tour whenever the `guides` array's identity changes. The example above defines `guides` inline, so it's a fresh array on every render of `App`. That's fine if `App` rarely re-renders, but if it does, wrap `guides` (and any inline callback props) in `useMemo`/`useCallback` so an in-progress tour doesn't get torn down and restarted underneath the user.

### React Props

| Prop        | Type     | Default | Description                                 |
| ----------- | -------- | ------- | ------------------------------------------- |
| `guides`    | array    | —       | _required_ Array of guide objects           |
| `color`     | string   | '#fff'  | Arrows and text color                       |
| `distance`  | number   | 100     | Distance between tip and element            |
| `className` | string   | —       | Custom CSS class for the guide element      |
| `smoothScroll` | boolean | false | If true, smooth scroll and defer positioning until scroll completes (per-guide overrides) |
| `autoStart` | boolean  | false   | Automatically start tour on component mount |
| `onStart`   | function | —       | Callback when tour starts                   |
| `onEnd`     | function | —       | Callback when tour ends                     |
| `onNext`    | function | —       | Callback when moving to next tip            |
| `onPrev`    | function | —       | Callback when moving to previous tip        |
| `onRender`  | function | —       | Callback before guide is rendered           |
| `children`  | function | —       | Render function to expose tour methods      |

### Using with Refs

Access the tour instance to programmatically control the tour:

```jsx
import { useRef } from "react";
import GuidedTour from "guides/react";

function App() {
  const tourRef = useRef();

  return (
    <>
      <GuidedTour
        ref={tourRef}
        guides={[{ html: "Step 1" }, { html: "Step 2" }, { html: "Step 3" }]}
      />

      <div>
        <button onClick={() => tourRef.current?.start()}>Start</button>
        <button onClick={() => tourRef.current?.next()}>Next</button>
        <button onClick={() => tourRef.current?.prev()}>Previous</button>
        <button onClick={() => tourRef.current?.end()}>End</button>
      </div>
    </>
  );
}

export default App;
```

### Using with Render Props

Use the children render function pattern to integrate tour controls:

```jsx
import GuidedTour from "guides/react";

function App() {
  return (
    <GuidedTour
      guides={[
        { html: "Welcome!" },
        { target: document.querySelector("main"), html: "Main content" },
      ]}
    >
      {(tour) => (
        <button onClick={() => tour?.start()}>Start Guided Tour</button>
      )}
    </GuidedTour>
  );
}

export default App;
```

## Development

### Building the Library

Build the production library:

```bash
npm run build
```

Build the demo site:

```bash
npm run build:demo
```

Run the development server:

```bash
npm start
```

### Running Tests

```bash
npm test
```

### Deploying Demo to GitHub Pages

The demo site is automatically deployed to GitHub Pages when you push to the `master` branch.

The deployment is handled by the GitHub Actions workflow in [`.github/workflows/deploy-demo.yml`](.github/workflows/deploy-demo.yml).

**Initial Setup:**

1. Go to your repository's Settings > Pages
2. Under "Build and deployment", set:
   - **Source**: GitHub Actions
3. Push to the `master` branch to trigger the deployment

The demo will be available at: `https://ejulianova.github.io/guides/`

You can also manually trigger the deployment from the Actions tab in your GitHub repository.
