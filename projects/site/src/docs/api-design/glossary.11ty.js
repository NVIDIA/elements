import { MetadataService } from '@nve-internals/metadata';

const metrics = await MetadataService.getMetadata();

export const data = {
  title: 'Glossary',
  layout: 'docs.11ty.js'
};

export function render(data) {
  return this.renderTemplate(
    /* markdown */ `
# ${data.title}

Below are the common base properties that define the consistent API definition and language for all components, based on the [W3C](https://developer.mozilla.org/en-US/docs/Web/Web_Components) and [ARIA Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) specifications.

## Properties

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="150px">Property</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
    <nve-grid-column width="350px">Type</nve-grid-column>
  </nve-grid-header>
  ${metrics.types.props
    ?.map(
      prop => /* html */ `
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">${prop.name}</code></nve-grid-cell>
    <nve-grid-cell>${prop.description}</nve-grid-cell>
    <nve-grid-cell>
      <div nve-layout="row gap:xs align:wrap">
        ${
          prop.type
            ? /* html */ `${prop.type
                ?.split('|')
                .map(i => i.trim())
                .filter(i => i.length)
                .map(i => /* html */ `<nve-tag readonly color="gray-slate">${i.replaceAll("'", '')}</nve-tag>`)
                .join('')}`
            : ''
        }
      </div>
    </nve-grid-cell>
  </nve-grid-row>`
    )
    .join('')}
</nve-grid>
`,
    'md'
  );
}
