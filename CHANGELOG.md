# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - Unreleased

**🚨 Breaking change:** complete rewrite. Drops the jQuery dependency for a vanilla JavaScript core with an optional React wrapper. Not backwards compatible with v1.x — see [MIGRATION.md](MIGRATION.md) for upgrade instructions and [RELEASING.md](RELEASING.md) for the rollout plan.

### Added
- Zero runtime dependencies (React is now an optional peer dependency, only needed for `guides/react`)
- React component wrapper with hooks support (`guides/react`)
- TypeScript definitions (`index.d.ts`, `react.d.ts`)
- New navigation/progress API: `goTo(index)`, `getCurrentGuide()`, `getProgress()`
- Tour persistence: `saveTourProgress()`, `loadTourProgress()`, `clearTourProgress()`, `resumeFromProgress()`
- `smoothScroll` option (per-tour or per-guide), using the native `scrollend` event where available
- `start(index?)` accepts an optional starting index; `autoStart` prop for the React component
- Accessible focus management: focus moves into each guide tip, the rest of the page is made `inert` while a tour is active (backing up the existing `aria-modal="true"`), and focus restores to the trigger element on `end()`
- Dark mode (`prefers-color-scheme`) and mobile-responsive tip sizing
- Debounced window-resize repositioning
- Graceful fallback (centered position + console warning) when a highlighted target is removed from the DOM mid-tour
- Security documentation covering `innerHTML` / XSS considerations for guide content

### Changed
- CSS migrated to custom properties (`--guides-*`) for theming
- `target` replaces v1's `element` option; `className` replaces v1's `cssClass`
- Guide/Arrow instances now only receive the specific option fields they use, not the entire tour config (including callbacks and the full `guides` array)

### Removed
- jQuery dependency
- Bower distribution
- `setOptions()` — construct a new instance instead
- The `destroy` event callback — use `end` instead (`destroy()` is now a plain alias for `end()`)

## [1.2.9] - 2016-11-19

Last jQuery-based release. See [MIGRATION.md](MIGRATION.md) for what changed moving to v2.

[2.0.0]: https://github.com/ejulianova/guides/compare/1.2.9...HEAD
[1.2.9]: https://github.com/ejulianova/guides/releases/tag/1.2.9
