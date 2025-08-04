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
  <meta name="robots" content="all">
  <base href="${BASE_URL}" />
  <title data-pagefind-meta="title">${data.title}</title>
  <meta name="description" content="Elements - ${data.title}">
  <meta property="og:title" content="Elements - ${data.title}" >
  <meta property="og:url" content="${data.page?.url ?? ''}">
  <meta property="og:description" content="NVIDIA Elements is a flexible, framework-agnostic design system and toolkit that empowers teams to build exceptional user experiences.">
  <meta property="og:image" content="/favicon.svg">
  <meta property="og:site_name" content="https://NVIDIA.github.io/elements/">
  <meta property="og:type" content="website">
  <link rel="icon" href="/favicon.svg">
  ${renderGlobalsScript(data)}
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
    @import '@nvidia-elements/themes/reduced-motion.css';
    @import '@nvidia-elements/styles/layout.css';
    @import '@nvidia-elements/styles/responsive.css';
    @import '@nvidia-elements/styles/typography.css';
    @import '@nvidia-elements/styles/view-transitions.css';

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
  <script type="module" defer>
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
<nve-tree id="docs-nav" data-pagefind-ignore="all" behavior-expand>
  <nve-tree-node ${data.page.url.includes('/docs/metrics/') || data.page.url.includes('/docs/changelog/') || data.page.url.includes('/docs/about/') ? 'expanded' : ''}>
    About
    <nve-tree-node ${data.page.url.includes('/docs/about/getting-started/') ? 'highlighted' : ''}><a href="docs/about/getting-started/">Getting Started</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/changelog/') ? 'highlighted' : ''}><a href="docs/changelog/">Changelog</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/metrics/') ? 'highlighted' : ''}><a href="docs/metrics/">Metrics</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/support/') ? 'highlighted' : ''}><a href="docs/about/support/">Support</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/accessibility/') ? 'highlighted' : ''}><a href="docs/about/accessibility/">Accessibility</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/contributions/') ? 'highlighted' : ''}><a href="docs/about/contributions/">Contributions</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/requests/') ? 'highlighted' : ''}><a href="docs/about/requests/">Requests</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/migration/') ? 'highlighted' : ''}><a href="docs/about/migration/">Migration</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/about/deprecations/') ? 'highlighted' : ''}><a href="docs/about/deprecations/">Deprecations</a></nve-tree-node>
  </nve-tree-node>
  
  <nve-tree-node ${data.page.url.includes('/docs/integrations/') || data.page.url.includes('/starters/') ? 'expanded' : ''}>
    Integrations
    <nve-tree-node ${data.page.url.includes('/docs/integrations/installation/') ? 'highlighted' : ''}><a href="docs/integrations/installation/">Installation</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/angular/') ? 'highlighted' : ''}><a href="docs/integrations/angular/">Angular</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/bundles/') ? 'highlighted' : ''}><a href="docs/integrations/bundles/">Bundles</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/extensions/') ? 'highlighted' : ''}><a href="docs/integrations/extensions/">Extensions</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/go/') ? 'highlighted' : ''}><a href="docs/integrations/go/">Go</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/importmaps/') ? 'highlighted' : ''}><a href="docs/integrations/importmaps/">Import Maps</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/lit/') ? 'highlighted' : ''}><a href="docs/integrations/lit/">Lit</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/nextjs/') ? 'highlighted' : ''}><a href="docs/integrations/nextjs/">NextJS</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/preact/') ? 'highlighted' : ''}><a href="docs/integrations/preact/">Preact</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/react/') ? 'highlighted' : ''}><a href="docs/integrations/react/">React</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/solidjs/') ? 'highlighted' : ''}><a href="docs/integrations/solidjs/">SolidJS</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/typescript/') ? 'highlighted' : ''}><a href="docs/integrations/typescript/">TypeScript</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/integrations/vue/') ? 'highlighted' : ''}><a href="docs/integrations/vue/">Vue</a></nve-tree-node>
  </nve-tree-node>
  
  <nve-tree-node ${data.page.url.includes('/docs/foundations/') ? 'expanded' : ''}>
    Foundations
    <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/') ? 'expanded' : ''} ${data.page.url === '/docs/foundations/themes/' ? 'highlighted' : ''}>
      <a href="docs/foundations/themes/">Themes</a>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/tokens/') ? 'highlighted' : ''}><a href="docs/foundations/themes/tokens/">Design Tokens</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/size/' ? 'highlighted' : ''}><a href="docs/foundations/themes/size/">Size & Space</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/objects/') ? 'highlighted' : ''}><a href="docs/foundations/themes/objects/">Objects</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/interactions/') ? 'highlighted' : ''}><a href="docs/foundations/themes/interactions/">Interactions</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/support/' ? 'highlighted' : ''}><a href="docs/foundations/themes/support/">Support</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/status/' ? 'highlighted' : ''}><a href="docs/foundations/themes/status/">Status</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/color/' ? 'highlighted' : ''}><a href="docs/foundations/themes/color/">Color</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/animation/' ? 'highlighted' : ''}><a href="docs/foundations/themes/animation/">Animation</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/fonts/' ? 'highlighted' : ''}><a href="docs/foundations/themes/fonts/">Fonts</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/themes/layers/') ? 'highlighted' : ''}><a href="docs/foundations/themes/layers/">Layers</a></nve-tree-node>
      <nve-tree-node ${data.page.url === '/docs/foundations/themes/custom/' ? 'highlighted' : ''}><a href="docs/foundations/themes/custom/">Custom</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/') ? 'expanded' : ''} ${data.page.url === '/docs/foundations/layout/' ? 'highlighted' : ''}>
      <a href="docs/foundations/layout/">Layout</a>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/horizontal/') ? 'highlighted' : ''}><a href="docs/foundations/layout/horizontal/">Horizontal</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/vertical/') ? 'highlighted' : ''}><a href="docs/foundations/layout/vertical/">Vertical</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/layout/grid/') ? 'highlighted' : ''}><a href="docs/foundations/layout/grid/">Grid</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/forms/') ? 'expanded' : ''} ${data.page.url === '/docs/foundations/forms/' ? 'highlighted' : ''}>
      <a href="docs/foundations/forms/">Forms</a>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/forms/controls/') ? 'highlighted' : ''}><a href="docs/foundations/forms/controls/">Controls</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/forms/actions/') ? 'highlighted' : ''}><a href="docs/foundations/forms/actions/">Actions</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/foundations/forms/validation/') ? 'highlighted' : ''}><a href="docs/foundations/forms/validation/">Validation</a></nve-tree-node>
    </nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/typography/') ? 'highlighted' : ''}><a href="docs/foundations/typography/">Typography</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/foundations/iconography/') ? 'highlighted' : ''}><a href="docs/foundations/iconography/">Iconography</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/popovers/' ? 'highlighted' : ''}><a href="docs/foundations/popovers/">Popovers</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/i18n/' ? 'highlighted' : ''}><a href="docs/foundations/i18n/">i18n</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/visualization/' ? 'highlighted' : ''}><a href="docs/foundations/visualization/">Visualization</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/foundations/view-transitions/' ? 'highlighted' : ''}><a href="docs/foundations/view-transitions/">View Transitions</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/elements/') ? 'expanded' : ''}>
    Elements
    <nve-tree-node ${data.page.url.includes('/docs/elements/accordion/') ? 'highlighted' : ''}><a href="docs/elements/accordion/">Accordion</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/alert/') ? 'highlighted' : ''}><a href="docs/elements/alert/">Alert</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/avatar/') ? 'highlighted' : ''}><a href="docs/elements/avatar/">Avatar</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/badge/') ? 'highlighted' : ''}><a href="docs/elements/badge/">Badge</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/breadcrumb/') ? 'highlighted' : ''}><a href="docs/elements/breadcrumb/">Breadcrumb</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/button/') ? 'highlighted' : ''}><a href="docs/elements/button/">Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/button-group/') ? 'highlighted' : ''}><a href="docs/elements/button-group/">Button Group</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/card/') ? 'highlighted' : ''}><a href="docs/elements/card/">Card</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/chat-message/') ? 'highlighted' : ''}><a href="docs/elements/chat-message/">Chat Message</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/checkbox/') ? 'highlighted' : ''}><a href="docs/elements/checkbox/">Checkbox</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/color/') ? 'highlighted' : ''}><a href="docs/elements/color/">Color</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/combobox/') ? 'highlighted' : ''}><a href="docs/elements/combobox/">Combobox</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/copy-button/') ? 'highlighted' : ''}><a href="docs/elements/copy-button/">Copy Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/') ? 'expanded' : ''} ${data.page.url.endsWith('/docs/elements/data-grid/') || data.page.url.endsWith('/docs/elements/data-grid/api/') ? 'highlighted' : ''}>
      <a href="docs/elements/data-grid/">Datagrid</a>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/integrations/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/integrations/">Integrations</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-action/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/column-action/">Column Action</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-alignment/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/column-alignment/">Column Alignment</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-fixed/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/column-fixed/">Column Fixed</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/column-width/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/column-width/">Column width</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/container/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/container/">Container</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/card/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/card/">Card</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/display-settings/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/display-settings/">Display Settings</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/footer/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/footer/">Footer</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/heatmap/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/heatmap/">Heatmap</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/keynav/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/keynav/">Keynav</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/multi-select/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/multi-select/">Multi Select</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/pagination/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/pagination/">Pagination</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/panel-detail/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/panel-detail/">Panel Detail</a></nve-tree-node>  
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/panel-grid/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/panel-grid/">Panel Grid</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/performance/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/performance/">Performance</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/placeholder/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/placeholder/">Placeholder</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/row-action/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/row-action/">Row Action</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/row-groups/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/row-groups/">Row Groups</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/row-sort/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/row-sort/">Row Sort</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/scroll-height/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/scroll-height/">Scroll Height</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/single-select/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/single-select/">Single Select</a></nve-tree-node>
      <nve-tree-node ${data.page.url.includes('/docs/elements/data-grid/stripe/') ? 'highlighted' : ''}><a href="docs/elements/data-grid/stripe/">Stripe</a></nve-tree-node>
    </nve-tree-node>  
    <nve-tree-node ${data.page.url.includes('/docs/elements/date/') ? 'highlighted' : ''}><a href="docs/elements/date/">Date</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/datetime/') ? 'highlighted' : ''}><a href="docs/elements/datetime/">Datetime</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dialog/') ? 'highlighted' : ''}><a href="docs/elements/dialog/">Dialog</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/divider/') ? 'highlighted' : ''}><a href="docs/elements/divider/">Divider</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dot/') ? 'highlighted' : ''}><a href="docs/elements/dot/">Dot</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/drawer/') ? 'highlighted' : ''}><a href="docs/elements/drawer/">Drawer</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dropdown/') ? 'highlighted' : ''}><a href="docs/elements/dropdown/">Dropdown</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dropdown-group/') ? 'highlighted' : ''}><a href="docs/elements/dropdown-group/">Dropdown Group</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/dropzone/') ? 'highlighted' : ''}><a href="docs/elements/dropzone/">Dropzone</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/file/') ? 'highlighted' : ''}><a href="docs/elements/file/">File</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/icon/') ? 'highlighted' : ''}><a href="docs/elements/icon/">Icon</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/icon-button/') ? 'highlighted' : ''}><a href="docs/elements/icon-button/">Icon Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/input/') ? 'highlighted' : ''}><a href="docs/elements/input/">Input</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/input-group/') ? 'highlighted' : ''}><a href="docs/elements/input-group/">Input Group</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/logo/') ? 'highlighted' : ''}><a href="docs/elements/logo/">Logo</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/menu/') ? 'highlighted' : ''}><a href="docs/elements/menu/">Menu</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/month/') ? 'highlighted' : ''}><a href="docs/elements/month/">Month</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/notification/') ? 'highlighted' : ''}><a href="docs/elements/notification/">Notification</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/page/') ? 'highlighted' : ''}><a href="docs/elements/page/">Page</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/page-header/') ? 'highlighted' : ''}><a href="docs/elements/page-header/">Page Header</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/page-loader/') ? 'highlighted' : ''}><a href="docs/elements/page-loader/">Page Loader</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/pagination/') ? 'highlighted' : ''}><a href="docs/elements/pagination/">Pagination</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/panel/') ? 'highlighted' : ''}><a href="docs/elements/panel/">Panel</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/progressive-filter-chip/') ? 'highlighted' : ''}><a href="docs/elements/progressive-filter-chip/">Progressive Filter Chip</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/progress-bar/') ? 'highlighted' : ''}><a href="docs/elements/progress-bar/">Progress Bar</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/progress-ring/') ? 'highlighted' : ''}><a href="docs/elements/progress-ring/">Progress Ring</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/password/') ? 'highlighted' : ''}><a href="docs/elements/password/">Password</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/preferences-input/') ? 'highlighted' : ''}><a href="docs/elements/preferences-input/">Preferences Input</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/pulse/') ? 'highlighted' : ''}><a href="docs/elements/pulse/">Pulse</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/radio/') ? 'highlighted' : ''}><a href="docs/elements/radio/">Radio</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/range/') ? 'highlighted' : ''}><a href="docs/elements/range/">Range</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/resize-handle/') ? 'highlighted' : ''}><a href="docs/elements/resize-handle/">Resize Handle</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/search/') ? 'highlighted' : ''}><a href="docs/elements/search/">Search</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/select/') ? 'highlighted' : ''}><a href="docs/elements/select/">Select</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/sort-button/') ? 'highlighted' : ''}><a href="docs/elements/sort-button/">Sort Button</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/star-rating/') ? 'highlighted' : ''}><a href="docs/elements/star-rating/">Star Rating</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/steps/') ? 'highlighted' : ''}><a href="docs/elements/steps/">Steps</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/switch/') ? 'highlighted' : ''}><a href="docs/elements/switch/">Switch</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tabs/') ? 'highlighted' : ''}><a href="docs/elements/tabs/">Tabs</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tag/') ? 'highlighted' : ''}><a href="docs/elements/tag/">Tag</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/textarea/') ? 'highlighted' : ''}><a href="docs/elements/textarea/">Textarea</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/time/') ? 'highlighted' : ''}><a href="docs/elements/time/">Time</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/toast/') ? 'highlighted' : ''}><a href="docs/elements/toast/">Toast</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/toggletip/') ? 'highlighted' : ''}><a href="docs/elements/toggletip/">Toggletip</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/toolbar/') ? 'highlighted' : ''}><a href="docs/elements/toolbar/">Toolbar</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tooltip/') ? 'highlighted' : ''}><a href="docs/elements/tooltip/">Tooltip</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/tree/') ? 'highlighted' : ''}><a href="docs/elements/tree/">Tree</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/elements/week/') ? 'highlighted' : ''}><a href="docs/elements/week/">Week</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/patterns/') ? 'expanded' : ''} ${data.page.url === '/docs/patterns/' ? 'highlighted' : ''}>
    <a href="docs/patterns/">Patterns</a>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/browse/') ? 'highlighted' : ''}><a href="docs/patterns/browse/">Browse</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/editor/') ? 'highlighted' : ''}><a href="docs/patterns/editor/">Editor</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/subheader/') ? 'highlighted' : ''}><a href="docs/patterns/subheader/">Subheader</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/panel/') ? 'highlighted' : ''}><a href="docs/patterns/panel/">Panel</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/trend/') ? 'highlighted' : ''}><a href="docs/patterns/trend/">Trend</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/keyboard-shortcut/') ? 'highlighted' : ''}><a href="docs/patterns/keyboard-shortcut/">Keyboard Shortcut</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/media/') ? 'highlighted' : ''}><a href="docs/patterns/media/">Media</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/onboarding/') ? 'highlighted' : ''}><a href="docs/patterns/onboarding/">Onboarding</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/button-row/') ? 'highlighted' : ''}><a href="docs/patterns/button-row/">Button Row</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/patterns/responsive/') ? 'highlighted' : ''}><a href="docs/patterns/responsive/">Responsive</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/testing/') ? 'expanded' : ''}>
    Testing
    <nve-tree-node ${data.page.url === '/docs/testing/' ? 'highlighted' : ''}><a href="docs/testing/">Getting Started</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/code/') ? 'expanded' : ''}>
    Code
    <nve-tree-node ${data.page.url.includes('/docs/code/codeblock/') ? 'highlighted' : ''}><a href="docs/code/codeblock/">Codeblock</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/monaco/') ? 'expanded' : ''}>
    Monaco
    <nve-tree-node ${data.page.url.includes('/docs/monaco/input/') ? 'highlighted' : ''}><a href="docs/monaco/input/">Input</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/monaco/diff-input/') ? 'highlighted' : ''}><a href="docs/monaco/diff-input/">Diff Input</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/monaco/editor/') ? 'highlighted' : ''}><a href="docs/monaco/editor/">Editor</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/monaco/diff-editor/') ? 'highlighted' : ''}><a href="docs/monaco/diff-editor/">Diff Editor</a></nve-tree-node>
  </nve-tree-node>

  <!-- <nve-tree-node ${data.page.url.includes('/docs/markdown/') ? 'expanded' : ''}>
    Markdown
    <nve-tree-node ${data.page.url.includes('/docs/markdown/') ? 'highlighted' : ''}><a href="docs/markdown/">Markdown</a></nve-tree-node>
  </nve-tree-node> -->

  <nve-tree-node ${data.page.url.includes('/docs/labs/') ? 'expanded' : ''} ${data.page.url === '/docs/labs/' ? 'highlighted' : ''}>
    <a href="docs/labs/">Labs</a>
    <nve-tree-node ${data.page.url === '/docs/labs/' ? 'highlighted' : ''}><a href="docs/labs/">About</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/labs/behaviors-alpine/' ? 'highlighted' : ''}><a href="docs/labs/behaviors-alpine/">Behaviors Alpine</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/labs/brand/' ? 'highlighted' : ''}><a href="docs/labs/brand/">Brand</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/labs/forms/' ? 'highlighted' : ''}><a href="docs/labs/forms/">Forms</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/api-design/') ? 'expanded' : ''} ${data.page.url === '/docs/api-design/' ? 'highlighted' : ''}>
    <a href="docs/api-design/">API Design</a>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/properties-attributes/') ? 'highlighted' : ''}><a href="docs/api-design/properties-attributes/">Properties & Attributes</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/slots/') ? 'highlighted' : ''}><a href="docs/api-design/slots/">Slots</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/registration/') ? 'highlighted' : ''}><a href="docs/api-design/registration/">Registration</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/custom-events/') ? 'highlighted' : ''}><a href="docs/api-design/custom-events/">CustomEvents</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/stateless/') ? 'highlighted' : ''}><a href="docs/api-design/stateless/">Stateless</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/composition/') ? 'highlighted' : ''}><a href="docs/api-design/composition/">Composition</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/styles/') ? 'highlighted' : ''}><a href="docs/api-design/styles/">Styles</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/packaging/') ? 'highlighted' : ''}><a href="docs/api-design/packaging/">Packaging</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/glossary/') ? 'highlighted' : ''}><a href="docs/api-design/glossary/">Glossary</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/api-design/logs/') ? 'highlighted' : ''}><a href="docs/api-design/logs/">Logs</a></nve-tree-node>
  </nve-tree-node>

  <nve-tree-node ${data.page.url.includes('/docs/internal/') ? 'expanded' : ''} ${data.page.url === '/docs/internal/' ? 'highlighted' : ''}>
    <a href="docs/internal/">Internal</a>
    <nve-tree-node><a href="stories/">Stories</a></nve-tree-node>
    <nve-tree-node ${data.page.url === '/docs/internal/testing/' ? 'highlighted' : ''}><a href="docs/internal/testing/">Testing Guidelines</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/testing/unit/') ? 'highlighted' : ''}><a href="docs/internal/testing/unit/">Unit Testing</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/testing/accessibility/') ? 'highlighted' : ''}><a href="docs/internal/testing/accessibility/">Accessibility Testing</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/testing/lighthouse/') ? 'highlighted' : ''}><a href="docs/internal/testing/lighthouse/">Lighthouse Testing</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/testing/ssr/') ? 'highlighted' : ''}><a href="docs/internal/testing/ssr/">SSR Testing</a></nve-tree-node>
    <nve-tree-node ${data.page.url.includes('/docs/internal/testing/visual/') ? 'highlighted' : ''}><a href="docs/internal/testing/visual/">Visual Testing</a></nve-tree-node>

    <nve-tree-node ${data.page.url.includes('/docs/internal/layout/responsive/') ? 'expanded' : ''} ${data.page.url === '/docs/internal/layout/responsive/' ? 'highlighted' : ''}>
      <a href="docs/internal/layout/responsive/">Responsive Layout</a>

        <nve-tree-node ${data.page.url.includes('/docs/internal/layout/responsive/viewport/') ? 'highlighted' : ''}><a href="docs/internal/layout/responsive/viewport/">Viewport</a></nve-tree-node>
        <nve-tree-node ${data.page.url.includes('/docs/internal/layout/responsive/container/') ? 'highlighted' : ''}><a href="docs/internal/layout/responsive/container/">Container</a></nve-tree-node>
        <nve-tree-node ${data.page.url.includes('/docs/internal/layout/responsive/patterns/') ? 'highlighted' : ''}><a href="docs/internal/layout/responsive/patterns/">Patterns</a></nve-tree-node>
    </nve-tree-node>
  </nve-tree-node>
</nve-tree>
`;

export function renderGlobalsScript(data = { disableTheme: false }) {
  return data.disableTheme
    ? ''
    : /* html */ `
<script>
  (() => {
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
      globalThis.document.documentElement.setAttribute('nve-theme', themes);
  })();
</script>
  `;
}

export const IS_MR_PREVIEW = process.env.PAGES_BASE_URL?.includes('mr-preview');
export const IS_DEV_MODE =
  process.env.ELEVENTY_RUN_MODE === 'serve' || process.env.PAGES_BASE_URL === '/elements/preview/';
