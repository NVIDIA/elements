// @ts-check

import { MetadataService } from '@internals/metadata';

const metadata = await MetadataService.getMetadata();

// https://www.11ty.dev/docs/data-js/
export default [
  {
    title: '@nvidia-elements/core',
    permalink: '/',
    changelog: metadata.projects['@nvidia-elements/core'].changelog
  },
  {
    title: '@nvidia-elements/core-react',
    permalink: '/elements-react/',
    changelog: metadata.projects['@nvidia-elements/core-react'].changelog
  },
  {
    title: '@nvidia-elements/styles',
    permalink: '/styles/',
    changelog: metadata.projects['@nvidia-elements/styles'].changelog
  },
  {
    title: '@nvidia-elements/themes',
    permalink: '/themes/',
    changelog: metadata.projects['@nvidia-elements/themes'].changelog
  },
  {
    title: '@nvidia-elements/testing',
    permalink: '/testing/',
    changelog: metadata.projects['@nvidia-elements/testing'].changelog
  },
  // {
  //   title: '@nvidia-elements/brand',
  //   permalink: '/labs-brand/',
  //   changelog: metadata.projects['@nvidia-elements/brand'].changelog
  // },
  {
    title: '@nvidia-elements/code',
    permalink: '/labs-code/',
    changelog: metadata.projects['@nvidia-elements/code'].changelog
  },
  {
    title: '@nvidia-elements/forms',
    permalink: '/labs-forms/',
    changelog: metadata.projects['@nvidia-elements/forms'].changelog
  },
  {
    title: '@nvidia-elements/behaviors-alpine',
    permalink: '/labs-behaviors-alpine/',
    changelog: metadata.projects['@nvidia-elements/behaviors-alpine'].changelog
  },
  {
    title: '@nvidia-elements/monaco',
    permalink: '/monaco/',
    changelog: metadata.projects['@nvidia-elements/monaco'].changelog
  }
];
