# Graph Report - Elajgar  (2026-10-24)

## Corpus Check
- 257 files · ~329,555 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 65 file(s) not represented in the graph (top: .csv 37, (none) 23, .log 2)

## Summary
- 2191 nodes · 4366 edges · 118 communities (99 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2eed523b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- next
- content/page.tsx
- session.ts
- react
- design_system.py
- user/route.ts
- promote-admin.mjs
- Hardening Controls
- package.json
- login/page.tsx
- validate_data.py
- DesignSystemGenerator
- toPersianDigits
- search_stack
- dependencies
- _select_palette_for_mode
- Next.js 16 Data Fetching — Server Components, not Server Actions in useEffect
- Anti-pattern catalog — red ❌ → green ✅
- Test-Driven Development
- Code Review and Quality
- Context Engineering
- _domain_keywords
- Optimization Patterns
- toPersianDigits
- search
- test_data_contracts.py
- PainHeatmap3D.tsx
- API and Interface Design
- BM25
- store.ts
- test_core_data_quality.py
- Browser Testing with DevTools
- Frontend UI Engineering
- Deprecation and Migration
- Next.js Forms — TanStack Form + Zod + shadcn `Field`
- Claude Automation Recommender
- seed.ts
- Debugging and Error Recovery
- format_ascii_box
- db
- compilerOptions
- vitest
- scripts
- Planning and Task Breakdown
- test_core.py
- UI/UX Pro Max - Design Intelligence
- ReOrder: Keep Your Regulars Ordering Direct
- Idea Refine
- CorrectionalCalendar.tsx
- Process
- _normalize
- manifest.json
- CatalogRefreshTest
- @sentry/nextjs
- Using Agent Skills
- Find Skills
- Spec-Driven Development
- Setup protocol
- MIDDLE ZONE — Execution Logic, Tool Routing, Diagnostics
- 5. Project-Specific Rules
- Source-Driven Development
- Pre-Delivery Checklist (canonical — the only one)
- Quick Reference
- AccessLint accessibility methodology
- Putting elajgar.ir online with Liara
- accessibility-inspect/SKILL.md
- Documentation Lookup
- Refinement & Evaluation Criteria
- screenshots
- prisma-retry.test.ts
- test_skill_script_paths.py
- Step-by-Step Guide to Deploying the Elajgar Project on cPanel
- Elajgar (علاج‌گر)
- app/layout.tsx
- test_catalog_summary_line_endings.py
- Ideation Frameworks Reference
- TestMetricMath
- settings/route.test.ts
- How to Upload and Run Elajgar on Your Webhost
- TestThresholdGate
- Frontend Design
- No `await import()` — static imports only
- accessibility-fix/SKILL.md
- _row_identities
- plans/route.test.ts
- accessibility-audit/SKILL.md
- accessibility-diff/SKILL.md
- accessibility-scan/SKILL.md
- TestStackFlagWithDesignSystem
- Ponytail
- Web Interface Guidelines
- server.js
- clear-password/route.test.ts
- 5. Database Setup
- postcss.config.mjs
- sw.js
- idea-refine.sh
- palette.md
- liara_pre_start.sh
- page.test.ts
- settings.ts
- [id]/page.tsx
- TestDiagnosticsContracts
- settings/page.tsx
- healthScore.ts
- _search_csv_detailed
- checkout.test.ts
- set-password/route.test.ts
- stats.ts
- TestTextLayoutDataContracts
- videos/route.test.ts
- content-icons.ts
- user/route.test.ts
- TestFixtureValidation

## God Nodes (most connected - your core abstractions)
1. `next` - 71 edges
2. `requireAdmin()` - 69 edges
3. `adminErrorResponse()` - 68 edges
4. `jsonError()` - 55 edges
5. `toPersianDigits()` - 52 edges
6. `search()` - 44 edges
7. `prisma` - 43 edges
8. `writeAudit()` - 42 edges
9. `react` - 42 edges
10. `DesignSystemGenerator` - 38 edges

## Surprising Connections (you probably didn't know these)
- `4. Run version-correct initialization` --references--> `search()`  [INFERRED]
  .claude/skills/mempalace/SKILL.md → .agents/skills/ui-ux-pro-max/scripts/core.py
- `Seed the food database (optional but recommended)` --references--> `Food`  [INFERRED]
  howto.md → app/panel-7x9k4m/foods/page.tsx
- `GET()` --calls--> `getSettings()`  [EXTRACTED]
  app/api/admin/settings/route.ts → lib/settings.ts
- `PATCH()` --calls--> `getSettings()`  [EXTRACTED]
  app/api/admin/settings/route.ts → lib/settings.ts
- `PATCH()` --calls--> `validateSetting()`  [EXTRACTED]
  app/api/admin/settings/route.ts → lib/settings.ts

## Import Cycles
- None detected.

## Communities (118 total, 19 thin omitted)

### Community 0 - "next"
Cohesion: 0.05
Nodes (117): Context, DELETE(), GET(), PATCH(), GET(), POST(), GET(), Context (+109 more)

### Community 1 - "content/page.tsx"
Cohesion: 0.09
Nodes (69): ACTION_LABELS, ACTION_TONES, AdminAuditPage(), AuditEntry, ENTITIES, ENTITY_LABELS, formatDate(), AdminContentPage() (+61 more)

### Community 2 - "session.ts"
Cohesion: 0.06
Nodes (38): POST(), cookieSet, prismaMock, sign(), signMock, signPayloads, userWithPassword, verifyPasswordMock (+30 more)

### Community 3 - "react"
Cohesion: 0.10
Nodes (37): EducationPage(), Plan, PremiumVideo, SubscriptionState, DashboardLayout(), HubCard(), Landing(), Step4Terms() (+29 more)

### Community 4 - "design_system.py"
Cohesion: 0.06
Nodes (11): _detect_page_type(), format_markdown(), format_page_override_md(), generate_design_system(), _generate_intelligent_overrides(), persist_design_system(), safe_slug(), _write_persisted_file() (+3 more)

### Community 5 - "user/route.ts"
Cohesion: 0.09
Nodes (29): ACTIVITY_LEVEL_MAP, ACTIVITY_LEVEL_TO_CLIENT, booleanToClient(), buildDailyLogs(), buildProfileUpdate(), buildQuestionnaire(), ClientDailyLog, ClientFood (+21 more)

### Community 6 - "promote-admin.mjs"
Cohesion: 0.05
Nodes (28): __dirname, __filename, env, failed, results, root, publicDir, root (+20 more)

### Community 7 - "Hardening Controls"
Cohesion: 0.05
Nodes (42): Broken Access Control, Broken Authentication, Cross-Site Scripting (XSS), Data Classification, Dependency Audit Triage, Destructive Operations on Derived Paths, File Upload Safety, Hardening Patterns (+34 more)

### Community 8 - "package.json"
Cohesion: 0.06
Nodes (43): devDependencies, @cloudflare/next-on-pages@^1.13.16, dotenv@^17.4.2, eslint@^9.39.1, eslint-config-next@16.0.8, firebase-tools@^15.0.0, prisma@^5.22.0, tailwindcss@4.1.11 (+35 more)

### Community 9 - "login/page.tsx"
Cohesion: 0.49
Nodes (5): LoginPage(), destinationFor(), safeNextPath(), isWizardComplete(), WIZARD_LAST_STEP

### Community 10 - "validate_data.py"
Cohesion: 0.09
Nodes (34): TestGeneratedCatalogContract, _catalog_date(), _check_app_interface_contract(), _check_catalog_contract(), _check_catalog_summary(), _check_color_contract(), _check_core_data_contract(), _check_file() (+26 more)

### Community 11 - "DesignSystemGenerator"
Cohesion: 0.08
Nodes (6): DesignSystemGenerator, _resolve_dial(), TestReasoningMatch, read_rows(), TestReasoningContract, TestEndToEndCoherence

### Community 12 - "toPersianDigits"
Cohesion: 0.12
Nodes (29): DashboardIndex(), HydrationChart, MEAL_PRESETS, ProgressReport, LoginForm(), LoginPage(), NutritionPage(), HydrationChart() (+21 more)

### Community 13 - "search_stack"
Cohesion: 0.09
Nodes (9): _exact_stack_identifier(), _project_row(), search_stack(), _valid_max_results(), _rows(), TestNativeDesktopStackFreshness, TestTextLayoutRetrieval, _rows() (+1 more)

### Community 14 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, autoprefixer@^10.4.21, class-variance-authority@^0.7.1, clsx@^2.1.1, d3@^7.9.0, @fontsource/vazirmatn@^5.3.0, @hookform/resolvers@^5.2.1, jose@^6.2.10 (+26 more)

### Community 15 - "_select_palette_for_mode"
Cohesion: 0.07
Nodes (15): _button_outline_text_color(), _contrast_ratio(), _derive_dark_palette(), _filter_anti_patterns_for_mode(), format_master_md(), _palette_is_dark(), _query_wants_dark(), _relative_luminance() (+7 more)

### Community 16 - "Next.js 16 Data Fetching — Server Components, not Server Actions in useEffect"
Cohesion: 0.06
Nodes (31): 1. Async Server Component — the default, 1. Reading data via a Server Action in `useEffect`, 2. Filter / tab / range state in `useState`, refetched via Server Action, 2. Stream a promise to a Client Component with `use()` + `<Suspense>`, 3. Manually re-running a read after a mutation, 3. Server Action — only for mutations, invoked via `<form>` or event handler after user intent, 4. Route Handler + SWR / React Query — last resort, narrow scope, 4. `"use server"` file containing read-only `getX` / `listX` / `findX` (+23 more)

### Community 17 - "Anti-pattern catalog — red ❌ → green ✅"
Cohesion: 0.06
Nodes (31): 10. Multiple `useState`s that always change together, 11. Page or layout converted to `"use client"` to host one piece of state, 12. "Has mounted" / "is on the client" SSR guards in `useState`, 13. `useState` for open/closed state the design system already owns, 1. Filter / tab / sort / search / pagination state in `useState`, 1a. Search-as-you-type bound to URL state, 2. Server data mirrored into `useState`, 3. Form field values in `useState` (+23 more)

### Community 18 - "Test-Driven Development"
Cohesion: 0.07
Nodes (29): Browser Testing with DevTools, Common Rationalizations, DAMP Over DRY in Tests, Decision Guide, Discover the Stack First, Name Tests Descriptively, One Assertion Per Concept, Overview (+21 more)

### Community 19 - "Code Review and Quality"
Cohesion: 0.07
Nodes (29): 1. Correctness, 2. Readability & Simplicity, 3. Architecture, 4. Security, 5. Performance, Change Descriptions, Change Sizing, Code Review and Quality (+21 more)

### Community 20 - "Context Engineering"
Cohesion: 0.07
Nodes (28): Anti-Patterns, Common Rationalizations, Compress before dropping, Confusion Management, Context Budget Management, Context Engineering, Context Packing Strategies, Level 1: Rules Files (+20 more)

### Community 21 - "_domain_keywords"
Cohesion: 0.22
Nodes (6): _domain_keywords(), _file_signature(), _load_csv(), _load_csv_snapshot(), _load_product_keywords(), _load_rows_or_empty()

### Community 22 - "Optimization Patterns"
Cohesion: 0.07
Nodes (25): Connection Pool Exhaustion, Large Bundle Size, Missing Caching (Backend), Missing Image Optimization (Frontend), N+1 Queries (Backend), Optimization Patterns, Queries That Ignore Their Index, Unbounded Data Fetching (+17 more)

### Community 23 - "toPersianDigits"
Cohesion: 0.14
Nodes (17): CheckoutPage(), Plan, CATEGORY_LABELS, Gym, GymCard(), GymImage(), GymsPage(), EditProfileForm() (+9 more)

### Community 24 - "search"
Cohesion: 0.12
Nodes (4): search(), _style_search_destination(), TestSearchDomains, TestStyleTaxonomy

### Community 25 - "test_data_contracts.py"
Cohesion: 0.10
Nodes (8): apply_decision_rules(), _object_without_duplicates(), parse_decision_rules(), _validate_action(), split_values(), style_identities(), TestLandingAndStackContract, TestStyleIdentityContract

### Community 26 - "PainHeatmap3D.tsx"
Cohesion: 0.12
Nodes (22): buildPainData(), Canvas, getHeatColor(), Marker(), PainHeatmap3D(), PainRegionDatum, PlaceholderHumanoid(), PositionedRegion (+14 more)

### Community 27 - "API and Interface Design"
Cohesion: 0.08
Nodes (24): 1. Contract First, 2. Consistent Error Semantics, 3. Validate at Boundaries, 4. Prefer Addition Over Modification, 5. Predictable Naming, 6. Honouring an Idempotency Key, API and Interface Design, Common Rationalizations (+16 more)

### Community 28 - "BM25"
Cohesion: 0.16
Nodes (5): BM25, _get_bm25(), _suggest_identities(), TestBm25CoreBehavior, TestTokenizer

### Community 29 - "store.ts"
Cohesion: 0.24
Nodes (8): ACTIVITY_MULTIPLIERS, DEFAULT_NUTRITION_CONFIG, goalBucket, MacroSplit, NutritionGoalKey, NutritionProfile, NutritionTargets, profile

### Community 30 - "test_core_data_quality.py"
Cohesion: 0.16
Nodes (10): read_rows(), TestAccessibilityGuidance, TestChartsTypographyAndIcons, TestCurrentReactGuidance, TestSemanticColors, _check_chart_contract(), _check_typography_contract(), _configured_font_names() (+2 more)

### Community 31 - "Browser Testing with DevTools"
Cohesion: 0.08
Nodes (24): Accessibility Verification with DevTools, Available Tools, Browser Testing with DevTools, Clean Console Standard, Common Rationalizations, Console Analysis Patterns, Content Boundary Markers, For Network Issues (+16 more)

### Community 32 - "Frontend UI Engineering"
Cohesion: 0.08
Nodes (24): Accessibility (WCAG 2.1 AA), ARIA Labels, Avoid the AI Aesthetic, Color, Common Rationalizations, Component Architecture, Component Patterns, Design System Adherence (+16 more)

### Community 33 - "Deprecation and Migration"
Cohesion: 0.08
Nodes (23): Adapter Pattern, Code Is a Liability, Common Rationalizations, Compulsory vs Advisory Deprecation, Core Principles, Database Schema Migrations (Expand/Contract), Deprecation and Migration, Deprecation Planning Starts at Design Time (+15 more)

### Community 34 - "Next.js Forms — TanStack Form + Zod + shadcn `Field`"
Cohesion: 0.08
Nodes (23): Audit, Companion skill — strongly recommended, Create form pattern, Edit form pattern (manual save, dirty-gated), Error handling, Escape hatch — `<form.Field>` directly, `FormActions`, i18n (+15 more)

### Community 35 - "Claude Automation Recommender"
Cohesion: 0.09
Nodes (22): A. MCP Server Recommendations, Automation Types Overview, B. Skills Recommendations, C. Hooks Recommendations, Claude Automation Recommender, Configuration Tips, D. Subagent Recommendations, Decision Framework (+14 more)

### Community 36 - "seed.ts"
Cohesion: 0.13
Nodes (21): ARTICLE_CATEGORIES, EXERCISE_CATEGORIES, SeedArticle, seedArticles, SeedExercise, seedExercises, adminPhoneNumbers(), defaultSettings (+13 more)

### Community 37 - "Debugging and Error Recovery"
Cohesion: 0.09
Nodes (21): Build Failure Triage, Common Rationalizations, Debugging and Error Recovery, Error-Specific Patterns, Instrumentation Guidelines, Overview, Red Flags, Runtime Error Triage (+13 more)

### Community 38 - "format_ascii_box"
Cohesion: 0.14
Nodes (8): ansi_ljust(), format_ascii_box(), add_wrapped(), wrap_text(), hex_to_ansi(), _mode_support_labels(), section_header(), TestLightResultOutputCoherence

### Community 39 - "db"
Cohesion: 0.09
Nodes (21): command, container_name, environment, healthcheck, image, ports, restart, volumes (+13 more)

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (21): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+13 more)

