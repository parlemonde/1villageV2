# AGENTS.md

## Project Overview

`1VillageV2` is a Next.js App Router rewrite of the original 1Village platform.

The product connects classrooms from different countries inside shared "villages" (virtual rooms / world villages). A village usually contains classrooms from 2 countries, but the data model supports more. Teachers and students interact through activities, while admins and mediators moderate the experience, manage villages/classrooms/users, and can also publish content as `Pelico`.

Main roles:

- `admin`: full back-office access
- `mediator`: moderation and village-level access
- `teacher`: classroom owner and main classroom-facing user
- `parent`: family login flow

## Stack And Tooling

- Next.js 16 App Router
- React 19
- TypeScript with `strict: true`
- `pnpm` package manager
- Drizzle ORM with PostgreSQL
- `better-auth` for auth/session management
- `next-intl` for translations
- SWR for client-side data fetching/caching
- Radix UI primitives plus custom UI components
- ProseMirror-based rich text editor
- H5P integration for interactive content
- Optional AWS S3 + DynamoDB integrations
- OpenTelemetry instrumentation in production

Runtime and infra notes:

- Local development uses `docker-compose.yml` for PostgreSQL, DynamoDB Local, and the local video transcoding lambda.
- The app supports local file storage and S3. The switch is handled centrally in `src/server/files/file-upload.ts`.
- Environment variables are centralized in `src/server/lib/get-env-variable.ts`. Do not introduce direct `process.env.FOO` reads when a shared accessor already exists.

## Common Commands

- `pnpm dev`: start Next.js and local services together
- `pnpm dev:next`: start only the Next.js app
- `pnpm dev:services`: start Docker services only
- `pnpm db:migrate`: run Drizzle migrations and seed the default admin/language locally
- `pnpm lint`: run ESLint
- `pnpm typecheck`: generate Next types and run TypeScript
- `pnpm i18n:extract`: extract translation keys

## Root Files Worth Knowing

- `package.json`: scripts, dependencies, Node version via Volta
- `next.config.ts`: SVG/raw asset loading, `next-intl`, standalone output
- `drizzle.config.ts`: Drizzle schema and migration output
- `docker-compose.yml`: local PostgreSQL, DynamoDB, lambda watcher
- `eslint.config.mjs`: important custom rules for import boundaries and i18n usage
- `server-transcode-videos/`: Rust lambda used for video transcoding

## Directory Guide

### `src/app`

Route entrypoints using the App Router.

- `src/app/(1village)`: main authenticated village experience
- `src/app/(1village)/(activities)`: multi-step activity creation flows
- `src/app/admin`: admin back office
- `src/app/login`: login flows
- `src/app/api`: server endpoints used by the UI and integrations
- `src/app/media`: media streaming/file serving routes

### `src/frontend`

Client-facing UI and browser-side logic.

- `components/ui`: reusable design-system-like primitives
- `components/activities`: activity cards, activity views, filters, timers, etc.
- `components/content`: structured content editors/viewers
- `components/html`: ProseMirror editor/viewer
- `components/upload`: image/audio/video/document/H5P upload flows
- `components/worldMaps`: 2D and 3D village world maps
- `contexts`: `UserContext`, `VillageContext`, `ActivityContext`
- `hooks`: custom browser hooks
- `lib`: lightweight frontend utilities

### `src/server`

Server-only code.

- `database`: Drizzle connection, migrations, schemas
- `entities`: read-side helpers around domain entities
- `helpers`: current-user and current-village resolution
- `lib`: auth, logging, env access, crypto, shared server utilities
- `files`: local/S3 file abstraction
- `aws`: DynamoDB/S3/AWS client helpers
- `h5p`: H5P runtime/editor integration
- `i18n`: locale/message loading

### `src/server-actions`

Write-side mutations invoked from the UI.

Examples:

- auth login/logout
- create/update/delete villages
- create/update/delete classrooms
- publish/save/update/delete activities
- post/update/delete comments
- media upload helpers

### `src/lib`

Cross-runtime utilities that can be shared safely between frontend/server layers.

## Architectural Patterns

### 1. Keep Layer Boundaries Clean

This repo enforces import boundaries in ESLint.

- `src/frontend` may import runtime code from `@frontend/*` and `@lib/*`, but only types from `@server/*` or `@app/*`
- `src/server` may not depend on frontend runtime code
- `src/server-actions` may not depend on frontend runtime code
- Use path aliases: `@app`, `@frontend`, `@lib`, `@server`, `@server-actions`

If you cross a layer boundary, expect ESLint to fail.

### 2. Server Components Load Context, Client Components Interact

Typical flow:

1. a server layout/page calls `getCurrentUser()`
2. village-aware pages resolve the current village/classroom with `getCurrentVillageAndClassroomForUser()`
3. providers are mounted in layouts
4. client components fetch village-scoped data with SWR from `/api/*`
5. writes happen through server actions in `src/server-actions/*`

Important layouts:

- `src/app/layout.tsx`: global providers, fonts, toasts, `next-intl`
- `src/app/(1village)/layout.tsx`: authenticated village shell
- `src/app/admin/layout.tsx`: authenticated admin shell

### 3. Prefer Existing Read/Write Paths

Before adding a new data access pattern, check whether the repo already has:

- a read endpoint in `src/app/api/*`
- a mutation in `src/server-actions/*`
- an entity/helper in `src/server/entities/*` or `src/server/helpers/*`

Match the existing pattern instead of introducing a parallel one.

### 4. Activity System Is The Core Domain

