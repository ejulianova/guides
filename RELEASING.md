# Releasing v2 (maintainer notes)

This documents the plan for publishing 2.0.0 as a breaking change while people are still actively using 1.x. It's maintainer-facing — end users should read [MIGRATION.md](MIGRATION.md) instead.

## Current v1 usage

Checked 2026-07-03. This isn't a dead package — there's a small but steady, real user base split across two distinct channels, so the rollout should treat that seriously rather than just publishing over it.

**npm** (`registry.npmjs.org/guides`, `api.npmjs.org/downloads`):
- Latest published version is still `1.2.9` — `2.0.0` has never been published, so at the time of writing 100% of npm downloads are v1.
- 213 downloads in the last 30 days, 1,838 over the last year, landing every single day (4–16/day, no gaps) rather than in one burst — consistent with CI pipelines reinstalling it on real projects, not a one-time spike.

**jsDelivr CDN** (`data.jsdelivr.com`) — a separate audience from npm, since jQuery-era plugins are commonly loaded via `<script src="...">` rather than installed:
- 100 hits / 313KB bandwidth in the last 30 days, also spread across many days, not concentrated.

**GitHub dependents graph** (`github.com/ejulianova/guides/network/dependents`):
- 3 public repositories, 3 packages listed. Least reliable number — only counts public repos GitHub could detect via lockfile/package.json, misses private repos and CDN-only consumers entirely.

Re-check before executing the deprecation step below — usage may have shifted:

```bash
curl -s https://registry.npmjs.org/guides | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['dist-tags'])"
curl -s https://api.npmjs.org/downloads/point/last-month/guides
curl -s "https://data.jsdelivr.com/v1/stats/packages/npm/guides?period=month"
```
(GitHub dependents graph has no API — check `https://github.com/ejulianova/guides/network/dependents` directly.)

## Publishing mechanics

Publishing to npm is a manual, explicit action — [`.github/workflows/publish-npm.yml`](.github/workflows/publish-npm.yml) only runs on `workflow_dispatch`, never automatically on push or tag creation. It re-runs lint/test/build as a gate immediately before publishing, then `npm publish --provenance` using an `NPM_TOKEN` repo secret.

**One-time setup** (only you can do this):
1. On npmjs.com, create an **Automation** token (Access Tokens → Generate New Token → Automation — this type bypasses 2FA prompts so it works non-interactively in CI).
2. Add it as a repo secret named `NPM_TOKEN` (Settings → Secrets and variables → Actions → New repository secret).

**To cut a release:**
1. Locally: `npm run release` / `release:minor` / `release:major` — bumps `package.json`, commits, tags (e.g. `v2.0.1`), and pushes the commit + tag. This step does *not* publish anything; it's git-only, no npm token needed.
2. On GitHub: Actions tab → "Publish to npm" → **Run workflow** → pick the branch/tag you just pushed (e.g. `v2.0.1`) and the npm dist-tag to publish under (`latest`, `next`, `v1`, ...) → Run.
3. Check the workflow's job summary — it prints the exact version/tag/commit being published before the `npm publish` step runs, so you can catch a wrong branch/tag selection before it's irreversible.

For the initial 2.0.0 release specifically, consider publishing under the `next` dist-tag first (`npm i guides@next` for early testers) before promoting to `latest`, given step 3 below is a breaking change for anyone on an unpinned install.

## Rollout plan

1. **Cut a `v1` maintenance branch** before touching `master`/`main`. Once the v2 rewrite lands on the default branch, `master` no longer has the jQuery code — patching v1 (including security fixes) needs a branch to work from.

2. **Pin an npm dist-tag to the last v1 release**, before publishing 2.0.0, so it's discoverable independent of what `latest` points to afterward:
   ```bash
   npm dist-tag add guides@1.2.9 v1
   ```
   `npm i guides@v1` will then always resolve to the last jQuery release, regardless of how many major versions ship later.

3. **Publish 2.0.0 as `latest`** (via the "Publish to npm" Action, see above) only after step 2 is done.

   Note that this alone does not affect most existing installs: consumers who installed with the default `^1.x.x`/`~1.x.x` range are unaffected by a new major version — npm won't cross a major-version boundary on a caret/tilde range. Only people who pinned `"guides": "*"` or `"latest"` literally are at risk, which is rare.

4. **CDN consumers need a separate check.** jsDelivr/unpkg URLs that already pin to `@1` (e.g. `cdn.jsdelivr.net/npm/guides@1/dist/guides.min.js`) are automatically safe — `@1` always resolves to the latest 1.x. But an *unversioned* URL (`cdn.jsdelivr.net/npm/guides/dist/guides.min.js`, no version) resolves to whatever npm's `latest` tag points to, and **will silently jump to 2.0.0** the moment step 3 happens. This is called out in MIGRATION.md; consider also opening an issue/discussion for the 3 known dependents pointing them at it.

5. **Don't run `npm deprecate` on the 1.x line immediately.** It prints a warning on every `npm install` for anyone still on that range, which fights the goal of letting people migrate on their own schedule. Hold off until a real migration window has passed (a few months), then deprecate with a message pointing at MIGRATION.md.

6. **Document a support window for 1.x** (e.g. "critical/security fixes only through <date>") in the v2 CHANGELOG's breaking-change note, so it's a concrete commitment rather than an open-ended one.
