# My Todo List — Refactor Notes
This is a small to-do list app built with React. You type a thing you need to do, press **Add**, and it shows up in a list. You can tick it off, delete it, and filter the list by "All", "Active", or "Completed".

The app came from [supportrevou/technical-test-3](https://github.com/supportrevou/technical-test-3). It worked, but it had hidden problems. The task was to find those problems and fix them without adding new features or rewriting everything.

This README explains what was wrong and how it was fixed, in plain words. For the full technical write-up, see [issue #16](https://github.com/denidarta/revou-cc3/issues/16).

---

## Run it

You need Node.js v22 or newer and pnpm.

```bash
pnpm install
```

```bash
pnpm dev
```

Then open http://localhost:5173.

```bash
pnpm test
```

Result: **22 tests, all passing.** The original app had 5.

---

## How the work was done

Think of a house with lots of little problems. You don't start hammering right away. You:

1. **Walk around and write down everything that's broken.** That's [`docs/audit.md`](docs/audit.md).
2. **Walk around again and look for stuff you can throw away.** That's [`docs/ponytail-audit.md`](docs/ponytail-audit.md). Less stuff means fewer things to break.
3. **Fix the scariest things first.** A gas leak comes before a squeaky door. Every problem was ranked: Critical, then High, then Medium, then Low.
4. **Fix one thing at a time.** Each fix got its own issue, its own branch, and its own commit.
5. **Leave a test behind for every fix.** A test is like a smoke alarm. If someone brings the problem back later, it goes off.

A few rules guided every choice:

- **Use what's already there.** React and the browser already do a lot. Don't build your own when one is in the box.
- **Throw away before you add.** Deleting a problem is better than building something around it.
- **Smallest fix that's still correct.** Short and right beats long and clever.

---

## What was fixed

### Critical — the gas leaks

**1. A secret password was written in the code.**
The code had a fake API key sitting in plain sight, and it printed that key in the browser console every time the screen updated. It's like writing your house key code on the front door. Nothing used the key, so it was deleted instead of hidden somewhere else. Debug messages that dumped everyone's todos to the console were removed too.

**2. A todo could run sneaky code (XSS).**
If you typed `<img src=x onerror=alert(1)>` as a todo, the app treated it as real code and ran it. Then it saved it, so it ran again every time you opened the app. That's like a note on the fridge that can unlock the doors. The fix: show todo text as plain text. React does this safely by default, so no extra library was needed.

### High

**3. The app saved your list way too often.**
It wrote the whole list to storage on every tiny screen update, even each letter you typed. Imagine re-writing your whole shopping list every time you blink. Now it saves only when the list actually changes.

### Medium

**4. The app could crash if saved data was broken.**
If the saved list got messed up, the app blew up and showed a blank page. It also drew an empty list for a moment before loading your todos. Now it reads saved todos once at the start, and if the data looks wrong, it starts with an empty list instead of crashing.

**5. Two todos could get the same name tag.**
Each todo got an ID from the current time in milliseconds. Add two todos fast enough and they'd get the same ID. Then ticking one might tick the other, like two kids with the same name tag. Now each todo gets a truly unique ID from the browser (`crypto.randomUUID()`). An unused `createdAt` field was also removed.

**6. One mistake broke the whole page.**
If any part of the app had an error, everything went blank. Now there's an **error boundary**, a safety net that catches the fall and shows a friendly "something went wrong" message instead.

**7. Screen readers didn't know what the buttons were.**
People who can't see the screen use tools that read it aloud. Those tools said "checkbox" and "Delete" for every item, with no hint which todo they belonged to. Now they say things like *Complete "Buy milk"* and *Delete "Buy milk"*. The text box got a name too.

**8. Pressing Enter used an old, outdated method.**
The app used `onKeyPress`, which is deprecated. It's being retired. Now the text box and button sit inside a normal `<form>`. Pressing Enter and clicking **Add** do the exact same thing, just like any form on the web.

### Low — the squeaky doors

**9. The app redid the same math over and over.**
It filtered the list and counted completed items twice on every screen update. Now it remembers the answer (`useMemo`) and only recounts when the list or filter changes. While doing this, a small bug turned up: old todos with no "done" flag disappeared from the Active filter. That's fixed and tested.

**10. The filter buttons were copy-pasted three times.**
Same button, written three times, each styled in a different place. Now it's one list of buttons drawn from `['all', 'active', 'completed']`, styled in the CSS file. Screen readers can also tell which filter is on.

**11. The test setup had extra parts.**
An unneeded setup file was deleted, and repeated "add a todo" steps in the tests became one small helper. Bonus surprise: on Node 25, the built-in `localStorage` got in the way of the test one. A one-line config fix in `vite.config.js` sorted it out.

**12. A long list of fonts became one word.**
Nine font names were swapped for `system-ui`, which means "use this computer's normal font". It looks the same and the code is shorter.

---

## Things looked at but left alone

Not every "problem" on the list was a real problem.

| Idea | Why it was skipped |
|---|---|
| "Use IDs instead of the list position as keys" | The code already used IDs. False alarm. |
| Add TypeScript | That's a new tool, not a fix. Out of scope. |
| Move logic into a custom `useTodos` hook, add `useCallback` | The app is about 110 lines. Extra layers would add clutter, not value. |
| Error handling in `deleteTodo` | That code can't fail, so a `try/catch` would never run. |
| "No todos yet" empty message | That's a new feature, and the rules said no new features. |

---

## What changed, file by file

| File | What happened |
|---|---|
| `src/App.jsx` | 23 lines shorter, and every fix above lives here. |
| `src/ErrorBoundary.jsx` | New. The safety net (18 lines). |
| `src/main.jsx` | Wraps the app in the safety net. |
| `src/index.css` | Simpler font, filter button styles. |
| `src/App.test.jsx` | Went from 5 tests to 20. |
| `src/ErrorBoundary.test.jsx` | New, 2 tests. |
| `src/test/setup.js` | Deleted. Not needed. |
| `vite.config.js` | Test setup and the Node 25 fix. |
| `docs/` | The audits and the plan. |

---

## Still on the to-do list (small stuff)

- Remove three leftover marker comments in `src/App.jsx` (`// Issue 7`, `{/* Issue 13 */}`, `// Issue 14`).
- Update [`docs/plan.md`](docs/plan.md). It still says "0 / 12 commits landed" and lists ideas that were dropped.
- Pick one package manager. The repo has both `bun.lock` and `pnpm-lock.yaml`.
