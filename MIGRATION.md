# Migrating from v1 to v2

Guides.js v2 is a complete rewrite. It drops the jQuery dependency entirely and ships a plain JavaScript core with an optional React wrapper. **This is not a drop-in upgrade** — read through this guide before bumping your dependency.

## Why a breaking rewrite

- jQuery is no longer a reasonable runtime dependency for a small UI library — v2 has zero runtime dependencies (React is an optional peer dependency, only needed if you use `guides/react`).
- The old jQuery plugin API (`$.fn.guides(...)`) doesn't map cleanly onto a dependency-free implementation, so the API surface changed shape rather than just losing jQuery underneath the same calls.

## Installation

```shell
npm i guides@latest
```

If you need to keep using v1 while you migrate, pin it explicitly:

```shell
npm i guides@^1
```

v1 will keep receiving critical fixes on the `1.x` line for a period after v2 ships, but new features and most bug fixes will only land on v2 going forward. See [RELEASING.md](RELEASING.md) for the exact rollout plan and support window.

### Loading from a CDN instead of npm?

If you include Guides.js directly with a `<script src="...">` tag (common for a jQuery-era plugin) rather than through npm, **check how your URL is pinned**:

```html
<!-- Safe: pinned to the 1.x line, will never change under you -->
<script src="https://cdn.jsdelivr.net/npm/guides@1/dist/guides.min.js"></script>

<!-- Not safe: unversioned, resolves to npm's "latest" tag -->
<script src="https://cdn.jsdelivr.net/npm/guides/dist/guides.min.js"></script>
```

An unversioned CDN URL will silently start serving 2.0.0 (and its breaking changes) the moment it's published, with no warning. If your `<script>` tag doesn't have a version number after the package name, add `@1` now, before upgrading on your own schedule.

## jQuery is no longer required

v1 declared jQuery as a hard runtime dependency (`^3.0.0`) and used `$(...)` internally. v2 has no such requirement — you can drop jQuery entirely if Guides.js was your only reason for including it (you may still need it for other things in your app, but Guides.js itself no longer touches `window.$`).

## API changes

### Initialization

v1 was a jQuery plugin with two entry points: bind it to a trigger element (the tour auto-starts when that element is clicked), or create a standalone instance and call `.start()` yourself.

**v1, bound to a trigger element:**

```javascript
$("#demo").guides({
  guides: [
    { element: $(".navbar-brand"), html: "Welcome to Guides.js" },
    { element: "#download", html: "Download guides.js" },
  ],
});
// tour now starts automatically whenever #demo is clicked
```

**v1, standalone:**

```javascript
var tour = $.guides({
  guides: [{ html: "Welcome to Guides.js" }, { element: $(".navbar"), html: "..." }],
});
tour.start();
```

**v2:**

```javascript
import Guides from "guides";

const tour = new Guides({
  guides: [
    { html: "Welcome to Guides.js" },
    { target: document.querySelector(".navbar-brand"), html: "..." },
  ],
});

document.querySelector("#demo").addEventListener("click", () => tour.start());
```

- No more jQuery selector entry point and no more auto-binding a click handler for you — `Guides` is a plain class you instantiate, and you wire up whatever triggers `start()` yourself (as in the README example). This is more code for the "bind to trigger element" case, but it's the same code you already needed for the "standalone" case in v1.
- The per-guide field was renamed from `element` to `target`, and it now takes a raw DOM node (`document.querySelector(...)`) instead of a jQuery object or CSS-selector string.
- The `html` field is unchanged — v1 already used a single `html` string per guide, not separate title/description fields.

### Starting and controlling the tour

**v1:** methods were dispatched through the jQuery plugin's string-command convention when bound to an element (`$('#demo').guides('start')`, `.guides('next')`, `.guides('prev')`, `.guides('end')`, `.guides('destroy')`, `.guides('setOptions', options)`), or called directly on the object returned by `$.guides(...)` in the standalone case (`tour.start()`, `tour.next()`, ...).

**v2:** always call methods directly on the instance — there's no string-command form:

```javascript
tour.start(); // or tour.start(3) to start at a specific step
tour.next();
tour.prev();
tour.end();
tour.goTo(2); // new in v2, see below
```

