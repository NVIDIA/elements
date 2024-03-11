import { setCustomElementsManifest } from '@storybook/web-components';
import { themes } from '@storybook/theming';
import { excludePrivateFields } from '@elements/elements/internal';
import font from '@elements/elements/inter.css?inline';
// import theme from '@nvidia-elements/themes/index.css?inline';
// import dark from '@nvidia-elements/themes/dark.css?inline';
import ddb from '@nvidia-elements/themes/ddb.css?inline';
import brand from '@nvidia-elements/themes/brand.css?inline';
import brandDark from '@nvidia-elements/themes/brand-dark.css?inline';
import styles from '@elements/elements/index.css?inline';
import responsiveStyles from '@elements/elements/css/module.responsive.css?inline';
import { playground } from './playground-url.js';
import { H1, H2, H3, P } from './markdown.jsx';
import '@elements/elements/button/define.js';
import '../docs/metrics.stories';

import format from 'html-format';
// const prettier = await import('prettier/esm/standalone.mjs');
const parserHTML = await import('prettier/esm/parser-html.mjs');
const customElements = await import('@elements/elements/custom-elements.json');

setCustomElementsManifest(excludePrivateFields(customElements));

const params = new URLSearchParams(window.location.search);

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
      p: P
    },
    theme: themes.dark,
    source: {
      transform: (src, context) => {
        const excludes = context.id.includes('foundations-tokens-examples--');
        let source = src
          .trim()
          .replace(/<mlv-button class="playground-btn" size="sm">.*<\/mlv-button>/g, '');
  
        const lines = source.split('\n').filter(i => i.length ? i.trim().length : false);
        source = lines[0]?.trim() === '<div>' ? lines.slice(1, -1).join('\n') : source;
  
        // prettier 3.0 is async and Storybook decorators cannot be async, temporary workaround using html-format package https://github.com/storybookjs/storybook/issues/10467
        // return excludes ? source : (await prettier.default.format(source, { parser: 'html', plugins: [parserHTML.default], singleAttributePerLine: false, printWidth: 120 })).replaceAll('=""', '');
        return excludes ? source : format(source.replaceAll('=""', ''), ' '.repeat(2), 120);
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
          'Changelog',
          'Metrics',
          'Support',
          'Testing',
          'Accessibility',
          'Extensions',
          'Contributions',
          'Requests',
          'Glossary',
          'API Design',
          [
            'Getting Started',
            'Properties & Attributes',
            'Slots',
            'Registration',
            'Custom Events',
            'Stateless',
            'Composition',
            'Styles',
            'Packaging'
          ]
        ],
        'Integrations',
        'Foundations',
        [
          'Tokens',
          [
            'Documentation',
            'Size & Space',
            'Objects',
            'Layers',
            'Interactions',
            'Support',
            'Status',
            'Color',
            'Animation',
            'Examples'
          ],
          'Themes',
          [
            'Documentation',
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
          'Visualization',
          'I18n'
        ],
        'Elements',
        [
          'Accordion',
          'Alert',
          'Alert Group',
          'App Header',
          'Badge',
          'Breadcrumb',
          'Button',
          'Button Group',
          'Bulk Actions',
          'Card',
          'Checkbox',
          'Color',
          'Combobox',
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
          'File',
          'Icon',
          'Icon Button',
          'Input',
          'Input Group',
          'Logo',
          'Menu',
          'Month',
          'Notification',
          'Page Loader',
          'Pagination',
          'Panel',
          'Progressive Filter Chip',
          'Progress Bar',
          'Progress Ring',
          'Password',
          'Radio',
          'Range',
          'Search',
          'Select',
          'Sort Button',
          'Switch',
          'Tabs',
          'Tag',
          'Textarea',
          'Time',
          'Toast',
          'Toolbar',
          'Tooltip',
          'Week',
        ],
        'Patterns',
        [
          'Documentation',
          'Header',
          'Panel',
          'Layout',
          'Row',
          'Trend',
          'Keyboard Shortcut',
          'Button Row',
          'Examples'
        ],
        'Internal',
        'Deprecated'
      ]
    }
  }
};

const stableThemes = [
  { value: '', title: 'Light' },
  { value: 'dark', title: 'Dark' },
  { value: 'high-contrast', title: 'High Contrast' }
];

const experimentalThemes = [
  { value: 'dark ddb', title: 'DBB (experimental)' },
  { value: 'brand', title: 'Brand Light (experimental)' },
  { value: 'dark brand-dark', title: 'Brand Dark (experimental)' }
];

export const globalTypes = {
  theme: {
    name: 'Themes',
    description: 'Themes',
    defaultValue: 'dark',
    toolbar: {
      title: 'Themes',
      showName: true,
      items: [...stableThemes, ...experimentalThemes]
    },
  },
  scale: {
    name: 'Scale',
    description: 'Scale',
    defaultValue: '',
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
    defaultValue: '',
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
    defaultValue: '',
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
    defaultValue: '',
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
  experimental: {
    name: 'Experimental',
    description: 'Experimental',
    defaultValue: true,
    control: { type: "boolean" },
    toolbar: {
      icon: 'beaker',
      showName: false,
      items: [
        { value: 'experimental', title: 'Experimental On' },
        { value: '', title: 'Experimental Off' },
      ],
    },
  },
}

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles + font + brand + brandDark + ddb + responsiveStyles);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];

const parentStyle = document.createElement('style');
parentStyle.innerText = styles + font + brand + brandDark + ddb + responsiveStyles;
window.parent.document.head.appendChild(parentStyle);

export const decorators = [(story, { globals }) => {
  const themes = window.parent.document.querySelector('[nve-theme]').getAttribute('nve-theme');
  window.document.querySelector('html').setAttribute('nve-theme', themes);
  return story();
}, playground];
