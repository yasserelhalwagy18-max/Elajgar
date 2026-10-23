# Graph Report - Elajgar  (2026-10-23)

## Corpus Check
- 284 files · ~388,915 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 47 file(s) not represented in the graph (top: .csv 37, (none) 5, .log 2)

## Summary
- 2532 nodes · 4663 edges · 144 communities (125 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `886dba74`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- next
- content/page.tsx
- validate_data.py
- toPersianDigits
- send-otp/route.ts
- core.py
- search_stack
- vitest
- accessibility-inspect/SKILL.md
- design_system.py
- utils.ts
- test_design_system_mode.py
- package.json
- lucide-react
- Model Queries
- Driver Adapters
- BM25
- nutrition/page.tsx
- user/route.ts
- Upgrade to Prisma ORM 7
- Relation Queries
- Removed Features
- app/layout.tsx
- seed.ts
- dependencies
- Prisma CLI Reference
- Raw Queries
- Troubleshooting Prisma Compute
- test_skill_script_paths.py
- compilerOptions
- Client Methods
- Filter Conditions and Operators
- Query Options
- [id]/page.tsx
- prisma db push
- prisma dev
- prisma generate
- prisma studio
- Prisma Client API Reference
- Prisma Config
- devDependencies
- scripts
- prisma migrate dev
- settings.ts
- prisma db seed
- Environment Variables
- format_ascii_box
- UI/UX Pro Max - Design Intelligence
- CorrectionalCalendar.tsx
- prisma db pull
- prisma init
- prisma migrate deploy
- Constructor Options
- Prisma Database Setup
- Prisma Accelerate Users
- ESM and CommonJS Support
- Schema Changes
- DesignSystemGenerator
- manifest.json
- Transactions
- Workflow
- TestMetricMath
- CatalogRefreshTest
- PainHeatmap3D.tsx
- Prisma Compute Framework Readiness
- MongoDB Setup
- Prisma SQL Driver Adapter Implementation
- Core Workflows
- TestTextLayoutDataContracts
- GET
- Modal.tsx
- nutrition-targets.ts
- prisma db execute
- Prisma Platform CLI App Deploy
- MySQL Setup
- management-api
- Pre-Delivery Checklist (canonical — the only one)
- Quick Reference
- Putting elajgar.ir online with Liara
- prisma migrate diff
- prisma migrate reset
- PostgreSQL Setup
- Prisma Postgres Setup
- SQLite Setup
- body-regions.ts
- healthScore.ts
- SQL Server Setup
- create-db-cli
- api-basics
- Step-by-Step Guide to Deploying the Elajgar Project on cPanel
- Elajgar (علاج‌گر)
- promote-admin.mjs
- prisma format
- prisma migrate resolve
- prisma validate
- CockroachDB Setup
- decision-stay-or-migrate
- console-and-connections
- management-api-sdk
- prisma migrate status
- Prisma Compute Config
- create-prisma Compute Flow
- SDK and API Automation
- Quick Rules
- Prisma Compute
- migrations-mapping
- schema-contract-mapping
- Prisma MongoDB Upgrade Path
- endpoints
- prisma mcp
- client-api-mapping
- Service Tokens
- How to Upload and Run Elajgar on Your Webhost
- palette.md
- doctor.mjs
- generate-icons.mjs
- liara-deploy.mjs
- prisma debug
- Prisma Client Setup
- verify-cutover-checklist
- Prisma 7 Client Instantiation
- TestThresholdGate
- prisma.mjs
- CatalogSummaryLineEndingsTest
- split_values
- TestGeneratedCatalogContract
- CLAUDE.md
- eslint.config.mjs
- TestStackFlagWithDesignSystem
- Web Interface Guidelines
- server.js
- AI safety checkpoint for destructive commands
- TestFixtureValidation
- 5. Database Setup
- prisma complete
- postcss.config.mjs
- sw.js
- liara_pre_start.sh

## God Nodes (most connected - your core abstractions)
1. `next` - 70 edges
2. `requireAdmin()` - 69 edges
3. `adminErrorResponse()` - 68 edges
4. `jsonError()` - 55 edges
5. `toPersianDigits()` - 49 edges
6. `search()` - 43 edges
7. `writeAudit()` - 42 edges
8. `prisma` - 42 edges
9. `react` - 42 edges
10. `DesignSystemGenerator` - 38 edges

## Surprising Connections (you probably didn't know these)
- `2026-10-22 - `type="number"` throws away Persian digits` --references--> `normalizeDigits()`  [INFERRED]
  .Jules/palette.md → lib/utils.ts
- `Use in CI` --references--> `validate()`  [INFERRED]
  .agents/skills/prisma-cli/references/validate.md → .agents/skills/ui-ux-pro-max/scripts/validate_data.py
- `Command Categories` --references--> `validate()`  [INFERRED]
  .agents/skills/prisma-cli/SKILL.md → .agents/skills/ui-ux-pro-max/scripts/validate_data.py
- `Rule Categories by Priority` --references--> `validate()`  [INFERRED]
  .agents/skills/prisma-cli/SKILL.md → .agents/skills/ui-ux-pro-max/scripts/validate_data.py
- `Seed the food database (optional but recommended)` --references--> `Food`  [INFERRED]
  howto.md → app/panel-7x9k4m/foods/page.tsx

## Import Cycles
- None detected.

## Communities (144 total, 19 thin omitted)

### Community 0 - "next"
Cohesion: 0.05
Nodes (110): Context, DELETE(), GET(), PATCH(), GET(), POST(), GET(), Context (+102 more)

### Community 1 - "content/page.tsx"
Cohesion: 0.09
Nodes (68): ACTION_LABELS, ACTION_TONES, AdminAuditPage(), AuditEntry, ENTITIES, ENTITY_LABELS, formatDate(), AdminContentPage() (+60 more)

### Community 2 - "validate_data.py"
Cohesion: 0.07
Nodes (43): read_rows(), TestAccessibilityGuidance, TestChartsTypographyAndIcons, TestCurrentReactGuidance, TestSemanticColors, _catalog_date(), _check_app_interface_contract(), _check_catalog_contract() (+35 more)

### Community 3 - "toPersianDigits"
Cohesion: 0.12
Nodes (38): EducationPage(), load(), Plan, PremiumVideo, SubscriptionState, CATEGORY_LABELS, Gym, GymCard() (+30 more)

### Community 4 - "send-otp/route.ts"
Cohesion: 0.08
Nodes (33): POST(), cookieSet, prismaMock, sendOtpSmsMock, sign(), signMock, smsFailureMessageMock, POST() (+25 more)

### Community 5 - "core.py"
Cohesion: 0.05
Nodes (20): _exact_match_diagnostic(), _exact_row_identity(), _exact_stack_identifier(), _legacy_successor_guidance(), _normalize(), _passes_threshold(), _project_row(), _query_coverage() (+12 more)

### Community 6 - "search_stack"
Cohesion: 0.12
Nodes (5): search_stack(), _rows(), TestNativeDesktopStackFreshness, _rows(), TestWebStackFreshness

### Community 7 - "vitest"
Cohesion: 0.06
Nodes (30): cookieStore, prismaMock, verifyTokenMock, prismaMock, sessionUserId, verifyPassword, cookieStore, prismaMock (+22 more)

### Community 8 - "accessibility-inspect/SKILL.md"
Cohesion: 0.04
Nodes (39): Grading, Notes, Report format, WCAG-EM steps, 1. Audit, 2. Report, 3. Tear down, Notes (+31 more)

### Community 9 - "design_system.py"
Cohesion: 0.08
Nodes (8): _write_persisted_file(), apply_decision_rules(), _object_without_duplicates(), parse_decision_rules(), _validate_action(), format_output(), read_rows(), read_rows()

### Community 10 - "utils.ts"
Cohesion: 0.13
Nodes (26): CheckoutPage(), formatCardNumber(), formatExpiry(), Plan, DashboardIndex(), getStatusText(), HydrationChart, MEAL_PRESETS (+18 more)

### Community 11 - "test_design_system_mode.py"
Cohesion: 0.06
Nodes (16): _button_outline_text_color(), _contrast_ratio(), _derive_dark_palette(), _filter_anti_patterns_for_mode(), format_master_md(), _palette_is_dark(), _query_wants_dark(), _relative_luminance() (+8 more)

### Community 12 - "package.json"
Cohesion: 0.06
Nodes (31): name, prisma, seed, private, version, autoprefixer, class-variance-authority, @cloudflare/next-on-pages (+23 more)

### Community 13 - "lucide-react"
Cohesion: 0.11
Nodes (22): EditProfileForm(), EditProfileModal(), EditProfileModalProps, NotificationPrefs, readNotificationPrefs(), SubscriptionState, HubCard(), LandingPage() (+14 more)

### Community 14 - "Model Queries"
Cohesion: 0.07
Nodes (27): aggregate, Aggregation Operations, Atomic operations, count, create, Create Operations, createMany, createManyAndReturn (+19 more)

### Community 15 - "Driver Adapters"
Cohesion: 0.07
Nodes (27): Accept self-signed certificates, After (v7), Available Adapters, Before (v6), Configuration, Connection Pool Configuration, Driver Adapters, Installation (+19 more)

### Community 16 - "BM25"
Cohesion: 0.06
Nodes (17): BM25, _contains_phrase(), detect_domain(), _domain_keywords(), _file_signature(), _get_bm25(), _load_csv(), _load_csv_snapshot() (+9 more)

### Community 17 - "nutrition/page.tsx"
Cohesion: 0.20
Nodes (14): DashboardLayout(), NutritionPage(), BottomNav(), buildSyncPayload(), composeSyncedSnapshot(), json(), SYNCABLE_JSON_KEYS, SYNCABLE_PROFILE_KEYS (+6 more)

### Community 18 - "user/route.ts"
Cohesion: 0.10
Nodes (26): ACTIVITY_LEVEL_MAP, ACTIVITY_LEVEL_TO_CLIENT, buildDailyLogs(), buildProfileUpdate(), buildQuestionnaire(), ClientDailyLog, ClientFood, FALSE_WORDS (+18 more)

### Community 19 - "Upgrade to Prisma ORM 7"
Cohesion: 0.08
Nodes (25): 1. Update package.json for ESM-first projects, 2. Update tsconfig.json, 3. Update schema.prisma, 4. Create prisma.config.ts, 5. Install a driver adapter (SQL providers only), 6. Update client instantiation, 7. Replace Prisma.validator with satisfies, 8. Run migrations and generate (+17 more)

### Community 20 - "Relation Queries"
Cohesion: 0.08
Nodes (23): Connect existing, Count Relations, Create or connect, Create with relations, Delete related, Disconnect, every, Filter counted relations (+15 more)

### Community 21 - "Removed Features"
Cohesion: 0.08
Nodes (23): Alternatives, Auto-generate after migrate, Auto-seed after migrate, Automatic Behaviors Removed, CLI Flags Removed, Client Middleware, Common Middleware Patterns, Custom counter with extensions (+15 more)

### Community 22 - "app/layout.tsx"
Cohesion: 0.13
Nodes (12): Error(), metadata, RootLayout(), viewport, ServiceWorkerRegistration(), onRouterTransitionStart, onRequestError, register() (+4 more)

### Community 23 - "seed.ts"
Cohesion: 0.13
Nodes (21): ARTICLE_CATEGORIES, EXERCISE_CATEGORIES, SeedArticle, seedArticles, SeedExercise, seedExercises, adminPhoneNumbers(), defaultSettings (+13 more)

### Community 24 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, autoprefixer, class-variance-authority, clsx, d3, @fontsource/vazirmatn, jose, lucide-react (+15 more)

### Community 25 - "Prisma CLI Reference"
Cohesion: 0.09
Nodes (21): AI Safety Checkpoint, Boundary: Platform and Compute, Bun Runtime, Client Generation, Command Categories, Current Command Behavior, Current Prisma CLI Setup, Database Operations (+13 more)

### Community 26 - "Raw Queries"
Cohesion: 0.09
Nodes (21): BigInt handling, Database-Specific Features, Date handling, Delete example, Dynamic table/column names, $executeRaw, Handling Results, Insert example (+13 more)

### Community 27 - "Troubleshooting Prisma Compute"
Cohesion: 0.09
Nodes (22): Accidental Prisma Postgres Provisioning, Auth Fails, Bun Entrypoint Missing, Compute Config Invalid, `create-prisma --yes` Did Not Deploy, Database Wiring or Schema Did Not Apply, Env Changes Did Not Apply, First Checks (+14 more)

### Community 28 - "test_skill_script_paths.py"
Cohesion: 0.38
Nodes (3): resolve(), shipped_invocations(), SkillScriptPathsTest

### Community 29 - "compilerOptions"
Cohesion: 0.10
Nodes (21): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+13 more)

