import '@nvidia-elements/core/polyfills';
import format from 'html-format';
import { themes } from '@storybook/theming';

import fontInter from '@nvidia-elements/themes/fonts/inter.css?inline';
import theme from '@nvidia-elements/themes/index.css?inline';
import dark from '@nvidia-elements/themes/dark.css?inline';
import layoutStyles from '@nvidia-elements/styles/layout.css?inline';
import typographyStyles from '@nvidia-elements/styles/typography.css?inline';
import responsiveStyles from '@nvidia-elements/styles/responsive.css?inline';
import highContrastTheme from '@nvidia-elements/themes/high-contrast.css?inline';
import reducedMotionTheme from '@nvidia-elements/themes/reduced-motion.css?inline';
import compactTheme from '@nvidia-elements/themes/compact.css?inline';
import debugTheme from '@nvidia-elements/themes/debug.css?inline';
import ddbTheme from '@nvidia-elements/themes/ddb-dark.css?inline';
import brandTheme from '@nvidia-elements/themes/brand.css?inline';
import brandDarkTheme from '@nvidia-elements/themes/brand-dark.css?inline';
import fontNvidiaSans from '@nvidia-elements/themes/fonts/nvidia-sans.css?inline';
import viewTransitionStyles from '@nvidia-elements/styles/view-transitions.css?inline';
import { H1, H2, H3, H4, P, UL, OL, PRE, CODE } from '@nve-internals/storybook/blocks';
import { setSourcePackageScope } from '@nve-internals/elements-api';

import '@nvidia-elements/core/button/define.js';
import '@nve-internals/elements-api/table/define.js';
import '@nve-internals/elements-api/detail/define.js';
import '@nve-internals/elements-api/status/define.js';
import '@nve-internals/elements-api/summary/define.js';

