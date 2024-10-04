export const data = {
  title: 'Eleventy + Elements'
};

export function render(data) {
  return /* markdown */ `
# ${data.title}

<nve-tabs>
  <nve-tabs-item selected><a href="/elements/starters/eleventy/">Home</a></nve-tabs-item>
  <nve-tabs-item><a href="/elements/starters/eleventy/about/">About</a></nve-tabs-item>
  <nve-tabs-item><a href="/elements/starters/eleventy/settings/">Settings</a></nve-tabs-item>
</nve-tabs>

This is a Eleventy Starter using Elements.

- [Source](https://github.com/NVIDIA/elements/-/tree/main/projects/starters/eleventy)
- [Documentation](https://11ty.dev/)
- [Download](https://NVIDIA.github.io/elements/starters/download/eleventy.zip)

<!-- #### This is a page specific style. -->
  `;
}
