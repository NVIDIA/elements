// @ts-check

import { MetadataService } from '@internals/metadata';

const metadata = await MetadataService.getMetadata();

// https://www.11ty.dev/docs/data-js/
export default [
  {
    title: '@nvidia-elements/core',
    permalink: '/elements/',
    version: metadata.projects['@nvidia-elements/core'].version,
    changelog: metadata.projects['@nvidia-elements/core'].changelog,
    description: metadata.projects['@nvidia-elements/core'].description
  },
  {
    title: '@nvidia-elements/core-react',
    permalink: '/elements-react/',
    version: metadata.projects['@nvidia-elements/core-react'].version,
    changelog: metadata.projects['@nvidia-elements/core-react'].changelog,
    description: metadata.projects['@nvidia-elements/core-react'].description
  },
  {
    title: '@nvidia-elements/styles',
    permalink: '/styles/',
    version: metadata.projects['@nvidia-elements/styles'].version,
    description: metadata.projects['@nvidia-elements/styles'].description,
    changelog: metadata.projects['@nvidia-elements/styles'].changelog
  },
  {
    title: '@nvidia-elements/themes',
    permalink: '/themes/',
    version: metadata.projects['@nvidia-elements/themes'].version,
    changelog: metadata.projects['@nvidia-elements/themes'].changelog,
    description: metadata.projects['@nvidia-elements/themes'].description
  },
  {
    title: '@nvidia-elements/monaco',
    permalink: '/monaco/',
    version: metadata.projects['@nvidia-elements/monaco'].version,
    changelog: metadata.projects['@nvidia-elements/monaco'].changelog,
    description: metadata.projects['@nvidia-elements/monaco'].description
  },
  {
    title: '@nvidia-elements/testing',
    permalink: '/testing/',
    version: metadata.projects['@nvidia-elements/testing'].version,
    changelog: metadata.projects['@nvidia-elements/testing'].changelog,
    description: metadata.projects['@nvidia-elements/testing'].description
  },
  {
    title: '@nvidia-elements/code',
    permalink: '/labs-code/',
    version: metadata.projects['@nvidia-elements/code'].version,
    changelog: metadata.projects['@nvidia-elements/code'].changelog,
    description: metadata.projects['@nvidia-elements/code'].description
  },
  {
    title: '@nvidia-elements/brand',
    permalink: '/labs-brand/',
    version: metadata.projects['@nvidia-elements/brand'].version,
    changelog: metadata.projects['@nvidia-elements/brand'].changelog,
    description: metadata.projects['@nvidia-elements/brand'].description
  },
  {
    title: '@nvidia-elements/cli',
    permalink: '/labs-cli/',
    version: metadata.projects['@nvidia-elements/cli'].version,
    changelog: metadata.projects['@nvidia-elements/cli'].changelog,
    description: metadata.projects['@nvidia-elements/cli'].description
  },
  {
    title: '@nvidia-elements/lint',
    permalink: '/labs-lint/',
    version: metadata.projects['@nvidia-elements/lint'].version,
    changelog: metadata.projects['@nvidia-elements/lint'].changelog,
    description: metadata.projects['@nvidia-elements/lint'].description
  },
  {
    title: '@nvidia-elements/forms',
    permalink: '/labs-forms/',
    version: metadata.projects['@nvidia-elements/forms'].version,
    changelog: metadata.projects['@nvidia-elements/forms'].changelog,
    description: metadata.projects['@nvidia-elements/forms'].description
  },
  // {
  //   title: '@nvidia-elements/markdown',
  //   permalink: '/labs-markdown/',
  //   version: metadata.projects['@nvidia-elements/markdown'].version,
  //   changelog: metadata.projects['@nvidia-elements/markdown'].changelog,
  //   description: metadata.projects['@nvidia-elements/markdown'].description
  // },
  {
    title: '@nvidia-elements/behaviors-alpine',
    permalink: '/labs-behaviors-alpine/',
    version: metadata.projects['@nvidia-elements/behaviors-alpine'].version,
    changelog: metadata.projects['@nvidia-elements/behaviors-alpine'].changelog,
    description: metadata.projects['@nvidia-elements/behaviors-alpine'].description
  }
];
