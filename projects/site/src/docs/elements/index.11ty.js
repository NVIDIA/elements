import { siteData } from '../../index.11tydata.js';

export const data = {
  title: 'Components',
  description:
    'NVIDIA Elements components are framework-agnostic Web Components for building agent-ready AI infrastructure, robotics, and autonomous vehicle user interfaces.',
  layout: 'docs.11ty.js'
};

const hasComponentTag = component => component.data?.tag;

const isElementsComponentDoc = component =>
  component.inputPath?.includes('/docs/elements/') && hasComponentTag(component);

const isLibraryComponentDoc = component =>
  ['/docs/code/', '/docs/markdown/', '/docs/media/', '/docs/monaco/'].some(path =>
    component.inputPath?.includes(path)
  ) && hasComponentTag(component);

const escapeHtml = value =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sortByTitle = (a, b) => a.title.localeCompare(b.title);

const createComponentCatalog = componentDocs => {
  const docsByTag = new Map(componentDocs.filter(hasComponentTag).map(component => [component.data.tag, component]));

  const createCatalogSection = predicate =>
    siteData.elements
      .filter(element => {
        const doc = docsByTag.get(element.name);

        return doc && predicate(doc);
      })
      .map(element => {
        const doc = docsByTag.get(element.name);

        return {
          description: element.manifest?.description?.trim() ?? `Documentation for ${doc.data.title}.`,
          href: doc.url,
          packageName: element.package,
          tag: element.name,
          title: doc.data.title,
          version: element.version
        };
      })
      .sort(sortByTitle);

  return [...createCatalogSection(isElementsComponentDoc), ...createCatalogSection(isLibraryComponentDoc)];
};

const renderComponentLink = component => /* html */ `
  <a href="${escapeHtml(component.href)}">
    <nve-card style="height: 100%; min-height: 150px">
      <nve-card-header>
        <div nve-layout="row align:space-between">
          <h3 nve-text="label medium">${escapeHtml(component.title)}</h3>
          <p nve-text="body sm muted"><code nve-text="code">${escapeHtml(component.tag)}</code></p>
        </div>
      </nve-card-header>
      <nve-card-content>
        <p nve-text="body sm">${escapeHtml(component.description)}</p>
      </nve-card-content>
    </nve-card>
  </a>`;

export function render(data) {
  const components = createComponentCatalog(data.collections.componentDocs);

  return /* html */ `
<style>
  a:has(nve-card) {
    text-decoration: none;

    * {
      cursor: pointer;
    }
  }
</style>

<h1 nve-text="heading xl mkd">NVIDIA Elements Components</h1>

<p nve-text="body">
  NVIDIA Elements components are production Web Components for an agent-ready design system. Use them to build AI
  infrastructure dashboards, robotics consoles, autonomous vehicle tools, and internal developer workflows with
  stable <code nve-text="code">nve-*</code> APIs, design tokens, accessibility guidance, and examples.
</p>

<div nve-layout="grid gap:md align:vertical-stretch span-items:12 &md|span-items:6 &xl|span-items:4">
  ${components.map(renderComponentLink).join('')}
</div>`;
}