### Community 41 - "vitest"
Cohesion: 0.15
Nodes (8): cookieStore, prismaMock, verifyTokenMock, cookieStore, prismaMock, verifyTokenMock, prismaMock, vitest

### Community 42 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, admin:clear-password, admin:delete, admin:promote, admin:set-password, build, clean, db:doctor (+12 more)

### Community 43 - "Planning and Task Breakdown"
Cohesion: 0.11
Nodes (18): Common Rationalizations, Output Files, Overview, Parallelization Opportunities, Plan Document Template, Planning and Task Breakdown, Red Flags, See Also (+10 more)

### Community 45 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.11
Nodes (17): Before Delivering App UI, Example Workflow, If a search returns 0 results, Output Formats, Query Contract, Rule Categories by Priority, Running the search tool, Step 1: Analyze User Requirements (+9 more)

### Community 46 - "ReOrder: Keep Your Regulars Ordering Direct"
Cohesion: 0.11
Nodes (17): Example 1: Vague Early-Stage Concept (Full 3-Phase Session), Example 2: Feature Idea Within an Existing Product (Codebase-Aware), Example 3: Process/Workflow Idea (Non-Product), Ideation Session Examples, Key Assumptions to Validate, MVP Scope, Not Doing (and Why), Open Questions (+9 more)

