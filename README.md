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
<script
  src="https://cdn.nominalcrew.com/loader.js"
  data-project="project-slug"
></script>
```

Example:

```html
<script
  src="https://cdn.nominalcrew.com/loader.js"
  data-project="abma"
></script>
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

```bash
pnpm install
```

## Cloudflare authentication

```bash
pnpm exec wrangler login
```

## Check

```bash
pnpm check
```

## Format

```bash
pnpm format
```

## Deploy

```bash
pnpm deploy
```

The deploy command uploads:

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
