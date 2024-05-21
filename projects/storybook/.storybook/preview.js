import { setCustomElementsManifest } from '@storybook/web-components';
import { themes } from '@storybook/theming';
import styles from '@nvidia-elements/core/index.css?inline';
// import theme from '@nvidia-elements/themes/index.css?inline'; // using backwards compatible theme above
// import dark from '@nvidia-elements/themes/dark.css?inline'; // using backwards compatible theme above
import fontInter from '@nvidia-elements/themes/fonts/inter.css?inline';
import fontNvidiaSans from '@nvidia-elements/themes/fonts/nvidia-sans.css?inline';
import ddb from '@nvidia-elements/themes/ddb-dark.css?inline';
import brand from '@nvidia-elements/themes/brand.css?inline';
import brandDark from '@nvidia-elements/themes/brand-dark.css?inline';
import responsiveStyles from '@nvidia-elements/core/css/module.responsive.css?inline';
import { playground } from './playground-url.js';
import { updateScope } from './utils.js';
import { H1, H2, H3, P, UL, OL, PRE } from './markdown.jsx';
import '@nvidia-elements/core/button/define.js';
import format from 'html-format';

const customElements = await import('@nvidia-elements/core/custom-elements.json');

import('../src/about/metrics.stories');

setCustomElementsManifest(excludePrivateFields(customElements)); // excludePrivateFields

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
      p: P,
      ul: UL,
      ol: OL,
      pre: PRE
    },
    theme: themes.dark,
    source: {
      transform: (source, context) => {
        // remove playground button from view source code in Storybook
        source = source.trim().replace(/<nve-button class="playground-btn" size="sm">.*<\/nve-button>/g, '')

        // basic html formatting
        source = format(source.replaceAll('=""', ''), ' '.repeat(2), 120); // https://github.com/storybookjs/storybook/issues/10467

        return updateScope(source, { scope: context.globals.scope, sourceType: context.globals.sourceType  });
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
          'Steps',
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
        'Testing',
        'Labs',
        'Internal',
        'Deprecated'
      ]
    }
  }
};

export const globalTypes = {
  theme: {
    name: 'Themes',
    description: 'Themes',
    defaultValue: 'dark',
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
  scope: {
    name: 'Scope',
    description: 'Scope',
    defaultValue: 'mlv',
    toolbar: {
      icon: 'beaker',
      showName: false,
      items: [
        { value: 'mlv', title: 'mlv' },
        { value: 'nve', title: 'nve' }
      ],
    },
  },
  sourceType: {
    name: 'Source Type',
    description: 'Source Type',
    defaultValue: 'html',
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
styleSheet.replaceSync(styles + fontInter + fontNvidiaSans + brand + brandDark + ddb + responsiveStyles);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];

const parentStyle = document.createElement('style');
parentStyle.innerText = styles + fontInter + fontNvidiaSans + brand + brandDark + ddb + responsiveStyles;
window.parent.document.head.appendChild(parentStyle);

export const decorators = [(story, { globals }) => {
  const themes = window.parent.document.querySelector('[nve-theme]')?.getAttribute('nve-theme') ?? globals.theme;
  window.document.querySelector('html').setAttribute('nve-theme', themes.trim());
  window.NVE_SB_GLOBALS = globals;
  return story();
}, playground];

function excludePrivateFields(manifest) {
  return {
    ...manifest,
    ...(manifest.modules && {
      modules: manifest.modules?.map((module) => ({
        ...module,
        ...(module.declarations && {
          declarations: module.declarations?.map((declaration) => ({
            ...declaration,
            ...(declaration.members && {
              members: declaration.members?.filter((members) => members.privacy !== 'private' && !members.static && members.name !== 'i18n' && members.name !== '_internals')
            })
          }))
        })
      }))
    })
  };
}