### Community 30 - "Client Methods"
Cohesion: 0.10
Nodes (18): Add custom methods, Add model methods, Chain extensions, Client Methods, $connect(), $disconnect(), $extends(), Graceful shutdown (+10 more)

### Community 31 - "Filter Conditions and Operators"
Cohesion: 0.10
Nodes (20): AND (explicit), AND (implicit), Array Field Filters, Combined, Comparison, Equality, every, Filter Conditions and Operators (+12 more)

### Community 32 - "Query Options"
Cohesion: 0.10
Nodes (20): cursor, distinct, Filtered include, include, Include relation count, Multiple distinct fields, Negative take (reverse), Nested include (+12 more)

### Community 33 - "[id]/page.tsx"
Cohesion: 0.13
Nodes (17): AdminLayout(), AdminOverviewPage(), PainHeatmap3D, StatsResponse, ACTIVITY_LABELS, AdminUserDetailPage(), formatDate(), GENDER_LABELS (+9 more)

### Community 34 - "prisma db push"
Cohesion: 0.10
Nodes (19): Accept data loss, Basic push, Command, Common Patterns, Comparison with migrate dev, Examples, Follow-up Command, Force reset (+11 more)

### Community 35 - "prisma dev"
Cohesion: 0.10
Nodes (19): Background mode, Command, Configuration, Custom ports, Examples, Force remove (stops first), Instance Management, List all instances (+11 more)

