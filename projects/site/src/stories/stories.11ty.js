import { stories } from './utils.js';

const groupedStories = Object.entries(
  stories.reduce((acc, story) => {
    acc[story.element] = acc[story.element] || [];
    acc[story.element].push(story);
    return acc;
  }, {})
).map(([element, stories]) => ({ element, stories }));

export const data = {
  title: 'Stories',
  layout: 'page.11ty.js',
  permalink: '/stories/index.html'
};

export function render() {
  return this.renderTemplate(
    /* html */ `
  <style>
    @import './stories.css';
  </style>
  <nve-page-panel id="stories-sidenav-panel" slot="left" style="--width: 300px">
    <nve-page-panel-content>
      <ul class="stories">
      ${groupedStories
        .map(
          story => /* html */ `
        <li>
          <h2 nve-text="heading">${story.element}</h2>
          <ul nve-text="list nav">
            ${story.stories.map(story => `<li><a nve-text="body sm" href="stories/${story.permalink}">${story.title}</a></li>`).join('')}
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
    import './stories.ts';
  </script>
`,
    'html'
  );
}
