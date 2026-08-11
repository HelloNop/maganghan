# Project Rules — Sistem Absensi Anak Magang

## General

- Always refer to `PRD.md` at the project root before implementing any feature. The PRD is the source of truth for requirements, data model, and phases.
- This project uses **Bahasa Indonesia** for UI text/labels and **English** for all code: variable names, function names, comments, commit messages.
- Always use **Context7 MCP** when looking up library/API documentation, code generation patterns, setup or configuration steps. Do not rely on potentially outdated training data when Context7 can provide up-to-date docs.

## Tech Stack (Enforced)

| Component        | Choice                                       |
| ---------------- | -------------------------------------------- |
| Framework        | Next.js (App Router)                         |
| Language         | TypeScript (strict mode)                     |
| Database         | PostgreSQL (any provider: Supabase, Neon, Railway, etc.) |
| ORM              | Drizzle ORM                                  |
| Authentication   | Auth.js v5 (Credentials provider)            |
| Styling          | Tailwind CSS v4                              |
| Photo Storage    | Cloudinary                                   |
| Face Detection   | face-api.js or MediaPipe Face Detection      |
| Hosting          | Vercel                                       |

- Do NOT introduce Prisma or other ORMs. Use Drizzle ORM only.
- Do NOT use Pages Router. Always use App Router (`app/` directory).
- Do NOT use `any` type. Define proper types/interfaces for all data.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & layouts
│   ├── (auth)/           # Auth-related pages (login, change-password)
│   ├── (dashboard)/      # Protected pages
│   │   ├── admin/        # Admin-only pages
│   │   └── intern/       # Intern-only pages
│   └── api/              # API routes
├── components/           # Reusable React components
│   ├── ui/               # Base UI components (buttons, inputs, modals)
│   └── features/         # Feature-specific components (attendance, leave)
├── lib/                  # Shared utilities
│   ├── db/               # Drizzle schema, migrations, connection
│   │   ├── schema.ts     # Drizzle table definitions
│   │   ├── index.ts      # DB connection (PostgreSQL via Drizzle)
│   │   └── migrations/   # Drizzle migration files
│   ├── auth/             # Auth.js configuration
│   ├── validators/       # Zod schemas for input validation
│   └── utils/            # Helper functions
├── actions/              # Next.js Server Actions
└── types/                # Shared TypeScript type definitions
```

## Database & Drizzle

- Define all tables in `src/lib/db/schema.ts` using Drizzle's `pgTable`.
- Use Drizzle Kit for migrations (`drizzle-kit generate` and `drizzle-kit migrate`).
- Always use parameterized queries — never concatenate user input into SQL.
- Use `drizzle-zod` to generate Zod schemas from Drizzle tables for input validation.
- Use transactions for operations that modify multiple tables.

## App Settings (DB-driven)

- Configurable settings (jam masuk/keluar, koordinat kantor, radius GPS, nama instansi) are stored in the `app_settings` table, NOT in environment variables.
- Environment variables are reserved for **secrets and credentials only** (DB URL, Cloudinary keys, Auth secret).
- Use a utility function `getAppSetting(key)` to read settings from DB with caching (React `cache()` for per-request dedup).
- Admin can update settings via the admin dashboard (Fase 2). During Fase 1, settings are populated via seed script.

## Authentication & Authorization

- Auth is handled via Auth.js v5 with the Credentials provider.
- Passwords must be hashed with `bcrypt` (min 10 salt rounds).
- All protected routes must check session + role before rendering.
- Admin routes must verify `role === 'admin'` in middleware or server components.
- Implement `must_change_password` check: redirect to change-password page on first login.
- Accounts are created by Admin only — no self-registration.

## Security

- Never expose `service` or `admin` API keys to the client.
- Use `proxy.ts` (Next.js proxy convention) for route protection — not `middleware.ts` (deprecated in this version).
- Validate all user inputs with Zod on the server side, even if validated on the client.
- Use HTTPS in production (Vercel handles this).
- Implement rate limiting on auth endpoints.
- Store sensitive config (DB URL, Cloudinary keys, Auth secret) in environment variables only.

## Code Conventions

- Use `function` declarations for React components, not arrow functions.
- Use Server Components by default. Add `"use client"` only when needed (interactivity, hooks).
- Prefer Server Actions over API routes for data mutations.
- Use `async/await` over `.then()` chains.
- Handle errors explicitly — no silent catches. Use try/catch with meaningful error messages.
- Use `const` by default, `let` only when reassignment is necessary, never `var`.

## UI & Styling

- Use Tailwind CSS v4 for all styling. Do not write custom CSS unless absolutely necessary.
- Design must be mobile-responsive (attendance is used on phones).
- UI text and labels are in **Bahasa Indonesia**.
- Compress and resize photos client-side (max 800×800px, WebP format) before upload.
- Face detection runs client-side — disable submit button if no face detected.

## File Naming

- React components: `PascalCase.tsx` (e.g., `AttendanceForm.tsx`)
- Utilities/helpers: `camelCase.ts` (e.g., `formatDate.ts`)
- Drizzle schema: `schema.ts`
- Server Actions: `camelCase.ts` in `actions/` directory
- Types: `camelCase.ts` in `types/` directory