### Community 47 - "Idea Refine"
Cohesion: 0.11
Nodes (17): Anti-patterns to Avoid, Common Rationalizations, Detailed Instructions, How It Works, Idea Refine, Output, Overview, Phase 1: Understand & Expand (Divergent) (+9 more)

### Community 48 - "CorrectionalCalendar.tsx"
Cohesion: 0.17
Nodes (16): addMonths(), CorrectionalCalendar(), daysInPersianMonth(), DEFAULT_SESSION_TEMPLATES, displayDayFormatter, displayYearFormatter, firstDayOfPersianMonth(), PERSIAN_MONTHS (+8 more)

### Community 49 - "Process"
Cohesion: 0.12
Nodes (15): 1. Define "working" before instrumenting, 2. Pick the right signal for each question, 3. Structured logging, 4. Metrics, 5. Distributed tracing, 6. Alerting, 7. Verify the telemetry itself, Common Rationalizations (+7 more)

### Community 50 - "_normalize"
Cohesion: 0.17
Nodes (7): _contains_phrase(), _exact_match_diagnostic(), _legacy_successor_guidance(), _normalize(), _rewrite_query_for_domain(), _stack_query_requests_legacy(), _stack_row_filter()

### Community 51 - "manifest.json"
Cohesion: 0.12
Nodes (15): background_color, categories, description, dir, display, icons, id, lang (+7 more)

