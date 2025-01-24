export const data = {
  title: 'Settings'
};

export function render(data) {
  return /* markdown */ `
# ${data.title}

<nve-tabs>
  <nve-tabs-item><a href="starters/eleventy/">Home</a></nve-tabs-item>
  <nve-tabs-item><a href="starters/eleventy/about/">About</a></nve-tabs-item>
  <nve-tabs-item selected><a href="starters/eleventy/settings/">Settings</a></nve-tabs-item>
</nve-tabs>

This is an settings page.

<!-- #### This is a page specific style. -->
  `;
}