export const parameters = {
  badges: ['stable'],
  backgrounds: {
    disable: true,
    grid: {
      disable: true,
    }
  },
  viewMode: 'story',
  docs: {
    components: {
      h1: H1,
      h2: H2,
      h3: H3,
      h4: H4,
      p: P,
      ul: UL,
      ol: OL,
      pre: PRE,
      code: CODE,
      canvas: PRE
    },
    theme: themes.dark,
    source: {
      transform: (source, context) => {
        // basic html formatting
        if (!source.includes('nve-codeblock')) { // skip formatting if codeblock to preserve story source formatting
          source = format(source.replaceAll('=""', ''), ' '.repeat(2), 120); // https://github.com/storybookjs/storybook/issues/10467
        }

        return setSourcePackageScope(source, { scope: context.globals.scope, sourceType: context.globals.sourceType  });
      }
    }
  },
  darkMode: {
    stylePreview: true,
    dark: { ...themes.dark, appContentBg: themes.dark.appContentBg },
    light: { ...themes.normal, appContentBg: '#F4F5F6' }
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    expanded: false,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  },
  options: {
    storySort: {
      method: 'alphabetical',
      order: [
        'About',
        [
          'Getting Started',
          'Installation',
          'Changelog',
          'Metrics',
          'Support',
          'Testing',
          'Accessibility',
          'Contributions',
          'Requests'
        ],
        'Integrations',
        'Foundations',
        [
          'Themes',
          [
            'Documentation',
            'Design Tokens',
            'Size & Space',
            'Objects',
            'Layers',
            'Interactions',
            'Support',
            'Status',
            'Color',
            'Animation',
            'Fonts',
            'Custom',
            'Examples'
          ],
          'Typography',
          [
            'Documentation',
            'Examples'
          ],
          'Iconography',
          [
            'Documentation'
          ],
          'Layout',
          [
            'Documentation',
            'Horizontal Flex',
            'Vertical Flex',
            'Grid',
            'Examples'
          ],
          'Forms',
          [
            'Documentation',
            'Validation',
            'Controls',
            'Actions',
            'Examples'
          ],
          'Popovers',
          'I18n',
          'Visualization',
          'View Transitions'
        ],
        'Elements',
        [
          'Accordion',
          'Alert',
          'App Header',
          'Avatar',
          'Badge',
          'Breadcrumb',
          'Button',
          'Button Group',
          'Bulk Actions',
          'Card',
          'Chat Message',
          'Checkbox',
          'Color',
          'Combobox',
          'Copy Button',
          'Data Grid',
          [
            'Documentation',
            'Integrations',
            'Action',
            'Column Action',
            'Column Alignment',
            'Column Fixed',
            'Column Width',
            'Container',
            'Card',
            'Display Settings',
            'Footer',
            'Multi Select',
            'Pagination',
            'Panel Detail',
            'Panel Grid',
            'Performance',
            'Placeholder',
            'Row Action',
            'Row Groups',
            'Row Sort',
            'Scroll Height',
            'Single Select',
            'Stripe',
            'Kitchen Sink',
            'Examples'
          ],
          'Date',
          'Datetime',
          'Dialog',
          'Divider',
          'Dot',
          'Drawer',
          'Dropdown',
          'Dropzone',
          'File',
          'Icon',
          'Icon Button',
          'Input',
          'Input Group',
          'Logo',
          'Menu',
          'Month',
          'Notification',
          'Page Header',
          'Page Loader',
          'Page',
          'Pagination',
          'Panel',
          'Password',
          'Preferences Input',
          'Progress Bar',
          'Progress Ring',
          'Progressive Filter Chip',
          'Pulse',
          'Radio',
          'Range',
          'Resize Handle',
          'Search',
          'Select',
          'Sort Button',
          'Star Rating',
          'Steps',
          'Switch',
          'Tabs',
          'Tag',
          'Textarea',
          'Time',
          'Toast',
          'Toggletip',
          'Toolbar',
          'Tooltip',
          'Tree',
          'Week',
        ],
        'Patterns',
        [
          'Documentation',
          'Browse',
          'Editor',
          'Subheader',
          'Panel',
          'Trend',
          'Keyboard Shortcut',
          'Media',
          'Onboarding',
          'Button Row',
          'Examples'
        ],
        'Testing',
        'Labs',
        [
          'About',
          'Code',
          'Behaviors Alpine'
        ],
        'API Design',
        [
          'NOPE',
          'Getting Started',
          'Properties & Attributes',
          'Slots',
          'Registration',
          'Custom Events',
          'Stateless',
          'Composition',
          'Styles',
          'Packaging',
          'Glossary'
        ],
        'Internal',
        'Deprecated'
      ]
    }
  }
};

const storedGlobals = JSON.parse(localStorage.getItem('elements-sb-globals')) || {};

