/* eslint-env node */
/* global process */

import { join } from 'node:path';

export const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/');

/**
 * This renders the base head element with all the common styles and scripts needed for ALL PAGES.
 * Page specific resources should not be placed here.
 */
export const renderBaseHead = data => /* html */ `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base href="${BASE_URL}" />
  <title>${data.title}</title>
  <meta name="description" content="Elements - ${data.title}">
  <link rel="icon" href="/favicon.svg"> 
  <style>
    @import '@nvidia-elements/themes/fonts/inter.css';
    @import '@nvidia-elements/themes/index.css';
    @import '@nvidia-elements/themes/dark.css';
    @import '@nvidia-elements/themes/high-contrast.css';
    @import '@nvidia-elements/themes/compact.css';
    @import '@nvidia-elements/themes/debug.css';
    @import '@nvidia-elements/themes/ddb-dark.css';
    @import '@nvidia-elements/themes/brand.css';
    @import '@nvidia-elements/themes/brand-dark.css';
    @import '@nvidia-elements/styles/layout.css';
    @import '@nvidia-elements/styles/responsive.css';
    @import '@nvidia-elements/styles/typography.css';
    @import '@nvidia-elements/styles/view-transitions.css';

    *:not(:defined) {
      visibility: hidden;
    }
  </style>
  <script type="module">
    const SB_GLOBALS = { theme: 'dark', font: '',  scale: '', debug: '', animation: '', sourceType: 'html', ...(JSON.parse(localStorage.getItem('elements-sb-globals'), null, 2) ?? { }) };
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
      ${data.disableTheme ? '' : `globalThis.document.documentElement.setAttribute('nve-theme', themes);`}
  </script>
  <script type="module">
    import { BrowserClient, getCurrentScope, defaultStackParser, makeFetchTransport, breadcrumbsIntegration, browserApiErrorsIntegration, dedupeIntegration, functionToStringIntegration, globalHandlersIntegration, httpContextIntegration, browserTracingIntegration } from '@sentry/browser';
    const client = new BrowserClient({
      dsn: 'https://aeb149467b30cd6b4e34711e88727b1f@sentry.perflab.nvidia.com/3418',
      enabled: process.env.NODE_ENV !== 'development',
      tracesSampleRate: 1.0,
      tracePropagationTargets: ['https://localhost:4173', 'https://NVIDIA.github.io/elements/'],
      transport: makeFetchTransport,
      stackParser: defaultStackParser,
      integrations: [
        breadcrumbsIntegration(),
        browserApiErrorsIntegration(),
        dedupeIntegration(),
        functionToStringIntegration(),
        globalHandlersIntegration(),
        httpContextIntegration(),
        browserTracingIntegration(),
      ]
    });

    getCurrentScope().setClient(client);
    client.init();
    // setTimeout(() => NOTFOUND(), 2000) // test error
  </script>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-723T2ZTKVT"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-723T2ZTKVT');
    gtag('set', 'content_group', 'elements');
  </script>
`;