### Community 36 - "prisma generate"
Cohesion: 0.10
Nodes (19): After schema changes, Basic generation, Bun Runtime, CI/CD pipeline, Command, Common Patterns, Compiler Build Tuning, Current Generator Behavior (+11 more)

### Community 37 - "prisma studio"
Cohesion: 0.10
Nodes (19): Command, Common Workflow, Custom port, Don't open browser, Edit Records, Examples, Features, Filter Data (+11 more)

### Community 38 - "Prisma Client API Reference"
Cohesion: 0.10
Nodes (19): Client Instantiation, Client Methods, Create records, Delete records, Filter Operators, Find records, How to Use, Model Query Methods (+11 more)

### Community 39 - "Prisma Config"
Cohesion: 0.10
Nodes (19): After (v7) - prisma.config.ts, Basic Configuration, Before (v6) - schema.prisma, Configuration Options, Custom Config Path, datasource.directUrl, datasource.shadowDatabaseUrl, datasource.url (+11 more)

### Community 40 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/next-on-pages, dotenv, eslint, eslint-config-next, firebase-tools, prisma, tailwindcss (+12 more)

### Community 41 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, admin:clear-password, admin:delete, admin:promote, admin:set-password, build, clean, db:doctor (+12 more)

### Community 42 - "prisma migrate dev"
Cohesion: 0.11
Nodes (18): After schema changes, Command, Common Patterns, Create and apply migration, Create without applying, Examples, Follow-up Commands, Full workflow (+10 more)