### Community 53 - "@sentry/nextjs"
Cohesion: 0.18
Nodes (7): Error(), onRouterTransitionStart, onRequestError, register(), nextConfig, @sentry/nextjs@^10.72.0, @sentry/nextjs

### Community 54 - "Using Agent Skills"
Cohesion: 0.13
Nodes (14): 1. Surface Assumptions, 2. Manage Confusion Actively, 3. Push Back When Warranted, 4. Enforce Simplicity, 5. Maintain Scope Discipline, 6. Verify, Don't Assume, Core Operating Behaviors, Failure Modes to Avoid (+6 more)

### Community 55 - "Find Skills"
Cohesion: 0.14
Nodes (13): Common Skill Categories, Find Skills, How to Help Users Find Skills, Step 1: Understand What They Need, Step 2: Check the Leaderboard First, Step 3: Search for Skills, Step 4: Verify Quality Before Recommending, Step 5: Present Options to the User (+5 more)

### Community 56 - "Spec-Driven Development"
Cohesion: 0.14
Nodes (13): Common Rationalizations, Keeping the Spec Alive, Overview, Phase 0: Scope Check, Phase 1: Specify, Phase 2: Plan, Phase 3: Tasks, Phase 4: Implement (+5 more)

### Community 57 - "Setup protocol"
Cohesion: 0.14
Nodes (13): 1. Inspect before changing anything, 2. Install the CLI when necessary, 3. Choose the topology with the user, 4. Run version-correct initialization, 5. Configure MCP, 6. Configure shared-brain identity and coordination, 7. Report readiness, Canonical references (+5 more)

