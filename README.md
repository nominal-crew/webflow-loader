# Webflow Loader

Tiny script included in every Nominal Crew Webflow site. It is the only custom-code snippet the site needs: it chooses which JS and CSS to load.

It does not build or upload project assets. That is [`webflow-relay`](../webflow-relay) inside each site repo (see [`webflow-starter`](../webflow-starter)).

## What it does

On every full page load it:

1. Reads `data-project` (required).
2. Picks an environment:
   - `?nc-env=dev|staging|production` wins, and is stored in `sessionStorage` for the tab
   - `?nc-env=off` clears that override
   - otherwise `*.webflow.io` → staging, custom domain → production
3. Injects the matching files.

| Environment    | Source                                                                      |
| -------------- | --------------------------------------------------------------------------- |
| **dev**        | Vite on `https://localhost:3000` (`@vite/client` + `/src/js/main.js`)       |
| **staging**    | `https://cdn.nominalcrew.com/{project}/staging/bundle.css` + `bundle.js`    |
| **production** | `https://cdn.nominalcrew.com/{project}/production/bundle.css` + `bundle.js` |

Dev has no separate CSS file: Vite serves CSS through the JS entry. Staging and production are the files uploaded by `webflow-relay deploy`.

## Webflow setup

Site Settings → Custom Code → Head. One script, no direct links to `bundle.js` / `bundle.css`:

```html
<script src="https://cdn.nominalcrew.com/loader.js" data-project="your-project-slug"></script>
```

`data-project` must match `name` in the site `webflow.config.js` (the R2 folder). Example: `data-project="abma"` loads `cdn.nominalcrew.com/abma/staging/…`.

Publish the Webflow site after adding the snippet.

Optional attributes (defaults shown):

```html
<script
  src="https://cdn.nominalcrew.com/loader.js"
  data-project="abma"
  data-js="bundle.js"
  data-css="bundle.css"
  data-dev-origin="https://localhost:3000"
  data-dev-entry="/src/js/main.js"
></script>
```

## Force an environment

```text
https://project.webflow.io/?nc-env=dev
https://www.example.com/?nc-env=staging
https://project.webflow.io/?nc-env=production
https://project.webflow.io/?nc-env=off
```

`nc-env=dev` only works while `pnpm dev` is running in the site repo. If Vite is down, the console tells you to start it.

The query is kept in `sessionStorage` until the tab closes or you use `nc-env=off`.

## CDN layout

```text
cdn.nominalcrew.com/
├── loader.js                  ← this package
├── project-a/
│   ├── staging/bundle.js      ← site repo, deploy staging
│   ├── staging/bundle.css
│   ├── production/bundle.js   ← site repo, deploy production
│   └── production/bundle.css
└── project-b/
```

## Work in this repo

Change `src/loader.js` only when the loading rules themselves change (new env, new filenames, new Vite origin). Site CSS/JS never lands here.

### 1. Install

```bash
pnpm install
```

If pnpm asks to approve build scripts:

```bash
pnpm approve-builds
pnpm install
```

### 2. Log in to Cloudflare (once)

```bash
pnpm exec wrangler login
```

### 3. Check

```bash
pnpm fix      # ESLint --fix + Prettier
pnpm check    # ESLint + Prettier check
```

### 4. Deploy

Builds a minified `dist/loader.js` and uploads it to R2:

```bash
pnpm deploy:loader
```

That runs `fix` → `check` → esbuild → upload to `nominalcrew-cdn/loader.js`.

Public URL:

```text
https://cdn.nominalcrew.com/loader.js
```

Every Webflow site that uses this URL picks up the new loader after a hard refresh. Deploy this **before** relying on `?nc-env=dev` on an already-published site.