### Community 43 - "settings.ts"
Cohesion: 0.25
Nodes (14): GET(), DEFAULT_PROGRAM_STEPS, DEFAULT_SETTINGS, getHealthScoreTargets(), getHealthScoreWeights(), getNutritionConfig(), getProgramSteps(), getSettings() (+6 more)

### Community 44 - "prisma db seed"
Cohesion: 0.11
Nodes (17): Best Practices, Command, Common Patterns, Common seed commands, Conditional seeding, Configuration, Current Workflow, Development reset (+9 more)

### Community 45 - "Environment Variables"
Cohesion: 0.11
Nodes (17): 1. Install dotenv, 2. Import in prisma.config.ts, Application Code, Bun Users, CI/CD Considerations, Entry point, Environment Variables, Multiple .env Files (+9 more)

### Community 46 - "format_ascii_box"
Cohesion: 0.07
Nodes (16): ansi_ljust(), _detect_page_type(), format_ascii_box(), add_wrapped(), wrap_text(), format_markdown(), format_page_override_md(), generate_design_system() (+8 more)

### Community 47 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.11
Nodes (17): Before Delivering App UI, Example Workflow, If a search returns 0 results, Output Formats, Query Contract, Rule Categories by Priority, Running the search tool, Step 1: Analyze User Requirements (+9 more)

### Community 48 - "CorrectionalCalendar.tsx"
Cohesion: 0.17
Nodes (16): addMonths(), CorrectionalCalendar(), daysInPersianMonth(), displayDayFormatter, displayYearFormatter, firstDayOfPersianMonth(), PERSIAN_MONTHS, persianFormatter (+8 more)

### Community 49 - "prisma db pull"
Cohesion: 0.12
Nodes (16): Basic introspection, Command, Examples, Force overwrite, Generated Schema Example, MongoDB Introspection, Options, Post-Introspection Cleanup (+8 more)

### Community 50 - "prisma init"
Cohesion: 0.12
Nodes (16): Add an example model, Basic initialization, Bun Runtime, Command, Examples, Generated Config (Bun), Generated Config (Node.js default), Generated Schema (+8 more)

### Community 51 - "prisma migrate deploy"
Cohesion: 0.12
Nodes (16): Basic deployment, Best Practices, Check status first, Command, Comparison with migrate dev, Configuration, Docker deployment, Error Handling (+8 more)

### Community 52 - "Constructor Options"
Cohesion: 0.12
Nodes (16): accelerateUrl (For Accelerate users), adapter (Required for the SQL provider workflow), Basic Instantiation, comments, Constructor Options, errorFormat, log, Log Events (+8 more)

