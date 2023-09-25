import { setCustomElementsManifest } from '@storybook/web-components';
import { themes } from '@storybook/theming';
import { excludePrivateFields } from '@elements/elements/internal';
import styles from '@elements/elements/index.css?inline';
import font from '@elements/elements/inter.css?inline';
import branding from '../src/css/theme.branding.css?inline';
import { MLV_VERSION } from '@elements/elements';
import { playground } from './playground-url.js';
import '@elements/elements/polyfills';
import '@elements/elements/button/define.js';
// import '@webcomponents/scoped-custom-element-registry';

const prettier = await import('prettier/esm/standalone.mjs');
const parserHTML = await import('prettier/esm/parser-html.mjs');
const customElements = await import('@elements/elements/custom-elements.json');

setCustomElementsManifest(excludePrivateFields(customElements));

const params = new URLSearchParams(window.location.search);
const experimental = params.get('experimental') === 'true';

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
    theme: themes.dark,
    transformSource: (src, context) => {
      const excludes = context.id.includes('foundations-tokens-examples--');
      // remove nve-theme="root" from demo source snippets when not used for theming
      let source = src
        .trim()
        .replace(/<nve-button class="playground-btn">.*<\/nve-button>/g, '')
        .replaceAll(' nve-theme="root ', ' nve-theme="')
        .replaceAll(' nve-theme="root"', '');

      const lines = source.split('\n').filter(i => i.length ? i.trim().length : false);
      source = lines[0]?.trim() === '<div>' ? lines.slice(1, -1).join('\n') : source;
      return excludes ? source : prettier.default.format(source, { parser: 'html', plugins: [parserHTML.default], singleAttributePerLine: false, printWidth: 120 }).replaceAll('=""', '');
    }
  },
  badgesConfig: {
    alpha: {
      styles: {
        backgroundColor: 'var(--nve-sys-support-warning-muted-color)',
        borderColor: 'var(--nve-sys-support-warning-muted-color)',
        color: 'var(--nve-sys-support-warning-emphasis-color)',
      },
      title: `Pre-Release ${MLV_VERSION}`,
      tooltip: {
        title: 'Pre-Release 🚧',
        desc: 'This element or utility is in under pre-release as a work in progress. Breaking API and visual changes may occur during the engineering and UI design review process.',
      }
    },
    beta: {
      styles: {
        backgroundColor: 'var(--nve-sys-support-accent-muted-color)',
        borderColor: 'var(--nve-sys-support-accent-muted-color)',
        color: 'var(--nve-sys-support-accent-emphasis-color)',
      },
      title: `Beta ${MLV_VERSION}`,
      tooltip: {
        title: 'Beta 🛠️',
        desc: 'This element or utility is in beta and available for use. The APIs and visual design are stable but in may change as we seek additional feedback.',
      }
    },
    stable: {
      styles: {
        backgroundColor: 'var(--nve-sys-support-success-muted-color)',
        borderColor: 'var(--nve-sys-support-success-muted-color)',
        color: 'var(--nve-sys-support-success-emphasis-color)',
      },
      title: `Stable ${MLV_VERSION}`,
      tooltip: {
        title: 'Stable ✅',
        desc: 'This element or utility is Stable and ready for use.',
      }
    },
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
          'Versioning',
          'Testing',
          'Accessibility',
          'Extensions',
          'Contributions',
          'Requests',
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
          'Alert Banner',
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
          'Tooltip',
          'Week',
        ],
        'Section Patterns',
        [
          'Documentation',
          'Feedback',
          'Header',
          'Row',
          'Examples'
        ],
        'Page Patterns',
        [
          'Documentation',
          'Card',
          'Panel'
        ],
        'Internal'
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
  { value: 'branding', title: 'Branding' },
  { value: 'branding-dark', title: 'Branding Dark' }
];

export const globalTypes = {
  theme: {
    name: 'Themes',
    description: 'Themes',
    defaultValue: 'dark',
    toolbar: {
      title: 'Themes',
      showName: true,
      items: experimental ? [...stableThemes, ...experimentalThemes] : stableThemes
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
  }
}

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles + font + branding);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];

const parentStyle = document.createElement('style');
parentStyle.innerText = styles + font + branding;
window.parent.document.head.appendChild(parentStyle);

updateTheme('dark');

function updateTheme(themes) {
  const preview = window.parent.document.querySelector('#storybook-preview-wrapper');
  const manager = window.parent.document.querySelector('html');
  const story = document.querySelector('html');

  if (preview) {
    manager.setAttribute('nve-theme', themes);
    story.setAttribute('nve-theme', themes);
    Array.from(document.querySelectorAll('iframe')).forEach(i => i.contentWindow.document.querySelector('html').setAttribute('nve-theme', themes));
  } else {
    const nestedStories = Array.from(window.parent.document.querySelectorAll('iframe')).map(i => i.contentWindow.document.querySelector('html'));
    nestedStories.forEach(i => i.setAttribute('nve-theme', manager.getAttribute('nve-theme')));
  }
}

const dataTheme = (story, { globals }) => {
  localStorage.setItem('nve-data-theme', globals.dataTheme);
  const fn = (...args) => story(args);
  return fn();
};

export const decorators = [(story, { globals }) => {
  updateTheme(`${globals.theme ? globals.theme : ''} ${globals.scale ? globals.scale : ''} ${globals.debug ? globals.debug : ''} ${globals.animation ? globals.animation : ''}`);
  return story();
}, dataTheme, playground];
