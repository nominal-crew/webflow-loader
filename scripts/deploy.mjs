import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const BUCKET = 'nominalcrew-cdn';
const LOCAL_FILE = resolve('src/loader.js');
const REMOTE_KEY = 'loader.js';

console.log('Deploying Nominal Crew Webflow loader...');

const result = spawnSync(
  'pnpm',
  [
    'exec',
    'wrangler',
    'r2',
    'object',
    'put',
    `${BUCKET}/${REMOTE_KEY}`,
    '--file',
    LOCAL_FILE,
    '--remote',
    '--content-type',
    'application/javascript; charset=utf-8',
    '--cache-control',
    'no-cache',
  ],
  {
    stdio: 'inherit',
    shell: false,
  },
);

if (result.status !== 0) {
  console.error('Loader deployment failed.');
  process.exit(result.status ?? 1);
}

console.log('Loader deployed successfully.');
console.log('https://cdn.nominalcrew.com/loader.js');