### Community 58 - "MIDDLE ZONE — Execution Logic, Tool Routing, Diagnostics"
Cohesion: 0.14
Nodes (13): Agentic Output Warning, Credential Safety, Diagnostic Checklist, Input Sanitization -- Pasted Prompts, Intent Extraction, Memory Block, MIDDLE ZONE — Execution Logic, Tool Routing, Diagnostics, Model Recency Gate (+5 more)

### Community 59 - "5. Project-Specific Rules"
Cohesion: 0.15
Nodes (12): 1. Stack, 2. Globally Installed Skills, 3. Intent → Skill Mapping, 4. Find Skills (Only If Nothing Matches Above), 5. Project-Specific Rules, Auth & Security Boundaries (Critical), Elajgar — Agent Skills & Project Rules, Execution Model (+4 more)

### Community 60 - "Source-Driven Development"
Cohesion: 0.15
Nodes (12): Common Rationalizations, Overview, Red Flags, Retrieval Safety: Treat Fetched Content as Data, Source-Driven Development, Step 1: Detect Stack and Versions, Step 2: Fetch Official Documentation, Step 3: Implement Following Documented Patterns (+4 more)

### Community 61 - "Pre-Delivery Checklist (canonical — the only one)"
Cohesion: 0.15
Nodes (12): Accessibility, Common Rules for Professional UI + Pre-Delivery Checklist, Icons & Visual Elements, Interaction, Interaction (App), Layout, Layout & Spacing, Light/Dark Mode (+4 more)

