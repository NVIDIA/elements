// @ts-check

import { join } from 'node:path';
import { ApiService, TestsService, WireitService } from '@nve-internals/metadata';
import { PlaygroundService } from '@nve-internals/tools/playground';
import { ExamplesService } from '@nve-internals/tools/examples';
import { camelToKebab } from './_11ty/utils/index.js';

const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/'); // eslint-disable-line no-undef

const apiMetrics = await ApiService.getData();

/** @type {import('@nve-internals/metadata').Element[]} */
const elements = apiMetrics.data.elements;

/** @type {import('@nve-internals/metadata').ProjectsTestSummary} */
const tests = await TestsService.getData();

/** @type {import('@nve-internals/metadata').ProjectTestSummary} */
const wireit = await WireitService.getData();

const examples = (await ExamplesService.getAll())
  .filter(s => !s.template?.includes('${'))
  .map(example => ({
    id: example.id,
    example: example.element,
    summary: example.summary,
    description: example.description,
    tags: example.tags.filter(tag => tag !== 'priority'),
    deprecated: example.deprecated,
    template: example.template,
    element: example.element,
    entrypoint: example.entrypoint,
    name: example.name,
    elementName: example.element?.replace('nve-', ''),
    permalink: `${example.entrypoint?.replace('.examples.json', '-')}${camelToKebab(example.id)}/`
  }));

const integrations = {
  angular: {
    logo: 'angular',
    starterDemo: 'https://NVIDIA.github.io/elements/starters/angular/',
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/angular.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/angular',
    documentation: 'https://angular.dev',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements + Angular</nve-alert>',
      type: 'angular'
    })
  },
  bundles: {
    logo: 'javascript',
    starterDemo: 'https://NVIDIA.github.io/elements/starters/bundles/',
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/bundles.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/bundles',
    documentation: 'https://vite.dev',
    playgroundURL: null
  },
  extensions: {
    logo: 'javascript',
    starterDemo: null,
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/scoped-registry.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/scoped-registry',
    documentation: 'https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md',
    playgroundURL: null
  },
  go: {
    logo: 'go',
    starterDemo: null,
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/go.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/go',
    documentation: 'https://go.dev',
    playgroundURL: null
  },
  hugo: {
    logo: 'hugo',
    starterDemo: 'https://NVIDIA.github.io/elements/starters/hugo/',
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/hugo.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/hugo',
    documentation: 'https://gohugo.io',
    playgroundURL: null
  },
  importmaps: {
    logo: 'javascript',
    starterDemo: 'https://NVIDIA.github.io/elements/starters/importmaps/',
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/importmaps.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/importmaps',
    documentation: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap',
    playgroundURL: null
  },
  lit: {
    logo: 'lit',
    starterDemo: null,
    starterDownload: null,
    starterSource: null,
    documentation: 'https://lit.dev',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements + Lit</nve-alert>',
      type: 'lit'
    })
  },
  nextjs: {
    logo: 'nextjs',
    starterDemo: null,
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/nextjs.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/nextjs',
    documentation: 'https://nextjs.org',
    playgroundURL: null
  },
  nuxt: {
    logo: 'nuxt',
    starterDemo: null,
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/nuxt.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/nuxt',
    documentation: 'https://nuxt.com/',
    playgroundURL: null
  },
  preact: {
    logo: 'preact',
    starterDemo: null,
    starterDownload: null,
    starterSource: null,
    documentation: 'https://preactjs.com',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements + Preact</nve-alert>',
      type: 'preact'
    })
  },
  react: {
    logo: 'react',
    starterDemo: 'https://NVIDIA.github.io/elements/starters/react/',
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/react.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/react',
    documentation: 'https://react.dev',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements + React</nve-alert>',
      type: 'react'
    })
  },
  solidjs: {
    logo: 'solidjs',
    starterDemo: 'https://NVIDIA.github.io/elements/starters/solidjs/',
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/solidjs.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/solidjs',
    documentation: 'https://www.solidjs.com',
    playgroundURL: null
  },
  svelte: {
    logo: 'svelte',
    starterDemo: 'https://NVIDIA.github.io/elements/starters/svelte/',
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/svelte.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/svelte',
    documentation: 'https://svelte.dev',
    playgroundURL: null
  },
  typescript: {
    logo: 'typescript',
    starterDemo: 'https://NVIDIA.github.io/elements/starters/typescript/',
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/typescript.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/typescript',
    documentation: 'https://www.typescriptlang.org',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements</nve-alert>'
    })
  },
  vue: {
    logo: 'vue',
    starterDemo: 'https://NVIDIA.github.io/elements/starters/vue/',
    starterDownload: 'https://NVIDIA.github.io/elements/starters/download/vue.zip',
    starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/vue',
    documentation: 'https://vuejs.org',
    playgroundURL: null
  }
};

export const siteData = {
  BASE_URL,
  elements,
  examples,
  integrations,
  tests,
  wireit
};

export default function siteDataFn() {
  return siteData;
}
