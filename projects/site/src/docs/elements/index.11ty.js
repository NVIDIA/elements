import { siteData } from '../../index.11tydata.js';
import { parseFragment, serialize } from 'parse5';

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

const defaultExamplesByTag = new Map(
  siteData.examples
    .filter(example => example.name === 'Default' && !example.element.includes('nve-panel'))
    .map(example => [example.element, example])
);

const disallowedPreviewElements = new Set(['base', 'embed', 'iframe', 'link', 'meta', 'object', 'script']);
const previewUrlAttributes = new Set(['action', 'formaction', 'href', 'poster', 'src', 'xlink:href']);
const safePreviewProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);

const isSafePreviewUrl = value => {
  try {
    return safePreviewProtocols.has(new URL(value, 'https://elements.invalid').protocol);
  } catch {
    return false;
  }
};

const sanitizePreviewNode = node => {
  if (!Array.isArray(node.childNodes)) return;
  node.childNodes = node.childNodes.filter(child => !disallowedPreviewElements.has(child.nodeName));
  node.childNodes.forEach(child => {
    if (Array.isArray(child.attrs)) {
      child.attrs = child.attrs.filter(attribute => {
        const name = attribute.name.toLowerCase();
        if (name.startsWith('on') || name === 'srcdoc') return false;
        if (previewUrlAttributes.has(name)) return isSafePreviewUrl(attribute.value);
        return true;
      });
    }

    sanitizePreviewNode(child);
    if (child.content) sanitizePreviewNode(child.content);
  });
};

const sanitizePreviewTemplate = template => {
  const fragment = parseFragment(String(template ?? ''));
  sanitizePreviewNode(fragment);
  return serialize(fragment).trim();
};

const flattenNestedContainers = template =>
  template.replace(/<(nve-(?:grid|accordion-group|accordion))(?=[\s>])([^>]*)>/g, (match, tag, attributes) =>
    attributes.includes('container=') ? match : `<${tag} container="flat"${attributes}>`
  );

const renderPopoverMock = ({ title, content, type = 'popover' }) => /* html */ `
  <div class="preview-mock preview-mock-${type}" nve-layout="column gap:sm">
    <div nve-layout="row align:space-between gap:md">
      <span nve-text="label sm medium">${title}</span>
      <span nve-text="body sm muted">×</span>
    </div>
    <p nve-text="body sm">${content}</p>
  </div>`;

const renderMonacoMock = tag => {
  const isDiff = tag.includes('diff');
  const isProblems = tag.includes('problems');
  const title = isProblems ? 'Problems' : isDiff ? 'Changes' : 'pipeline.ts';

  if (isProblems) {
    return /* html */ `
      <div class="preview-editor">
        <div class="preview-editor-tab" nve-text="label sm medium">${title}</div>
        <div class="preview-problems" nve-layout="column gap:xs">
          <p nve-text="body sm"><span class="preview-problems-marker">×</span> Type mismatch in deployment config</p>
          <p nve-text="body sm"><span class="preview-problems-marker">!</span> Unused environment variable</p>
          <p nve-text="body sm muted">2 problems in 2 files</p>
        </div>
      </div>`;
  }

  const codePane = (label, value) => /* html */ `
    <div class="preview-editor-pane">
      ${label ? `<div class="preview-editor-pane-label" nve-text="label sm muted">${label}</div>` : ''}
      <div class="preview-editor-code" nve-text="code">
        <span>1</span><code nve-text="code">const model = '${value}';</code>
        <span>2</span><code nve-text="code">deploy(model);</code>
        <span>3</span><code nve-text="code">monitor('gpu');</code>
      </div>
    </div>`;

  return /* html */ `
    <div class="preview-editor">
      <div class="preview-editor-tab" nve-text="label sm medium">${title}</div>
      <div class="preview-editor-panes">
        ${isDiff ? codePane('Original', 'v1') + codePane('Modified', 'v2') : codePane('', 'nemotron')}
      </div>
    </div>`;
};

