import { mkdir, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await exec('unzip', ['-q', '-j', 'siteguard152.zip', '-d', 'dist']);

console.log('SiteGuard 152 production build ready');
