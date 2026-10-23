# Elajgar — Agent Skills & Project Rules

This file tells OpenCode how to work in this project. It maps your requests to the right skills and enforces project-specific conventions. Read once; the AI will follow it automatically.

## 1. Stack

- **Next.js 15** (App Router), **React 19**, TypeScript
- **Prisma ORM** + **MySQL** (`prisma/schema.prisma`)
- **Tailwind CSS v4**, Framer Motion, Zustand, Lucide React
- **Vitest** for tests (`vitest run`)
- **ESLint** (`eslint-config-next`)
- **Sentry** (`@sentry/nextjs`)
- Auth: OTP (SMS), JWT sessions, scrypt password hashing
- Data: users, subscriptions, payments, health logs, pain zones, food logs, audit logs
- Deploy: Liara (Docker), Cloudflare Pages, Firebase

---

## 2. Globally Installed Skills

These are already installed and available in every project. Pick from this list first:

| Skill | Use When |
|-------|----------|
| `security-and-hardening` | Auth, payments, user input, health data, secrets, OWASP Top 10, dependency audit |
| `code-review-and-quality` | Before merging any change; five-axis review |
| `frontend-ui-engineering` | React components, Tailwind layouts, WCAG accessibility, design systems |
| `frontend-design-anthopic` | Visual design direction, typography, aesthetic choices that don't look templated |
| `nextjs-data-fetching` | Reading data in Next.js App Router (Server Actions, `"use server"` for SELECT) |
| `nextjs-forms` | Forms with inputs that persist to backend (`<input>`, save buttons, dirty state) |
| `nextjs-usestate` | Avoiding `useState` abuse in App Router; use Server Components where possible |
| `no-await-import` | No `await import()` in production code |
| `find-docs` | Up-to-date docs for Next.js, Prisma, Tailwind, React, etc. |
| `graphify` | Codebase questions — use `graphify query` / `path` / `explain` instead of grepping |
| `ponytail` | Simple mechanical tasks (rename, delete, typo, config tweak) — smallest change that works |
| `screenshots` | Browser screenshot capture for QA, visual debugging, before/after UI comparison |
| `api-and-interface-design` | Designing APIs, module boundaries, or public interfaces (REST, GraphQL, type contracts) |
| `deprecation-and-migration` | Removing old systems, migrating DB schema without downtime (expand/contract), sunsetting code |
| `source-driven-development` | Ground every framework/library decision in official documentation before implementing |
| `spec-driven-development` | New features with no spec; break into capability map |
| `test-driven-development` | Red-green-refactor; write tests before/with implementation |
| `debugging-and-error-recovery` | Tests fail, builds break, behavior doesn't match expectations |
| `planning-and-task-breakdown` | Large task feels overwhelming; split into ordered tasks |
| `performance-optimization` | Core Web Vitals, N+1 queries, bundle size, slow pages |
| `observability-and-instrumentation` | Logging, metrics, tracing, production debugging |
| `context-engineering` | Session context setup, rules files, when output quality degrades |
| `browser-testing-with-devtools` | Test in real browsers via Chrome DevTools MCP (DOM, console, network, performance) |
| `idea-refine` | Refine vague ideas into sharp, actionable concepts before committing to a plan |
| `mempalace` | Memory/context persistence across sessions |
| `web-design-guidelines` | Review UI code for Web Interface Guidelines compliance |
| `using-agent-skills` | Discover and invoke agent skills |
| `ui-ux-pro-max` | UI/UX design intelligence for web, mobile, desktop |
| `accessibility-audit` | Full web accessibility audit against WCAG 2.2 |
| `accessibility-diff` | Diff accessibility violations against a baseline |
| `accessibility-fix` | Repair accessibility violations against WCAG 2.2 |
| `accessibility-inspect` | Manual accessibility checks (keyboard, screen reader, reflow) |
| `accessibility-scan` | Automated accessibility rule engine scan |
| `prisma-cli` | Prisma ORM CLI commands reference |
| `prisma-client-api` | Prisma Client API reference |
| `prisma-compute` | Prisma Compute deployment guide |
| `prisma-database-setup` | Prisma database provider setup |
| `prisma-driver-adapter-implementation` | Prisma ORM 7 SQL driver adapter implementation |
| `prisma-mongodb-upgrade` | Prisma MongoDB upgrade guide |
| `prisma-postgres` | Prisma Postgres setup and operations |
| `prisma-postgres-setup` | Set up Prisma Postgres and connect to project |
| `prisma-upgrade-v7` | Prisma ORM v6 to v7 migration guide |

## 3. Intent → Skill Mapping

Map your request to a skill from Section 2 before implementing:

| Your Request | Skill |
|--------------|-------|
| "Review this code / PR / diff" | `code-review-and-quality` |
| "Build a new feature / page / API route" | `spec-driven-development` → `incremental-implementation` → `test-driven-development` |
| "Fix a bug / build is broken / tests fail" | `debugging-and-error-recovery` |
| "Add auth / payment / user input handling" | `security-and-hardening` |
| "Create a React component / UI layout" | `frontend-ui-engineering` + `nextjs-usestate` + `nextjs-forms` |
| "Visual design / typography / aesthetic direction" | `frontend-design-anthopic` |
| "Fetch data in Next.js" | `nextjs-data-fetching` |
| "Write tests for a function" | `test-driven-development` |
| "Refactor / simplify existing code" | `code-review-and-quality` (review first) |
| "Design an API or module boundary" | `api-and-interface-design` |
| "How does X connect to Y in the codebase?" | `graphify query` / `graphify path` |
| "Rename / delete / typo / config tweak" | `ponytail` (lite) |
| "Look up library docs / API reference" | `find-docs` |
| "Plan a large task into steps" | `planning-and-task-breakdown` |
| "Make it faster / fix slow query" | `performance-optimization` |
| "Add logging / tracing / monitoring" | `observability-and-instrumentation` |
| "Migrate DB schema / remove old code" | `deprecation-and-migration` |
| "Verify approach against official docs" | `source-driven-development` |
| "Capture a screenshot for QA" | `screenshots` |
| "Test in a real browser" | `browser-testing-with-devtools` |
| "Refine a vague idea into a plan" | `idea-refine` |
| "Review UI / check accessibility / audit design" | `web-design-guidelines` |
| "Accessibility audit / scan / fix / inspect / diff" | `accessibility-*` skills |
| "Prisma schema / migration / CLI commands" | `prisma-*` skills |
| "Discover which skill to use" | `find-skills` / `using-agent-skills` |
| "UI/UX design intelligence" | `ui-ux-pro-max` |
| "Memory/context across sessions" | `mempalace` |

---

## 4. Find Skills (Only If Nothing Matches Above)

If your request doesn't match any skill in Sections 2–3, use `find-skills` to discover and install a **new** skill from the ecosystem:

| Skill | What it does |
|-------|-------------|
| `find-skills` | Discovers and installs agent skills from the open skills ecosystem. Use when you ask "how do I do X", "find a skill for X", or want to extend capabilities. Runs `npx skills find <query>` and `npx skills add <package>` to locate and install skills not yet installed. |

**Note:** `find-skills` is for finding skills **not already installed**. It does not help you choose between the skills listed in Sections 2–3 — use the Intent → Skill Mapping table for that.

If a relevant skill isn't installed yet, use `find-skills` to locate it, then install it globally with `npx skills add <owner/repo@skill> -g -y`.

---

## 5. Project-Specific Rules

### Next.js App Router
- Prefer **Server Components** by default. Use `"use client"` only when you need interactivity (event handlers, browser APIs, state).
- Data fetching: use Server Actions (`"use server"`) for SELECT/read operations. Pair with `nextjs-data-fetching`.
- Forms: route through `nextjs-forms` — don't hand-roll `useState` for field values unless the skill says so.
- No `await import()` in production (`no-await-import`).

### Prisma / MySQL
- Always check `prisma/schema.prisma` before adding fields or models. Your schema has relations, enums, and JSON fields — don't duplicate them.
- One DailyLog per user per date (`@@unique([userId, date])`).
- Passwords live in separate `HashedPassword` table — never return password hash in user queries.
- Payments use a mock provider until a real gateway is wired — don't treat `provider = "mock"` as production-ready.

### Auth & Security Boundaries (Critical)
- Auth routes live in `app/api/auth/` (OTP, clear-password). Treat as security-sensitive.
- Admin routes live in `app/api/admin/` — guard with role checks (`Role.ADMIN`).
- Health data (pain zones, daily logs, questionnaires) is PII — never log it to console or expose in error messages.
- Use `security-and-hardening` before touching auth, payment, or user-input code.
- Secrets: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SENTRY_DSN` live in `.env` — never commit real values.

### Testing
- Tests are under `app/api/**/*.test.ts` and `lib/*.test.ts`. Run `npm test` (vitest) before and after changes.
- New logic needs a test or assert-based self-check (per `test-driven-development`).
- Trivial mechanical edits (rename, delete) need no test.

### Execution Model
For every request:
1. Check Sections 2–3 to see if an installed skill applies.
2. If no installed skill matches, use `find-skills` (Section 4) to discover a new one.
3. Load the skill via the `skill` tool.
4. Follow the skill workflow strictly; do not partially apply it.
5. Only proceed to implementation after required steps (spec, plan, test) are complete.
6. Before merging, run `code-review-and-quality`.
7. After modifying code, run `graphify update .` to keep the knowledge graph current.

### What to Skip
- **Don't** use expensive models for mechanical renames/deletes — use `ponytail` lite + `graphify` to find callers.
- **Don't** let cheap models touch auth, payments, or health data unsupervised — use `security-and-hardening` and review.
- **Don't** add `useState` for derived values, timers, or SSR guards — use `nextjs-usestate`.
- **Don't** add dependencies for a few lines of code — use stdlib or platform features first.