const previewOverrides = {
  'nve-dialog': renderPopoverMock({
    title: 'Deploy model?',
    content: 'Review the configuration before continuing.',
    type: 'dialog'
  }),
  'nve-drawer': /* html */ `
    <div class="preview-drawer" nve-layout="column gap:md">
      <div nve-layout="row align:space-between">
        <span nve-text="label sm medium">Session details</span>
        <span nve-text="body sm muted">×</span>
      </div>
      <div class="preview-mock-lines"><span></span><span></span><span></span></div>
    </div>`,
  'nve-dropdown': /* html */ `
    <div class="preview-dropdown" nve-layout="column gap:xs">
      <span nve-text="label sm medium">Actions</span>
      <span nve-text="body sm">Open details</span>
      <span nve-text="body sm">Duplicate</span>
      <span nve-text="body sm">Archive</span>
    </div>`,
  'nve-dropdown-group': /* html */ `
    <div class="preview-dropdown-group">
      <div class="preview-dropdown" nve-layout="column gap:xs">
        <span nve-text="label sm medium">Create</span>
        <span nve-text="body sm">Workspace&nbsp;›</span>
        <span nve-text="body sm">Deployment</span>
      </div>
      <div class="preview-dropdown preview-dropdown-nested" nve-layout="column gap:xs">
        <span nve-text="body sm">Training</span>
        <span nve-text="body sm">Inference</span>
      </div>
    </div>`,
  'nve-grid': /* html */ `
    <nve-grid>
      <nve-grid-header>
        <nve-grid-column>Model</nve-grid-column>
        <nve-grid-column>Status</nve-grid-column>
        <nve-grid-column>GPUs</nve-grid-column>
      </nve-grid-header>
      <nve-grid-row>
        <nve-grid-cell>Nemotron</nve-grid-cell>
        <nve-grid-cell>Running</nve-grid-cell>
        <nve-grid-cell>8</nve-grid-cell>
      </nve-grid-row>
      <nve-grid-row>
        <nve-grid-cell>Cosmos</nve-grid-cell>
        <nve-grid-cell>Ready</nve-grid-cell>
        <nve-grid-cell>4</nve-grid-cell>
      </nve-grid-row>
    </nve-grid>`,
  'nve-notification': renderPopoverMock({
    title: 'Deployment ready',
    content: 'The new endpoint is available.',
    type: 'notification'
  }),
  'nve-page': /* html */ `
    <div class="preview-page">
      <div class="preview-page-header" nve-layout="row align:space-between">
        <span nve-text="label sm medium">Infrastructure</span>
        <span nve-text="body sm muted">Deploy</span>
      </div>
      <div class="preview-page-body">
        <div class="preview-page-nav" nve-layout="column gap:sm">
          <span></span><span></span><span></span>
        </div>
        <div class="preview-page-main" nve-layout="column gap:sm">
          <span nve-text="label sm medium">Models</span>
          <div class="preview-mock-lines"><span></span><span></span><span></span></div>
        </div>
      </div>
    </div>`,
  'nve-page-loader': /* html */ `
    <div class="preview-page-loader" nve-layout="column gap:sm align:center">
      <nve-progress-ring status="accent"></nve-progress-ring>
      <span nve-text="body sm muted">Loading workspace</span>
    </div>`,
  'nve-panel': /* html */ `
    <div class="preview-panel" nve-layout="column gap:md">
      <div nve-layout="column gap:xs">
        <span nve-text="label medium">Deployment</span>
        <span nve-text="body sm muted">Session details</span>
      </div>
      <div nve-layout="column gap:md">
        <div nve-layout="column gap:xs">
          <span nve-text="body sm muted">Status</span>
          <span nve-text="label sm">Ready</span>
        </div>
        <div nve-layout="column gap:xs">
          <span nve-text="body sm muted">GPUs</span>
          <span nve-text="label sm">8 × H100</span>
        </div>
      </div>
    </div>`,
  'nve-toast': renderPopoverMock({ title: 'Changes saved', content: 'Your settings are up to date.', type: 'toast' }),
  'nve-toggletip': renderPopoverMock({
    title: 'GPU allocation',
    content: 'Choose a pool that matches the workload.',
    type: 'toggletip'
  }),
  'nve-tooltip': /* html */ `
    <div class="preview-tooltip" nve-text="body sm">Copy deployment ID</div>`,
  'nve-tree': /* html */ `
    <nve-tree behavior-expand>
      <nve-tree-node expanded>
        Infrastructure
        <nve-tree-node>Training</nve-tree-node>
        <nve-tree-node>Inference</nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>Datasets</nve-tree-node>
    </nve-tree>`,
  'nve-monaco-diff-editor': renderMonacoMock('nve-monaco-diff-editor'),
  'nve-monaco-diff-input': renderMonacoMock('nve-monaco-diff-input'),
  'nve-monaco-editor': renderMonacoMock('nve-monaco-editor'),
  'nve-monaco-input': renderMonacoMock('nve-monaco-input'),
  'nve-monaco-problems': renderMonacoMock('nve-monaco-problems'),
  'nve-media-fullscreen-button': /* html */ `<nve-media-fullscreen-button></nve-media-fullscreen-button>`,
  'nve-media-mute-button': /* html */ `<nve-media-mute-button></nve-media-mute-button>`,
  'nve-media-pause-button': /* html */ `<nve-media-pause-button></nve-media-pause-button>`,
  'nve-media-playback-rate-select': /* html */ `<nve-media-playback-rate-select></nve-media-playback-rate-select>`,
  'nve-media-seek-button': /* html */ `<nve-media-seek-button></nve-media-seek-button>`,
  'nve-media-time-range': /* html */ `<nve-media-time-range min="0" max="60" value="16" buffered-ranges='[{"start":0,"end":22},{"start":31,"end":48}]'></nve-media-time-range>`,
  'nve-media-volume-range': /* html */ `<nve-media-volume-range value="0.5"></nve-media-volume-range>`
};

