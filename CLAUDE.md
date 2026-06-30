# CLAUDE.md

Project: MATE (digital-circus-website) — Next.js web app, driven entirely through Claude Code.
The user does not edit code by hand. Optimize for correctness on the first pass
and for minimal context usage.

Stack: Next.js 14 · App Router · React 18 · TypeScript · Tailwind CSS · npm

## Commands

Run only when needed. Never start long-lived / watch processes.

- Build:  `npm run build`
- Lint:   `npm run lint`
- Types:  `npx tsc --noEmit`
- Dev server: assume it is already running on :3000. DO NOT start it.

(No test script defined in package.json.)

## Project map

Trust this map. Do not scan the file tree to rediscover structure.

- `src/app/`        — routes, layouts, server components (App Router); dynamic
  routes `projects/[slug]`, `team/[id]`; client subcomponents live alongside
  pages as `*Client.tsx`. Also holds `robots.ts`, `sitemap.ts`, `not-found.tsx`.
- `src/components/`  — shared UI / client components (e.g. SafeImage, ServiceCard)
- `src/data/`        — static content sources (projects, team, services, faq, …)
- `src/types/`       — shared TypeScript types (`index.ts`)
- `public/`          — static assets, images, robots.txt, sitemap.xml
- Config: `next.config.js`, `tailwind.config.ts`, `tsconfig.json`,
  `postcss.config.mjs`, `.eslintrc.json`

There is no `lib/` directory. Docs live at repo root (`README.md`,
`PROJECT_OVERVIEW.md`, `DEPLOYMENT_GUIDE.md`, etc.).

Never read these (no value, large): `node_modules/`, `.next/`, `dist/`,
`coverage/`, `*.lock`, and any generated output.

## Conventions

- TypeScript strict. Avoid `any`.
- Server Components by default; add `"use client"` only when actually required.
  Pattern here: a server `page.tsx` that renders a `*Client.tsx` for interactivity.
- Content/data is centralized in `src/data/*` — edit there, not inline in pages.
- Reuse existing components/utilities before writing new ones.
- Copy the import / styling / naming patterns from neighboring files.
- Styling via Tailwind utility classes; animations via framer-motion;
  icons via react-icons; theming via next-themes.

## How to work (keep context small)

- Be terse. No preamble, no "I'll now…", no recap of unchanged code.
- Make the smallest targeted edit. Never rewrite a whole file for a small change.
- Search narrowly: grep/glob by symbol or path. Don't read whole directories
  or files you don't need for the task.
- Don't echo large file contents back to me — summarize in 1–2 lines.
- After a meaningful change, run lint + types on the touched scope only.
- Stop and confirm before any change spanning more than ~3 files, or touching
  config / build / auth.
- Prefer editing existing files over creating new ones.
