import { setCustomElementsManifest } from '@storybook/web-components';
import { themes } from '@storybook/theming';
import { excludePrivateFields } from '@elements/elements/internal';
import customElements from '@elements/elements/custom-elements.json';
import '@elements/elements/css/fonts.css';
import '@elements/elements/css/variables.css';
import '@elements/elements/css/theme.css';

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
          'Changelog',
        ],
        'Elements'
      ]
    }
  }
};
