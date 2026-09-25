# Audit Trail — React Refactoring Assessment

Source: `src/App.jsx` (16 issues pre-flagged via inline comments) plus an independent
review against the 5 grading categories in the root `README.md`. Severity drives fix
order in [`plan.md`](./plan.md).

Severity scale: **Critical** (security/data exposure) · **High** (breaks correctness
or perf under real usage) · **Medium** (real defect, moderate impact) · **Low**
(quality/polish, no functional risk).

## Findings

| # | File:Line (approx) | Category | Severity | Finding |
|---|---|---|---|---|
| 1 | `App.jsx:4` | Security | Critical | Hardcoded API key (`sk-1234567890abcdef`) committed in source, and unused by any actual request. |
| 16 | `App.jsx:147-148` | Security | Critical | Leftover debug `console.log` calls, one of which logs the API key to the browser console on every render. |
| 15 | `App.jsx:130` | Security | Critical | `dangerouslySetInnerHTML` renders raw `todo.text` — stored XSS: any `<script>`/`<img onerror>` typed into the input executes for every viewer. |
| 6 | `App.jsx:33` | Reliability / Code Quality | Medium | `Date.now()` used as todo `id`. Two todos added within the same millisecond (rapid calls, tests) collide, breaking `key` uniqueness and toggle/delete targeting. |
| 3 | `App.jsx:12-17` | Code Quality | Medium | Comment claims a bad dependency array, but `[]` is actually correct for a run-once load. The real gap: `JSON.parse(saved)` is unguarded — corrupted/hand-edited `localStorage` data throws and crashes the app on mount. |
| 4 | `App.jsx:20-22` | Performance | High | Save-to-localStorage effect has **no** dependency array — it re-runs and re-serializes `todos` on every single render, not just when `todos` changes. |
| 2 | `App.jsx:8-10` | Code Quality | Medium | Three independent `useState` calls plus CRUD logic and persistence live directly in the component body — no separation between state logic and presentation. |
| 5 | `App.jsx:29` | Performance | Low | `addTodo` is a new function every render (not memoized); passed to `onClick`, causing unnecessary prop churn. |
| 7 | `App.jsx:48` | Code Quality | Low | `deleteTodo` has no error handling — low risk (array filter can't throw), but flagged as a gap in defensive coding. |
| 8 | `App.jsx:58-65` | Performance | Low | `getFilteredTodos()` recalculates by filtering the full array on every render instead of only when `todos`/`filter` change. |
| 9 | `App.jsx:69-73` | Performance | Low | `stats` object iterates `todos` twice (`.filter` x2) on every render, uncached. |
| 10 | `App.jsx:76` (list buttons) | Performance | Low | Inline arrow functions on click handlers recreated every render. |
| 11 | `App.jsx:87-96` | Accessibility | Medium | Todo text `<input>` has no `<label>`/`aria-label` — relies solely on placeholder, which is not an accessible name. |
| 12 | `App.jsx:104-124` | Code Quality | Low | Filter button active-state styling is inline (`style={{...}}`), inconsistent with the rest of the app which uses `index.css` classes. |
| 13 | `App.jsx:127-144` | Code Quality / UX | Low | No empty-state message when the filtered list has zero todos — renders a blank `<div>`. |
| 14 | `App.jsx:128` | Code Quality | — (false positive) | Comment says "key should use ID instead of index" — code already uses `todo.id` as the `key`. No action needed. |

## Findings beyond the numbered comments (independent review vs. README categories)

| # | Category | Severity | Finding |
|---|---|---|---|
| 17 | Code Quality / DX | Medium | No error boundary anywhere in the tree (`main.jsx` renders `<App/>` directly) — README section 3 explicitly asks whether proper error boundaries exist. An unexpected render error (e.g. malformed todo data) blanks the entire app with no recovery UI. |
| 18 | DX | N/A | No TypeScript in the project (plain `.jsx`, no `tsconfig.json`). Retrofitting types is a tooling/feature addition, out of scope per README's "do not add new features / do not rewrite" rules. Reviewed, no action. |
| 19 | Accessibility | Medium | Completion `<input type="checkbox">` has no accessible name tied to its todo — a screen reader announces only "checkbox," not which todo it toggles. |
| 20 | Accessibility | Medium | Delete `<button>` text is generic "Delete" with no indication of which todo — ambiguous out of visual context for screen reader users. |
| 21 | Accessibility | Low | Filter buttons (`All`/`Active`/`Completed`) don't expose active state via `aria-pressed`, only via background color. |

## Summary

- **Critical (3):** #1, #15, #16 — all security, all must be fixed first.
- **High (1):** #4 — real performance/correctness bug (effect runs unconditionally).
- **Medium (7):** #2, #3, #6, #11, #17, #19, #20.
- **Low (8):** #5, #7, #8, #9, #10, #12, #13, #21.
- **False positive (1):** #14 — reviewed, no action.
- **N/A (1):** #18 — reviewed, no action, out of scope.
