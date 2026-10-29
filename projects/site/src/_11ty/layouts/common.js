/* eslint-env node */
/* global process */

import { ELEMENTS_REPO_BASE_URL } from '../utils/env.js';
import { UPDATE_FEEDS } from '../plugins/updates-feed.js';
import { DEPLOYED_SITE_URL, getSiteUrl } from '../utils/site-url.js';
import {
  AUTHOR_CREDENTIALS,
  AUTHOR_NAME,
  AUTHOR_URL,
  escapeAttr,
  resolvePageMeta,
  renderJsonLd,
  BASE_URL
} from './metadata.js';

/**
 * This renders the base head element with all the common styles and scripts needed for ALL PAGES.
 * Page specific resources should not be placed here.
 */
export const renderBaseHead = data => {
  const meta = resolvePageMeta(data);
  const ogType = meta.url === '/' ? 'website' : 'article';
  const robots = data.noindex ? 'noindex,follow' : 'all';
  const markdownAlternate = data.alternateMarkdown
    ? `<link rel="alternate" type="text/markdown" title="Markdown version" href="${getSiteUrl(data.alternateMarkdown)}">`
    : '';
  return /* html */ `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="${robots}">
  <base href="${BASE_URL}" />
  <title data-pagefind-meta="title">${escapeAttr(meta.title)}</title>
  <meta name="description" content="${escapeAttr(meta.description)}">
  <meta name="author" content="${escapeAttr(AUTHOR_NAME)}">
  <link rel="canonical" href="${meta.canonicalUrl}">
  <link rel="alternate" type="text/plain" title="llms.txt" href="${DEPLOYED_SITE_URL}/llms.txt">
  ${UPDATE_FEEDS.map(({ label, outputPath, type }) => `<link rel="alternate" type="application/${type}+xml" title="NVIDIA Elements Updates (${label})" href="${getSiteUrl(outputPath)}">`).join('\n  ')}
  ${markdownAlternate}
  <link href="https://github.com/NVIDIA/elements" rel="me">
  <meta property="og:title" content="${escapeAttr(meta.title)}">
  <meta property="og:url" content="${meta.canonicalUrl}">
  <meta property="og:description" content="${escapeAttr(meta.description)}">
  <meta property="og:image" content="${meta.ogImage}">
  <meta property="og:image:alt" content="${escapeAttr(meta.ogImageAlt)}">
  ${meta.video ? '<meta property="og:image:width" content="1920"><meta property="og:image:height" content="1080"><meta property="og:image:type" content="image/webp">' : ''}
  <meta property="og:site_name" content="NVIDIA Elements">
  <meta property="og:type" content="${ogType}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(meta.title)}">
  <meta name="twitter:description" content="${escapeAttr(meta.description)}">
  <meta name="twitter:image" content="${meta.ogImage}">
  <meta name="twitter:image:alt" content="${escapeAttr(meta.ogImageAlt)}">
  <link rel="icon" href="https://avatars.githubusercontent.com/u/1728152">
  <meta name="google-site-verification" content="pqQ1zOnKkqdZ2Lm0H8qIQx3q1x6Q7ghbumSrwzF_KSY" />
  <meta name="msvalidate.01" content="590EBF38676B077801C72048F4D8B5CB" />
  ${renderJsonLd(data, meta)}
  ${renderGlobalsScript(data)}
  <style>
    @import '@nvidia-elements/themes/fonts/inter.css';
    @import '@nvidia-elements/themes/index.css';
    @import '@nvidia-elements/themes/dark.css';
    @import '@nvidia-elements/styles/view-transitions.css';
    @import '@nvidia-elements/styles/typography.css';
    @import '@nvidia-elements/styles/layout.css';
    @import '@nvidia-elements/styles/labs/layout-viewport.css';
    @import '@nvidia-elements/styles/labs/layout-container.css';

    @import '@nvidia-elements/themes/reduced-motion.css';
    @import '@nvidia-elements/themes/high-contrast.css';
    @import '@nvidia-elements/themes/compact.css';
    @import '@nvidia-elements/themes/debug.css';

    nve-page:not(:defined) {
      visibility: visible !important;
    }

    /* hide non-ssr elements until defined */
    nve-tree:not(:defined),
    nve-grid:not(:defined),
    nvd-canvas:not(:defined),
    nve-badge:not(:defined),
    nve-button:not(:defined) {
      visibility: hidden !important;
    }

    /* hide if not defined and view transition is active */
    [nve-transition='auto']:active-view-transition-type(forwards, backwards) {
      nve-page:not(:defined) {
        visibility: hidden !important;
      }
    }

    /* mobile */
    .header-btn {
      display: none;
    }

    @media (width < 920px) {
      [no-js] #sidenav-panel {
        display: none !important;
      }
    }

    @media (width >= 920px) {
      nve-page-header {
        .header-btn {
          display: block !important;
        }

        .header-menu-btn {
          display: none !important;
        }
      }
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  </style>
  ${
    data.disableTheme
      ? ''
      : /* html */ `<script>
    const globals = JSON.parse(localStorage.getItem('elements-sb-globals') ?? '{}');
    if (globals.classic === 'classic' && globals.theme !== 'high-contrast') {
      const link = document.createElement('link');
      link.id = 'classic-theme-stylesheet';
      link.rel = 'stylesheet';
      link.href = new URL('static/themes/classic.css', document.baseURI).href;
      document.head.append(link);
    }
  </script>`
  }
  <script type="module">
    const sidenavPanel = globalThis.document.querySelector('#sidenav-panel');
    if (sidenavPanel && globalThis.window.innerWidth < 920) {
      sidenavPanel.hidden = true;
    }
    globalThis.document.documentElement.removeAttribute('no-js');
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-K5TKPS8VHN"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-K5TKPS8VHN');
  </script>
`;
};

