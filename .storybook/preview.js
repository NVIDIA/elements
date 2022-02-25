import { setCustomElementsManifest } from '@storybook/web-components';
import { excludePrivateFields } from '../src/util/storybook-utils';
import customElements from '../custom-elements.json';
import * as jest from '@storybook/jest';

setCustomElementsManifest(excludePrivateFields(customElements));

// Fix: fn() is not defined, see: https://github.com/storybookjs/storybook/issues/15391
window.jest = jest;

export const parameters = {
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
