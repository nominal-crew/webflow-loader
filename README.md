# Webflow Loader

Shared loader used by Nominal Crew Webflow projects.

The loader automatically selects the staging or production assets depending on the current hostname.

## CDN

The loader is served from:

```text
https://cdn.nominalcrew.com/loader.js
```

## Webflow integration

Add the following script to the Webflow project:

```html
<script src="https://cdn.nominalcrew.com/loader.js" data-project="project-slug"></script>
```

Example:

```html
<script src="https://cdn.nominalcrew.com/loader.js" data-project="abma"></script>
```

## Environment detection

Webflow staging domains automatically load the staging assets:

```text
*.webflow.io
→ staging
```

Custom domains automatically load production assets:

```text
example.com
→ production
```

## Force an environment

Force staging:

```text
https://www.example.com/?nc-env=staging
```

Force production:

```text
https://project.webflow.io/?nc-env=production
```

The override only applies to the current URL and is not persisted.

## Expected CDN structure

```text
cdn.nominalcrew.com/
├── loader.js
├── project-a/
│   ├── staging/
│   │   ├── main.js
│   │   └── main.css
│   └── production/
│       ├── main.js
│       └── main.css
└── project-b/
```

## Install

Install dependencies:

```bash
pnpm install
```

If pnpm asks you to approve dependency build scripts:

```bash
pnpm approve-builds
```

Approve the required packages, then run:

```bash
pnpm install
```

## Cloudflare authentication

```bash
pnpm exec wrangler login
```

## Fix

Automatically fixes ESLint issues where possible and formats the project with Prettier.

```bash
pnpm fix
```

## Check

Runs ESLint and checks that all files are correctly formatted.

```bash
pnpm check
```

## Format

Formats the entire project with Prettier.

```bash
pnpm format
```

## Deploy

Formats and fixes the project, validates it, then uploads the loader to Cloudflare R2.

```bash
pnpm deploy
```

The deploy command runs:

```text
pnpm fix
→ pnpm check
→ upload to R2
```

It uploads:

```text
src/loader.js
```

to:

```text
nominalcrew-cdn/loader.js
```

Public URL:

```text
https://cdn.nominalcrew.com/loader.js
```
