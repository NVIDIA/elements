import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';
import React from 'react';

addons.setConfig({
  theme: themes.dark,
  sidebar: {
    renderLabel: ({ id, name }) => {
      const alpha = ['elements-popovers', 'elements-toast', 'elements-tooltip', 'elements-dropdown', 'elements-dialog', 'elements-notification', 'forms-color', 'forms-date', 'forms-datetime', 'forms-file', 'forms-month', 'forms-time', 'forms-week'];
      const alphaBadge = React.createElement('span', {  }, name, React.createElement('span', { style: { color: 'var(--mlv-sys-text-muted-color)'}}, ' (alpha)'));
      return alpha.includes(id) ? alphaBadge : name;
    }
  }
});