Two behavior changes to note:
- `next()` and `prev()` now **throw** if called while the tour isn't in progress, instead of v1's `next()` (which just kept incrementing an internal counter with no guide to show) or `prev()` (which quietly did nothing). Check `tour.getProgress().isActive` first, or wrap in try/catch, if you call these from code that might run before `start()`.
- v1 had a separate `destroy` method/event that called `end()` and then also unbound the trigger element's click handler and fired a `destroy` callback. v2's `destroy()` is a plain alias for `end()` — there's no separate `destroy` event, since v2 doesn't bind any click handler on your behalf to begin with (see above).
- `setOptions(options)` (v1's way to patch options after construction) has no v2 equivalent — construct a new `Guides` instance with the merged options instead.

### Events

**v1:** callbacks passed in the options object only — `start`, `end`, `next`, `prev`, `render`, `destroy`. No way to add a second listener for the same event without overwriting the first.

**v2:** pass callbacks in the constructor exactly as before (minus `destroy`, see above), plus a new `.on()`/`.off()` API if you need multiple listeners per event or want to attach listeners after construction:

```javascript
const tour = new Guides({
  guides: [...],
  start: (event) => console.log("started", event),
});

// or, new in v2:
tour.on("start", (event) => console.log("started", event));
tour.off("start"); // remove all handlers for an event
```

Supported events: `start`, `render`, `next`, `prev`, `end` (no `destroy` event — see above). The event object's shape also changed: v1 passed `{ sender, $element, $guide }` (jQuery-wrapped); v2 passes `{ sender, guide }` where `guide` is the plain guide config object, not a DOM/jQuery reference.

### CSS classes

Good news here: the `.guides-*` class names are almost unchanged (`guides-canvas`, `guides-overlay`, `guides-mask`, `guides-guide`, `guides-current-element`, `guides-fade-in`, `guides-center`, `guides-top`/`guides-bottom`/`guides-left`/`guides-right`), so most custom CSS overrides should carry over as-is. Two things did change:

- The global/per-guide class-name option was renamed from `cssClass` to `className`.
- `guides-canvas`/`guides-overlay`/`guides-mask` switched from `position: absolute` to `position: fixed`, and v2 layers in CSS custom properties (`--guides-*`) for theming, a `backdrop-filter` blur, dark-mode support, and responsive breakpoints. See [`src/Guides.scss`](src/Guides.scss) for the current styles.
- You no longer link a separate `guides.css`/`guides.min.css` file — the stylesheet is bundled with the JS import (`import Guides from "guides"` pulls in the CSS automatically via webpack's `sideEffects`).

## New in v2 (not present in v1)

- TypeScript definitions (`index.d.ts`, `react.d.ts`).
- A React component wrapper (`guides/react`) — see the [README](README.md#react) for usage.
- `goTo(index)`, `getCurrentGuide()`, `getProgress()` for programmatic navigation and progress display.
- `saveTourProgress()` / `loadTourProgress()` / `clearTourProgress()` / `resumeFromProgress()` for persisting a tour across page loads via `localStorage`.
- `smoothScroll` option (per-tour or per-guide) for animated scroll-into-view. Note the default changed: v1 always animated the scroll (jQuery's `.animate()`, 500ms); v2 defaults to an instant jump and requires `smoothScroll: true` to get animated scrolling back — see the README for why.
- Dark mode support via `prefers-color-scheme` and CSS custom properties (`--guides-*`).
- Mobile-responsive tip sizing.
- Focus management: the tour is a real accessible modal now — focus moves into each tip, the rest of the page is made `inert` while the tour is active, and focus is restored to the trigger element on `end()`. See [Accessibility](README.md#accessibility) in the README.

## Security note

v2's `html` field is rendered with `innerHTML`, same as v1. If any of your guide content comes from user input rather than being hardcoded by your app, sanitize it (e.g. with [DOMPurify](https://github.com/cure53/DOMPurify)) before passing it in — see the [Security section](README.md#security) in the README.

## Getting help

If you hit a migration issue not covered here, please open an issue with your v1 configuration and what you expected v2 to do.
