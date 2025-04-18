import { readFileSync } from 'fs';

// https://www.11ty.dev/docs/data-js/
export default [
  {
    title: '@nvidia-elements/core',
    permalink: '/',
    changelog: readFileSync('../elements/CHANGELOG.md', 'utf8')
  },
  {
    title: '@nvidia-elements/core-react',
    permalink: '/elements-react/',
    changelog: readFileSync('../elements-react/CHANGELOG.md', 'utf8')
  },
  {
    title: '@nvidia-elements/styles',
    permalink: '/styles/',
    changelog: readFileSync('../styles/CHANGELOG.md', 'utf8')
  },
  {
    title: '@nvidia-elements/themes',
    permalink: '/themes/',
    changelog: readFileSync('../themes/CHANGELOG.md', 'utf8')
  },
  {
    title: '@nvidia-elements/testing',
    permalink: '/testing/',
    changelog: readFileSync('../testing/CHANGELOG.md', 'utf8')
  },
  {
    title: '@nvidia-elements/code',
    permalink: '/labs-code/',
    changelog: readFileSync('../labs/code/CHANGELOG.md', 'utf8')
  },
  // {
  //   title: '@nvidia-elements/entity',
  //   permalink: '/labs-entity/',
  //   changelog: readFileSync('../labs/entity/CHANGELOG.md', 'utf8')
  // },
  {
    title: '@nvidia-elements/behaviors-alpine',
    permalink: '/labs-behaviors-alpine/',
    changelog: readFileSync('../labs/behaviors-alpine/CHANGELOG.md', 'utf8')
  },
  {
    title: '@nvidia-elements/monaco',
    permalink: '/monaco/',
    changelog: readFileSync('../monaco/CHANGELOG.md', 'utf8')
  }
];