export const renderDocsNav = data => /* html */ `
<nve-tree id="docs-nav" data-pagefind-ignore="all" behavior-expand selectable="single">
  <nve-tree-node ${data.page.url === '/' || data.page.url.includes('/docs/integrations/installation/') || data.page.url.includes('/docs/cli/') || data.page.url.includes('/docs/mcp/') || data.page.url.includes('/docs/skills/') || data.page.url.includes('/docs/lint/') || data.page.url.includes('/docs/whats-new/') ? 'expanded' : ''}>
    <a href="/">Getting Started</a>
    <nve-tree-node ${data.page.url === '/' ? 'selected' : ''}><a href="/">Overview</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/installation/') ? 'selected' : ''}><a href="/docs/integrations/installation/">Installation</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/cli/') ? 'selected' : ''}><a href="/docs/cli/">CLI</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/mcp/') ? 'selected' : ''}><a href="/docs/mcp/">MCP</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/skills/') ? 'selected' : ''}><a href="/docs/skills/">Skills</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/lint/') ? 'selected' : ''}><a href="/docs/lint/">Lint</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/whats-new/') ? 'selected' : ''}><a href="/docs/whats-new/">What’s New</a></nve-tree-node>
    <nve-tree-node><a href="https://github.com/NVIDIA/elements" target="_blank">GitHub</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/patterns/') ? 'expanded' : ''}>
    <a href="/docs/patterns/">Patterns</a>
    <nve-tree-node ${data.page.url === '/docs/patterns/' ? 'selected' : ''}><a href="/docs/patterns/">Overview</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/agent/') ? 'selected' : ''}><a href="/docs/patterns/agent/">Agent</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/authentication/') ? 'selected' : ''}><a href="/docs/patterns/authentication/">Authentication</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/browse/') ? 'selected' : ''}><a href="/docs/patterns/browse/">Browse</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/chat/') ? 'selected' : ''}><a href="/docs/patterns/chat/">Chat</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/code/') ? 'selected' : ''}><a href="/docs/patterns/code/">Code</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/dashboard/') ? 'selected' : ''}><a href="/docs/patterns/dashboard/">Dashboard</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/editor/') ? 'selected' : ''}><a href="/docs/patterns/editor/">Editor</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/empty-states/') ? 'selected' : ''}><a href="/docs/patterns/empty-states/">Empty States</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/heatmap/') ? 'selected' : ''}><a href="/docs/patterns/heatmap/">Heatmap</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/keyboard-shortcut/') ? 'selected' : ''}><a href="/docs/patterns/keyboard-shortcut/">Keyboard Shortcut</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/logging/') ? 'selected' : ''}><a href="/docs/patterns/logging/">Logging</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/media/') ? 'selected' : ''}><a href="/docs/patterns/media/">Media</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/navigation/') ? 'selected' : ''}><a href="/docs/patterns/navigation/">Navigation</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/onboarding/') ? 'selected' : ''}><a href="/docs/patterns/onboarding/">Onboarding</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/panel/') ? 'selected' : ''}><a href="/docs/patterns/panel/">Panel</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/responsive/') ? 'selected' : ''}><a href="/docs/patterns/responsive/">Responsive</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/search/') ? 'selected' : ''}><a href="/docs/patterns/search/">Search</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/subheader/') ? 'selected' : ''}><a href="/docs/patterns/subheader/">Subheader</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/trend/') ? 'selected' : ''}><a href="/docs/patterns/trend/">Trend</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/elements/') || data.page.url.includes('/docs/foundations/scroll-box/') || data.page.url.includes('/docs/media/') || data.page.url.includes('/docs/monaco/') || data.page.url.includes('/docs/markdown/') || data.page.url.includes('/docs/code/') || data.page.url.includes('/docs/viewport/') ? 'expanded' : ''}>
    <a href="/docs/elements/">Elements</a>
    <nve-tree-node ${data.page.url === '/docs/elements/' ? 'selected' : ''}><a href="/docs/elements/">Overview</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/accordion/') ? 'selected' : ''}><a href="/docs/elements/accordion/">Accordion</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/alert/') ? 'selected' : ''}><a href="/docs/elements/alert/">Alert</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/avatar/') ? 'selected' : ''}><a href="/docs/elements/avatar/">Avatar</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/badge/') ? 'selected' : ''}><a href="/docs/elements/badge/">Badge</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/breadcrumb/') ? 'selected' : ''}><a href="/docs/elements/breadcrumb/">Breadcrumb</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/button/') ? 'selected' : ''}><a href="/docs/elements/button/">Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/button-group/') ? 'selected' : ''}><a href="/docs/elements/button-group/">Button Group</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/card/') ? 'selected' : ''}><a href="/docs/elements/card/">Card</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/chat-message/') ? 'selected' : ''}><a href="/docs/elements/chat-message/">Chat Message</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/checkbox/') ? 'selected' : ''}><a href="/docs/elements/checkbox/">Checkbox</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/code/codeblock/') ? 'selected' : ''}><a href="/docs/code/codeblock/">Codeblock</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/color/') ? 'selected' : ''}><a href="/docs/elements/color/">Color</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/combobox/') ? 'selected' : ''}><a href="/docs/elements/combobox/">Combobox</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/copy-button/') ? 'selected' : ''}><a href="/docs/elements/copy-button/">Copy Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.startsWith('/docs/elements/data-grid/') ? 'expanded' : ''}>
      <a href="/docs/elements/data-grid/">Datagrid</a>
      <nve-tree-node ${data.page.url === '/docs/elements/data-grid/' ? 'selected' : ''}><a href="/docs/elements/data-grid/">Getting Started</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/integrations/') ? 'selected' : ''}><a href="/docs/elements/data-grid/integrations/">Integrations</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-action/') ? 'selected' : ''}><a href="/docs/elements/data-grid/column-action/">Column Action</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-alignment/') ? 'selected' : ''}><a href="/docs/elements/data-grid/column-alignment/">Column Alignment</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-fixed/') ? 'selected' : ''}><a href="/docs/elements/data-grid/column-fixed/">Column Fixed</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-width/') ? 'selected' : ''}><a href="/docs/elements/data-grid/column-width/">Column width</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/container/') ? 'selected' : ''}><a href="/docs/elements/data-grid/container/">Container</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/card/') ? 'selected' : ''}><a href="/docs/elements/data-grid/card/">Card</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/display-settings/') ? 'selected' : ''}><a href="/docs/elements/data-grid/display-settings/">Display Settings</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/footer/') ? 'selected' : ''}><a href="/docs/elements/data-grid/footer/">Footer</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/heatmap/') ? 'selected' : ''}><a href="/docs/elements/data-grid/heatmap/">Heatmap</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/keynav/') ? 'selected' : ''}><a href="/docs/elements/data-grid/keynav/">Keynav</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/multi-select/') ? 'selected' : ''}><a href="/docs/elements/data-grid/multi-select/">Multi Select</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/pagination/') ? 'selected' : ''}><a href="/docs/elements/data-grid/pagination/">Pagination</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/panel-detail/') ? 'selected' : ''}><a href="/docs/elements/data-grid/panel-detail/">Panel Detail</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/panel-grid/') ? 'selected' : ''}><a href="/docs/elements/data-grid/panel-grid/">Panel Grid</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/performance/') ? 'selected' : ''}><a href="/docs/elements/data-grid/performance/">Performance</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/placeholder/') ? 'selected' : ''}><a href="/docs/elements/data-grid/placeholder/">Placeholder</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/row-action/') ? 'selected' : ''}><a href="/docs/elements/data-grid/row-action/">Row Action</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/row-groups/') ? 'selected' : ''}><a href="/docs/elements/data-grid/row-groups/">Row Groups</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/row-sort/') ? 'selected' : ''}><a href="/docs/elements/data-grid/row-sort/">Row Sort</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/scroll-height/') ? 'selected' : ''}><a href="/docs/elements/data-grid/scroll-height/">Scroll Height</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/single-select/') ? 'selected' : ''}><a href="/docs/elements/data-grid/single-select/">Single Select</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/stripe/') ? 'selected' : ''}><a href="/docs/elements/data-grid/stripe/">Stripe</a></nve-tree-node>
    </nve-tree-node>  
    <nve-tree-node ${data.page.url.includes('/docs/elements/date/') ? 'selected' : ''}><a href="/docs/elements/date/">Date</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/datetime/') ? 'selected' : ''}><a href="/docs/elements/datetime/">Datetime</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dialog/') ? 'selected' : ''}><a href="/docs/elements/dialog/">Dialog</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/divider/') ? 'selected' : ''}><a href="/docs/elements/divider/">Divider</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dot/') ? 'selected' : ''}><a href="/docs/elements/dot/">Dot</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/drag-handle/') ? 'selected' : ''}><a href="/docs/elements/drag-handle/">Drag Handle</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/drawer/') ? 'selected' : ''}><a href="/docs/elements/drawer/">Drawer</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dropdown/') ? 'selected' : ''}><a href="/docs/elements/dropdown/">Dropdown</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dropdown-group/') ? 'selected' : ''}><a href="/docs/elements/dropdown-group/">Dropdown Group</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dropzone/') ? 'selected' : ''}><a href="/docs/elements/dropzone/">Dropzone</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/file/') ? 'selected' : ''}><a href="/docs/elements/file/">File</a></nve-tree-node>
    <nve-tree-node ${data.page.url.startsWith('/docs/elements/format-') ? 'expanded' : ''}>
      <a href="/docs/elements/format-bytes/">Format</a>
      <nve-tree-node ${data.page.url.includes('/docs/elements/format-bytes/') ? 'selected' : ''}><a href="/docs/elements/format-bytes/">Bytes</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/format-datetime/') ? 'selected' : ''}><a href="/docs/elements/format-datetime/">Datetime</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/format-number/') ? 'selected' : ''}><a href="/docs/elements/format-number/">Number</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/format-relative-time/') ? 'selected' : ''}><a href="/docs/elements/format-relative-time/">Relative Time</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/format-truncate/') ? 'selected' : ''}><a href="/docs/elements/format-truncate/">Truncate</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.startsWith('/docs/elements/forms/') || data.page.url.startsWith('/docs/elements/control/') ? 'expanded' : ''}>
      <a href="/docs/elements/forms/">Forms</a>
      <nve-tree-node ${data.page.url === '/docs/elements/forms/' ? 'selected' : ''}><a href="/docs/elements/forms/">Getting Started</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/forms/validation/') ? 'selected' : ''}><a href="/docs/elements/forms/validation/">Validation</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/forms/actions/') ? 'selected' : ''}><a href="/docs/elements/forms/actions/">Actions</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/control/') ? 'selected' : ''}><a href="/docs/elements/control/">Control</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/gauge/') ? 'selected' : ''}><a href="/docs/elements/gauge/">Gauge</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/ghost/') ? 'selected' : ''}><a href="/docs/elements/ghost/">Ghost</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/icon/') ? 'selected' : ''}><a href="/docs/elements/icon/">Icon</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/icon-button/') ? 'selected' : ''}><a href="/docs/elements/icon-button/">Icon Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/iframe/') ? 'selected' : ''}><a href="/docs/elements/iframe/">Iframe</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/input/') ? 'selected' : ''}><a href="/docs/elements/input/">Input</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/input-group/') ? 'selected' : ''}><a href="/docs/elements/input-group/">Input Group</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/joystick/') ? 'selected' : ''}><a href="/docs/elements/joystick/">Joystick</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/logo/') ? 'selected' : ''}><a href="/docs/elements/logo/">Logo</a></nve-tree-node>
    <nve-tree-node ${data.page.url.endsWith('/docs/markdown/') ? 'selected' : ''}><a href="/docs/markdown/">Markdown</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/markdown/styles/') ? 'selected' : ''}><a href="/docs/markdown/styles/">Markdown CSS</a></nve-tree-node>
    <nve-tree-node ${data.page.url.startsWith('/docs/media/') ? 'expanded' : ''}>
      <a href="/docs/media/controller/">Media</a>
      <nve-tree-node ${data.page.url.includes('/docs/media/controller/') ? 'selected' : ''}><a href="/docs/media/controller/">Controller</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/media/pause-button/') ? 'selected' : ''}><a href="/docs/media/pause-button/">Pause Button</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/media/playback-rate-select/') ? 'selected' : ''}><a href="/docs/media/playback-rate-select/">Playback Rate Select</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/media/loop-button/') ? 'selected' : ''}><a href="/docs/media/loop-button/">Loop Button</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/media/mute-button/') ? 'selected' : ''}><a href="/docs/media/mute-button/">Mute Button</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/media/pip-button/') ? 'selected' : ''}><a href="/docs/media/pip-button/">Media PiP Button</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/media/seek-button/') ? 'selected' : ''}><a href="/docs/media/seek-button/">Seek Button</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/media/time-range/') ? 'selected' : ''}><a href="/docs/media/time-range/">Time Range</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/media/volume-range/') ? 'selected' : ''}><a href="/docs/media/volume-range/">Volume Range</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/media/fullscreen-button/') ? 'selected' : ''}><a href="/docs/media/fullscreen-button/">Full-screen Button</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/menu/') ? 'selected' : ''}><a href="/docs/elements/menu/">Menu</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/month/') ? 'selected' : ''}><a href="/docs/elements/month/">Month</a></nve-tree-node>
    <nve-tree-node ${data.page.url.startsWith('/docs/monaco/') ? 'expanded' : ''}>
      <a href="/docs/monaco/input/">Monaco</a>
      <nve-tree-node ${data.page.url.includes('/docs/monaco/input/') ? 'selected' : ''}><a href="/docs/monaco/input/">Input</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/monaco/diff-input/') ? 'selected' : ''}><a href="/docs/monaco/diff-input/">Diff Input</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/monaco/editor/') ? 'selected' : ''}><a href="/docs/monaco/editor/">Monaco Editor</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/monaco/diff-editor/') ? 'selected' : ''}><a href="/docs/monaco/diff-editor/">Diff Editor</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/monaco/problems/') ? 'selected' : ''}><a href="/docs/monaco/problems/">Problems</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/notification/') ? 'selected' : ''}><a href="/docs/elements/notification/">Notification</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/page/') ? 'selected' : ''}><a href="/docs/elements/page/">Page</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/page-header/') ? 'selected' : ''}><a href="/docs/elements/page-header/">Page Header</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/page-loader/') ? 'selected' : ''}><a href="/docs/elements/page-loader/">Page Loader</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/pagination/') ? 'selected' : ''}><a href="/docs/elements/pagination/">Pagination</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/progressive-filter-chip/') ? 'selected' : ''}><a href="/docs/elements/progressive-filter-chip/">Progressive Filter Chip</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/progress-bar/') ? 'selected' : ''}><a href="/docs/elements/progress-bar/">Progress Bar</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/progress-dot/') ? 'selected' : ''}><a href="/docs/elements/progress-dot/">Progress Dot</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/progress-ring/') ? 'selected' : ''}><a href="/docs/elements/progress-ring/">Progress Ring</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/password/') ? 'selected' : ''}><a href="/docs/elements/password/">Password</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/preferences-input/') ? 'selected' : ''}><a href="/docs/elements/preferences-input/">Preferences Input</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/pulse/') ? 'selected' : ''}><a href="/docs/elements/pulse/">Pulse</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/radio/') ? 'selected' : ''}><a href="/docs/elements/radio/">Radio</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/range/') ? 'selected' : ''}><a href="/docs/elements/range/">Range</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/resize-handle/') ? 'selected' : ''}><a href="/docs/elements/resize-handle/">Resize Handle</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/scroll-box/') ? 'selected' : ''}><a href="/docs/foundations/scroll-box/">Scroll Box</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/search/') ? 'selected' : ''}><a href="/docs/elements/search/">Search</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/select/') ? 'selected' : ''}><a href="/docs/elements/select/">Select</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/skeleton/') ? 'selected' : ''}><a href="/docs/elements/skeleton/">Skeleton</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/sort-button/') ? 'selected' : ''}><a href="/docs/elements/sort-button/">Sort Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/sparkline/') ? 'selected' : ''}><a href="/docs/elements/sparkline/">Sparkline</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/star-rating/') ? 'selected' : ''}><a href="/docs/elements/star-rating/">Star Rating</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/steps/') ? 'selected' : ''}><a href="/docs/elements/steps/">Steps</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/switch/') ? 'selected' : ''}><a href="/docs/elements/switch/">Switch</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tabs/') ? 'selected' : ''}><a href="/docs/elements/tabs/">Tabs</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tag/') ? 'selected' : ''}><a href="/docs/elements/tag/">Tag</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/textarea/') ? 'selected' : ''}><a href="/docs/elements/textarea/">Textarea</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/time/') ? 'selected' : ''}><a href="/docs/elements/time/">Time</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/toast/') ? 'selected' : ''}><a href="/docs/elements/toast/">Toast</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/toggletip/') ? 'selected' : ''}><a href="/docs/elements/toggletip/">Toggletip</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/toolbar/') ? 'selected' : ''}><a href="/docs/elements/toolbar/">Toolbar</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tooltip/') ? 'selected' : ''}><a href="/docs/elements/tooltip/">Tooltip</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tree/') ? 'selected' : ''}><a href="/docs/elements/tree/">Tree</a></nve-tree-node>
    <nve-tree-node ${data.page.url.startsWith('/docs/viewport/') ? 'expanded' : ''}>
      <a href="/docs/viewport/">Viewport</a>
      <nve-tree-node ${['/docs/viewport/', '/docs/viewport/api/', '/docs/viewport/examples/'].includes(data.page.url) ? 'selected' : ''}><a href="/docs/viewport/">Viewport</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/viewport/gridlines/') ? 'selected' : ''}><a href="/docs/viewport/gridlines/">Gridlines</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/viewport/minimap/') ? 'selected' : ''}><a href="/docs/viewport/minimap/">Minimap</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/viewport/zoom-range/') ? 'selected' : ''}><a href="/docs/viewport/zoom-range/">Zoom Range</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/week/') ? 'highlighted selected' : ''}><a href="/docs/elements/week/">Week</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/workspace/') ? 'highlighted selected' : ''}><a href="/docs/elements/workspace/">Workspace</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/foundations/') || data.page.url.includes('/docs/design-md/') ? 'expanded' : ''}>
    <a href="/docs/foundations/">Foundations</a>
    <nve-tree-node ${data.page.url.endsWith('/docs/foundations/') ? 'selected' : ''}><a href="/docs/foundations/">Overview</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/typography/') ? 'selected' : ''}><a href="/docs/foundations/typography/">Typography</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/iconography/') ? 'selected' : ''}><a href="/docs/foundations/iconography/">Iconography</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/') ? 'expanded' : ''} ${data.page.url === '/docs/foundations/themes/' ? 'highlighted' : ''}>
      <a href="/docs/foundations/themes/">Themes</a>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/tokens/') ? 'selected' : ''}><a href="/docs/foundations/themes/tokens/">Design Tokens</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/size/' ? 'selected' : ''}><a href="/docs/foundations/themes/size/">Size & Space</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/objects/') ? 'selected' : ''}><a href="/docs/foundations/themes/objects/">Objects</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/interactions/') ? 'selected' : ''}><a href="/docs/foundations/themes/interactions/">Interactions</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/support/' ? 'selected' : ''}><a href="/docs/foundations/themes/support/">Support</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/status/' ? 'selected' : ''}><a href="/docs/foundations/themes/status/">Status</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/color/' ? 'selected' : ''}><a href="/docs/foundations/themes/color/">Color</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/animation/' ? 'selected' : ''}><a href="/docs/foundations/themes/animation/">Animation</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/fonts/' ? 'selected' : ''}><a href="/docs/foundations/themes/fonts/">Fonts</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/layers/') ? 'selected' : ''}><a href="/docs/foundations/themes/layers/">Layers</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/custom/' ? 'selected' : ''}><a href="/docs/foundations/themes/custom/">Custom</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/') ? 'expanded' : ''} ${data.page.url === '/docs/foundations/layout/' ? 'highlighted' : ''}>
      <a href="/docs/foundations/layout/">Layout</a>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/horizontal/') ? 'selected' : ''}><a href="/docs/foundations/layout/horizontal/">Horizontal</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/vertical/') ? 'selected' : ''}><a href="/docs/foundations/layout/vertical/">Vertical</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/grid/') ? 'selected' : ''}><a href="/docs/foundations/layout/grid/">Grid</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/popovers/' ? 'selected' : ''}><a href="/docs/foundations/popovers/">Popovers</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/i18n/' ? 'selected' : ''}><a href="/docs/foundations/i18n/">i18n</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/visualization/' ? 'selected' : ''}><a href="/docs/foundations/visualization/">Visualization</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/view-transitions/' ? 'selected' : ''}><a href="/docs/foundations/view-transitions/">View Transitions</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/design-md/') ? 'selected' : ''}><a href="/docs/design-md/">DESIGN.md</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/integrations/') ? 'expanded' : ''}>
    <a href="/docs/integrations/">Integrations</a>
    <nve-tree-node ${data.page.url.endsWith('/docs/integrations/') ? 'selected' : ''}><a href="/docs/integrations/">Getting Started</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/angular/') ? 'selected' : ''}><a href="/docs/integrations/angular/">Angular</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/bundles/') ? 'selected' : ''}><a href="/docs/integrations/bundles/">Bundles</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/cdn/') ? 'selected' : ''}><a href="/docs/integrations/cdn/">CDN</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/custom-elements/') ? 'selected' : ''}><a href="/docs/integrations/custom-elements/">Custom Elements</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/eleventy/') ? 'selected' : ''}><a href="/docs/integrations/eleventy/">Eleventy</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/go/') ? 'selected' : ''}><a href="/docs/integrations/go/">Golang</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/go-htmx/') ? 'selected' : ''}><a href="/docs/integrations/go-htmx/">HTMX + Go</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/hugo/') ? 'selected' : ''}><a href="/docs/integrations/hugo/">Hugo</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/importmaps/') ? 'selected' : ''}><a href="/docs/integrations/importmaps/">Import Maps</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/lit/') ? 'selected' : ''}><a href="/docs/integrations/lit/">Lit</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/lit-library/') ? 'selected' : ''}><a href="/docs/integrations/lit-library/">Lit Library</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/mcp-apps/') ? 'selected' : ''}><a href="/docs/integrations/mcp-apps/">MCP Apps</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/nextjs/') ? 'selected' : ''}><a href="/docs/integrations/nextjs/">NextJS</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/nuxt/') ? 'selected' : ''}><a href="/docs/integrations/nuxt/">Nuxt</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/pi/') ? 'selected' : ''}><a href="/docs/integrations/pi/">Pi</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/preact/') ? 'selected' : ''}><a href="/docs/integrations/preact/">Preact</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/react/') ? 'selected' : ''}><a href="/docs/integrations/react/">React</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/solidjs/') ? 'selected' : ''}><a href="/docs/integrations/solidjs/">SolidJS</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/sphinx/') ? 'selected' : ''}><a href="/docs/integrations/sphinx/">Sphinx</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/svelte/') ? 'selected' : ''}><a href="/docs/integrations/svelte/">Svelte</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/typescript/') ? 'selected' : ''}><a href="/docs/integrations/typescript/">TypeScript</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/vue/') ? 'selected' : ''}><a href="/docs/integrations/vue/">Vue</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/metrics/') || data.page.url.includes('/docs/changelog/') || data.page.url.includes('/docs/about/') || data.page.url === '/sitemap/' ? 'expanded' : ''}>
    <a href="/docs/changelog/">About</a>
    <nve-tree-node ${data.page.url.includes('/docs/changelog/') ? 'selected' : ''}><a href="/docs/changelog/">Changelog</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/metrics/') ? 'selected' : ''}><a href="/docs/metrics/">Metrics</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/support/') ? 'selected' : ''}><a href="/docs/about/support/">Support</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/accessibility/') ? 'selected' : ''}><a href="/docs/about/accessibility/">Accessibility</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/contributions/') ? 'selected' : ''}><a href="/docs/about/contributions/">Contributions</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/requests/') ? 'selected' : ''}><a href="/docs/about/requests/">Requests</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/migration/') ? 'selected' : ''}><a href="/docs/about/migration/">Migration</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/sitemap/' ? 'selected' : ''}><a href="/sitemap/">Sitemap</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/labs/') || data.page.url.includes('/docs/plot/') || data.page.url.includes('/docs/scene/') ? 'expanded' : ''} ${data.page.url === '/docs/labs/' ? 'highlighted' : ''} style="--color: var(--nve-sys-text-muted-color)">
    <a href="/docs/labs/">Labs</a>
    <nve-tree-node ${data.page.url.includes('/docs/plot/') ? 'expanded' : ''}>
      <a href="/docs/plot/">Plot <nve-icon name="beaker" size="sm"></nve-icon></a>
      <nve-tree-node ${data.page.url === '/docs/plot/' ? 'highlighted selected' : ''}><a href="/docs/plot/">Overview</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/scene/') ? 'expanded' : ''}>
      <a href="/docs/scene/">Scene <nve-icon name="beaker" size="sm"></nve-icon></a>
      <nve-tree-node ${data.page.url === '/docs/scene/' ? 'highlighted selected' : ''}><a href="/docs/scene/">Overview</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/record-buffers/') ? 'highlighted selected' : ''}><a href="/docs/scene/record-buffers/">Record Buffers</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/interaction/') ? 'highlighted selected' : ''}><a href="/docs/scene/interaction/">Interaction</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/arrows/') ? 'highlighted selected' : ''}><a href="/docs/scene/arrows/">Arrows</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/axes/') ? 'highlighted selected' : ''}><a href="/docs/scene/axes/">Axes</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/body/') ? 'highlighted selected' : ''}><a href="/docs/scene/body/">Body</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/camera/') ? 'highlighted selected' : ''}><a href="/docs/scene/camera/">Camera</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/cones/') ? 'highlighted selected' : ''}><a href="/docs/scene/cones/">Cones</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/cubes/') ? 'highlighted selected' : ''}><a href="/docs/scene/cubes/">Cubes</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/cylinders/') ? 'highlighted selected' : ''}><a href="/docs/scene/cylinders/">Cylinders</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/frame/') ? 'highlighted selected' : ''}><a href="/docs/scene/frame/">Frame</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/gridlines/') ? 'highlighted selected' : ''}><a href="/docs/scene/gridlines/">Gridlines</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/heightfield/') ? 'highlighted selected' : ''}><a href="/docs/scene/heightfield/">Heightfield</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/joint/') ? 'highlighted selected' : ''}><a href="/docs/scene/joint/">Joint</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/labels/') ? 'highlighted selected' : ''}><a href="/docs/scene/labels/">Labels</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/lines/') ? 'highlighted selected' : ''}><a href="/docs/scene/lines/">Lines</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/mesh/') ? 'highlighted selected' : ''}><a href="/docs/scene/mesh/">Mesh</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/model/') ? 'highlighted selected' : ''}><a href="/docs/scene/model/">Model</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/points/') ? 'highlighted selected' : ''}><a href="/docs/scene/points/">Points</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/polygon/') ? 'highlighted selected' : ''}><a href="/docs/scene/polygon/">Polygon</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/pyramids/') ? 'highlighted selected' : ''}><a href="/docs/scene/pyramids/">Pyramids</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/spheres/') ? 'highlighted selected' : ''}><a href="/docs/scene/spheres/">Spheres</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/scene/triangles/') ? 'highlighted selected' : ''}><a href="/docs/scene/triangles/">Triangles</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/labs/layout/responsive/') ? 'expanded' : ''} ${data.page.url === '/docs/labs/layout/responsive/' ? 'highlighted' : ''}>
      <a href="/docs/labs/layout/responsive/" nve-layout="row align:vertical-center gap:xs">Responsive Layout <nve-icon name="beaker" size="sm"></nve-icon></a>
      <nve-tree-node ${data.page.url.includes('/docs/labs/layout/responsive/viewport/') ? 'selected' : ''}><a href="/docs/labs/layout/responsive/viewport/">Viewport</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/labs/layout/responsive/container/') ? 'selected' : ''}><a href="/docs/labs/layout/responsive/container/">Container</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/labs/layout/responsive/patterns/') ? 'selected' : ''}><a href="/docs/labs/layout/responsive/patterns/">Patterns</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/labs/forms/' ? 'selected' : ''}><a href="/docs/labs/forms/" nve-layout="row align:vertical-center gap:xs">Forms <nve-icon name="beaker" size="sm"></nve-icon></a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/api-design/') || data.page.url.includes('/docs/internal/guidelines') || data.page.url === '/examples/' ? 'expanded' : ''} style="--color: var(--nve-sys-text-muted-color)">
    <a href="/docs/api-design/">Internal</a>
    <nve-tree-node expanded>
      <a href="/docs/api-design/">API Design</a>
      <nve-tree-node ${data.page.url === '/docs/api-design/' ? 'selected' : ''}><a href="/docs/api-design/">Guidelines</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/api-design/properties-attributes/') ? 'selected' : ''}><a href="/docs/api-design/properties-attributes/">Properties & Attributes</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/api-design/slots/') ? 'selected' : ''}><a href="/docs/api-design/slots/">Slots</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/api-design/registration/') ? 'selected' : ''}><a href="/docs/api-design/registration/">Registration</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/api-design/custom-events/') ? 'selected' : ''}><a href="/docs/api-design/custom-events/">CustomEvents</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/api-design/stateless/') ? 'selected' : ''}><a href="/docs/api-design/stateless/">Stateless</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/api-design/composition/') ? 'selected' : ''}><a href="/docs/api-design/composition/">Composition</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/api-design/styles/') ? 'selected' : ''}><a href="/docs/api-design/styles/">Styles</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/api-design/packaging/') ? 'selected' : ''}><a href="/docs/api-design/packaging/">Packaging</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/api-design/glossary/') ? 'selected' : ''}><a href="/docs/api-design/glossary/">Glossary</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/api-design/logs/') ? 'selected' : ''}><a href="/docs/api-design/logs/">Logs</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node expanded>
      <a href="/docs/internal/guidelines/agent-harness/">Guidelines</a>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/agent-harness/') ? 'selected' : ''}><a href="/docs/internal/guidelines/agent-harness/">Agent Harness</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/agent-tooling/') ? 'selected' : ''}><a href="/docs/internal/guidelines/agent-tooling/">Agent Tooling</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/agent-ownership/') ? 'selected' : ''}><a href="/docs/internal/guidelines/agent-ownership/">Agent Ownership</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/documentation/') ? 'selected' : ''}><a href="/docs/internal/guidelines/documentation/">Documentation</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/examples/') ? 'selected' : ''}><a href="/docs/internal/guidelines/examples/">Examples</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/typescript/') ? 'selected' : ''}><a href="/docs/internal/guidelines/typescript/">TypeScript</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/internal/guidelines/testing/' ? 'selected' : ''}><a href="/docs/internal/guidelines/testing/">Testing</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/testing-unit/') ? 'selected' : ''}><a href="/docs/internal/guidelines/testing-unit/">Unit Testing</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/testing-accessibility/') ? 'selected' : ''}><a href="/docs/internal/guidelines/testing-accessibility/">Accessibility Testing</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/testing-lighthouse/') ? 'selected' : ''}><a href="/docs/internal/guidelines/testing-lighthouse/">Lighthouse Testing</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/testing-ssr/') ? 'selected' : ''}><a href="/docs/internal/guidelines/testing-ssr/">SSR Testing</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/testing-visual/') ? 'selected' : ''}><a href="/docs/internal/guidelines/testing-visual/">Visual Testing</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/troubleshooting/') ? 'selected' : ''}><a href="/docs/internal/guidelines/troubleshooting/">Troubleshooting</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/component-creation/') ? 'selected' : ''}><a href="/docs/internal/guidelines/component-creation/">Component Creation</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url === '/examples/' ? 'highlighted' : ''} expanded>
      <a href="/examples/">Examples</a>
      <nve-tree-node ${data.page.url === '/examples/' ? 'selected' : ''}><a href="/examples/">All Examples</a></nve-tree-node>
    </nve-tree-node>
  </nve-tree-node>
</nve-tree>
`;