export const renderDocsNav = data => /* html */ `
<nve-tree behavior-expand>
  <nve-tree-node ${data.page.url.includes('/docs/metrics/') || data.page.url.includes('/docs/changelog/') ? 'expanded' : ''}>
    About
    <nve-tree-node><a href="api/?path=/docs/about-getting-started--docs">Getting Started</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/about-installation--docs">Installation</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/changelog/') ? 'highlighted' : ''}><a href="docs/changelog/">Changelog</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/metrics/') ? 'highlighted' : ''}><a href="docs/metrics/">Metrics</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/about-support--docs">Support</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/about-accessibility--docs">Accessibility</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/about-contributions--docs">Contributions</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/about-requests--docs">Requests</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/about-migration--docs">Migration</a></nve-tree-node>
  </nve-tree-node>
  <nve-tree-node>
    Integrations
    <nve-tree-node><a href="api/?path=/docs/integrations-angular--docs">Angular</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/integrations-buildless--docs">Buildless</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/integrations-extensions--docs">Extensions</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/integrations-lit--docs">Lit</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/integrations-nextjs--docs">NextJS</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/integrations-preact--docs">Preact</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/integrations-react--docs">React</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/integrations-solidjs--docs">SolidJS</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/integrations-typescript--docs">TypeScript</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/integrations-vue--docs">Vue</a></nve-tree-node>
  </nve-tree-node>
  <nve-tree-node>
    Foundations
    <nve-tree-node>
      Themes
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-documentation--docs">Documentation</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-design-tokens--docs">Design Tokens</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-size-space--docs">Size & Space</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-objects--docs">Objects</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-layers--docs">Layers</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-interactions--docs">Interactions</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-support--docs">Support</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-status--docs">Status</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-color--docs">Color</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-animation--docs">Animation</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-fonts--docs">Fonts</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-themes-custom-themes--docs">Custom</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/foundations-typography-documentation--docs">Typography</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/foundations-iconography-documentation--docs">Iconography</a></nve-tree-node>
    <nve-tree-node>
      Layout
      <nve-tree-node><a href="api/?path=/docs/foundations-layout-documentation--docs">Documentation</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-layout-horizontal-flex--docs">Horizontal</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-layout-vertical-flex--docs">Vertical</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-layout-grid--docs">Grid</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node>
      Forms
      <nve-tree-node><a href="api/?path=/docs/foundations-forms-documentation--docs">Documentation</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-forms-validation--docs">Validation</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-forms-controls--docs">Controls</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/foundations-forms-actions--docs">Actions</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/foundations-popovers-documentation--docs">Popovers</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/foundations-i18n-documentation--docs">i18n</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/foundations-visualization-documentation--docs">Visualization</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/foundations-view-transitions-documentation--docs">View Transitions</a></nve-tree-node>
  </nve-tree-node>
  <nve-tree-node ${data.page.url.includes('/docs/elements/') ? 'expanded' : ''}>
    Elements
    <nve-tree-node><a href="api/?path=/docs/elements-accordion-documentation--docs">Accordion</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-alert-documentation--docs">Alert</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-avatar-documentation--docs">Avatar</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-badge-documentation--docs">Badge</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-breadcrumb-documentation--docs">Breadcrumb</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-button-documentation--docs">Button</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-button-group-documentation--docs">Button Group</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-card-documentation--docs">Card</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-checkbox-documentation--docs">Checkbox</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-color-documentation--docs">Color</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-combobox-documentation--docs">Combobox</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-copy-button-documentation--docs">Copy Button</a></nve-tree-node>
    <nve-tree-node>
      Datagrid
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-documentation--docs">Documentation</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-integrations--docs">Integrations</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-column-action--docs">Column Action</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-column-alignment--docs">Column Alignment</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-column-fixed--docs">Column Fixed</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-column-width--docs">Column width</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-container--docs">Container</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-card--docs">Card</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-display-settings--docs">Display Settings</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-footer--docs">Footer</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-multi-select--docs">Multi Select</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-pagination--docs">Pagination</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-panel-detail--docs">Panel Detail</a></nve-tree-node>  
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-panel-grid--docs">Panel Grid</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-performance--docs">Performance</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-placeholder--docs">Placeholder</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-row-action--docs">Row Action</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-row-groups--docs">Row Groups</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-row-sort--docs">Row Sort</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-scroll-height--docs">Scroll Height</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-single-select--docs">Single Select</a></nve-tree-node>
      <nve-tree-node><a href="api/?path=/docs/elements-data-grid-stripe--docs">Stripe</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-date-documentation--docs">Date</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-datetime-documentation--docs">Datetime</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-dialog-documentation--docs">Dialog</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-divider-documentation--docs">Divider</a></nve-tree-node>
    <!-- <nve-tree-node ${data.page.url.includes('/docs/elements/dot/') ? 'highlighted' : ''}><a href="docs/elements/dot/">Dot</a></nve-tree-node> -->
    <nve-tree-node ${data.page.url.includes('/docs/elements/dot/') ? 'highlighted' : ''}><a href="api/?path=/docs/elements-dot-documentation--docs">Dot</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-drawer-documentation--docs">Drawer</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-dropdown-documentation--docs">Dropdown</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-file-documentation--docs">File</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-icon-documentation--docs">Icon</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-icon-button-documentation--docs">Icon Button</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-input-documentation--docs">Input</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-input-group-documentation--docs">Input Group</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-logo-documentation--docs">Logo</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-menu-documentation--docs">Menu</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-month-documentation--docs">Month</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-notification-documentation--docs">Notification</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-page-documentation--docs">Page</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-page-header-documentation--docs">Page Header</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-page-loader-documentation--docs">Page Loader</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-pagination-documentation--docs">Pagination</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-panel-documentation--docs">Panel</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-progressive-filter-chip-documentation--docs">Progressive Filter Chip</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-progress-bar-documentation--docs">Progress Bar</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-progress-ring-documentation--docs">Progress Ring</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-password-documentation--docs">Password</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-preferences-input-documentation--docs">Preferences Input</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-pulse-documentation--docs">Pulse</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-radio-documentation--docs">Radio</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-range-documentation--docs">Range</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-search-documentation--docs">Search</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-select-documentation--docs">Select</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-sort-button-documentation--docs">Sort Button</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-switch-documentation--docs">Switch</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-steps-documentation--docs">Steps</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-tabs-documentation--docs">Tabs</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-tag-documentation--docs">Tag</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-textarea-documentation--docs">Textarea</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-time-documentation--docs">Time</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-toast-documentation--docs">Toast</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-toggletip-documentation--docs">Toggletip</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-toolbar-documentation--docs">Toolbar</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-tooltip-documentation--docs">Tooltip</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-tree-documentation--docs">Tree</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/elements-week-documentation--docs">Week</a></nve-tree-node>
  </nve-tree-node>
  <nve-tree-node>
    Patterns
    <nve-tree-node><a href="api/?path=/docs/patterns-documentation--docs">Documentation</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/patterns-browse--docs">Browse</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/patterns-editor--docs">Editor</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/patterns-subheader--docs">Subheader</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/patterns-panel--docs">Panel</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/patterns-trend--docs">Trend</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/patterns-keyboard-shortcut--docs">Keyboard Shortcut</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/patterns-media--docs">Media</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/patterns-onboarding--docs">Onboarding</a></nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/patterns-button-row--docs">Button Row</a></nve-tree-node>
  </nve-tree-node>
  <nve-tree-node>
    Testing
    <nve-tree-node><a href="api/?path=/docs/testing-documentation--docs">Getting Started</a></nve-tree-node>
  </nve-tree-node>
  <nve-tree-node ${data.page.url.includes('/docs/labs/') ? 'expanded' : ''}>
    Labs
    <nve-tree-node ${data.page.url === '/docs/labs/' ? 'highlighted' : ''}><a href="docs/labs/">About</a></nve-tree-node>
    <nve-tree-node>
      Code
      <nve-tree-node><a href="api/?path=/docs/labs-code-codeblock-documentation--docs">Codeblock</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node><a href="api/?path=/docs/labs-behaviors-alpine-documentation--docs">Behaviors Alpine</a></nve-tree-node>
  </nve-tree-node>
  <nve-tree-node ${data.page.url.includes('/docs/api-design/') ? 'expanded' : ''}>
    API Design 
    <nve-tree-node ${data.page.url.includes('/docs/api-design/getting-started/') ? 'highlighted' : ''}><a href="docs/api-design/getting-started/">Getting Started</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/properties-attributes/') ? 'highlighted' : ''}><a href="docs/api-design/properties-attributes/">Properties & Attributes</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/slots/') ? 'highlighted' : ''}><a href="docs/api-design/slots/">Slots</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/registration/') ? 'highlighted' : ''}><a href="docs/api-design/registration/">Registration</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/custom-events/') ? 'highlighted' : ''}><a href="docs/api-design/custom-events/">CustomEvents</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/stateless/') ? 'highlighted' : ''}><a href="docs/api-design/stateless/">Stateless</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/composition/') ? 'highlighted' : ''}><a href="docs/api-design/composition/">Composition</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/styles/') ? 'highlighted' : ''}><a href="docs/api-design/styles/">Styles</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/packaging/') ? 'highlighted' : ''}><a href="docs/api-design/packaging/">Packaging</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/glossary/') ? 'highlighted' : ''}><a href="docs/api-design/glossary/">Glossary</a></nve-tree-node>
  </nve-tree-node>
</nve-tree>
`;

const IS_MR_PREVIEW = process.env.PAGES_BASE_URL?.includes('mr-preview');
const IS_DEV_MODE = process.env.ELEVENTY_RUN_MODE === 'serve' || process.env.PAGES_BASE_URL === '/elements/preview/';
export const PROD_REDIRECT =
  !IS_MR_PREVIEW && !IS_DEV_MODE
    ? /* html */ `<meta http-equiv="refresh" content="0; url=/elements/api/" /><style>body { display: none !important; }</style>`
    : /* html */ `<!-- IS_MR_PREVIEW: ${IS_MR_PREVIEW}, IS_DEV_MODE: ${IS_DEV_MODE} -->`;
