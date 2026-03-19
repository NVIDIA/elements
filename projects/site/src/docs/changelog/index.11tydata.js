// @ts-check

import { ProjectsService } from '@internals/metadata';

const metadata = await ProjectsService.getData();
const projects = metadata.data;
const elements = projects.find(p => p.name === '@nvidia-elements/core');
const styles = projects.find(p => p.name === '@nvidia-elements/styles');
const themes = projects.find(p => p.name === '@nvidia-elements/themes');
const monaco = projects.find(p => p.name === '@nvidia-elements/monaco');
const create = projects.find(p => p.name === '@nvidia-elements/create');
const labsCode = projects.find(p => p.name === '@nvidia-elements/code');
const labsCli = projects.find(p => p.name === '@nvidia-elements/cli');
const labsLint = projects.find(p => p.name === '@nvidia-elements/lint');
const labsForms = projects.find(p => p.name === '@nvidia-elements/forms');
const labsMarkdown = projects.find(p => p.name === '@nvidia-elements/markdown');

// https://www.11ty.dev/docs/data-js/
export default [
  {
    title: '@nvidia-elements/core',
    permalink: '/elements/',
    version: elements?.version,
    changelog: elements?.changelog,
    description: elements?.description
  },
  {
    title: '@nvidia-elements/styles',
    permalink: '/styles/',
    version: styles?.version,
    description: styles?.description,
    changelog: styles?.changelog
  },
  {
    title: '@nvidia-elements/themes',
    permalink: '/themes/',
    version: themes?.version,
    changelog: themes?.changelog,
    description: themes?.description
  },
  {
    title: '@nvidia-elements/monaco',
    permalink: '/monaco/',
    version: monaco?.version,
    changelog: monaco?.changelog,
    description: monaco?.description
  },
  {
    title: '@nvidia-elements/create',
    permalink: '/create/',
    version: create?.version,
    changelog: create?.changelog,
    description: create?.description
  },
  {
    title: '@nvidia-elements/code',
    permalink: '/labs-code/',
    version: labsCode?.version,
    changelog: labsCode?.changelog,
    description: labsCode?.description
  },
  {
    title: '@nvidia-elements/cli',
    permalink: '/labs-cli/',
    version: labsCli?.version,
    changelog: labsCli?.changelog,
    description: labsCli?.description
  },
  {
    title: '@nvidia-elements/lint',
    permalink: '/labs-lint/',
    version: labsLint?.version,
    changelog: labsLint?.changelog,
    description: labsLint?.description
  },
  {
    title: '@nvidia-elements/forms',
    permalink: '/labs-forms/',
    version: labsForms?.version,
    changelog: labsForms?.changelog,
    description: labsForms?.description
  },
  {
    title: '@nvidia-elements/markdown',
    permalink: '/labs-markdown/',
    version: labsMarkdown?.version,
    changelog: labsMarkdown?.changelog,
    description: labsMarkdown?.description
  }
];
