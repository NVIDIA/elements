import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';
import React from 'react';

// provide min width defaults for navbar
const storybookLayout = JSON.parse(localStorage.getItem('storybook-layout'));
if (!storybookLayout) {
  localStorage.setItem('storybook-layout', JSON.stringify({...storybookLayout, resizerNav: { x: 300, y: 0 } }));
}

addons.setConfig({
  enableShortcuts: false, // prevents shortcuts from interfering with stories
  theme: themes.dark,
  sidebar: {
    renderLabel: ({ id, name }) => {
      const alpha = [];
      const alphaBadge = React.createElement('span', {  }, name, React.createElement('span', { style: { color: 'var(--mlv-sys-text-muted-color)'}}, ' (alpha)'));
      return alpha.includes(id) ? alphaBadge : name;
    }
  },
  toolbar: {
    eject: { hidden: true },
    copy: { hidden: true },
    grid: { hidden: true }
  }
});