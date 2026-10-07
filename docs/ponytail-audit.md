# Ponytail Audit — Over-engineering & Bloat

Date: 2026-10-07
Scope: whole repo (`src/`, config, tooling files). Over-engineering and complexity only.
Ranked biggest cut first. Format: `<tag> <what to cut>. <replacement>. [path]`

## Findings

1. `delete:` 16 `// Issue N` / `{/* Issue N */}` marker comments. Remove each one as its issue is fixed; none should survive the refactor. [src/App.jsx:3,7,12,21,26,33,45,56,67,74,79,95,118,120,127,143]
2. `shrink:` Three copy-pasted filter buttons with inline styles. Map over one array and use a class instead of inline style: `{['all','active','completed'].map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</button>)}` plus one `.filters button.active { background: #28a745 }` rule. ~-12 lines. [src/App.jsx:96-115]
3. `shrink:` Repeated "type text, click Add" setup in four tests. One local helper `const add = (text) => { fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), { target: { value: text } }); fireEvent.click(screen.getByText('Add')) }`. ~-12 lines. [src/App.test.jsx:17-21,28-32,42-46,56-63]
4. `delete:` Unused `API_KEY` constant and both render-time `console.log` calls. Nothing reads the key; delete all three. -4 lines. [src/App.jsx:4,144-145]
5. `shrink:` Mount-time load `useEffect` + separate `useState([])`. Lazy initializer: `useState(() => JSON.parse(localStorage.getItem('todos')) ?? [])`. Removes one effect and the empty-first-render. -6 lines. [src/App.jsx:8,13-19]
6. `shrink:` `getFilteredTodos()` helper with three branches, called once. Inline one expression: `const visible = filter === 'all' ? todos : todos.filter(t => t.completed === (filter === 'completed'))`. -6 lines. [src/App.jsx:57-65]
7. `delete:` Test setup file re-does what libraries already do. With `globals: true`, Testing Library auto-runs `cleanup` after each test, and `expect` import is unused. Delete `src/test/setup.js`; set `setupFiles: '@testing-library/jest-dom/vitest'` in config. -7 lines, -1 file. [src/test/setup.js, vite.config.js:9]
8. `native:` Hand-rolled Enter-key handler on deprecated `onKeyPress`. Wrap input + button in `<form onSubmit={e => { e.preventDefault(); addTodo() }}>`; the browser submits on Enter. -5 lines. [src/App.jsx:80-93]
9. `delete:` Second lockfile `bun.lock` alongside `pnpm-lock.yaml`, and `pnpm-workspace.yaml` for a single-package repo holding only a placeholder (`esbuild: set this to true or false`). Pick pnpm; delete `bun.lock`; delete `pnpm-workspace.yaml` or set `esbuild: true` if pnpm demands the build approval. -1 to -2 files. [bun.lock, pnpm-workspace.yaml]
10. `shrink:` `stats` object runs two full filters. One count, derive the other: `const done = todos.filter(t => t.completed).length`, active = `todos.length - done`. Drop the wrapper object. -3 lines. [src/App.jsx:68-72,140]
11. `delete:` `createdAt` field written on every todo, never read. YAGNI; add when something displays or sorts by it. -1 line. [src/App.jsx:38]
12. `native:` 9-font hand-listed system font stack. `font-family: system-ui, sans-serif;`. -2 lines. [src/index.css:8-10]
13. `shrink:` Default `import React` only to reach `React.StrictMode`. `import { StrictMode } from 'react'`. ±0 lines, one less namespace. [src/main.jsx:1,7]

## Out of scope (route to a normal review)

- Security: `dangerouslySetInnerHTML` renders raw user text (XSS). Use `{todo.text}`, which is also shorter. [src/App.jsx:128]
- Correctness/perf: save `useEffect` has no dependency array, so it writes on every render. Add `[todos]`. [src/App.jsx:22-24]
- Correctness: `Date.now()` IDs can collide on fast adds. `crypto.randomUUID()` is a native one-liner. [src/App.jsx:35]
- Accessibility: input has no label. Add `aria-label="New todo"`. [src/App.jsx:81]

## Not worth adding

- No `useMemo` / `useCallback`. List is tiny; memoization adds code for no measurable gain.
- No component split, custom hooks, context, or state library. 150-line single component is fine at this size.

net: ~-74 lines, -0 deps possible (plus -1 to -3 files: `src/test/setup.js`, `bun.lock`, `pnpm-workspace.yaml`).
