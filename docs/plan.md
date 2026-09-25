# Action Plan — React Refactoring Assessment

Living checklist. Tick a box when its commit lands. Order follows severity from
[`audit.md`](./audit.md): Critical → High → Medium → Low. Commits group issues only
when the fix is genuinely the same change to the same lines — see `audit.md` for
why each grouping was made.

Verification gate for every commit: `pnpm test` passes, app still runs via `pnpm dev`,
no behavior change beyond the fix itself (no new features, no rewrite).

## Critical

- [ ] **Commit 1 — Remove hardcoded secret and debug logging** (#1, #16)
      Delete `API_KEY` constant and both `console.log` calls.
- [ ] **Commit 2 — Fix stored XSS** (#15)
      Replace `dangerouslySetInnerHTML` with plain `{todo.text}` JSX (React escapes by default).
      Add regression test: render a todo with `<img src=x onerror=...>` as text, assert it renders as literal text, not markup/executes nothing.

## High

- [ ] **Commit 3 — Fix localStorage save effect running every render** (#4)
      Add `[todos]` dependency array to the persistence `useEffect`.

## Medium

- [ ] **Commit 4 — Guard corrupted localStorage data** (#3)
      Wrap `JSON.parse(saved)` in try/catch; fall back to `[]` on parse failure.
- [ ] **Commit 5 — Replace `Date.now()` ID with collision-safe ID** (#6)
      Use `crypto.randomUUID()` for new todo `id`.
- [ ] **Commit 6 — Extract `useTodos` custom hook** (#2, folds in #5, #7, #10)
      Move `todos` state, `addTodo`/`deleteTodo`/`toggleTodo`, and both localStorage
      effects into `src/hooks/useTodos.js`. Wrap CRUD functions in `useCallback`.
      `App.jsx` becomes presentation-only, consuming the hook.
- [ ] **Commit 7 — Add error boundary** (#17)
      Minimal `ErrorBoundary` component wrapping `<App />` in `main.jsx`.
- [ ] **Commit 8 — Accessible names for input, checkbox, delete button** (#11, #19, #20)
      `<label>`/`aria-label` on the text input, `aria-label` on each checkbox and
      delete button referencing the specific todo's text.

## Low

- [ ] **Commit 9 — Memoize filtered list and stats** (#8, #9)
      `useMemo` for the filtered todo list and for `stats`, keyed on `[todos, filter]` / `[todos]`.
- [ ] **Commit 10 — Move filter-button active styling to CSS** (#12)
      Replace inline `style={{...}}` with a CSS class (e.g. `.filter-btn.active`) in `index.css`.
- [ ] **Commit 11 — Add empty-state message** (#13)
      Render a "No todos yet" message when the filtered list is empty.
- [ ] **Commit 12 — `aria-pressed` on filter buttons** (#21)
      Reflect active filter state for assistive tech, not just background color.

## Reviewed, no action

- #14 — comment inaccurate; code already uses `todo.id` as React `key`.
- #18 — no TypeScript in project; adding it is a tooling addition, out of scope.

## Progress

0 / 12 commits landed.
