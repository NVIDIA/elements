import { cpSync, existsSync, mkdirSync } from 'fs';

if (!existsSync('./dist')) {
  mkdirSync('./dist/starters', { recursive: true });
  mkdirSync('./dist/api', { recursive: true });
}

cpSync('./_redirects', './dist/_redirects');
cpSync('./robots.txt', './dist/robots.txt');
cpSync('../storybook/dist/', './dist/api/', { recursive: true });
cpSync('../internals/metadata/dist/', './dist/metadata/', { recursive: true });

cpSync('../starters/dist/', './dist/starters/download/', { recursive: true });
cpSync('../starters/angular/dist/angular-app/browser/', './dist/starters/angular/', { recursive: true });
cpSync('../starters/buildless/dist/', './dist/starters/buildless/', { recursive: true });
cpSync('../starters/eleventy/dist/', './dist/starters/eleventy/', { recursive: true });
cpSync('../starters/mpa/dist/', './dist/starters/mpa/', { recursive: true });
cpSync('../starters/nextjs/dist/', './dist/starters/nextjs/', { recursive: true });
cpSync('../starters/react/dist/', './dist/starters/react/', { recursive: true });
cpSync('../starters/solidjs/dist/', './dist/starters/solidjs/', { recursive: true });
cpSync('../starters/typescript/dist/', './dist/starters/typescript/', { recursive: true });
cpSync('../starters/vue/dist/', './dist/starters/vue/', { recursive: true });
