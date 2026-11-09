# Teaching portfolio · Syeda Alishba Fatima

Live site: **https://alishbafatima12.github.io/teaching/**

An interactive teaching portfolio for university mathematics (calculus, analysis, algebra): six Interactive Lab modules,
an AI Verification Lab with 17 "spot the AI's mistake" items, and pages for teaching philosophy, courses,
experience and contact.

Built with Astro (static output), Preact islands, TypeScript, Tailwind CSS 4 and KaTeX. All graphs are
hand-written SVG. No backend, no API keys, no cookies, no tracking.

## Update content

| What | Where |
|---|---|
| Biographical facts (degrees, roles, research, contact) | `src/content/facts.ts`: the only source of factual claims; see `AUDIT.md` |
| Teaching-demonstration video | `src/site.config.ts` → `youtubeId` (the ID after `v=` in a YouTube link). Empty = the section is hidden. Embedded with youtube-nocookie.com. |
| PDFs (CV, teaching portfolio, sample lesson plan) | Put the files in `public/docs/` named exactly `cv.pdf`, `teaching-portfolio.pdf`, `sample-lesson-plan.pdf`. Download links appear automatically only for files that exist. Labels are in `src/site.config.ts`. |
| Lab modules (outcomes, guided questions, teacher notes) | `src/content/modules.ts` |
| Interactives | `src/components/islands/*.tsx`; the math they use is in `src/lib/math/*.ts` |
| AI Verification Lab items and checklist | `src/content/mistakes.ts` (add a matching numerical check in `tests/unit/mistakes.test.ts`; the test suite fails if an item has none) |
| SFU courses and approach notes | `src/content/courses.ts` |
| Colours and fonts | `src/styles/global.css` (one accent colour; light and dark tokens) |

Before adding a PDF, check it does not contain a phone number or other private information.

## Develop

```bash
npm install
npm run dev          # http://localhost:4321/teaching/
npm test             # Vitest: every numeric routine and every AI-lab answer
npm run build
npm run e2e          # Playwright: all pages, interactives, keyboard, themes, mobile
node scripts/screens.mjs http://127.0.0.1:4322/teaching/ screenshots/final   # screenshots (with `npm run preview -- --port 4322` running)
node scripts/lighthouse.mjs                                                  # Lighthouse mobile → reports/lighthouse/
node scripts/og.mjs  # regenerate the Open Graph image
```

Node 22.12+ is required locally; CI uses Node 24.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: unit tests, build, end-to-end tests, then
deployment to GitHub Pages. A failing test stops the deployment.
One-time setting: repository **Settings → Pages → Source: GitHub Actions**.

## Quality gates

- **Mathematical correctness:** `tests/unit/` covers difference quotients, Riemann sums (exact limits), Taylor
  errors and Lagrange bounds, determinants and eigen-decompositions, bisection and Newton (including
  failure cases), percentages, compounding and break-even, plus a numerical check for every AI-lab item.
- **End-to-end:** `tests/e2e/site.spec.ts` at 390 px and 1280 px: no console errors, no horizontal scroll,
  every internal link, each interactive responds to input (including the keyboard), theme toggle, mobile menu.
- **Content audit:** `AUDIT.md`.
- **Lighthouse:** `reports/lighthouse/`.

## Credits

Interactive resources designed by Syeda Alishba Fatima and built with the help of an AI coding assistant;
every result was checked for mathematical accuracy.
