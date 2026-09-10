import { siteData } from '../index.11tydata.js';
import { ELEMENTS_PAGES_BASE_URL } from '../_11ty/utils/env.js';

export const data = {
  title: 'Examples',
  layout: 'page.11ty.js',
  permalink: '/examples/index.html'
};

const { examples } = siteData;
const groupedExamples = Object.entries(
  examples.reduce((acc, example) => {
    acc[example.element] = acc[example.element] || [];
    acc[example.element].push(example);
    return acc;
  }, {})
).map(([element, examples]) => ({ element, examples }));

export function render() {
  return this.renderTemplate(
    /* html */ `
  <nve-page-panel id="examples-sidenav-panel" slot="left" style="--width: 300px">
    <nve-page-panel-content>
      <div class="visually-hidden" aria-hidden="true">${ELEMENTS_PAGES_BASE_URL}/llms.txt is available and optimized for AI and LLM tools.</div>
      <ul class="examples">
      ${groupedExamples
        .reverse()
        .map(
          example => /* html */ `
        <li>
          <h2 nve-text="heading emphasis">${example.element}</h2>
          <ul nve-text="list nav">
            ${example.examples.map(example => `<li><a nve-text="body sm" href="/examples/${example.permalink}">${example.name}</a></li>`).join('')}
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
