# LSIH E-Learning — Frontend (Next.js)

Next.js frontend for the LSIH E-Learning platform MVP.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS

## Requirements

- Node.js 20+
- npm

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Environment
cp .env.example .env.local

# 3. Run frontend
pnpm run dev
```

App URL: `http://localhost:3000`

API expected at: `http://localhost:8000/api/v1` (see backend README)

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Laravel API base (`http://localhost:8000/api/v1`) |
| `NEXT_PUBLIC_APP_NAME` | Display name |

## Project layout (Phase 1+)

```text
src/
  app/                 # App Router pages
  components/          # UI / feature components
  lib/api/             # API client helpers
  types/               # Shared TypeScript types
  hooks/               # Client hooks
```

## Static demo login (UI only)

Password for all accounts: `password123`

| Role | Email |
|------|-------|
| Student | `student@lsih.demo` |
| Admin | `admin@lsih.demo` |
| Super Admin | `superadmin@lsih.demo` |

Course structure in the UI:

```text
Course
 ├── Module(s)
 │   ├── Lesson(s): video | pdf
 │   └── Module quiz (end of module)
 └── Course quiz (end of course)
```

## Phase status

- [x] Phase 1 — Project setup
- [x] Frontend UI shell + static role login (mock data)
- [ ] Phase 2 — (backend) Database + migrations
- [ ] Phase 3 — Authentication + roles
