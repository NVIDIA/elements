import { join } from 'node:path';
import { MetadataService } from '@internals/metadata';

export const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/');

const metadata = await MetadataService.getMetadata();
const stories = metadata['@nvidia-elements/core'].elements.flatMap(element => {
  const stories = element.stories
    // few stories have invalid html so they are filtered out
    .filter(s => !s.template?.includes('${'))
    .filter(s => !s.id.toLowerCase().includes('shadowroot'));

  return stories.map(story => ({
    title: story.id.toLowerCase(),
    permalink: `${element.name.replace('nve-', '')}/${story.id.toLowerCase()}`,
    template: story.template
  }));
});

export const data = {
  title: 'Stories',
  pagination: {
    data: 'stories',
    size: 1,
    alias: 'story'
  },
  stories,
  permalink: data => `stories/${data.story.permalink}.html`
};

export function render(data) {
  return this.renderTemplate(
    /* html */ `
<html lang="en" nve-theme="dark" nve-transition="auto">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="${BASE_URL}" />
    <style>
      @import '@nvidia-elements/themes/fonts/inter.css';
      @import '@nvidia-elements/themes/index.css';
      @import '@nvidia-elements/themes/dark.css';
      @import '@nvidia-elements/themes/high-contrast.css';
      @import '@nvidia-elements/themes/compact.css';
      @import '@nvidia-elements/themes/debug.css';
      @import '@nvidia-elements/styles/layout.css';
      @import '@nvidia-elements/styles/responsive.css';
      @import '@nvidia-elements/styles/typography.css';
      @import '@nvidia-elements/styles/view-transitions.css';

      *:not(:defined) {
        visibility: hidden;
      }
    </style>
  </head>
  <body>
    ${data.story.template}
  </body>
</html>
`,
    'html'
  );
}