### Community 53 - "Prisma Database Setup"
Cohesion: 0.12
Nodes (16): Bun Runtime, Configuration Files, Driver Adapters, How to Use, MongoDB, MySQL, PostgreSQL, Prisma Client Setup (Required) (+8 more)

### Community 54 - "Prisma Accelerate Users"
Cohesion: 0.12
Nodes (16): 1. Keep your Accelerate URL, 2. Install Accelerate extension, 3. Configure prisma.config.ts, 4. Instantiate client with accelerateUrl, Caching with Accelerate, Correct v7 Setup for Accelerate, Edge Runtime, Important (+8 more)

### Community 55 - "ESM and CommonJS Support"
Cohesion: 0.12
Nodes (16): Browser-Safe Types, Bun, "Cannot use import statement outside a module", CommonJS Projects, "ERR_REQUIRE_ESM", ESM and CommonJS Support, ESM Projects, File Extensions (+8 more)

### Community 56 - "Schema Changes"
Cohesion: 0.12
Nodes (15): 1. Provider name, 2. Output is required, 3. engineType changed, 4. moduleFormat is explicit when needed, After Schema Changes, Datasource Block, Example Output Paths, Generated Entrypoints (+7 more)

### Community 57 - "DesignSystemGenerator"
Cohesion: 0.08
Nodes (6): DesignSystemGenerator, _resolve_dial(), TestReasoningMatch, read_rows(), TestLandingAndStackContract, TestReasoningContract

### Community 58 - "manifest.json"
Cohesion: 0.12
Nodes (15): background_color, categories, description, dir, display, icons, id, lang (+7 more)

### Community 59 - "Transactions"
Cohesion: 0.13
Nodes (14): All or nothing, Best Practices, Handle errors, Interactive Transactions, Isolation levels, Keep transactions short, Nested Writes, OrThrow in Transactions (+6 more)

### Community 60 - "Workflow"
Cohesion: 0.13
Nodes (14): Error Handling, Prerequisites, Prisma Postgres Setup, Reference Files, Step 1: Authenticate, Step 2: List available regions, Step 3: Create a project with a database, Step 4: Create a named connection (optional) (+6 more)

### Community 63 - "PainHeatmap3D.tsx"
Cohesion: 0.20
Nodes (13): buildPainData(), Canvas, getHeatColor(), Marker(), PainHeatmap3D(), PainRegionDatum, PlaceholderHumanoid(), PositionedRegion (+5 more)

### Community 64 - "Prisma Compute Framework Readiness"
Cohesion: 0.14
Nodes (14): Astro, Bun, Elysia, and Plain Source Servers, CLI-First Model, CLI Matrix, Custom Build Artifacts, Hono, NestJS, Next.js (+6 more)

### Community 65 - "MongoDB Setup"
Cohesion: 0.14
Nodes (13): 1. Schema Configuration, 2. Environment Variable, Common Issues, Current Verification Notes, Driver Adapters, ID Field Requirement, "Invalid ObjectID", Migrations vs Introspection (+5 more)

### Community 66 - "Prisma SQL Driver Adapter Implementation"
Cohesion: 0.14
Nodes (13): Commit and rollback, Contract snapshot, Error mapping, Factory, ownership, and shadow database, Priority rules, Prisma SQL Driver Adapter Implementation, Query implementation, Result mapping (+5 more)

### Community 67 - "Core Workflows"
Cohesion: 0.14
Nodes (13): 1. Console-first workflow, 2. Quick provisioning with create-db, 2b. Persistent databases with the Platform CLI, 3. Link an existing local project, 4. Programmatic provisioning with Management API, 5. Type-safe integration with Management API SDK, Core Workflows, How to Use (+5 more)

### Community 69 - "GET"
Cohesion: 0.67
Nodes (3): booleanToClient(), GET(), serializeUser()

### Community 70 - "Modal.tsx"
Cohesion: 0.24
Nodes (7): Article, EducationalContent(), CONTENT_ICON_KEYS, CONTENT_ICONS, ContentIcon, DEFAULT_CONTENT_ICON, resolveContentIcon()

### Community 71 - "nutrition-targets.ts"
Cohesion: 0.24
Nodes (8): ACTIVITY_MULTIPLIERS, DEFAULT_NUTRITION_CONFIG, goalBucket, MacroSplit, NutritionGoalKey, NutritionProfile, NutritionTargets, profile

### Community 72 - "prisma db execute"
Cohesion: 0.15
Nodes (12): Command, Configuration, Current Option Surface, Examples, Execute from file, Execute from stdin, Execute `migrate diff` output, Limitations (+4 more)