/** @param {{disableTheme?: boolean}} [data] */
export function renderGlobalsScript(data = { disableTheme: false }) {
  return data.disableTheme
    ? ''
    : /* html */ `
<script>
  (() => {
    const getGlobals = () => ({ theme: 'auto', font: '', layer: '', scale: '', debug: '', animation: '', sourceType: 'html', showAdvancedApi: '', ...(JSON.parse(localStorage.getItem('elements-sb-globals'), null, 2) ?? { }) });
    const systemColorScheme = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = SB_GLOBALS => {
      const colorScheme = SB_GLOBALS.theme === 'auto'
        ? systemColorScheme.matches
          ? 'dark'
          : 'light'
        : SB_GLOBALS.theme;
      const themes = [
        colorScheme,
        SB_GLOBALS.classic === 'classic' && colorScheme !== 'high-contrast' ? (colorScheme === 'dark' ? 'classic-dark' : 'classic') : '',
        SB_GLOBALS.font,
        SB_GLOBALS.scale,
        SB_GLOBALS.debug,
        SB_GLOBALS.animation,
        SB_GLOBALS.experimental,
        SB_GLOBALS.systemOptions
      ]
        .filter(i => i !== '')
        .join(' ')
        .trim();
      globalThis.document.documentElement.setAttribute('nve-theme', themes);
      globalThis.document.documentElement.setAttribute('nve-layer', SB_GLOBALS.layer);
      globalThis.document.documentElement.setAttribute('show-advanced-api', SB_GLOBALS.showAdvancedApi);
      globalThis.document.dispatchEvent(new CustomEvent('nve-theme-change', { detail: { theme: themes } }));
      globalThis.document.querySelectorAll('iframe').forEach(iframe => {
        iframe.contentDocument?.documentElement.setAttribute('nve-theme', themes);
        iframe.contentDocument?.documentElement.setAttribute('nve-layer', SB_GLOBALS.layer);
        iframe.contentDocument?.documentElement.setAttribute('show-advanced-api', SB_GLOBALS.showAdvancedApi);
      });
    };
    applyTheme(getGlobals());
    systemColorScheme.addEventListener('change', () => {
      const SB_GLOBALS = getGlobals();
      if (SB_GLOBALS.theme === 'auto') applyTheme(SB_GLOBALS);
    });
  })();
</script>
  `;
}