### Community 62 - "Quick Reference"
Cohesion: 0.15
Nodes (12): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+4 more)

### Community 63 - "AccessLint accessibility methodology"
Cohesion: 0.15
Nodes (12): AccessLint accessibility methodology, Conformance: three states, Evidence basis — what you can support, Grounding and honesty, High-risk patterns, Severity — user impact (separate from evidence basis), The boundary: no proxy for human experience, The evidence budget: uncertainty must be cheaper than certainty (+4 more)

### Community 64 - "Putting elajgar.ir online with Liara"
Cohesion: 0.15
Nodes (13): 1. The database, 2. The app, 3. The environment variables, 4. Upload the app, 5. What happens on the first start, 6. The domain, 7. Check it, Before the real launch (+5 more)

### Community 65 - "accessibility-inspect/SKILL.md"
Cohesion: 0.17
Nodes (10): Inspect checkpoints — per-check procedure and default grades, Driving efficiently, Evidence budget — cap spend by grade, Grading, High-risk patterns, Notes, Prerequisite: a browser to drive, Report (+2 more)

### Community 66 - "Documentation Lookup"
Cohesion: 0.17
Nodes (11): Authentication, Common Mistakes, Documentation Lookup, Error Handling, Result fields, Selection process, Step 1: Resolve a Library, Step 2: Query Documentation (+3 more)

### Community 67 - "Refinement & Evaluation Criteria"
Cohesion: 0.17
Nodes (11): 1. User Value, 2. Feasibility, 3. Differentiation, Assumption Audit, Core Evaluation Dimensions, Decision Framework, Might Be True (Nice to Have), Must Be True (Dealbreakers) (+3 more)

### Community 68 - "screenshots"
Cohesion: 0.17
Nodes (11): Common mistakes, Decision: qa or debug?, Filename format, Folder layout, Overview, Quick recipe (bash), Red flags — STOP, Repo preconditions (verify once per session) (+3 more)

