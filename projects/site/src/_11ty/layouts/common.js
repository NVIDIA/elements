/* eslint-env node */
/* global process */

import { join } from 'node:path';
import { ELEMENTS_PAGES_BASE_URL, ELEMENTS_PLAYGROUND_BASE_URL, ELEMENTS_REPO_BASE_URL } from '../utils/env.js';

export const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/');

/**
 * This renders the base head element with all the common styles and scripts needed for ALL PAGES.
 * Page specific resources should not be placed here.
 */
export const renderBaseHead = data => /* html */ `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="all">
  <base href="${BASE_URL}" />
  <title data-pagefind-meta="title">${data.title}</title>
  <meta name="description" content="Elements - ${data.title}">
  <meta property="og:title" content="Elements - ${data.title}" >
  <meta property="og:url" content="${data.page?.url ?? ''}">
  <meta property="og:description" content="NVIDIA Elements is a flexible, framework-agnostic design system and toolkit that empowers teams to build exceptional user experiences.">
  <meta property="og:image" content="/favicon.svg">
  <meta property="og:site_name" content="${ELEMENTS_PAGES_BASE_URL}/">
  <meta property="og:type" content="website">
  <link rel="icon" href="/favicon.svg">
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
    nvd-canvas:not(:defined) {
      visibility: hidden !important;
    }

    /* hide if not defined and view transition is active */
    [nve-transition='auto']:active-view-transition-type(forwards, backwards) {
      nve-page:not(:defined) {
        visibility: hidden !important;
      }
    }
  </style>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-723T2ZTKVT" defer></script>
  <script defer>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-723T2ZTKVT');
    gtag('set', 'content_group', 'elements');
  </script>
`;

