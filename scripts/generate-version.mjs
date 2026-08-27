import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));
const outputPath = resolve(rootDir, 'src/generated/version.ts');

function readGitValue(command, fallback) {
  try {
    return execSync(command, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return fallback;
  }
}

const generatedAt = new Date().toISOString();
const commit = readGitValue('git rev-parse --short HEAD', 'local');
const buildNumber = readGitValue('git rev-list --count HEAD', generatedAt.replace(/[-:TZ.]/g, '').slice(0, 14));
const version = packageJson.version || '0.0.0';
const buildDate = new Date();
const pad = value => String(value).padStart(2, '0');
const buildStamp = `${buildDate.getUTCFullYear()}${pad(buildDate.getUTCMonth() + 1)}${pad(buildDate.getUTCDate())}.${pad(buildDate.getUTCHours())}${pad(buildDate.getUTCMinutes())}`;
const display = `v${version}.${buildNumber}`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  `export const APP_VERSION = ${JSON.stringify(
    {
      version,
      buildNumber,
      buildStamp,
      commit,
      generatedAt,
      display,
      buildDisplay: `build ${buildStamp}`,
      fullDisplay: `${display} (build ${buildStamp})`,
    },
    null,
    2
  )} as const;\n`,
  'utf8'
);

console.log(`Generated app version ${version}.${buildNumber} (${commit})`);
