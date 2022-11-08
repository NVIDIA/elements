import  { setCustomElementsManifest } from '@storybook/web-components';
import { themes } from '@storybook/theming';
import { excludePrivateFields } from '@elements/elements/internal';
import customElements from '@elements/elements/custom-elements.json';
import styles from '@elements/elements/index.css';
import font from '@elements/elements/inter.css';
import '@elements/elements/polyfills/index.js';

setCustomElementsManifest(excludePrivateFields(customElements));

export const parameters = {
  docs: {
    theme: themes.dark,
  },
  badgesConfig: {
    alpha: {
      styles: {
        backgroundColor: 'var(--nve-sys-status-warning-background)',
        borderColor: 'var(--nve-sys-status-warning-background)',
        color: 'var(--nve-sys-status-warning-color)',
      },
      title: 'Alpha',
      tooltip: {
        title: 'Alpha 🚧',
        desc: 'This element or utility is in under alpha preview as a work in progress. Breaking API and visual changes may occur during the engineering and UI design review process.',
      }
    },
    beta: {
      styles: {
        backgroundColor: 'var(--nve-sys-status-default-background)',
        borderColor: 'var(--nve-sys-status-default-background)',
        color: 'var(--nve-sys-status-default-color)',
      },
      title: 'Beta',
      tooltip: {
        title: 'Beta 🛠️',
        desc: 'This element or utility is in beta and available for use. The APIs and visual design are stable but in may change as we seek additional feedback.',
      }
    },
    stable: {
      styles: {
        backgroundColor: 'var(--nve-sys-status-success-background)',
        borderColor: 'var(--nve-sys-status-success-background)',
        color: 'var(--nve-sys-status-success-color)',
      },
      title: 'Stable',
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
          'Angular',
          'Lit',
          'React',
          'Testing',
        ],
        'Foundations',
        [
          'Tokens',
          [
            'Documentation',
            'Size & Space',
            'Objects',
            'Interactions',
            'Status',
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
            'Horizontal Layout',
            'Vertical Layout',
            'Grid Layout',
            'Examples',
          ],
        ],

        'Elements',
        [
          'Alert',
          'Alert Group',
          'Button',
          'Card',
          'Datalist',
          'Icon',
          'Icon Button',
          'Forms',
          'Form Validation',
          'Form Actions',
          'Form Control',
          'Validation',
          'Input',
          'Input Group',
          'Checkbox',
          'Password',
          'Radio',
          'Range',
          'Search',
          'Select',
          'Switch',
          'Textarea',
          'Color',
          'Date',
          'Datetime',
          'File',
          'Month',
          'Time',
          'Week',
          'Dropdown',
          'Dialog',
          'Notification',
          'Panel',
          'Toast',
          'Tooltip',
          'Internal',
        ]
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
      showName: true,
      items: [
        { value: '', title: 'Light' },
        { value: 'dark', title: 'Dark' },
        { value: 'high-contrast', title: 'High Contrast' },
      ],
    },
  },
  scale: {
    name: 'Scale',
    description: 'Themes',
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
}

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles + font);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];

const parentStyle = document.createElement('style');
parentStyle.innerText = styles + font;
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

export const decorators = [(story, { globals }) => {
  updateTheme(`${globals.theme ? globals.theme : ''} ${globals.scale ? globals.scale : ''} ${globals.animation ? globals.animation : ''}`);
  return story();
}];