export const renderDocsNav = data => /* html */ `
<nve-tree id="docs-nav" data-pagefind-ignore="all" behavior-expand selectable="single">
  <nve-tree-node ${data.page.url.includes('/docs/metrics/') || data.page.url.includes('/docs/changelog/') || data.page.url.includes('/docs/about/') ? 'expanded' : ''}>
    <a href="docs/about/getting-started/">About</a>
    <nve-tree-node ${data.page.url.includes('/docs/about/getting-started/') ? 'highlighted selected' : ''}><a href="docs/about/getting-started/">Getting Started</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/changelog/') ? 'highlighted selected' : ''}><a href="docs/changelog/">Changelog</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/metrics/') ? 'highlighted selected' : ''}><a href="docs/metrics/">Metrics</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/support/') ? 'highlighted selected' : ''}><a href="docs/about/support/">Support</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/accessibility/') ? 'highlighted selected' : ''}><a href="docs/about/accessibility/">Accessibility</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/contributions/') ? 'highlighted selected' : ''}><a href="docs/about/contributions/">Contributions</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/requests/') ? 'highlighted selected' : ''}><a href="docs/about/requests/">Requests</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/migration/') ? 'highlighted selected' : ''}><a href="docs/about/migration/">Migration</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/deprecations/') ? 'highlighted selected' : ''}><a href="docs/about/deprecations/">Deprecations</a></nve-tree-node>
  </nve-tree-node>
  
  <nve-tree-node ${data.page.url.includes('/docs/integrations/') || data.page.url.includes('/starters/') || data.page.url.includes('/docs/cli/') || data.page.url.includes('/docs/mcp/') || data.page.url.includes('/docs/lint/') || data.page.url.includes('/docs/testing/') ? 'expanded' : ''}>
    <a href="docs/integrations/installation/">Integrations</a>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/installation/') ? 'highlighted selected' : ''}><a href="docs/integrations/installation/">Installation</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/mcp/') ? 'highlighted selected' : ''}><a href="docs/mcp/">MCP</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/cli/') ? 'highlighted selected' : ''}><a href="docs/cli/">CLI</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/lint/') ? 'highlighted selected' : ''}><a href="docs/lint/">Lint</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/angular/') ? 'highlighted selected' : ''}><a href="docs/integrations/angular/">Angular</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/bundles/') ? 'highlighted selected' : ''}><a href="docs/integrations/bundles/">Bundles</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/extensions/') ? 'highlighted selected' : ''}><a href="docs/integrations/extensions/">Extensions</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/go/') ? 'highlighted selected' : ''}><a href="docs/integrations/go/">Go</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/hugo/') ? 'highlighted selected' : ''}><a href="docs/integrations/hugo/">Hugo</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/importmaps/') ? 'highlighted selected' : ''}><a href="docs/integrations/importmaps/">Import Maps</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/lit/') ? 'highlighted selected' : ''}><a href="docs/integrations/lit/">Lit</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/nextjs/') ? 'highlighted selected' : ''}><a href="docs/integrations/nextjs/">NextJS</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/nuxt/') ? 'highlighted selected' : ''}><a href="docs/integrations/nuxt/">Nuxt</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/preact/') ? 'highlighted selected' : ''}><a href="docs/integrations/preact/">Preact</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/react/') ? 'highlighted selected' : ''}><a href="docs/integrations/react/">React</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/solidjs/') ? 'highlighted selected' : ''}><a href="docs/integrations/solidjs/">SolidJS</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/svelte/') ? 'highlighted selected' : ''}><a href="docs/integrations/svelte/">Svelte</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/typescript/') ? 'highlighted selected' : ''}><a href="docs/integrations/typescript/">TypeScript</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/vue/') ? 'highlighted selected' : ''}><a href="docs/integrations/vue/">Vue</a></nve-tree-node>
  </nve-tree-node>
  
  <nve-tree-node ${data.page.url.includes('/docs/foundations/') ? 'expanded' : ''}>
    <a href="docs/foundations/typography/">Foundations</a>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/typography/') ? 'highlighted selected' : ''}><a href="docs/foundations/typography/">Typography</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/iconography/') ? 'highlighted selected' : ''}><a href="docs/foundations/iconography/">Iconography</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/') ? 'expanded' : ''} ${data.page.url === '/docs/foundations/themes/' ? 'highlighted' : ''}>
      <a href="docs/foundations/themes/">Themes</a>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/tokens/') ? 'highlighted selected' : ''}><a href="docs/foundations/themes/tokens/">Design Tokens</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/size/' ? 'highlighted selected' : ''}><a href="docs/foundations/themes/size/">Size & Space</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/objects/') ? 'highlighted selected' : ''}><a href="docs/foundations/themes/objects/">Objects</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/interactions/') ? 'highlighted selected' : ''}><a href="docs/foundations/themes/interactions/">Interactions</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/support/' ? 'highlighted selected' : ''}><a href="docs/foundations/themes/support/">Support</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/status/' ? 'highlighted selected' : ''}><a href="docs/foundations/themes/status/">Status</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/color/' ? 'highlighted selected' : ''}><a href="docs/foundations/themes/color/">Color</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/animation/' ? 'highlighted selected' : ''}><a href="docs/foundations/themes/animation/">Animation</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/fonts/' ? 'highlighted selected' : ''}><a href="docs/foundations/themes/fonts/">Fonts</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/layers/') ? 'highlighted selected' : ''}><a href="docs/foundations/themes/layers/">Layers</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/custom/' ? 'highlighted selected' : ''}><a href="docs/foundations/themes/custom/">Custom</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/') ? 'expanded' : ''} ${data.page.url === '/docs/foundations/layout/' ? 'highlighted' : ''}>
      <a href="docs/foundations/layout/">Layout</a>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/horizontal/') ? 'highlighted selected' : ''}><a href="docs/foundations/layout/horizontal/">Horizontal</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/vertical/') ? 'highlighted selected' : ''}><a href="docs/foundations/layout/vertical/">Vertical</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/grid/') ? 'highlighted selected' : ''}><a href="docs/foundations/layout/grid/">Grid</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/popovers/' ? 'highlighted selected' : ''}><a href="docs/foundations/popovers/">Popovers</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/i18n/' ? 'highlighted selected' : ''}><a href="docs/foundations/i18n/">i18n</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/visualization/' ? 'highlighted selected' : ''}><a href="docs/foundations/visualization/">Visualization</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/view-transitions/' ? 'highlighted selected' : ''}><a href="docs/foundations/view-transitions/">View Transitions</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/elements/') ? 'expanded' : ''}>
    <a href="docs/elements/accordion/">Elements</a>
    <nve-tree-node ${data.page.url.includes('/docs/elements/accordion/') ? 'highlighted selected' : ''}><a href="docs/elements/accordion/">Accordion</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/alert/') ? 'highlighted selected' : ''}><a href="docs/elements/alert/">Alert</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/avatar/') ? 'highlighted selected' : ''}><a href="docs/elements/avatar/">Avatar</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/badge/') ? 'highlighted selected' : ''}><a href="docs/elements/badge/">Badge</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/breadcrumb/') ? 'highlighted selected' : ''}><a href="docs/elements/breadcrumb/">Breadcrumb</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/button/') ? 'highlighted selected' : ''}><a href="docs/elements/button/">Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/button-group/') ? 'highlighted selected' : ''}><a href="docs/elements/button-group/">Button Group</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/card/') ? 'highlighted selected' : ''}><a href="docs/elements/card/">Card</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/chat-message/') ? 'highlighted selected' : ''}><a href="docs/elements/chat-message/">Chat Message</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/checkbox/') ? 'highlighted selected' : ''}><a href="docs/elements/checkbox/">Checkbox</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/color/') ? 'highlighted selected' : ''}><a href="docs/elements/color/">Color</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/combobox/') ? 'highlighted selected' : ''}><a href="docs/elements/combobox/">Combobox</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/copy-button/') ? 'highlighted selected' : ''}><a href="docs/elements/copy-button/">Copy Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/') ? 'expanded' : ''} ${data.page.url.endsWith('/docs/elements/data-grid/') || data.page.url.endsWith('/docs/elements/data-grid/api/') ? 'highlighted' : ''}>
      <a href="docs/elements/data-grid/">Datagrid</a>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/integrations/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/integrations/">Integrations</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-action/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/column-action/">Column Action</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-alignment/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/column-alignment/">Column Alignment</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-fixed/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/column-fixed/">Column Fixed</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-width/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/column-width/">Column width</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/container/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/container/">Container</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/card/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/card/">Card</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/display-settings/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/display-settings/">Display Settings</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/footer/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/footer/">Footer</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/heatmap/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/heatmap/">Heatmap</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/keynav/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/keynav/">Keynav</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/multi-select/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/multi-select/">Multi Select</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/pagination/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/pagination/">Pagination</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/panel-detail/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/panel-detail/">Panel Detail</a></nve-tree-node>  
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/panel-grid/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/panel-grid/">Panel Grid</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/performance/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/performance/">Performance</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/placeholder/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/placeholder/">Placeholder</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/row-action/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/row-action/">Row Action</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/row-groups/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/row-groups/">Row Groups</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/row-sort/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/row-sort/">Row Sort</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/scroll-height/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/scroll-height/">Scroll Height</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/single-select/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/single-select/">Single Select</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/stripe/') ? 'highlighted selected' : ''}><a href="docs/elements/data-grid/stripe/">Stripe</a></nve-tree-node>
    </nve-tree-node>  
    <nve-tree-node ${data.page.url.includes('/docs/elements/date/') ? 'highlighted selected' : ''}><a href="docs/elements/date/">Date</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/datetime/') ? 'highlighted selected' : ''}><a href="docs/elements/datetime/">Datetime</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dialog/') ? 'highlighted selected' : ''}><a href="docs/elements/dialog/">Dialog</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/divider/') ? 'highlighted selected' : ''}><a href="docs/elements/divider/">Divider</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dot/') ? 'highlighted selected' : ''}><a href="docs/elements/dot/">Dot</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/drawer/') ? 'highlighted selected' : ''}><a href="docs/elements/drawer/">Drawer</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dropdown/') ? 'highlighted selected' : ''}><a href="docs/elements/dropdown/">Dropdown</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dropdown-group/') ? 'highlighted selected' : ''}><a href="docs/elements/dropdown-group/">Dropdown Group</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dropzone/') ? 'highlighted selected' : ''}><a href="docs/elements/dropzone/">Dropzone</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/file/') ? 'highlighted selected' : ''}><a href="docs/elements/file/">File</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/forms/') || data.page.url.includes('/docs/elements/control/') ? 'expanded' : ''} ${data.page.url === '/docs/elements/forms/' ? 'highlighted' : ''}>
      <a href="docs/elements/forms/">Forms</a>
      <nve-tree-node ${data.page.url.includes('/docs/elements/forms/validation/') ? 'highlighted selected' : ''}><a href="docs/elements/forms/validation/">Validation</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/forms/actions/') ? 'highlighted selected' : ''}><a href="docs/elements/forms/actions/">Actions</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/control/') ? 'highlighted selected' : ''}><a href="docs/elements/control/">Control</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/icon/') ? 'highlighted selected' : ''}><a href="docs/elements/icon/">Icon</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/icon-button/') ? 'highlighted selected' : ''}><a href="docs/elements/icon-button/">Icon Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/input/') ? 'highlighted selected' : ''}><a href="docs/elements/input/">Input</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/input-group/') ? 'highlighted selected' : ''}><a href="docs/elements/input-group/">Input Group</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/logo/') ? 'highlighted selected' : ''}><a href="docs/elements/logo/">Logo</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/menu/') ? 'highlighted selected' : ''}><a href="docs/elements/menu/">Menu</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/month/') ? 'highlighted selected' : ''}><a href="docs/elements/month/">Month</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/notification/') ? 'highlighted selected' : ''}><a href="docs/elements/notification/">Notification</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/page/') ? 'highlighted selected' : ''}><a href="docs/elements/page/">Page</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/page-header/') ? 'highlighted selected' : ''}><a href="docs/elements/page-header/">Page Header</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/page-loader/') ? 'highlighted selected' : ''}><a href="docs/elements/page-loader/">Page Loader</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/pagination/') ? 'highlighted selected' : ''}><a href="docs/elements/pagination/">Pagination</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/panel/') ? 'highlighted selected' : ''}><a href="docs/elements/panel/">Panel</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/progressive-filter-chip/') ? 'highlighted selected' : ''}><a href="docs/elements/progressive-filter-chip/">Progressive Filter Chip</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/progress-bar/') ? 'highlighted selected' : ''}><a href="docs/elements/progress-bar/">Progress Bar</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/progress-ring/') ? 'highlighted selected' : ''}><a href="docs/elements/progress-ring/">Progress Ring</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/password/') ? 'highlighted selected' : ''}><a href="docs/elements/password/">Password</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/preferences-input/') ? 'highlighted selected' : ''}><a href="docs/elements/preferences-input/">Preferences Input</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/pulse/') ? 'highlighted selected' : ''}><a href="docs/elements/pulse/">Pulse</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/radio/') ? 'highlighted selected' : ''}><a href="docs/elements/radio/">Radio</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/range/') ? 'highlighted selected' : ''}><a href="docs/elements/range/">Range</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/resize-handle/') ? 'highlighted selected' : ''}><a href="docs/elements/resize-handle/">Resize Handle</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/search/') ? 'highlighted selected' : ''}><a href="docs/elements/search/">Search</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/select/') ? 'highlighted selected' : ''}><a href="docs/elements/select/">Select</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/skeleton/') ? 'highlighted selected' : ''}><a href="docs/elements/skeleton/">Skeleton</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/sort-button/') ? 'highlighted selected' : ''}><a href="docs/elements/sort-button/">Sort Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/sparkline/') ? 'highlighted selected' : ''}><a href="docs/elements/sparkline/">Sparkline</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/star-rating/') ? 'highlighted selected' : ''}><a href="docs/elements/star-rating/">Star Rating</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/steps/') ? 'highlighted selected' : ''}><a href="docs/elements/steps/">Steps</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/switch/') ? 'highlighted selected' : ''}><a href="docs/elements/switch/">Switch</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tabs/') ? 'highlighted selected' : ''}><a href="docs/elements/tabs/">Tabs</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tag/') ? 'highlighted selected' : ''}><a href="docs/elements/tag/">Tag</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/textarea/') ? 'highlighted selected' : ''}><a href="docs/elements/textarea/">Textarea</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/time/') ? 'highlighted selected' : ''}><a href="docs/elements/time/">Time</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/toast/') ? 'highlighted selected' : ''}><a href="docs/elements/toast/">Toast</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/toggletip/') ? 'highlighted selected' : ''}><a href="docs/elements/toggletip/">Toggletip</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/toolbar/') ? 'highlighted selected' : ''}><a href="docs/elements/toolbar/">Toolbar</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tooltip/') ? 'highlighted selected' : ''}><a href="docs/elements/tooltip/">Tooltip</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tree/') ? 'highlighted selected' : ''}><a href="docs/elements/tree/">Tree</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/week/') ? 'highlighted selected' : ''}><a href="docs/elements/week/">Week</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/patterns/') ? 'expanded' : ''} ${data.page.url === '/docs/patterns/' ? 'highlighted' : ''}>
    <a href="docs/patterns/">Patterns</a>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/authentication/') ? 'highlighted selected' : ''}><a href="docs/patterns/authentication/">Authentication</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/browse/') ? 'highlighted selected' : ''}><a href="docs/patterns/browse/">Browse</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/dashboard/') ? 'highlighted selected' : ''}><a href="docs/patterns/dashboard/">Dashboard</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/editor/') ? 'highlighted selected' : ''}><a href="docs/patterns/editor/">Editor</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/empty-states/') ? 'highlighted selected' : ''}><a href="docs/patterns/empty-states/">Empty States</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/heatmap/') ? 'highlighted selected' : ''}><a href="docs/patterns/heatmap/">Heatmap</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/keyboard-shortcut/') ? 'highlighted selected' : ''}><a href="docs/patterns/keyboard-shortcut/">Keyboard Shortcut</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/logging/') ? 'highlighted selected' : ''}><a href="docs/patterns/logging/">Logging</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/media/') ? 'highlighted selected' : ''}><a href="docs/patterns/media/">Media</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/onboarding/') ? 'highlighted selected' : ''}><a href="docs/patterns/onboarding/">Onboarding</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/panel/') ? 'highlighted selected' : ''}><a href="docs/patterns/panel/">Panel</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/responsive/') ? 'highlighted selected' : ''}><a href="docs/patterns/responsive/">Responsive</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/search/') ? 'highlighted selected' : ''}><a href="docs/patterns/search/">Search</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/subheader/') ? 'highlighted selected' : ''}><a href="docs/patterns/subheader/">Subheader</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/trend/') ? 'highlighted selected' : ''}><a href="docs/patterns/trend/">Trend</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/code/') ? 'expanded' : ''}>
    <a href="docs/code/codeblock/">Code</a>
    <nve-tree-node ${data.page.url.includes('/docs/code/codeblock/') ? 'highlighted selected' : ''}><a href="docs/code/codeblock/">Codeblock</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/monaco/') ? 'expanded' : ''}>
    <a href="docs/monaco/input/">Monaco</a>
    <nve-tree-node ${data.page.url.includes('/docs/monaco/input/') ? 'highlighted selected' : ''}><a href="docs/monaco/input/">Input</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/monaco/diff-input/') ? 'highlighted selected' : ''}><a href="docs/monaco/diff-input/">Diff Input</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/monaco/editor/') ? 'highlighted selected' : ''}><a href="docs/monaco/editor/">Editor</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/monaco/diff-editor/') ? 'highlighted selected' : ''}><a href="docs/monaco/diff-editor/">Diff Editor</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/monaco/problems/') ? 'highlighted selected' : ''}><a href="docs/monaco/problems/">Problems</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/markdown/') ? 'expanded' : ''}>
    <a href="docs/markdown/">Markdown</a>
    <nve-tree-node ${data.page.url.endsWith('/docs/markdown/') ? 'highlighted selected' : ''}><a href="docs/markdown/">Markdown</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/markdown/styles/') ? 'highlighted selected' : ''}><a href="docs/markdown/styles/">CSS Utility</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/labs/') ? 'expanded' : ''} ${data.page.url === '/docs/labs/' ? 'highlighted' : ''}>
    <a href="docs/labs/">Labs</a>
    <nve-tree-node ${data.page.url.includes('/docs/labs/layout/responsive/') ? 'expanded' : ''} ${data.page.url === '/docs/labs/layout/responsive/' ? 'highlighted' : ''}>
      <a href="docs/labs/layout/responsive/" nve-layout="row align:vertical-center gap:xs">Responsive Layout <nve-icon name="beaker" size="sm"></nve-icon></a>
      <nve-tree-node ${data.page.url.includes('/docs/labs/layout/responsive/viewport/') ? 'highlighted selected' : ''}><a href="docs/labs/layout/responsive/viewport/">Viewport</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/labs/layout/responsive/container/') ? 'highlighted selected' : ''}><a href="docs/labs/layout/responsive/container/">Container</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/labs/layout/responsive/patterns/') ? 'highlighted selected' : ''}><a href="docs/labs/layout/responsive/patterns/">Patterns</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/labs/forms/' ? 'highlighted selected' : ''}><a href="docs/labs/forms/" nve-layout="row align:vertical-center gap:xs">Forms <nve-icon name="beaker" size="sm"></nve-icon></a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/api-design/') ? 'expanded' : ''} ${data.page.url === '/docs/api-design/' ? 'highlighted' : ''}>
    <a href="docs/api-design/">API Design</a>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/properties-attributes/') ? 'highlighted selected' : ''}><a href="docs/api-design/properties-attributes/">Properties & Attributes</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/slots/') ? 'highlighted selected' : ''}><a href="docs/api-design/slots/">Slots</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/registration/') ? 'highlighted selected' : ''}><a href="docs/api-design/registration/">Registration</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/custom-events/') ? 'highlighted selected' : ''}><a href="docs/api-design/custom-events/">CustomEvents</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/stateless/') ? 'highlighted selected' : ''}><a href="docs/api-design/stateless/">Stateless</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/composition/') ? 'highlighted selected' : ''}><a href="docs/api-design/composition/">Composition</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/styles/') ? 'highlighted selected' : ''}><a href="docs/api-design/styles/">Styles</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/packaging/') ? 'highlighted selected' : ''}><a href="docs/api-design/packaging/">Packaging</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/glossary/') ? 'highlighted selected' : ''}><a href="docs/api-design/glossary/">Glossary</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/logs/') ? 'highlighted selected' : ''}><a href="docs/api-design/logs/">Logs</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines') ? 'expanded' : ''} ${data.page.url === '/docs/internal/guidelines/' ? 'highlighted' : ''}>
    <a href="docs/internal/guidelines/agent-harness/">Internal Guidelines</a>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/agent-harness/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/agent-harness/">Agent Harness</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/documentation/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/documentation/">Documentation</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/examples/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/examples/">Examples</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/typescript/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/typescript/">TypeScript</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/internal/guidelines/testing/' ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/testing/">Testing</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/testing-unit/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/testing-unit/">Unit Testing</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/testing-accessibility/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/testing-accessibility/">Accessibility Testing</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/testing-lighthouse/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/testing-lighthouse/">Lighthouse Testing</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/testing-ssr/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/testing-ssr/">SSR Testing</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/testing-visual/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/testing-visual/">Visual Testing</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/troubleshooting/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/troubleshooting/">Troubleshooting</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/guidelines/component-creation/') ? 'highlighted selected' : ''}><a href="docs/internal/guidelines/component-creation/">Component Creation</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('examples/') ? 'expanded' : ''} ${data.page.url === 'examples/' ? 'highlighted' : ''}>
    <a href="examples/">Internal Examples</a>
    <nve-tree-node ${data.page.url.includes('examples/') ? 'highlighted selected' : ''}><a href="examples/">All Examples</a></nve-tree-node>
  </nve-tree-node>
</nve-tree>
`;