### Community 69 - "prisma-retry.test.ts"
Cohesion: 0.33
Nodes (5): resilient(), createResilientOperation(), isTransientConnectionError(), resilientPromise(), TRANSIENT_CONNECTION_ERRORS

### Community 70 - "test_skill_script_paths.py"
Cohesion: 0.38
Nodes (3): resolve(), shipped_invocations(), SkillScriptPathsTest

### Community 71 - "Step-by-Step Guide to Deploying the Elajgar Project on cPanel"
Cohesion: 0.18
Nodes (11): Step 1: Confirm the Database Provider, Step 2: Prepare the cPanel Server for Next.js, Step 3: Build the Project on Your Computer, Step 4: Zip the Files for Upload, Step 5: Create a Database in cPanel, Step 6: Setup Node.js App in cPanel, Step 7: Upload the Files in cPanel, Step 8: Run Final Commands in cPanel Terminal (+3 more)

### Community 72 - "Elajgar (علاج‌گر)"
Cohesion: 0.18
Nodes (11): Before you go live, Check that everything is wired up, Deploying, Elajgar (علاج‌گر), Run Locally, Signing in, Tests, The admin panel (+3 more)

### Community 73 - "app/layout.tsx"
Cohesion: 0.29
Nodes (6): metadata, RootLayout(), viewport, ServiceWorkerRegistration(), vazirmatnArabic, vazirmatnLatin

### Community 75 - "Ideation Frameworks Reference"
Cohesion: 0.22
Nodes (8): Analogous Inspiration, Constraint-Based Ideation, First Principles Thinking, How Might We (HMW), Ideation Frameworks Reference, Jobs to Be Done (JTBD), Pre-mortem, SCAMPER

### Community 77 - "settings/route.test.ts"
Cohesion: 0.25
Nodes (6): cookieStore, prismaMock, VALID_MACROS, VALID_NUTRITION, VALID_WEIGHTS, verifyTokenMock

### Community 78 - "How to Upload and Run Elajgar on Your Webhost"
Cohesion: 0.25
Nodes (8): 1. What You Need Before Starting, 2. Build the Project on Your Computer, 3. Files to Upload, 4. Environment Variables, 6. Start the Application, 7. Updating Later, How to Upload and Run Elajgar on Your Webhost, Troubleshooting

### Community 80 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground your designs in the subject matter, More on writing in design, Process: plan, review against the brief, build, critique, Restraint and self-critique

### Community 81 - "No `await import()` — static imports only"
Cohesion: 0.29
Nodes (6): No `await import()` — static imports only, Review checklist, Test-only exception, The Rule, What to do when you see one, Why

### Community 82 - "accessibility-fix/SKILL.md"
Cohesion: 0.33
Nodes (5): Input, Output, Picking a flow (for baseline and verify), Steps, When to stop

### Community 83 - "_row_identities"
Cohesion: 0.33
Nodes (3): _exact_row_identity(), _row_identities(), _style_identity()

### Community 84 - "plans/route.test.ts"
Cohesion: 0.33
Nodes (4): cookieStore, prismaMock, VALID_BODY, verifyTokenMock

### Community 85 - "accessibility-audit/SKILL.md"
Cohesion: 0.40
Nodes (4): Grading, Notes, Report format, WCAG-EM steps

### Community 86 - "accessibility-diff/SKILL.md"
Cohesion: 0.40
Nodes (4): 1. Audit, 2. Report, 3. Tear down, Notes

### Community 87 - "accessibility-scan/SKILL.md"
Cohesion: 0.40
Nodes (4): 1. Audit, 2. Report, 3. Tear down, Notes

### Community 89 - "Ponytail"
Cohesion: 0.40
Nodes (4): Before you write, Levels, Ponytail, The smallest complete change

### Community 90 - "Web Interface Guidelines"
Cohesion: 0.40
Nodes (4): Guidelines Source, How It Works, Usage, Web Interface Guidelines

### Community 92 - "clear-password/route.test.ts"
Cohesion: 0.33
Nodes (4): issueSessionMock, prismaMock, sessionUserId, verifyPassword

