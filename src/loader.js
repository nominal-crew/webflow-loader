(() => {
  const CDN_ORIGIN = 'https://cdn.nominalcrew.com';

  const currentScript = document.currentScript;
  const project = currentScript?.dataset.project?.trim();

  if (!project) {
    console.error('[Nominal Crew] Missing data-project on loader script.');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const forcedEnvironment = params.get('nc-env');

  const isWebflowStaging = window.location.hostname.endsWith('.webflow.io');

  let environment = isWebflowStaging ? 'staging' : 'production';

  if (forcedEnvironment === 'staging' || forcedEnvironment === 'production') {
    environment = forcedEnvironment;
  }

  const baseUrl = `${CDN_ORIGIN}/${project}/${environment}`;

  const stylesheet = document.createElement('link');

  stylesheet.rel = 'stylesheet';
  stylesheet.href = `${baseUrl}/main.css`;
  stylesheet.dataset.ncAsset = 'css';
  stylesheet.dataset.ncProject = project;
  stylesheet.dataset.ncEnvironment = environment;

  const script = document.createElement('script');

  script.src = `${baseUrl}/main.js`;
  script.defer = true;
  script.dataset.ncAsset = 'js';
  script.dataset.ncProject = project;
  script.dataset.ncEnvironment = environment;

  stylesheet.addEventListener('error', () => {
    console.error(`[Nominal Crew] Failed to load stylesheet: ${stylesheet.href}`);
  });

  script.addEventListener('error', () => {
    console.error(`[Nominal Crew] Failed to load script: ${script.src}`);
  });

  document.head.appendChild(stylesheet);
  document.head.appendChild(script);

  console.log(`[Nominal Crew] ${project} → ${environment}`);
})();
