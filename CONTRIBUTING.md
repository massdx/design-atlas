# Contributing to Design Atlas

Thanks for your interest in contributing! This project grows progressively, so
small, focused changes are easier to review and merge than large rewrites.

## Getting set up

Follow the [Getting started](README.md#getting-started) section of the README to
install dependencies and configure your local environment.

## Before opening a pull request

Make sure the project is clean:

```bash
pnpm typecheck   # no type errors
pnpm lint        # no lint errors
pnpm format      # consistent formatting
```

## Guidelines

- **Keep PRs small and focused.** One feature or fix per PR.
- **Write clear commit messages.** Conventional Commits style is appreciated
  (e.g. `feat:`, `fix:`, `chore:`).
- **Don't commit secrets.** Never add real credentials or commit `.env.local`.
- **Database changes** go through Drizzle: edit `lib/db/schema.ts`, then run
  `pnpm db:generate` to create a migration, and `pnpm db:push` to apply it.
- **Match the existing style.** Avoid unrelated refactors in a feature PR.

## Reporting bugs

Open an issue describing the problem, the steps to reproduce it, and what you
expected to happen. Screenshots help for UI issues.

## Security

Please report security issues privately — see [SECURITY.md](SECURITY.md). Do not
open a public issue for vulnerabilities.
