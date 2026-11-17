import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function buildBundle() {
  if (!existsSync(resolve('src/bundle.ts'))) {
    return;
  }

  const customConfig = resolve('vite.bundle.ts');
  const configPath = existsSync(customConfig)
    ? customConfig
    : fileURLToPath(new URL('../configs/build.bundle.js', import.meta.url));

  const child = spawn('vite', ['build', '--config', configPath], {
    env: { ...process.env, NODE_ENV: 'production', VITE_BUNDLE_CONFIG: 'true' },
    stdio: 'inherit'
  });
  const [code, signal] = await once(child, 'close');
  if (code !== 0) {
    throw new Error(`Vite bundle build failed (${signal ?? `exit code ${code}`}).`);
  }
}