export const globalTypes = {
  theme: {
    name: 'Themes',
    description: 'Themes',
    defaultValue: storedGlobals?.theme ?? 'dark',
    toolbar: {
      title: 'Themes',
      showName: true,
      items: [
        { value: '', title: 'Light' },
        { value: 'high-contrast', title: 'High Contrast' },
        { value: 'brand', title: 'Brand (experimental)' },
        { value: 'dark', title: 'Dark' },
        { value: 'brand-dark', title: 'Brand Dark (experimental)' },
        { value: 'ddb-dark', title: 'DBB Dark (experimental)' },
      ]
    },
  },
  font: {
    name: 'Font',
    description: 'Fonts',
    defaultValue: storedGlobals?.font ?? '',
    toolbar: {
      title: 'Font',
      showName: true,
      items: [
        { value: '', title: 'Theme Default' },
        { value: 'inter', title: 'Inter' },
        { value: 'nvidia-sans', title: 'NVIDIA Sans' }
      ]
    },
  },
  scale: {
    name: 'Scale',
    description: 'Scale',
    defaultValue: storedGlobals?.scale ?? '',
    toolbar: {
      title: 'Scale',
      showName: true,
      items: [
        { value: '', title: 'Default' },
        { value: 'compact', title: 'Compact' }
      ],
    },
  },
  debug: {
    name: 'Debug',
    description: 'Debug',
    defaultValue: storedGlobals?.debug ?? '',
    toolbar: {
      title: 'Debug',
      showName: true,
      items: [
        { value: '', title: 'Off' },
        { value: 'debug', title: 'On' }
      ],
    },
  },
  animation: {
    name: 'Animation',
    description: 'Animation',
    defaultValue: storedGlobals?.animation ?? '',
    toolbar: {
      title: 'Animation',
      showName: true,
      items: [
        { value: '', title: 'Default' },
        { value: 'reduced-motion', title: 'Reduced Motion' },
      ],
    },
  },
  dataTheme: {
    name: 'Data',
    description: 'Data',
    defaultValue: storedGlobals?.dataTheme ?? '',
    toolbar: {
      title: 'Data',
      showName: true,
      items: [
        { value: '', title: 'Infra' },
        { value: 'models', title: 'AI/ML' },
        { value: 'hardware', title: 'Hardware' }
      ],
    },
  },
  scope: {
    name: 'Scope',
    description: 'Scope',
    defaultValue: storedGlobals?.scope ?? 'nve',
    toolbar: {
      icon: 'beaker',
      showName: false,
      items: [
        { value: 'nve', title: 'nve' },
        { value: 'mlv', title: 'mlv' }
      ],
    },
  },
  sourceType: {
    name: 'Source Type',
    description: 'Source Type',
    defaultValue: storedGlobals?.sourceType ?? 'html',
    toolbar: {
      icon: 'beaker',
      showName: false,
      items: [
        { value: 'html', title: 'html' },
        { value: 'react', title: 'react' },
      ],
    },
  },
}

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(theme + dark + fontInter + fontNvidiaSans + highContrastTheme + reducedMotionTheme + compactTheme + debugTheme + brandTheme + brandDarkTheme + ddbTheme + layoutStyles + responsiveStyles + typographyStyles + viewTransitionStyles);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];

const parentStyle = document.createElement('style');
parentStyle.innerText = theme + dark + fontInter + fontNvidiaSans + highContrastTheme + reducedMotionTheme + compactTheme + debugTheme + brandTheme + brandDarkTheme + ddbTheme + layoutStyles + responsiveStyles + typographyStyles + viewTransitionStyles;
window.parent.document.head.appendChild(parentStyle);

export const decorators = [(story, { globals }) => {
  const themes = window.parent.document.querySelector('[nve-theme]')?.getAttribute('nve-theme') ?? `${globals.theme} ${globals.font}`;
  window.document.querySelector('html').setAttribute('nve-theme', themes.trim());
  window.NVE_SB_GLOBALS = globals;
  return story();
},
(story) => {
  const listId = `${document.title}-list`;
  const docsWrapper = document.querySelector('.sbdocs-wrapper');
  const elementMetrics = document.querySelector('nve-api-summary');

  if (docsWrapper && elementMetrics && !document.querySelector(`#${listId}`)) {
    const headings = [
      ...Array.from(document.querySelectorAll('h1, h2, h3, h4')).filter(h => h.className === 'dynamic-anchor'),
      document.querySelector('nve-api-status') ? { textContent: 'Status', id: 'element-status'} : null,
      document.querySelector('nve-api-table[type="all"]') ? { textContent: 'API', id: 'element-api'} : null
    ].filter(i => !!i);
  
    if (headings.length > 2) {
      const list = headingsToUL(headings);
      list.id = listId;
      docsWrapper.appendChild(list);
    }
  }
  return story();
}];

function headingsToUL(headings) {
  const ul = document.createElement('ul');
  ul.setAttribute('nve-text', 'list sb');
  for (const heading of headings) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.setAttribute('nve-text', 'link truncate');
    a.href = `./?path=/docs/${document.title}#${heading.id}`;
    a.textContent = heading.textContent;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector(`#${heading.id}`).scrollIntoView();
    });
    li.appendChild(a);
    ul.appendChild(li);
  }
  return ul;
}
