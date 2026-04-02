import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';

if (!existsSync('./dist')) {
  mkdirSync('./dist/starters', { recursive: true });
  mkdirSync('./dist/api', { recursive: true });
}

cpSync('../site/dist/', './dist/', { recursive: true });
cpSync('../internals/metadata/static/api.json', './dist/metadata/api.json');
cpSync('../internals/metadata/static/examples.json', './dist/metadata/examples.json');
cpSync('../internals/metadata/static/projects.json', './dist/metadata/projects.json');

cpSync('../starters/dist/', './dist/starters/download/', { recursive: true });
cpSync('../starters/angular/dist/angular-starter/browser/', './dist/starters/angular/', { recursive: true });
cpSync('../starters/bundles/dist/', './dist/starters/bundles/', { recursive: true });
cpSync('../starters/importmaps/dist/', './dist/starters/importmaps/', { recursive: true });
cpSync('../starters/eleventy/dist/', './dist/starters/eleventy/', { recursive: true });
cpSync('../starters/mpa/dist/', './dist/starters/mpa/', { recursive: true });
cpSync('../starters/nextjs/dist/', './dist/starters/nextjs/', { recursive: true });
cpSync('../starters/react/dist/', './dist/starters/react/', { recursive: true });
cpSync('../starters/solidjs/dist/', './dist/starters/solidjs/', { recursive: true });
cpSync('../starters/svelte/dist/', './dist/starters/svelte/', { recursive: true });
cpSync('../starters/typescript/dist/', './dist/starters/typescript/', { recursive: true });
cpSync('../starters/vue/dist/', './dist/starters/vue/', { recursive: true });
cpSync('../starters/hugo/dist/', './dist/starters/hugo/', { recursive: true });

// HTML redirects (GitHub Pages does not support _redirects files)
const redirect = (url) => `<!DOCTYPE html><meta http-equiv="refresh" content="0;url=${url}"><link rel="canonical" href="${url}"><a href="${url}">Redirect</a>`;
mkdirSync('./dist/api', { recursive: true });
mkdirSync('./dist/demos', { recursive: true });
writeFileSync('./dist/api/index.html', redirect('/elements/'));
writeFileSync('./dist/demos/index.html', redirect('/elements/starters/'));
