import {
  formatUpdateMonth,
  getUpdateMonth,
  renderUpdatesFeedLink,
  sortUpdatesNewestFirst
} from '../../_11ty/layouts/whats-new.11ty.js';

export const data = {
  title: 'What’s New',
  description:
    'Monthly NVIDIA Elements Design System highlights, package updates, and links to detailed release information.',
  layout: 'docs.11ty.js',
  permalink: '/docs/whats-new/'
};

export function render(data) {
  const entries = sortUpdatesNewestFirst(data.collections['whats-new'] ?? []);

  return this.renderTemplate(
    /* html */ `
# ${data.title}

<style>
  .update-card {
    cursor: pointer;
    min-height: 200px;

    * {
      cursor: pointer;
    }
  }
</style>

<div nve-layout="row full align:space-between align:vertical-center">
  <p nve-text="heading muted">Follow the latest NVIDIA Elements features, fixes, and package releases.</p>
  ${renderUpdatesFeedLink()}
</div>

<section nve-layout="grid span-items:12 &md|span-items:6 gap:md align:vertical-stretch">
${entries
  .map(
    entry => /* html */ `
<a href="${entry.url}" style="display: flex; text-decoration: none;">
  <nve-card class="update-card">
    <nve-card-header>
      <h2 nve-text="heading">Monthly update - <time datetime="${getUpdateMonth(entry).toISOString().slice(0, 7)}">${formatUpdateMonth(entry)}</time></h2>
    </nve-card-header>
    <nve-card-content>
      <p nve-text="body">${entry.data.description}</p>
    </nve-card-content>
    <nve-card-footer>
      <div nve-layout="row full align:right">
        <span nve-text="body sm emphasis">Read update</span>
      </div>
    </nve-card-footer>
  </nve-card>
</a>
`
  )
  .join('')}
</section>
`,
    'md'
  );
}
