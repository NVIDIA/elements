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
  <link rel="icon" href="/assets/favicon.svg"> 
  <style>
    @import '@nvidia-elements/themes/fonts/inter.css';
    @import '@nvidia-elements/themes/index.css';
    @import '@nvidia-elements/themes/dark.css';
    @import '@nvidia-elements/styles/layout.css';
    @import '@nvidia-elements/styles/responsive.css';
    @import '@nvidia-elements/styles/typography.css';
    @import '@nvidia-elements/styles/view-transitions.css';

    *:not(:defined) {
      visibility: hidden;
    }
  </style>
  <script type="module">
    import '@nvidia-elements/core/page-header/define.js';
    import '@nvidia-elements/core/page/define.js';
    import '@nvidia-elements/core/button/define.js';
    import '@nvidia-elements/core/logo/define.js';

    const SB_GLOBALS = { theme: 'dark', font: '',  scale: '', debug: '', animation: '', sourceType: 'html', ...(JSON.parse(localStorage.getItem('elements-sb-globals'), null, 2) ?? { }) };
    document.body.setAttribute('nve-theme', SB_GLOBALS.theme);
  </script>
`;

const IS_MR_PREVIEW = process.env.PAGES_BASE_URL.includes('mr-preview');
const IS_DEV_MODE = process.env.ELEVENTY_RUN_MODE === 'serve' || process.env.PAGES_BASE_URL === '/elements/preview/';
export const PROD_REDIRECT =
  !IS_MR_PREVIEW && !IS_DEV_MODE
    ? /* html */ `<meta http-equiv="refresh" content="0; url=/elements/api/" /><style>body { display: none !important; }</style>`
    : /* html */ `<!-- IS_MR_PREVIEW: ${IS_MR_PREVIEW}, IS_DEV_MODE: ${IS_DEV_MODE} -->`;
