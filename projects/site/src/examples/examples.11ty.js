import { siteData } from '../index.11tydata.js';

const examples = siteData.stories;
const groupedStories = Object.entries(
  examples.reduce((acc, example) => {
    acc[example.element] = acc[example.element] || [];
    acc[example.element].push(example);
    return acc;
  }, {})
).map(([element, examples]) => ({ element, examples }));

export const data = {
  title: 'Examples',
  layout: 'page.11ty.js',
  permalink: '/examples/index.html'
};

export function render() {
  return this.renderTemplate(
    /* html */ `
  <style>
    @import './examples.css';
  </style>
  <nve-page-panel id="examples-sidenav-panel" slot="left" style="--width: 300px">
    <nve-page-panel-content>
      <ul class="examples">
      ${groupedStories
        .reverse()
        .map(
          example => /* html */ `
        <li>
          <h2 nve-text="heading">${example.element}</h2>
          <ul nve-text="list nav">
            ${example.examples.map(example => `<li><a nve-text="body sm" href="examples/${example.permalink}">${example.title}</a></li>`).join('')}
          </ul>
        </li>`
        )
        .join('')}
      </ul>
    </nve-page-panel-content>
  </nve-page-panel>
  <section nve-layout="row gap:md align:stretch full">
    <iframe></iframe>
  </section>
  <script type="module">
    import './examples.ts';
  </script>
`,
    'html'
  );
}