export function renderGlobalsScript(data = { disableTheme: false }) {
  return data.disableTheme
    ? ''
    : /* html */ `
<script>
  (() => {
    const SB_GLOBALS = { theme: 'dark', font: '', layer: '', scale: '', debug: '', animation: '', sourceType: 'html', showAdvancedApi: '', ...(JSON.parse(localStorage.getItem('elements-sb-globals'), null, 2) ?? { }) };
    const themes = [
      SB_GLOBALS.theme === 'auto'
        ? globalThis.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
        : SB_GLOBALS.theme,
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
      globalThis.document.documentElement.setAttribute('nve-theme', themes);\
      globalThis.document.documentElement.setAttribute('nve-layer', SB_GLOBALS.layer);
      globalThis.document.documentElement.setAttribute('show-advanced-api', SB_GLOBALS.showAdvancedApi);
  })();
</script>
  `;
}

export function renderBasePageHeader(data) {
  return /* html */ `
<nve-page-header slot="header">
  <nve-logo slot="prefix" color="brand-green" size="sm">NV</nve-logo>
  <a slot="prefix" href=".">Elements</a>
  <nve-button container="flat" ${data.page.url.includes('docs') ? 'selected' : ''}><a href="docs/about/getting-started/">Catalog</a></nve-button>
  ${ELEMENTS_PLAYGROUND_BASE_URL ? /* html */ `<nve-button container="flat"><a href="${ELEMENTS_PLAYGROUND_BASE_URL}/ui/elements-playground/browse.html" target="_blank">Playground</a></nve-button>` : ''}
  <nve-button container="flat" ${data.page.url.includes('starters') ? 'selected' : ''}><a href="starters/">Starters</a></nve-button>
  <nve-button container="flat"><a href="${ELEMENTS_REPO_BASE_URL}" target="_blank">Repo</a></nve-button>
  ${data.page.url !== '/' ? /* html */ `<nve-button slot="suffix" id="system-options-panel-btn" container="flat">System Themes</nve-button>` : ''}
</nve-page-header>
  `;
}

export const IS_MR_PREVIEW = process.env.PAGES_BASE_URL?.includes('mr-preview');
export const IS_DEV_MODE =
  process.env.ELEVENTY_RUN_MODE === 'serve' || process.env.PAGES_BASE_URL === '/elements/preview/';
