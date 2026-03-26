// @ts-check

import { join } from 'node:path';
import { ApiService, TestsService, WireitService } from '@internals/metadata';
import { PlaygroundService } from '@internals/tools/playground';
import { ExamplesService } from '@internals/tools/examples';
import { camelToKebab } from './_11ty/utils/index.js';
import {
  ELEMENTS_PAGES_BASE_URL,
  ELEMENTS_REPO_BASE_URL,
  ELEMENTS_PLAYGROUND_BASE_URL,
  ELEMENTS_REGISTRY_URL
} from './_11ty/utils/env.js';

const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/'); // eslint-disable-line no-undef

const apiMetrics = await ApiService.getData();

/** @type {import('@internals/metadata').Element[]} */
const elements = apiMetrics.data.elements;

/** @type {import('@internals/metadata').ProjectTestSummary} */
const tests = await TestsService.getData();

/** @type {import('@internals/metadata').ProjectTestSummary} */
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
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/angular/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/angular.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/angular`,
    documentation: 'https://angular.dev',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements + Angular</nve-alert>',
      type: 'angular'
    })
  },
  bundles: {
    logo: 'javascript',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/bundles/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/bundles.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/bundles`,
    documentation: 'https://vite.dev',
    playgroundURL: null
  },
  extensions: {
    logo: 'javascript',
    starterDemo: null,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/scoped-registry.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/scoped-registry`,
    documentation: 'https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md',
    playgroundURL: null
  },
  go: {
    logo: 'go',
    starterDemo: null,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/go.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/go`,
    documentation: 'https://go.dev',
    playgroundURL: null
  },
  hugo: {
    logo: 'hugo',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/hugo/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/hugo.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/hugo`,
    documentation: 'https://gohugo.io',
    playgroundURL: null
  },
  importmaps: {
    logo: 'javascript',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/importmaps/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/importmaps.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/importmaps`,
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
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/nextjs.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/nextjs`,
    documentation: 'https://nextjs.org',
    playgroundURL: null
  },
  nuxt: {
    logo: 'nuxt',
    starterDemo: null,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/nuxt.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/nuxt`,
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
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/react/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/react.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/react`,
    documentation: 'https://react.dev',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements + React</nve-alert>',
      type: 'react'
    })
  },
  solidjs: {
    logo: 'solidjs',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/solidjs/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/solidjs.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/solidjs`,
    documentation: 'https://www.solidjs.com',
    playgroundURL: null
  },
  svelte: {
    logo: 'svelte',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/svelte/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/svelte.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/svelte`,
    documentation: 'https://svelte.dev',
    playgroundURL: null
  },
  typescript: {
    logo: 'typescript',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/typescript/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/typescript.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/typescript`,
    documentation: 'https://www.typescriptlang.org',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements</nve-alert>'
    })
  },
  vue: {
    logo: 'vue',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/vue/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/vue.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/vue`,
    documentation: 'https://vuejs.org',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements + Vue</nve-alert>',
      type: 'vue'
    })
  }
};

export const siteData = {
  BASE_URL,
  ELEMENTS_PAGES_BASE_URL,
  ELEMENTS_REPO_BASE_URL,
  ELEMENTS_PLAYGROUND_BASE_URL,
  ELEMENTS_REGISTRY_URL,
  elements,
  examples,
  integrations,
  tests,
  wireit
};

export default function siteDataFn() {
  return siteData;
}
