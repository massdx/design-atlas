# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability, please **do not open a public issue**.

Instead, report it privately through GitHub's
[private vulnerability reporting](https://github.com/massdx/design-atlas/security/advisories/new)
or by contacting the maintainer directly.

Please include:

- A description of the vulnerability and its potential impact.
- Steps to reproduce it.
- Any relevant logs or proof-of-concept (without exposing real user data).

We will acknowledge your report as soon as possible and keep you informed about
the fix.

## Handling secrets

This project relies on environment variables for all credentials
(database, auth, storage). Never commit real secrets. The following are already
gitignored:

- `.env*.local`
- `.vscode/`
- `mcp.json`
- `*.pem`

If a secret is ever committed by mistake, rotate it immediately and remove it
from the git history.
