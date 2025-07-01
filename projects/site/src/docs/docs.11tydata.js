import { PlaygroundService } from '@nve-internals/metadata';

const playgroundService = new PlaygroundService();
const playgroundURL = await playgroundService.getPlaygroundURL({
  html: '<nve-alert status="success">Elements</nve-alert>'
});
const reactPlaygroundURL = await playgroundService.getReactPlaygroundURL({
  html: '<nve-alert status="success">Elements + React</nve-alert>'
});
const angularPlaygroundURL = await playgroundService.getAngularPlaygroundURL({
  html: '<nve-alert status="success">Elements + Angular</nve-alert>'
});
const litPlaygroundURL = await playgroundService.getLitPlaygroundURL({
  html: '<nve-alert status="success">Elements + Lit</nve-alert>'
});
const preactPlaygroundURL = await playgroundService.getPreactPlaygroundURL({
  html: '<nve-alert status="success">Elements + Preact</nve-alert>'
});

export default function () {
  return {
    integrations: {
      angular: {
        logo: 'angular',
        starterDemo: 'https://NVIDIA.github.io/elements/starters/angular/',
        starterDownload: 'https://NVIDIA.github.io/elements/starters/download/angular.zip',
        starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/angular',
        documentation: 'https://angular.dev',
        playgroundURL: angularPlaygroundURL
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
        starterDownload:
          'https://NVIDIA.github.io/elements/starters/download/scoped-registry.zip',
        starterSource:
          'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/scoped-registry',
        documentation:
          'https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md',
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
        playgroundURL: litPlaygroundURL
      },
      nextjs: {
        logo: 'nextjs',
        starterDemo: null,
        starterDownload: 'https://NVIDIA.github.io/elements/starters/download/nextjs.zip',
        starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/nextjs',
        documentation: 'https://nextjs.org',
        playgroundURL: null
      },
      preact: {
        logo: 'preact',
        starterDemo: null,
        starterDownload: null,
        starterSource: null,
        documentation: 'https://preactjs.com',
        playgroundURL: preactPlaygroundURL
      },
      react: {
        logo: 'react',
        starterDemo: 'https://NVIDIA.github.io/elements/starters/react/',
        starterDownload: 'https://NVIDIA.github.io/elements/starters/download/react.zip',
        starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/react',
        documentation: 'https://react.dev',
        playgroundURL: reactPlaygroundURL
      },
      solidjs: {
        logo: 'solidjs',
        starterDemo: 'https://NVIDIA.github.io/elements/starters/solidjs/',
        starterDownload: 'https://NVIDIA.github.io/elements/starters/download/solidjs.zip',
        starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/solidjs',
        documentation: 'https://www.solidjs.com',
        playgroundURL: null
      },
      typescript: {
        logo: 'typescript',
        starterDemo: 'https://NVIDIA.github.io/elements/starters/typescript/',
        starterDownload: 'https://NVIDIA.github.io/elements/starters/download/typescript.zip',
        starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/typescript',
        documentation: 'https://www.typescriptlang.org',
        playgroundURL: playgroundURL
      },
      vue: {
        logo: 'vue',
        starterDemo: 'https://NVIDIA.github.io/elements/starters/vue/',
        starterDownload: 'https://NVIDIA.github.io/elements/starters/download/vue.zip',
        starterSource: 'https://github.com/NVIDIA/elements/-/tree/main/projects/starters/vue',
        documentation: 'https://vuejs.org',
        playgroundURL: null
      }
    }
  };
}