### Community 73 - "Prisma Platform CLI App Deploy"
Cohesion: 0.15
Nodes (13): Agent Skill Installation, Auth and Project Binding, Build and Run Locally, Database and Env, Deploy, Deployment Story: GitHub vs CLI, Operations, Output Handling (+5 more)

### Community 74 - "MySQL Setup"
Cohesion: 0.15
Nodes (12): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, Common Issues, Connection String Format, Driver Adapter, JSON Support, MySQL Setup (+4 more)

### Community 75 - "management-api"
Cohesion: 0.15
Nodes (12): API exploration, Authentication methods, Base URL, Current resource inventory, management-api, Notes, OAuth flow summary, Priority (+4 more)

### Community 76 - "Pre-Delivery Checklist (canonical — the only one)"
Cohesion: 0.15
Nodes (12): Accessibility, Common Rules for Professional UI + Pre-Delivery Checklist, Icons & Visual Elements, Interaction, Interaction (App), Layout, Layout & Spacing, Light/Dark Mode (+4 more)

### Community 77 - "Quick Reference"
Cohesion: 0.15
Nodes (12): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+4 more)

### Community 78 - "Putting elajgar.ir online with Liara"
Cohesion: 0.15
Nodes (13): 1. The database, 2. The app, 3. The environment variables, 4. Upload the app, 5. What happens on the first start, 6. The domain, 7. Check it, Before the real launch (+5 more)

### Community 79 - "prisma migrate diff"
Cohesion: 0.17
Nodes (11): Check for drift (CI), Command, Create baseline migration, Examples, Generate SQL for a schema change, Options, prisma migrate diff, Review pending migrations (+3 more)

### Community 80 - "prisma migrate reset"
Cohesion: 0.17
Nodes (11): Basic reset, Command, Configuration, Examples, Follow-up Steps, Force reset (CI/Automation), Options, prisma migrate reset (+3 more)

### Community 81 - "PostgreSQL Setup"
Cohesion: 0.17
Nodes (11): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, "Authentication failed", "Can't reach database server", Common Issues, Connection String Format, Driver Adapter (+3 more)

### Community 82 - "Prisma Postgres Setup"
Cohesion: 0.17
Nodes (11): 1. Schema Configuration, 2. Config Configuration, Connection String, Driver Adapter, Edge/serverless option, Features, Overview, Prisma Postgres Setup (+3 more)

### Community 83 - "SQLite Setup"
Cohesion: 0.17
Nodes (11): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, Common Issues, Connection String Format, "Database file not found", Driver Adapter, Limitations (+3 more)

### Community 84 - "body-regions.ts"
Cohesion: 0.21
Nodes (11): BODY_BUCKET_LABELS, BODY_BUCKET_POSITIONS, BODY_BUCKETS, BODY_REGIONS, BodyFamily, BodyRegion, BodyView, FAMILY_KEYWORDS (+3 more)

### Community 85 - "healthScore.ts"
Cohesion: 0.20
Nodes (11): DailyHealthData, DEFAULT_HEALTH_TARGETS, DEFAULT_HEALTH_WEIGHTS, HealthScoreInput, HealthScoreOptions, HealthScoreTargets, HealthScoreWeights, optimal (+3 more)

### Community 86 - "SQL Server Setup"
Cohesion: 0.18
Nodes (10): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, Common Issues, Connection String Format, Driver Adapter, "Login failed for user", Prerequisites (+2 more)

### Community 87 - "create-db-cli"
Cohesion: 0.18
Nodes (10): Command discovery (`--help`), Commands, Common patterns, create-db-cli, `create` options, Lifecycle and claim flow, Priority, Programmatic usage (library API) (+2 more)

### Community 88 - "api-basics"
Cohesion: 0.18
Nodes (10): api-basics, Base URL, Collection, Error codes by HTTP status, Error Responses, Pagination, Resource ID Prefixes, Response Envelope (+2 more)

### Community 89 - "Step-by-Step Guide to Deploying the Elajgar Project on cPanel"
Cohesion: 0.18
Nodes (11): Step 1: Confirm the Database Provider, Step 2: Prepare the cPanel Server for Next.js, Step 3: Build the Project on Your Computer, Step 4: Zip the Files for Upload, Step 5: Create a Database in cPanel, Step 6: Setup Node.js App in cPanel, Step 7: Upload the Files in cPanel, Step 8: Run Final Commands in cPanel Terminal (+3 more)

