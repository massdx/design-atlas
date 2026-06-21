# Design Atlas

A curated, open-source catalog of design resources and tools. Browse and
search a hand-picked collection, submit new resources, and manage everything
through an admin dashboard.

Built with the Next.js App Router, Drizzle ORM, and a PostgreSQL database.

## Features

- **Public catalog** — fast, searchable list of design resources, filterable by
  category and tags.
- **Public submissions** — anyone can submit a resource (with an optional email,
  or anonymously); admins review and approve it.
- **Admin manager** — auth-protected dashboard to approve/reject submissions,
  manage categories and their colors, manage tags, and invite other admins.
- **File storage** — resource cover images stored on S3-compatible storage,
  served through stable internal URLs backed by presigned links.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Server Actions) + React 19
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL ([Neon](https://neon.tech))
- [Neon Auth](https://neon.tech/docs/guides/neon-auth) for authentication
- S3-compatible storage ([Filebase](https://filebase.com) by default)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [motion](https://motion.dev/) for animations
- TypeScript, ESLint, Prettier

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- A PostgreSQL database (a free [Neon](https://neon.tech) project works great)
- A Neon Auth instance (for sign-in / admin access)
- An S3-compatible bucket (a free [Filebase](https://filebase.com) bucket works)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/massdx/design-atlas.git
cd design-atlas
pnpm install
```

### 2. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env.local
```

`.env.local` is gitignored — **never commit it**. See the table below for what
each variable does.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `NEON_AUTH_BASE_URL` | yes | Base URL of your Neon Auth instance. |
| `NEON_AUTH_COOKIE_SECRET` | yes | Secret to sign session cookies. Generate with `openssl rand -base64 32`. |
| `FILES_BASE_ACCESS_KEY` | yes | S3-compatible storage access key. |
| `FILES_BASE_SECRET` | yes | S3-compatible storage secret key. |
| `FILES_BASE_BUCKET` | yes | Storage bucket name. |
| `FILES_BASE_ENDPOINT` | no | Storage endpoint. Defaults to `https://s3.filebase.io`. |
| `FILES_BASE_REGION` | no | Storage region. Defaults to `auto`. |
| `NEXT_PUBLIC_SITE_URL` | no | Public site URL (sitemap, robots, metadata). |
| `SEED_ADMIN_EMAIL` | no | Email of the default admin created by `pnpm db:seed`. |
| `SEED_ADMIN_NAME` | no | Name of the default admin. |
| `SEED_COUNT` | no | Number of fake resources for `pnpm db:seed:fake`. |

### 3. Set up the database

Apply the schema to your database:

```bash
pnpm db:push
```

(Optionally) seed a default admin and some sample data:

```bash
pnpm db:seed        # creates the default admin (SEED_ADMIN_EMAIL)
pnpm db:seed:fake   # generates fake resources for local testing
```

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The admin manager lives at
`/manager`.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack). |
| `pnpm build` | Production build. |
| `pnpm start` | Run the production build. |
| `pnpm lint` | Run ESLint. |
| `pnpm format` | Format with Prettier. |
| `pnpm typecheck` | Type-check with `tsc`. |
| `pnpm db:generate` | Generate a Drizzle migration from schema changes. |
| `pnpm db:push` | Push the schema to the database. |
| `pnpm db:studio` | Open Drizzle Studio. |
| `pnpm db:seed` | Seed the default admin. |
| `pnpm db:seed:fake` | Seed fake resources. |

## Project structure

```text
app/            Next.js routes (public + admin manager + API)
components/     Shared UI (shadcn/ui + custom)
features/       Feature modules (auth, resources, categories, admins, …)
lib/            Database client, schema, utilities
drizzle/        SQL migrations and snapshots
```

## Security

- Never commit `.env.local` or any real credentials. `.env*.local`, `.vscode/`,
  `mcp.json`, and `*.pem` are already gitignored.
- If you discover a vulnerability, please **do not** open a public issue — see
  [SECURITY.md](SECURITY.md).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before
opening a pull request. The codebase evolves progressively — small, focused PRs
are preferred over large rewrites.

## License

Released under the [MIT License](LICENSE).