const getPreviewTemplate = tag => {
  const defaultTemplate = defaultExamplesByTag.get(tag)?.template;
  const template =
    previewOverrides[tag] ??
    (defaultTemplate ? sanitizePreviewTemplate(defaultTemplate) : `<code nve-text="code">${escapeHtml(tag)}</code>`);

  return flattenNestedContainers(template);
};

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
          preview: '',
          tag: element.name,
          title: doc.data.title,
          version: element.version
        };
      })
      .map(component => {
        const preview = getPreviewTemplate(component.tag);

        return {
          ...component,
          preview
        };
      })
      .sort(sortByTitle);

  return [...createCatalogSection(isElementsComponentDoc), ...createCatalogSection(isLibraryComponentDoc)];
};

const renderComponentCard = component => /* html */ `
  <nve-card class="component-card">
    <div
      class="component-preview"
      data-component-preview="${escapeHtml(component.tag)}"
      aria-hidden="true"
      inert
    >
      <div class="component-preview-content">${component.preview}</div>
    </div>
    <nve-card-content>
      <div nve-layout="column gap:sm">
        <h3 nve-text="label medium">${escapeHtml(component.title)}</h3>
        <p nve-text="body sm">${escapeHtml(component.description)}</p>
      </div>
    </nve-card-content>
    <a
      class="component-card-link"
      href="${escapeHtml(component.href)}"
      aria-label="View ${escapeHtml(component.title)} documentation"
    ></a>
  </nve-card>`;

const renderPreviewScript = () => /* html */ `
<script type="module">
  const loadPreview = async preview => {
    const tag = preview.dataset.componentPreview;

    try {
      const customElementNames = new Set(
        [...preview.querySelectorAll('*')]
          .map(element => element.localName)
          .filter(name => name.startsWith('nve-'))
      );
      await Promise.all([...customElementNames].map(name => customElements.whenDefined(name)));

      if (tag === 'nve-sparkline') {
        preview.querySelector('nve-sparkline').data = [18, 22, 20, 24, 19, 28, 25, 30];
      }

      const updates = [...preview.querySelectorAll('*')]
        .map(element => element.updateComplete)
        .filter(Boolean);
      await Promise.all(updates);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    } catch (error) {
      console.error('Unable to load component preview', { error, tag });
      preview.dataset.previewError = '';
    }

    preview.dataset.previewReady = '';
  };

  const previews = document.querySelectorAll('[data-component-preview]');

  if ('IntersectionObserver' in globalThis) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          void loadPreview(entry.target);
        });
      },
      { rootMargin: '300px 0px' }
    );

    previews.forEach(preview => observer.observe(preview));
  } else {
    previews.forEach(preview => void loadPreview(preview));
  }
</script>`;

