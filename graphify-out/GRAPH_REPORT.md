# Graph Report - Elajgar  (2026-10-24)

## Corpus Check
- 246 files · ~324,413 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 65 file(s) not represented in the graph (top: .csv 37, (none) 23, .log 2)

## Summary
- 2119 nodes · 4215 edges · 103 communities (85 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `64150474`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- next
- content/page.tsx
- session.ts
- toPersianDigits
- design_system.py
- user/route.ts
- promote-admin.mjs
- Hardening Controls
- package.json
- vitest
- validate_data.py
- DesignSystemGenerator
- dashboard/page.tsx
- search_stack
- dependencies
- _select_palette_for_mode
- Next.js 16 Data Fetching — Server Components, not Server Actions in useEffect
- Anti-pattern catalog — red ❌ → green ✅
- Test-Driven Development
- Code Review and Quality
- Context Engineering
- core.py
- Optimization Patterns
- lucide-react
- search
- test_data_contracts.py
- PainHeatmap3D.tsx
- API and Interface Design
- BM25
- test_core_data_quality.py
- utils.ts
- Browser Testing with DevTools
- Frontend UI Engineering
- Deprecation and Migration
- Next.js Forms — TanStack Form + Zod + shadcn `Field`
- Claude Automation Recommender
- seed.ts
- Debugging and Error Recovery
- [id]/page.tsx
- db
- compilerOptions
- test_design_system_mode.py
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
- unittest
- test_text_layout_resilience.py
- Step-by-Step Guide to Deploying the Elajgar Project on cPanel
- Elajgar (علاج‌گر)
- app/layout.tsx
- test_catalog_summary_line_endings.py
- Ideation Frameworks Reference
- test_relevance_evaluator.py
- pathlib
- How to Upload and Run Elajgar on Your Webhost
- TestThresholdGate
- Frontend Design
- No `await import()` — static imports only
- accessibility-fix/SKILL.md
- TestGeneratedCatalogContract
- settings/page.tsx
- accessibility-audit/SKILL.md
- accessibility-diff/SKILL.md
- accessibility-scan/SKILL.md
- TestStackFlagWithDesignSystem
- Ponytail
- Web Interface Guidelines
- server.js
- TestFixtureValidation
- 5. Database Setup
- postcss.config.mjs
- sw.js
- idea-refine.sh
- palette.md
- liara_pre_start.sh

## God Nodes (most connected - your core abstractions)
1. `next` - 71 edges
2. `requireAdmin()` - 69 edges
3. `adminErrorResponse()` - 68 edges
4. `jsonError()` - 55 edges
5. `toPersianDigits()` - 50 edges
6. `search()` - 44 edges
7. `writeAudit()` - 42 edges
8. `prisma` - 42 edges
9. `react` - 41 edges
10. `DesignSystemGenerator` - 38 edges

## Surprising Connections (you probably didn't know these)
- `4. Run version-correct initialization` --references--> `search()`  [INFERRED]
  .claude/skills/mempalace/SKILL.md → .agents/skills/ui-ux-pro-max/scripts/core.py
- `Seed the food database (optional but recommended)` --references--> `Food`  [INFERRED]
  howto.md → app/panel-7x9k4m/foods/page.tsx
- `POST()` --calls--> `getSessionUserId()`  [EXTRACTED]
  app/api/checkout/confirm/route.ts → lib/session.ts
- `POST()` --calls--> `getSessionUserId()`  [EXTRACTED]
  app/api/checkout/route.ts → lib/session.ts
- `GET()` --calls--> `getProgramSteps()`  [EXTRACTED]
  app/api/content/program/route.ts → lib/settings.ts

## Import Cycles
- None detected.

## Communities (103 total, 18 thin omitted)

### Community 0 - "next"
Cohesion: 0.06
Nodes (99): Context, DELETE(), GET(), PATCH(), GET(), POST(), GET(), Context (+91 more)

### Community 1 - "content/page.tsx"
Cohesion: 0.09
Nodes (66): ACTION_LABELS, ACTION_TONES, AdminAuditPage(), AuditEntry, ENTITIES, ENTITY_LABELS, formatDate(), AdminContentPage() (+58 more)

### Community 2 - "session.ts"
Cohesion: 0.06
Nodes (47): DELETE(), POST(), cookieSet, prismaMock, sendOtpSmsMock, sign(), signMock, smsFailureMessageMock (+39 more)

### Community 3 - "toPersianDigits"
Cohesion: 0.10
Nodes (36): EducationPage(), Plan, PremiumVideo, SubscriptionState, CATEGORY_LABELS, Gym, GymCard(), GymImage() (+28 more)

### Community 4 - "design_system.py"
Cohesion: 0.06
Nodes (19): ansi_ljust(), _detect_page_type(), format_ascii_box(), add_wrapped(), wrap_text(), format_markdown(), format_page_override_md(), generate_design_system() (+11 more)

### Community 5 - "user/route.ts"
Cohesion: 0.06
Nodes (46): GET(), ACTIVITY_LEVEL_MAP, ACTIVITY_LEVEL_TO_CLIENT, booleanToClient(), buildDailyLogs(), buildProfileUpdate(), buildQuestionnaire(), ClientDailyLog (+38 more)

### Community 6 - "promote-admin.mjs"
Cohesion: 0.05
Nodes (28): __dirname, __filename, env, failed, results, root, publicDir, root (+20 more)

### Community 7 - "Hardening Controls"
Cohesion: 0.05
Nodes (42): Broken Access Control, Broken Authentication, Cross-Site Scripting (XSS), Data Classification, Dependency Audit Triage, Destructive Operations on Derived Paths, File Upload Safety, Hardening Patterns (+34 more)

### Community 8 - "package.json"
Cohesion: 0.06
Nodes (43): devDependencies, @cloudflare/next-on-pages@^1.13.16, dotenv@^17.4.2, eslint@^9.39.1, eslint-config-next@16.0.8, firebase-tools@^15.0.0, prisma@^5.22.0, tailwindcss@4.1.11 (+35 more)

### Community 9 - "vitest"
Cohesion: 0.07
Nodes (24): cookieStore, prismaMock, verifyTokenMock, prismaMock, sessionUserId, verifyPassword, LoginPage(), prismaMock (+16 more)

### Community 10 - "validate_data.py"
Cohesion: 0.11
Nodes (32): _catalog_date(), _check_app_interface_contract(), _check_catalog_contract(), _check_catalog_summary(), _check_chart_contract(), _check_color_contract(), _check_core_data_contract(), _check_file() (+24 more)

### Community 11 - "DesignSystemGenerator"
Cohesion: 0.11
Nodes (4): DesignSystemGenerator, TestReasoningMatch, read_rows(), TestReasoningContract

### Community 12 - "dashboard/page.tsx"
Cohesion: 0.10
Nodes (28): DashboardIndex(), HydrationChart, MEAL_PRESETS, ProgressReport, chartTooltipStyle, ProgressReport(), buildHealthDataFromLogs(), calculateHealthScore() (+20 more)

### Community 13 - "search_stack"
Cohesion: 0.09
Nodes (6): _exact_stack_identifier(), search_stack(), _rows(), TestNativeDesktopStackFreshness, _rows(), TestWebStackFreshness

### Community 14 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, autoprefixer@^10.4.21, class-variance-authority@^0.7.1, clsx@^2.1.1, d3@^7.9.0, @fontsource/vazirmatn@^5.3.0, @hookform/resolvers@^5.2.1, jose@^6.2.10 (+26 more)

### Community 15 - "_select_palette_for_mode"
Cohesion: 0.09
Nodes (10): _button_outline_text_color(), _contrast_ratio(), _derive_dark_palette(), format_master_md(), _palette_is_dark(), _relative_luminance(), _select_palette_for_mode(), TestEndToEndCoherence (+2 more)

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

### Community 21 - "core.py"
Cohesion: 0.11
Nodes (15): _contains_phrase(), _domain_keywords(), _file_signature(), _load_csv(), _load_csv_snapshot(), _load_product_keywords(), _load_rows_or_empty(), _passes_threshold() (+7 more)

### Community 22 - "Optimization Patterns"
Cohesion: 0.07
Nodes (25): Connection Pool Exhaustion, Large Bundle Size, Missing Caching (Backend), Missing Image Optimization (Frontend), N+1 Queries (Backend), Optimization Patterns, Queries That Ignore Their Index, Unbounded Data Fetching (+17 more)

### Community 23 - "lucide-react"
Cohesion: 0.12
Nodes (21): EditProfileForm(), EditProfileModal(), EditProfileModalProps, NotificationPrefs, ProfilePage(), readNotificationPrefs(), SubscriptionState, Switch() (+13 more)

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
Cohesion: 0.14
Nodes (5): BM25, _get_bm25(), _suggest_identities(), TestBm25CoreBehavior, TestTokenizer

### Community 29 - "test_core_data_quality.py"
Cohesion: 0.14
Nodes (11): read_rows(), TestAccessibilityGuidance, TestChartsTypographyAndIcons, TestCurrentReactGuidance, TestSemanticColors, _check_typography_contract(), _configured_font_names(), contrast_ratio() (+3 more)

### Community 30 - "utils.ts"
Cohesion: 0.15
Nodes (15): CheckoutPage(), Plan, DashboardLayout(), NutritionPage(), BottomNav(), MACRO_COLOR, MACRO_LABEL, MacroBar() (+7 more)

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

### Community 38 - "[id]/page.tsx"
Cohesion: 0.13
Nodes (17): AdminLayout(), AdminOverviewPage(), PainHeatmap3D, StatsResponse, ACTIVITY_LABELS, AdminUserDetailPage(), formatDate(), GENDER_LABELS (+9 more)

### Community 39 - "db"
Cohesion: 0.09
Nodes (21): command, container_name, environment, healthcheck, image, ports, restart, volumes (+13 more)

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (21): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+13 more)