export function renderBasePageHeader(data) {
  const isCatalogPage = [
    '/docs/elements/',
    '/docs/code/',
    '/docs/markdown/',
    '/docs/media/',
    '/docs/monaco/',
    '/docs/viewport/'
  ].some(path => data.page.url.startsWith(path));

  return /* html */ `
<nve-page-header slot="header">
  <a slot="prefix" class="docs-ascii-logo" href="/" aria-label="NVIDIA Elements homepage"><pre aria-hidden="true" inert></pre></a>
  <a slot="prefix" href="/">NVIDIA Elements</a>
  <nve-button container="flat" ${data.page.url.includes('/docs/patterns/') ? 'selected' : ''} class="header-btn"><a href="/docs/patterns/">Patterns</a></nve-button>
  <nve-button container="flat" ${isCatalogPage ? 'selected' : ''} class="header-btn"><a href="/docs/elements/">Elements</a></nve-button>
  <nve-button container="flat" ${data.page.url.includes('/docs/foundations/') ? 'selected' : ''} class="header-btn"><a href="/docs/foundations/">Foundations</a></nve-button>
  <nve-button container="flat" ${data.page.url.includes('/docs/integrations/') ? 'selected' : ''} class="header-btn"><a href="/docs/integrations/">Integrations</a></nve-button>
  <nve-button container="flat" class="header-btn"><a href="${ELEMENTS_REPO_BASE_URL}" target="_blank">GitHub</a></nve-button>
  <nve-button slot="suffix" id="system-options-panel-btn" container="flat">System Themes</nve-button>
  <nve-icon-button class="header-menu-btn" role="button" command="--toggle" commandfor="sidenav-panel" container="flat" slot="suffix" icon-name="menu" aria-label="menu"></nve-icon-button>
</nve-page-header>
  `;
}

export const IS_MR_PREVIEW = process.env.PAGES_BASE_URL?.includes('mr-preview');
export const IS_DEV_MODE =
  process.env.ELEVENTY_RUN_MODE === 'serve' || process.env.PAGES_BASE_URL === '/elements/preview/';
