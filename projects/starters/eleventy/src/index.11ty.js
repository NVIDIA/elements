export const data = {
  title: 'Eleventy + Elements',
  layout: 'index.11ty.js'
};

export function render(data) {
  return this.renderTemplate(
    /* markdown */ `
# ${data.title}

<nve-tabs>
  <nve-tabs-item selected><a href="./">Home</a></nve-tabs-item>
  <nve-tabs-item><a href="about/">About</a></nve-tabs-item>
  <nve-tabs-item><a href="settings/">Settings</a></nve-tabs-item>
</nve-tabs>

This is a Eleventy Starter using Elements.

- [Source](https://github.com/NVIDIA/elements/-/tree/main/projects/starters/eleventy)
- [Documentation](https://11ty.dev/)
- [Download](https://NVIDIA.github.io/elements/starters/download/eleventy.zip)
`,
    'md'
  );
}
