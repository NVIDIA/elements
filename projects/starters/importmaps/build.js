import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Copy all dependencies as static files to the dist folder

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, 'dist');
const nodeModules = join(__dirname, 'node_modules');

async function build() {
  await mkdir(join(dist, 'node_modules', '@nvidia-elements'), { recursive: true });
  await cp(join(__dirname, 'src', 'index.html'), join(dist, 'index.html'));

  for (const pkg of ['lit', 'lit-html', 'lit-element', '@lit/reactive-element']) {
    await cp(join(nodeModules, pkg), join(dist, 'node_modules', pkg), { recursive: true, dereference: true });
  }

  for (const pkg of ['core', 'styles', 'themes']) {
    await cp(join(nodeModules, '@nvidia-elements', pkg, 'dist'), join(dist, 'node_modules', '@nvidia-elements', pkg, 'dist'), {
      recursive: true,
      dereference: true
    });
  }
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
