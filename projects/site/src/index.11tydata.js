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
    href: '/docs/integrations/angular/',
    icon: 'angular.svg',
    title: 'Angular',
    description: 'Use Elements with Angular templates and events.',
    logo: 'angular',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/angular/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/angular.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/angular`,
    documentation: 'https://angular.dev',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements + Angular</nve-alert>',
      type: 'angular'
    })
  },
  bundles: {
    href: '/docs/integrations/bundles/',
    icon: 'javascript.svg',
    title: 'Bundles',
    description: 'Load prebuilt Elements bundles in static pages.',
    logo: 'javascript',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/bundles/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/bundles.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/bundles`,
    documentation: 'https://vite.dev',
    playgroundURL: null
  },
  cdn: {
    href: '/docs/integrations/cdn/',
    nveIcon: 'globe-alt-stroke',
    title: 'CDN',
    description: 'Load Elements from CDN-hosted npm packages.'
  },
  'custom-elements': {
    href: '/docs/integrations/custom-elements/',
    nveIcon: 'code',
    title: 'Custom Elements',
    description: 'Use Elements package metadata with Web Component tooling.'
  },
  eleventy: {
    href: '/docs/integrations/eleventy/',
    icon: 'eleventy.svg',
    title: 'Eleventy',
    description: 'Use Elements with Eleventy static sites.',
    logo: 'eleventy',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/eleventy/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/eleventy.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/eleventy`,
    documentation: 'https://www.11ty.dev/docs/',
    playgroundURL: null
  },
  go: {
    href: '/docs/integrations/go/',
    icon: 'go.svg',
    iconSize: '48',
    title: 'Golang',
    description: 'Use Elements with Go-backed web applications.',
    logo: 'go',
    starterDemo: null,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/go.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/go`,
    documentation: 'https://go.dev/doc/',
    playgroundURL: null
  },
  'go-htmx': {
    href: '/docs/integrations/go-htmx/',
    icon: 'htmx.svg',
    iconHeight: '32',
    iconWidth: '48',
    title: 'HTMX + Go',
    description: 'Use Elements with HTMX and Go template fragments.',
    logo: 'htmx',
    starterDemo: null,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/go-htmx.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/go-htmx`,
    documentation: 'https://htmx.org/docs/',
    playgroundURL: null
  },
  hugo: {
    href: '/docs/integrations/hugo/',
    icon: 'hugo.svg',
    iconSize: '28px',
    title: 'Hugo',
    description: 'Use Elements in Hugo static sites.',
    logo: 'hugo',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/hugo/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/hugo.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/hugo`,
    documentation: 'https://gohugo.io',
    playgroundURL: null
  },
  importmaps: {
    href: '/docs/integrations/importmaps/',
    icon: 'javascript.svg',
    title: 'Import Maps',
    description: 'Load Elements from browser-native import maps.',
    logo: 'javascript',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/importmaps/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/importmaps.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/importmaps`,
    documentation: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap',
    playgroundURL: null
  },
  lit: {
    href: '/docs/integrations/lit/',
    icon: 'lit.svg',
    title: 'Lit',
    description: 'Use Elements alongside Lit components and SSR.',
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
  'lit-library': {
    href: '/docs/integrations/lit-library/',
    icon: 'lit.svg',
    title: 'Lit Library',
    description: 'Build a distributable Custom Element library with Lit and Elements.',
    logo: 'lit',
    starterDemo: null,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/lit-library.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/lit-library`,
    documentation: 'https://lit.dev',
    playgroundURL: null
  },
  'mcp-app': {
    href: '/docs/integrations/mcp-apps/',
    nveIcon: 'connected-blocks',
    title: 'MCP Apps',
    description: 'Use Elements in iframe-based MCP UI hosts.',
    logo: 'javascript',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/mcp-app/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/mcp-app.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/mcp-app`,
    documentation: 'https://apps.extensions.modelcontextprotocol.io/api/',
    playgroundURL: null
  },
  nextjs: {
    href: '/docs/integrations/nextjs/',
    icon: 'nextjs.svg',
    iconSize: '28px',
    title: 'NextJS',
    description: 'Use Elements with NextJS and React.',
    logo: 'nextjs',
    starterDemo: null,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/nextjs.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/nextjs`,
    documentation: 'https://nextjs.org',
    playgroundURL: null
  },
  nuxt: {
    href: '/docs/integrations/nuxt/',
    icon: 'nuxt.svg',
    iconSize: '38px',
    title: 'Nuxt',
    description: 'Use Elements with Nuxt applications.',
    logo: 'nuxt',
    starterDemo: null,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/nuxt.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/nuxt`,
    documentation: 'https://nuxt.com/',
    playgroundURL: null
  },
  preact: {
    href: '/docs/integrations/preact/',
    icon: 'preact.svg',
    title: 'Preact',
    description: 'Use Elements with Preact JSX and custom events.',
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
    href: '/docs/integrations/react/',
    icon: 'react.svg',
    title: 'React',
    description: 'Use Elements with React and native custom events.',
    logo: 'react',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/react/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/react.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/react`,
    documentation: 'https://react.dev',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements + React</nve-alert>',
      type: 'react'
    })
  },
  solidjs: {
    href: '/docs/integrations/solidjs/',
    icon: 'solidjs.svg',
    title: 'SolidJS',
    description: 'Use Elements with SolidJS and Vite.',
    logo: 'solidjs',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/solidjs/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/solidjs.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/solidjs`,
    documentation: 'https://www.solidjs.com',
    playgroundURL: null
  },
  svelte: {
    href: '/docs/integrations/svelte/',
    icon: 'svelte.svg',
    title: 'Svelte',
    description: 'Use Elements with Svelte and Vite.',
    logo: 'svelte',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/svelte/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/svelte.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/svelte`,
    documentation: 'https://svelte.dev',
    playgroundURL: null
  },
  typescript: {
    href: '/docs/integrations/typescript/',
    icon: 'typescript.svg',
    title: 'TypeScript',
    description: 'Use Elements with TypeScript and Vite.',
    logo: 'typescript',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/typescript/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/typescript.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/typescript`,
    documentation: 'https://www.typescriptlang.org',
    playgroundURL: await PlaygroundService.create({
      template: '<nve-alert status="success">Elements</nve-alert>'
    })
  },
  vue: {
    href: '/docs/integrations/vue/',
    icon: 'vue.svg',
    title: 'Vue',
    description: 'Use Elements with Vue and Vite.',
    logo: 'vue',
    starterDemo: `${ELEMENTS_PAGES_BASE_URL}/starters/vue/`,
    starterDownload: `${ELEMENTS_PAGES_BASE_URL}/starters/download/vue.zip`,
    starterSource: `${ELEMENTS_REPO_BASE_URL}/tree/main/projects/starters/vue`,
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
