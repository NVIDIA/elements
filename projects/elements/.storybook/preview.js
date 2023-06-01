import  { setCustomElementsManifest } from '@storybook/web-components';
import { themes } from '@storybook/theming';
import { excludePrivateFields } from '@elements/elements/internal';
import customElements from '@elements/elements/custom-elements.json';
import styles from '@elements/elements/index.css';
import font from '@elements/elements/inter.css';
import branding from '../src/css/theme.branding.css';
import { MLV_VERSION } from '@elements/elements';
import '@elements/elements/polyfills';
import '@webcomponents/scoped-custom-element-registry';
import prettier from 'prettier/esm/standalone.mjs';
import parserHTML from 'prettier/esm/parser-html.mjs';

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
      const hasRoot = i => i.match(/nve-theme="root"/g)?.length > 1;
      const lines = src.trim().split('\n').filter(i => !hasRoot(i));
      const source = (hasRoot(src) ? lines.slice(0, -1).join('\n') : lines.join('\n')).replaceAll('nve-theme="root ', 'nve-theme="');
      return excludes ? source : prettier.format(source, { parser: 'html', plugins: [parserHTML], singleAttributePerLine: false, printWidth: 120 }).replaceAll('=""', '');
    }
  },
  controls: {
    expanded: false
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
          'Support',
          'Versioning',
          'Testing',
          'Extensions',
          'Metrics',
          'Contributions',
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
          'Alert',
          'Alert Banner',
          'Alert Group',
          'App Header',
          'Badge',
          'Breadcrumb',
          'Button',
          'Bulk Actions',
          'Card',
          'Checkbox',
          'Color',
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
        'Patterns',
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
      showName: true,
      items: experimental ? [...stableThemes, ...experimentalThemes] : stableThemes
    },
  },
  scale: {
    name: 'Scale',
    description: 'Scale',
    defaultValue: '',
    toolbar: {
      showName: true,
      items: [
        { value: '', title: 'Default' },
        { value: 'compact', title: 'Compact' }
      ],
    },
  },
  animation: {
    name: 'Animation',
    description: 'Animation',
    defaultValue: '',
    toolbar: {
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
    defaultValue: 'infra',
    toolbar: {
      showName: true,
      items: [
        { value: 'infra', title: 'Infra' },
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
  updateTheme(`${globals.theme ? globals.theme : ''} ${globals.scale ? globals.scale : ''} ${globals.animation ? globals.animation : ''}`);
  return story();
}, dataTheme];