export function render(data) {
  const components = createComponentCatalog(data.collections.componentDocs);

  return /* html */ `
<style>
  #doc-content {
    max-width: 1400px !important;
  }

  .component-card {
    position: relative;
    height: 100%;
    min-height: 300px;
  }

  .component-card-link {
    position: absolute;
    z-index: 2;
    inset: 0;
    border-radius: var(--nve-ref-border-radius-lg);
    cursor: pointer;
  }

  .component-card-link:focus-visible {
    outline: var(--nve-ref-outline);
    outline-offset: calc(-1 * var(--nve-ref-size-50));
  }

  .component-preview {
    position: relative;
    display: grid;
    place-items: center;
    height: 180px;
    overflow: hidden;
    border-bottom: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
    background: color-mix(
      in oklab,
      var(--nve-sys-layer-container-accent-background) 70%,
      transparent
    );
  }

  .component-preview-content {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    transform: scale(0.85);

    /* force overflow to prevent step wrap */
    nve-steps {
      width: 600px;
    }
  }

  .preview-mock,
  .preview-dropdown,
  .preview-tooltip,
  .preview-drawer,
  .preview-editor,
  .preview-page,
  .preview-panel {
    border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
    border-radius: var(--nve-ref-border-radius-md);
    background: var(--nve-sys-layer-container-background);
    color: var(--nve-sys-layer-container-color);
    box-shadow: var(--nve-ref-shadow-200);
  }

  .preview-mock {
    width: 280px;
    padding: var(--nve-ref-space-md);
  }

  .preview-mock-notification {
    border-inline-start: var(--nve-ref-border-width-lg) solid var(--nve-sys-support-accent-color);
  }

  .preview-tooltip {
    position: relative;
    padding: var(--nve-ref-space-xs) var(--nve-ref-space-sm);
  }

  .preview-tooltip::after {
    position: absolute;
    bottom: calc(-1 * var(--nve-ref-space-xs));
    left: 50%;
    width: var(--nve-ref-space-sm);
    height: var(--nve-ref-space-sm);
    background: inherit;
    content: '';
    transform: translateX(-50%) rotate(45deg);
  }

  .preview-drawer {
    width: 250px;
    height: 170px;
    padding: var(--nve-ref-space-md);
    border-radius: 0;
    border-inline-start: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
  }

  .preview-panel {
    width: 260px;
    height: 180px;
    padding: var(--nve-ref-space-md);
    border-radius: 0;
  }

  .preview-page {
    width: 560px;
    height: 260px;
    overflow: hidden;
    background: var(--nve-sys-layer-canvas-background);
  }

  .preview-page-header {
    min-height: var(--nve-ref-size-900);
    padding: var(--nve-ref-space-sm) var(--nve-ref-space-md);
    border-bottom: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
    background: var(--nve-sys-layer-shell-background);
  }

  .preview-page-body {
    display: grid;
    grid-template-columns: 140px 1fr;
    height: calc(100% - var(--nve-ref-size-900));
  }

  .preview-page-nav,
  .preview-page-main {
    padding: var(--nve-ref-space-md);
  }

  .preview-page-nav {
    border-inline-end: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
    background: var(--nve-sys-layer-container-background);

    > span {
      display: block;
      width: 100%;
      height: var(--nve-ref-space-sm);
      border-radius: var(--nve-ref-border-radius-sm);
      background: var(--nve-sys-interaction-background);
    }
  }

  .preview-mock-lines {
    display: grid;
    gap: var(--nve-ref-space-sm);

    span {
      display: block;
      width: 100%;
      height: var(--nve-ref-space-sm);
      border-radius: var(--nve-ref-border-radius-sm);
      background: var(--nve-sys-interaction-background);
    }

    span:nth-child(2) {
      width: 80%;
    }

    span:nth-child(3) {
      width: 60%;
    }
  }

  .preview-dropdown {
    min-width: 170px;
    padding: var(--nve-ref-space-sm);
  }

  .preview-dropdown-group {
    position: relative;
    width: 310px;
    height: 140px;
  }

  .preview-dropdown-nested {
    position: absolute;
    top: var(--nve-ref-space-lg);
    right: 0;
  }

  .preview-editor {
    width: 430px;
    height: 180px;
    overflow: hidden;
    background: var(--nve-sys-layer-container-background);
    color: var(--nve-sys-layer-container-color);
    box-shadow: none;
  }

  .preview-editor-tab,
  .preview-editor-pane-label {
    padding: var(--nve-ref-space-xs) var(--nve-ref-space-sm);
    border-bottom: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
  }

  .preview-editor-panes {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    height: calc(100% - var(--nve-ref-space-xl));
  }

  .preview-editor-pane + .preview-editor-pane {
    border-inline-start: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
  }

  .preview-editor-code {
    display: grid;
    grid-template-columns: min-content 1fr;
    gap: var(--nve-ref-space-xs) var(--nve-ref-space-sm);
    padding: var(--nve-ref-space-sm);

    > span {
      color: var(--nve-sys-text-muted-color);
      text-align: end;
    }
  }

  .preview-problems {
    padding: var(--nve-ref-space-sm);
  }

  .preview-problems-marker {
    display: inline-grid;
    place-items: center;
    width: var(--nve-ref-space-md);
    margin-inline-end: var(--nve-ref-space-xs);
    border-radius: var(--nve-ref-border-radius-full);
    background: var(--nve-sys-interaction-background);
  }
</style>

<h1 nve-text="heading xl mkd">NVIDIA Elements Components</h1>

<p nve-text="body">
  NVIDIA Elements components are production Web Components for an agent-ready design system. Use them to build AI
  infrastructure dashboards, robotics consoles, autonomous vehicle tools, and internal developer workflows with
  stable <code nve-text="code">nve-*</code> APIs, design tokens, accessibility guidance, and examples.
</p>

<div nve-layout="grid gap:md align:vertical-stretch span-items:12 &lg|span-items:6 &xl|span-items:4 &xxl|span-items:3">
  ${components.map(renderComponentCard).join('')}
</div>

${renderPreviewScript()}`;
}
