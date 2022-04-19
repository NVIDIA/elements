import { setCustomElementsManifest } from '@storybook/web-components';
import { themes } from '@storybook/theming';
import { excludePrivateFields } from '../src/util/storybook-utils';
import customElements from '../custom-elements.json';

setCustomElementsManifest(excludePrivateFields(customElements));

import * as jest from "jest-mock";
window.jest = jest;
// Fix: `@storybook/addon-interactions` exports is not defined or `jest-mock` does not provide an export named 'fn'
// https://github.com/storybookjs/storybook/issues/15391#issuecomment-873472669

export const parameters = {
  status: {
    statuses: {
      alpha: {
        background: 'yellow',
        color: '#000000',
        description: 'This component is undergoing active development',
      },
      beta: {
        background: 'blue',
        color: '#000000',
        description: 'This component is undergoing active development',
      },
      stable: {
        background: 'green',
        color: '#000000',
        description: 'This component is stable and released',
      },
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
  }
};
