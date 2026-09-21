# Webflow Loader

Tiny script included in every Nominal Crew Webflow site. It chooses which JS to load, and retargets the Head CSS `<link>` when the page is not staging.

It does not build or upload project assets. That is [`@nominalcrew/webflow-kit`](https://www.npmjs.com/package/@nominalcrew/webflow-kit) inside each site repo (see [`webflow-starter`](../webflow-starter)).

## What it does

On every full page load it:

1. Reads `data-project` (required).
2. Picks an environment:
   - `?nc-env=dev|staging|production` wins, and is stored in `sessionStorage` for the tab
   - `?nc-env=off` clears that override
   - otherwise `*.webflow.io` → staging, custom domain → production
3. Applies CSS and JS for that environment.

Webflow custom code is the same in the Designer, on `*.webflow.io`, and on the custom domain. The Designer does not run this script, so CSS in the canvas has to be a static `<link>` — always the **staging** file.

| Environment    | CSS                                                                   | JS                                                             |
| -------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- |
| **canvas**     | Head `<link>` to staging (this script does not run)                   | none                                                           |
| **dev**        | disables that `<link>`; Vite injects CSS through the JS entry         | `@vite/client` + `/src/js/main.js` on `https://localhost:3000` |
| **staging**    | leaves the staging `<link>` as-is                                     | `{cdn}/{project}/staging/bundle.js`                            |
| **production** | rewrites the `<link>` href to `{cdn}/{project}/production/bundle.css` | `{cdn}/{project}/production/bundle.js`                         |

If the staging `<link>` is missing (old snippet), the loader injects the environment CSS itself so published pages still get a stylesheet.

## Webflow setup

Site Settings → Custom Code → Head. Staging CSS first, then the loader. Do not add `bundle.js`:

```html
<link rel="stylesheet" href="https://cdn.nominalcrew.com/your-project-slug/staging/bundle.css" />
<script src="https://cdn.nominalcrew.com/loader.js" data-project="your-project-slug"></script>
```

`data-project` must match `name` in the site `webflow.config.js` (the R2 folder). Example: `data-project="abma"` uses `cdn.nominalcrew.com/abma/staging/…`.

The `<link>` must come **before** the script so the loader can find it. Publish the Webflow site after adding the snippet.

A CSS save is visible in the canvas only after that staging file is uploaded. Production CSS does not change until `deploy:production`.

Optional attributes (defaults shown):

```html
<link rel="stylesheet" href="https://cdn.nominalcrew.com/abma/staging/bundle.css" />
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

`nc-env=production` on `*.webflow.io` also switches the Head `<link>` to production CSS. `nc-env=staging` on a custom domain leaves (or restores) the staging stylesheet.

The query is kept in `sessionStorage` until the tab closes or you use `nc-env=off`.

## CDN layout

```text
cdn.nominalcrew.com/
├── loader.js                  ← this package
├── project-a/
│   ├── staging/bundle.js      ← site repo, deploy staging
│   ├── staging/bundle.css     ← Head <link> + canvas
│   ├── production/bundle.js   ← site repo, deploy production
│   └── production/bundle.css  ← loader rewrites the <link> here
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

Every Webflow site that uses this URL picks up the new loader after a hard refresh. Deploy this **before** relying on `?nc-env=dev` or production CSS switching on an already-published site.