### Community 41 - "test_design_system_mode.py"
Cohesion: 0.15
Nodes (6): _filter_anti_patterns_for_mode(), _query_wants_dark(), _resolve_color_mode(), _style_is_dark_primary(), TestAntiPatternGating, TestModeResolution

### Community 42 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, admin:clear-password, admin:delete, admin:promote, admin:set-password, build, clean, db:doctor (+12 more)

### Community 43 - "Planning and Task Breakdown"
Cohesion: 0.11
Nodes (18): Common Rationalizations, Output Files, Overview, Parallelization Opportunities, Plan Document Template, Planning and Task Breakdown, Red Flags, See Also (+10 more)

### Community 44 - "test_core.py"
Cohesion: 0.17
Nodes (3): detect_domain(), TestDiagnosticsContracts, TestDomainDetection

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
Cohesion: 0.13
Nodes (8): _exact_match_diagnostic(), _exact_row_identity(), _legacy_successor_guidance(), _normalize(), _row_identities(), _stack_query_requests_legacy(), _stack_row_filter(), _style_identity()

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

### Community 70 - "test_text_layout_resilience.py"
Cohesion: 0.20
Nodes (3): read_rows(), TestTextLayoutDataContracts, TestTextLayoutRetrieval

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

### Community 77 - "pathlib"
Cohesion: 0.32
Nodes (3): resolve(), shipped_invocations(), SkillScriptPathsTest

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

### Community 84 - "settings/page.tsx"
Cohesion: 0.33
Nodes (4): AdminSettingsPage(), SettingsResponse, WEIGHT_HINTS, WEIGHT_LABELS

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

### Community 93 - "5. Database Setup"
Cohesion: 0.50
Nodes (4): Food, 5. Database Setup, Create an admin account, Seed the food database (optional but recommended)

## Knowledge Gaps
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `content/page.tsx`, `session.ts`, `toPersianDigits`, `user/route.ts`, `[id]/page.tsx`, `package.json`, `app/layout.tsx`, `vitest`, `dashboard/page.tsx`, `dependencies`, `@sentry/nextjs`, `lucide-react`, `PainHeatmap3D.tsx`, `server.js`, `utils.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.06330491565390894 - nodes in this community are weakly interconnected._
- **Why does `Food` connect `5. Database Setup` to `content/page.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `content/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09330143540669857 - nodes in this community are weakly interconnected._
- **Should `session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05674044265593561 - nodes in this community are weakly interconnected._
- **Should `toPersianDigits` be split into smaller, more focused modules?**
  _Cohesion score 0.10303030303030303 - nodes in this community are weakly interconnected._
- **Should `design_system.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05731523378582202 - nodes in this community are weakly interconnected._