### Community 90 - "Elajgar (علاج‌گر)"
Cohesion: 0.18
Nodes (11): Before you go live, Check that everything is wired up, Deploying, Elajgar (علاج‌گر), Run Locally, Signing in, Tests, The admin panel (+3 more)

### Community 91 - "promote-admin.mjs"
Cohesion: 0.18
Nodes (9): args, clearPassword, env, positionals, prisma, remove, revoke, root (+1 more)

### Community 92 - "prisma format"
Cohesion: 0.20
Nodes (9): Behavior, Command, Examples, Format default schema, Format specific schema, Options, prisma format, Use in Editor (+1 more)

### Community 93 - "prisma migrate resolve"
Cohesion: 0.20
Nodes (9): Command, Examples, Mark as Applied (Baselining), Mark as Rolled Back (Fixing Failures), Options, prisma migrate resolve, References, Use Cases (+1 more)

### Community 94 - "prisma validate"
Cohesion: 0.20
Nodes (9): Command, Common Errors, Examples, Options, prisma validate, Use in CI, Validate default schema, Validate specific schema (+1 more)

### Community 95 - "CockroachDB Setup"
Cohesion: 0.20
Nodes (9): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, CockroachDB Setup, Common Issues, Driver Adapter, ID Generation, Prerequisites (+1 more)

### Community 96 - "decision-stay-or-migrate"
Cohesion: 0.20
Nodes (9): Bad, Blocker checks before migrating, decision-stay-or-migrate, Good, Priority, References, Stay-on-v6 hygiene, The facts the decision rests on (+1 more)

### Community 97 - "console-and-connections"
Cohesion: 0.20
Nodes (9): Adapter choices, Connection setup, console-and-connections, Console workflow, Linking an existing project, Local Studio, Priority, References (+1 more)

### Community 98 - "management-api-sdk"
Cohesion: 0.20
Nodes (9): Full SDK (OAuth + refresh), Install, management-api-sdk, OAuth SDK flow, Priority, References, Simple client (existing token), Why It Matters (+1 more)

### Community 100 - "prisma migrate status"
Cohesion: 0.22
Nodes (8): Check status, Command, Examples, Exit Codes, Options, prisma migrate status, What It Does, When to Use

### Community 101 - "Prisma Compute Config"
Cohesion: 0.22
Nodes (9): App Fields, Basic Shape, Database Scope, File Names and Discovery, Generating a Config with `init`, Monorepos and Multi-App Repos, Precedence, Prisma Compute Config (+1 more)

### Community 102 - "create-prisma Compute Flow"
Cohesion: 0.22
Nodes (9): Addon Notes, Basic Commands, create-prisma Compute Flow, Failure Handling, Generated Deploy Script, Generated Files to Preserve, PostgreSQL and Database Behavior, Reference (+1 more)

### Community 103 - "SDK and API Automation"
Cohesion: 0.22
Nodes (8): Compute SDK, Management API Concepts, Prefer the CLI for App Workflows, Regions, Repository-snapshot detection, SDK and API Automation, SDK Build Strategies, Secrets and Redaction

### Community 104 - "Quick Rules"
Cohesion: 0.22
Nodes (9): 1. Command Verification, 2. Auth and Workspace Selection, 3. Framework Readiness, 4. Runtime Host and Port Binding, 5. Typed Compute Config, 6. Branch, Environment, and Database, 7. Deploy Operations, 8. SDK and API (+1 more)

### Community 105 - "Prisma Compute"
Cohesion: 0.22
Nodes (9): Avoid, Decision Tree, Preferred Workflow, Prisma Compute, Prisma Compute CLI Surface, Rules by Priority, Send Feedback and Report CLI Issues, Source-of-Truth Order (+1 more)

### Community 106 - "migrations-mapping"
Cohesion: 0.22
Nodes (8): Bad, Good, migrations-mapping, Priority, Prisma Next: first-class, contract-driven migrations (Mongo included), References, v6: `db push` only, Why It Matters

### Community 107 - "schema-contract-mapping"
Cohesion: 0.22
Nodes (8): Bad, Environment requirements, Good, Priority, References, schema-contract-mapping, The mapping, Why It Matters

### Community 108 - "Prisma MongoDB Upgrade Path"
Cohesion: 0.22
Nodes (8): Decision table, Hand-off rule, If staying on v6: hygiene (a deliberate stay, not neglect), Prisma MongoDB Upgrade Path, Reference files, The decision, up front, The version landscape, Verified against

### Community 109 - "endpoints"
Cohesion: 0.22
Nodes (8): Create connection, Create project (with database), Delete database, Delete project, endpoints, Get database, List projects, List regions