### Community 93 - "5. Database Setup"
Cohesion: 0.50
Nodes (4): Food, 5. Database Setup, Create an admin account, Seed the food database (optional but recommended)

### Community 103 - "page.test.ts"
Cohesion: 0.40
Nodes (3): prismaMock, redirectMock, sessionUserId

### Community 104 - "settings.ts"
Cohesion: 0.25
Nodes (14): GET(), DEFAULT_PROGRAM_STEPS, DEFAULT_SETTINGS, getHealthScoreTargets(), getHealthScoreWeights(), getNutritionConfig(), getProgramSteps(), getSettings() (+6 more)

### Community 105 - "[id]/page.tsx"
Cohesion: 0.19
Nodes (12): AdminOverviewPage(), PainHeatmap3D, StatsResponse, ACTIVITY_LABELS, AdminUserDetailPage(), formatDate(), GENDER_LABELS, Row() (+4 more)

### Community 107 - "settings/page.tsx"
Cohesion: 0.22
Nodes (10): AdminSettingsPage(), isHundred(), MACRO_FIELD_LABELS, MACRO_GROUP_LABELS, parseNonNegative(), parseNumber(), SettingsResponse, WEIGHT_HINTS (+2 more)

### Community 108 - "healthScore.ts"
Cohesion: 0.22
Nodes (10): DEFAULT_HEALTH_TARGETS, DEFAULT_HEALTH_WEIGHTS, HealthScoreInput, HealthScoreOptions, HealthScoreTargets, HealthScoreWeights, optimal, NutritionConfig (+2 more)

### Community 109 - "_search_csv_detailed"
Cohesion: 0.18
Nodes (5): _passes_threshold(), _query_coverage(), _search_csv(), _search_csv_detailed(), _suggest_terms()

### Community 110 - "checkout.test.ts"
Cohesion: 0.22
Nodes (6): activateSubscriptionMock, CheckoutError, getActiveSubscriptionMock, getSessionUserIdMock, PLAN, prismaMock

### Community 111 - "set-password/route.test.ts"
Cohesion: 0.25
Nodes (6): checkPasswordStrengthMock, hashPasswordMock, issueSessionMock, prismaMock, sessionUserId, verifyPasswordMock

### Community 112 - "stats.ts"
Cohesion: 0.39
Nodes (5): GET(), dynamic, LandingPage(), getLandingStats(), LandingStats

### Community 114 - "videos/route.test.ts"
Cohesion: 0.33
Nodes (5): freeVideo, getActiveSubscriptionMock, getSessionUserIdMock, premiumVideo, prismaMock

### Community 115 - "content-icons.ts"
Cohesion: 0.33
Nodes (5): CONTENT_ICON_KEYS, CONTENT_ICONS, ContentIcon, DEFAULT_CONTENT_ICON, resolveContentIcon()

### Community 116 - "user/route.test.ts"
Cohesion: 0.40
Nodes (4): activeUser, cookieStore, prismaMock, verifyTokenMock

## Knowledge Gaps
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `content/page.tsx`, `session.ts`, `react`, `user/route.ts`, `settings.ts`, `app/layout.tsx`, `login/page.tsx`, `[id]/page.tsx`, `toPersianDigits`, `package.json`, `dependencies`, `stats.ts`, `@sentry/nextjs`, `toPersianDigits`, `PainHeatmap3D.tsx`, `server.js`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.051558036010896285 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `next`, `session.ts`, `prisma-retry.test.ts`, `promote-admin.mjs`, `page.test.ts`, `package.json`, `login/page.tsx`, `toPersianDigits`, `settings/route.test.ts`, `checkout.test.ts`, `set-password/route.test.ts`, `healthScore.ts`, `videos/route.test.ts`, `plans/route.test.ts`, `user/route.test.ts`, `PainHeatmap3D.tsx`, `clear-password/route.test.ts`, `store.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `content/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09274314965371876 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `next` to `seed.ts`, `user/route.ts`, `settings.ts`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Should `session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.062146892655367235 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.09899749373433583 - nodes in this community are weakly interconnected._