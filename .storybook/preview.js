import { setCustomElementsManifest } from '@storybook/web-components';
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
      dev: {
        background: 'yellow',
        color: '#000000',
        description: 'This component is undergoing active development',
      },
      released: {
        background: 'pink',
        color: '#000000',
        description: 'This component is stable and released',
      },
    },
  },
  darkMode: {
    stylePreview: true
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
};
