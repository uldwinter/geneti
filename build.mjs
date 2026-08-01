import { mkdir, rm, copyFile } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

for (const file of [
  'index.html',
  'styles.css',
  'app.js',
  'favicon.svg',
  'manifest.webmanifest'
]) {
  await copyFile(file, `dist/${file}`);
}

console.log('SiteGuard 152 production build ready');