### Community 110 - "prisma mcp"
Cohesion: 0.25
Nodes (7): Command, Notes, prisma mcp, References, Typical Use Cases, Usage, What It Does

### Community 111 - "client-api-mapping"
Cohesion: 0.25
Nodes (7): Bad, client-api-mapping, Good, Priority, References, The mapping, Why It Matters

### Community 112 - "Service Tokens"
Cohesion: 0.25
Nodes (7): auth, Creating a service token, OAuth 2.0 (for user-scoped access), Security practices, Service Tokens, Token scope, Using a service token

### Community 114 - "How to Upload and Run Elajgar on Your Webhost"
Cohesion: 0.25
Nodes (8): 1. What You Need Before Starting, 2. Build the Project on Your Computer, 3. Files to Upload, 4. Environment Variables, 6. Start the Application, 7. Updating Later, How to Upload and Run Elajgar on Your Webhost, Troubleshooting

### Community 115 - "palette.md"
Cohesion: 0.25
Nodes (7): 2024-07-09 - Added ARIA labels to icon-only buttons, 2026-10-22 - A headless browser without a visible window suspends requestAnimationFrame, 2026-10-22 - Every form error needs an id, a role and an aria-describedby, 2026-10-22 - Match body regions by bucket, not by label, 2026-10-22 - `role="img"` around a recharts chart is invalid ARIA, 2026-10-22 - The CSS reduced-motion rule does not reach Motion, 2026-10-22 - `type="number"` throws away Persian digits

### Community 116 - "doctor.mjs"
Cohesion: 0.25
Nodes (4): env, failed, results, root

### Community 117 - "generate-icons.mjs"
Cohesion: 0.25
Nodes (3): publicDir, root, source

### Community 118 - "liara-deploy.mjs"
Cohesion: 0.25
Nodes (6): engineDir, EXCLUDES, outDir, outFile, root, tarArgs

### Community 119 - "prisma debug"
Cohesion: 0.29
Nodes (6): Command, Example Output, Options, prisma debug, What It Does, When to Use

### Community 120 - "Prisma Client Setup"
Cohesion: 0.29
Nodes (6): 1. Install dependencies, 2. Add generator block, 3. Generate Prisma Client, 4. Instantiate Prisma Client, 5. Use a single instance, Prisma Client Setup

### Community 121 - "verify-cutover-checklist"
Cohesion: 0.29
Nodes (6): Checklist, Ground rules, Priority, References, verify-cutover-checklist, Why It Matters

### Community 122 - "Prisma 7 Client Instantiation"
Cohesion: 0.29
Nodes (6): Basic instantiation, Common mistakes, Key rules, Prisma 7 Client Instantiation, Required packages, Usage in application code

### Community 124 - "prisma.mjs"
Cohesion: 0.29
Nodes (4): child, env, prismaBin, root

### Community 127 - "split_values"
Cohesion: 0.47
Nodes (3): split_values(), style_identities(), TestStyleIdentityContract

### Community 130 - "CLAUDE.md"
Cohesion: 0.33
Nodes (4): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution

### Community 131 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (4): __dirname, __filename, eslint, eslint-config-next

### Community 133 - "Web Interface Guidelines"
Cohesion: 0.40
Nodes (4): Guidelines Source, How It Works, Usage, Web Interface Guidelines

### Community 135 - "AI safety checkpoint for destructive commands"
Cohesion: 0.50
Nodes (3): AI safety checkpoint for destructive commands, Reference, Required workflow

### Community 138 - "5. Database Setup"
Cohesion: 0.50
Nodes (4): Food, 5. Database Setup, Create an admin account, Seed the food database (optional but recommended)

## Knowledge Gaps
- **21 isolated node(s):** `@fontsource/vazirmatn`, `autoprefixer`, `class-variance-authority`, `postcss`, `react-dom` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1452 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `[id]/page.tsx`, `content/page.tsx`, `toPersianDigits`, `send-otp/route.ts`, `server.js`, `vitest`, `utils.ts`, `settings.ts`, `package.json`, `lucide-react`, `nutrition/page.tsx`, `user/route.ts`, `app/layout.tsx`, `PainHeatmap3D.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `@fontsource/vazirmatn`, `autoprefixer`, `class-variance-authority` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.05290636964845109 - nodes in this community are weakly interconnected._
- **Why does `Food` connect `5. Database Setup` to `content/page.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `content/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09272151898734177 - nodes in this community are weakly interconnected._
- **Should `validate_data.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06946386946386947 - nodes in this community are weakly interconnected._
- **Should `toPersianDigits` be split into smaller, more focused modules?**
  _Cohesion score 0.1196808510638298 - nodes in this community are weakly interconnected._