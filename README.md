# CloudPulse

NestJS task-management API with JWT authentication, role-based access control (RBAC), PostgreSQL, and Docker Compose.

> Status: early backend MVP. Auth, users, tasks, and health are implemented. Notifications / Azure integrations described in older drafts are **not** shipped yet.

## Features

- JWT register / login / profile
- RBAC (`admin`, `manager`, `member`) via `RolesGuard`
- Task CRUD with owner scoping
- Admin/manager user management
- Health check (`/api/health`)
- Swagger docs in non-production (`/api/docs`)
- Helmet, rate limiting, validation whitelist
- Docker Compose for local and production-style stacks

## Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 20, TypeScript |
| Framework | NestJS 11 |
| Database | PostgreSQL + TypeORM |
| Auth | Passport JWT, bcrypt |
| Docs | OpenAPI / Swagger |
| Containers | Docker, Docker Compose |

## Quick start

### Prerequisites

- Node.js 20+
- Docker (recommended) **or** a local PostgreSQL instance

### 1. Configure environment

```bash
cp .env.example .env
```

Set a strong `JWT_SECRET` before any shared or production use.

### 2. Run with Docker Compose

```bash
docker compose up --build -d
```

- API: `http://localhost:5000/api`
- Swagger: `http://localhost:5000/api/docs`
- Health: `http://localhost:5000/api/health`

Production-style (DB not published; requires real secrets in `.env`):

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### 3. Run locally (without Docker for the API)

```bash
npm install
npm run start:dev
```

Point `DATABASE_*` in `.env` at a reachable Postgres instance.

## API overview

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/profile` | Authenticated |
| `CRUD` | `/api/users` | Admin / Manager (create & delete: Admin) |
| `CRUD` | `/api/tasks` | Authenticated (owner-scoped) |
| `GET` | `/api/health` | Public |

Send `Authorization: Bearer <token>` for protected routes.

## Scripts

```bash
npm run start:dev   # watch mode
npm run build       # compile
npm run start:prod  # run dist
npm test            # unit tests
npm run test:cov    # coverage
npm run lint        # eslint
```

## Security notes

- Never commit `.env` (gitignored)
- Use a long random `JWT_SECRET` in any shared environment
- `synchronize` is **disabled in production** — use migrations before going live with real data
- Swagger is disabled when `NODE_ENV=production`
- Passwords are hashed with bcrypt and never returned in API responses
- Global rate limiting and Helmet headers are enabled
- `npm overrides` pin patched `multer` / `js-yaml`; run `npm audit --omit=dev` before releases (TypeORM still pulls a few **moderate** transitive advisories with no non-breaking fix yet)

See [SECURITY.md](SECURITY.md) for reporting issues.

## Project layout

```text
src/
├── common/           # filters, interceptors, enums
├── config/           # env config factories
├── modules/
│   ├── auth/         # JWT auth + RBAC guards
│   ├── users/        # user management
│   ├── tasks/        # task CRUD
│   └── health/       # liveness / DB ping
├── app.module.ts
└── main.ts
```

## Repository

- GitHub: [imrahimar/cloudpulse](https://github.com/imrahimar/cloudpulse)

Clone:

```bash
git clone https://github.com/imrahimar/cloudpulse.git
cd cloudpulse
```

Or with SSH:

```bash
git clone git@github.com:imrahimar/cloudpulse.git
cd cloudpulse
```

## License

MIT — see [LICENSE](LICENSE).
