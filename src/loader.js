(() => {
  const CDN_ORIGIN = 'https://cdn.nominalcrew.com';
  const STORAGE_KEY = 'nc-env';
  const ENVIRONMENTS = new Set(['dev', 'staging', 'production']);

  const currentScript = document.currentScript;
  const project = currentScript?.dataset.project?.trim();

  if (!project) {
    console.error('[Nominal Crew] Missing data-project on loader script.');
    return;
  }

  const jsFile = currentScript.dataset.js?.trim() || 'bundle.js';
  const cssFile = currentScript.dataset.css?.trim() || 'bundle.css';
  const devOrigin = (currentScript.dataset.devOrigin?.trim() || 'https://localhost:3000').replace(
    /\/$/,
    '',
  );
  const devEntry = currentScript.dataset.devEntry?.trim() || '/src/js/main.js';

  const params = new URLSearchParams(window.location.search);
  const forcedEnvironment = params.get('nc-env');

  try {
    if (forcedEnvironment === 'off') {
      sessionStorage.removeItem(STORAGE_KEY);
    } else if (ENVIRONMENTS.has(forcedEnvironment)) {
      sessionStorage.setItem(STORAGE_KEY, forcedEnvironment);
    }
  } catch {
    // Private mode can block sessionStorage.
  }

  let storedEnvironment = null;

  try {
    storedEnvironment = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    storedEnvironment = null;
  }

  const isWebflowStaging = window.location.hostname.endsWith('.webflow.io');
  let environment = isWebflowStaging ? 'staging' : 'production';

  if (forcedEnvironment !== 'off') {
    if (ENVIRONMENTS.has(forcedEnvironment)) {
      environment = forcedEnvironment;
    } else if (ENVIRONMENTS.has(storedEnvironment)) {
      environment = storedEnvironment;
    }
  }

  function assetUrl(environmentName, file) {
    return `${CDN_ORIGIN}/${project}/${environmentName}/${file}`;
  }

  function isProjectStylesheet(link) {
    try {
      const url = new URL(link.href, document.baseURI);

      if (url.origin !== CDN_ORIGIN) {
        return false;
      }

      const parts = url.pathname.split('/').filter(Boolean);

      return parts[0] === project && parts[2] === cssFile;
    } catch {
      return false;
    }
  }

  function projectStylesheets() {
    return [...document.querySelectorAll('link[rel="stylesheet"]')].filter(isProjectStylesheet);
  }

  function markAsset(element, asset) {
    element.dataset.ncAsset = asset;
    element.dataset.ncProject = project;
    element.dataset.ncEnvironment = environment;
  }

  function onAssetError(element, label) {
    element.addEventListener('error', () => {
      console.error(`[Nominal Crew] Failed to load ${label}: ${element.href || element.src}`);
    });
  }

  function disableProjectStylesheets() {
    projectStylesheets().forEach((link) => {
      link.disabled = true;
      markAsset(link, 'css');
    });
  }

  function applyStylesheet(environmentName) {
    const href = assetUrl(environmentName, cssFile);
    const existing = projectStylesheets();
    const stylesheet = existing[0] || document.createElement('link');

    if (!stylesheet.rel) {
      stylesheet.rel = 'stylesheet';
    }

    stylesheet.disabled = false;
    markAsset(stylesheet, 'css');
    onAssetError(stylesheet, 'stylesheet');

    if (stylesheet.href !== href) {
      stylesheet.href = href;
    }

    if (!stylesheet.isConnected) {
      document.head.appendChild(stylesheet);
    }

    existing.slice(1).forEach((link) => {
      link.disabled = true;
    });
  }

  if (environment === 'dev') {
    disableProjectStylesheets();

    const entryPath = devEntry.startsWith('/') ? devEntry : `/${devEntry}`;

    const viteClient = document.createElement('script');
    viteClient.type = 'module';
    viteClient.src = `${devOrigin}/@vite/client`;
    markAsset(viteClient, 'vite-client');
    onAssetError(viteClient, 'Vite client');

    const script = document.createElement('script');
    script.type = 'module';
    script.src = `${devOrigin}${entryPath}`;
    markAsset(script, 'js');
    onAssetError(script, 'script');
    script.addEventListener('error', () => {
      console.error('[Nominal Crew] Local Vite is not running. Start it with `pnpm dev`.');
    });

    document.head.appendChild(viteClient);
    document.head.appendChild(script);

    console.log(`[Nominal Crew] ${project} → ${environment} (${devOrigin})`);
    return;
  }

  applyStylesheet(environment);

  const script = document.createElement('script');
  script.src = assetUrl(environment, jsFile);
  script.defer = true;
  markAsset(script, 'js');
  onAssetError(script, 'script');
  document.head.appendChild(script);

  console.log(`[Nominal Crew] ${project} → ${environment}`);
})();
