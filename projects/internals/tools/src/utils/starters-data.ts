export type Starter =
  | 'angular'
  | 'react'
  | 'lit'
  | 'preact'
  | 'solidjs'
  | 'vue'
  | 'nextjs'
  | 'typescript'
  | 'go'
  | 'importmaps'
  | 'bundles'
  | 'extensions';

export const startersData = {
  typescript: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/typescript.zip',
    cli: true
  },
  eleventy: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/eleventy.zip',
    cli: true
  },
  angular: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/angular.zip',
    cli: true
  },
  react: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/react.zip',
    cli: true
  },
  vue: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/vue.zip',
    cli: true
  },
  nextjs: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/nextjs.zip',
    cli: true
  },
  solidjs: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/solidjs.zip',
    cli: true
  },
  go: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/go.zip',
    cli: false
  },
  importmaps: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/importmaps.zip',
    cli: false
  },
  lit: {
    zip: null,
    cli: false
  },
  preact: {
    zip: null,
    cli: false
  },
  bundles: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/bundles.zip',
    cli: false
  },
  extensions: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/scoped-registry.zip',
    cli: false
  }
};
