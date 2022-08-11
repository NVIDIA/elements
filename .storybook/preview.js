import { setCustomElementsManifest } from '@elements/custom-elements-storybook/preview';
import { themes } from '@storybook/theming';
import { excludePrivateFields } from '@elements/elements/internal';
import customElements from '@elements/elements/custom-elements.json';
import styles from '@elements/elements/index.css';

setCustomElementsManifest(excludePrivateFields(customElements));

import * as jest from 'jest-mock';
window.jest = jest;
// Fix: `@storybook/addon-interactions` exports is not defined or `jest-mock` does not provide an export named 'fn'
// https://github.com/storybookjs/storybook/issues/15391#issuecomment-873472669

export const parameters = {
  status: {
    statuses: {
      alpha: {
        background: 'yellow',
        color: 'black',
        description: 'This component is undergoing active development'
      },
      beta: {
        background: 'blue',
        color: 'white',
        description: 'This component is undergoing active development'
      },
      stable: {
        background: 'green',
        color: 'white',
        description: 'This component is stable and released'
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
          'Changelog'
        ],
        'Foundation',
        [
          'Tokens',
          'Themes',
          'Typography',
          'Layout',
          'Objects',
          'Interactions',
          'Status',
          'Testing',
          'Examples'
        ],
        'Elements'
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
      icon: 'paintbrush',
      showName: true,
      items: [
        { value: '', title: 'Light' },
        { value: 'dark', title: 'Dark' },
        { value: 'high-contrast', title: 'High Contrast' },
      ],
    },
  },
}

const styleSheet = document.createElement('style')
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
window.parent.document.head.appendChild(styleSheet);
updateTheme('dark');

function updateTheme(themes) {
  document.querySelector('html').setAttribute('mlv-theme', themes);
  window.parent.document.querySelector('html').setAttribute('mlv-theme', themes);
  window.localStorage.setItem('mlv-theme', themes);
}

export const decorators = [(story, { globals }) => {
  updateTheme(globals.theme ? globals.theme : '');
  return story();
}];
