# Security Policy

## Supported versions

This project is an early MVP. Security fixes are applied on the default branch.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems.

Email the maintainer privately (or use GitHub Security Advisories if enabled) with:

- Description of the issue
- Steps to reproduce
- Impact assessment if known

You should receive an acknowledgement within a few days.

## Hardening checklist for operators

- Set a unique, high-entropy `JWT_SECRET`
- Set `NODE_ENV=production`
- Set explicit `CORS_ORIGIN` (comma-separated allowlist)
- Do not expose PostgreSQL ports publicly
- Prefer migrations over `synchronize` for production data
- Keep dependencies updated (`npm audit`, Dependabot)