Activities live in `src/server/database/schemas/activities.ts` and are typed by `src/server/database/schemas/activity-types.ts`.

Current activity families include:

- `libre`
- `defi`
- `jeu`
- `enigme`
- `indice`
- `reportage`
- `histoire`
- `mascotte`
- `question`

Rendering is centralized:

- card/preview rendering in `src/frontend/components/activities/ActivityCard`
- full rendering in `src/frontend/components/activities/ActivityView`

If you add or change an activity type, check all of these places:

- DB type definitions
- card renderer
- full activity renderer
- creation flow pages under `src/app/(1village)/(activities)`
- filters/API endpoints
- admin phase/activity configuration

### 5. Village Context Matters

The selected village is not resolved the same way for every role:

- teachers get their village from their classroom
- admins/mediators use the `villageId` cookie
- `setVillage` server action updates that cookie

When changing village-scoped behavior, verify which roles are affected.

## Domain Model Notes

Important tables:

- `users`: auth-managed users with role
- `villages`: village metadata, country list, active phase, phase start dates, classroom counts
- `classrooms`: school/classroom identity, teacher owner, location, country, village
- `activities`: all user and Pelico content, drafts, publication state, responses/parent links
- `comments`: activity comments using rich text JSON content
- `languages`: enabled UI locales
- `medias`: uploaded media linked to activities

Important relationships:

- a teacher owns a classroom
- a classroom may belong to a village
- an activity belongs to a user and may belong to a classroom and village
- Pelico content is modeled through activity/media flags rather than a separate user type

## i18n Rules

This repo does not want plain `useTranslations` / `getTranslations`.

Use:

- `useExtracted(...)` in client components
- `getExtracted(...)` in server code

Messages are loaded from:

- default extracted English messages in `src/server/i18n/messages`
- locale overrides stored in DynamoDB

Locale is driven by a cookie in `src/server/i18n/request.ts`.

## Content And Editor Rules

- Rich text content is stored as ProseMirror JSON, not raw HTML strings
- Reuse `HtmlEditor`, `HtmlViewer`, `ContentEditor`, and `ContentViewer` instead of inventing new editors/renderers
- Many activity payloads embed `AnyContent[]`; preserve those existing shapes when extending features

## Auth And Permissions

- Use `getCurrentUser()` for authenticated server access
- API routes usually return `401` when no session exists
- Admin-only pages enforce `user.role === 'admin'`
- Do not trust client state alone for permissions

Better Auth is wired through:

- `src/server/lib/auth.ts`
- `src/app/api/auth/[...all]/route.ts`

## Media, Uploads, And H5P

- Media library APIs live under `src/app/api/media-library`, `src/app/api/medias`, and file-serving routes under `src/app/media`
- Upload helpers live in `src/server-actions/file-upload/*` and `src/frontend/components/upload/*`
- H5P support spans `src/app/admin/create/h5p`, `src/frontend/components/h5p`, and `src/server/h5p`

If you touch uploads or media URLs, trace the full path:

1. client upload UI
2. server action
3. `src/server/files/file-upload.ts`
4. local or S3 implementation
5. media-serving route

## Conventions To Preserve

- Use existing UI primitives from `src/frontend/components/ui` before creating new ones
- Reuse SWR + `jsonFetcher` + `serializeToQueryUrl` for client data fetching
- Keep server action return shapes consistent with `ServerActionResponse`
- Prefer small typed helpers over duplicating inline parsing logic
- Use `getEnvVariable()` for env access
- Keep imports on aliases rather than long relative paths
- Match existing CSS Module usage

Formatting conventions already in the repo:

- Prettier uses single quotes, trailing commas, 4-space tabs, 150-char print width

## When Editing Database Or Domain Logic

If you change a schema in `src/server/database/schemas/*`:

1. generate a Drizzle migration
2. check related API routes and server actions
3. check corresponding client forms/views
4. verify auth/role assumptions

Be especially careful with:

- activity JSON payload compatibility
- user roles
- village/classroom relationships
- phase-dependent behavior

## When Editing Activity Flows

The multi-step creators under `src/app/(1village)/(activities)` often use:

- `page.tsx` step screens
- `helpers.tsx`
- `validators.tsx`
- preview/success pages

Do not update only one step if the saved draft, preview, and publish flow also rely on the same data shape.

## Verification Guidance

There is no dedicated automated test script configured in `package.json` right now.

Minimum validation after non-trivial changes:

- `pnpm lint`
- `pnpm typecheck`

Useful manual smoke tests:

- login as admin and as teacher
- switch village as admin/mediator
- create/edit/publish an activity
- open an activity detail page and comments
- verify uploads when touching media code
- verify translations when touching i18n keys

## Good First Places To Read

If you are new to the codebase, start here:

- `src/app/layout.tsx`
- `src/app/(1village)/layout.tsx`
- `src/app/admin/layout.tsx`
- `src/server/helpers/get-current-user.ts`
- `src/server/helpers/get-current-village-and-classroom.ts`
- `src/server/database/schemas/activities.ts`
- `src/server/database/schemas/activity-types.ts`
- `src/frontend/components/activities/ActivityView/ActivityView.tsx`
- `src/frontend/components/activities/ActivityCard/ActivityCard.tsx`

## Practical Advice For Future Agents

- Read the existing route, API handler, and server action for the feature area before changing anything
- Assume village scoping and role scoping are important unless proven otherwise
- Preserve Pelico behavior when working on admin/mediator content
- Prefer extending existing activity/content abstractions over introducing one-off data shapes
- Avoid bypassing the established auth, i18n, upload, or DB helper layers
