import React from 'react';
import { addons, types, useGlobals } from '@storybook/manager-api';

import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/icon-button/define.js';

function updateTheme(themes) {
  const previewIframe = document.querySelector('#storybook-preview-iframe');
  const manager = document.querySelector('html') as HTMLElement;
  manager.setAttribute('nve-theme', themes);

  if (previewIframe) {
    previewIframe.contentDocument.querySelector('html')?.setAttribute('nve-theme', themes);
  }
}

const ThemePicker = () => {
  const [globals, updateGlobals] = useGlobals();
  const themes = [globals.theme, globals.font, globals.scale, globals.debug, globals.animation, globals.experimental, globals.systemOptions].filter(i => i !== '').join(' ').trim();
  updateTheme(themes);

  return (
    globals.theme || globals.theme === '' ?
    (<div style={{ 'display': 'flex', 'width': '100%'}}>
      <nve-button container="flat"><a target="_blank" href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html">Playground</a></nve-button>
      <nve-button container="flat"><a target="_blank" href="https://NVIDIA.github.io/elements/starters/">Starters</a></nve-button>
      <nve-button container="flat"><a target="_blank" href="https://github.com/NVIDIA/elements">Gitlab</a></nve-button>
      <nve-button popovertarget="system-options-drawer" container="flat" id="dropdown-btn" style={{ marginLeft: 'auto' }}>System Options</nve-button>
      <nve-drawer id="system-options-drawer" position="right" size="sm" closable style={{'--top': '47px', '--box-shadow': '0'}}>
        <nve-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <nve-select style={{'--background': 'transparent', '--min-width': '180px'}}>
            <label>Theme</label>
            <select size={6} defaultValue={globals.theme} onChange={e => updateGlobals({ theme: e.target.value })}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="high-contrast">High Contrast</option>
              <option value="ddb-dark">DDB Dark (experimental)</option>
              <option value="brand">Brand (experimental)</option>
              <option value="brand-dark">Brand Dark (experimental)</option>
            </select>
          </nve-select>
        </nve-drawer-content>
        <nve-divider style={{'width': '100%'}}></nve-divider>
        <nve-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <nve-select style={{'--background': 'transparent', '--min-width': '170px'}}>
            <label>Data</label>
            <nve-icon-button slot="label" id="data-hint-btn" size="sm" container="flat" icon-name="information-circle-stroke" style={{'--height': '12px'}}></nve-icon-button>
            <select size={3} defaultValue={globals.dataTheme} onChange={e => updateGlobals({ dataTheme: e.target.value })}>
              <option value="models">AI/ML</option>
              <option value="">Infra</option>
              <option value="hardware">Hardware</option>
            </select>
          </nve-select>
        </nve-drawer-content>
        <nve-divider style={{'width': '100%'}}></nve-divider>
        <nve-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <nve-select style={{'--background': 'transparent', '--min-width': '180px'}}>
            <label>Font</label>
            <select size={3} defaultValue={globals.font} onChange={e => updateGlobals({ font: e.target.value })}>
              <option value="">Default</option>
              <option value="inter">Inter</option>
              <option value="nvidia-sans">NVIDIA Sans</option>
            </select>
          </nve-select>
        </nve-drawer-content>
        <nve-divider style={{'width': '100%'}}></nve-divider>
        <nve-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <nve-switch-group>
            <label>Options</label>
            <nve-switch>
              <label>Compact</label>
              <input type="checkbox" value="compact" defaultChecked={globals.scale === 'compact'} onChange={e => updateGlobals({ scale: e.target.checked ? 'compact' : ''})} />
            </nve-switch>
            <nve-switch>
              <label>Reduced Motion</label>
              <input type="checkbox" value="reduced-motion" defaultChecked={globals.animation === 'reduced-motion'} onChange={e => updateGlobals({ animation: e.target.checked ? 'reduced-motion' : '' })} />
            </nve-switch>
            <nve-switch>
              <label>Debug</label>
              <input type="checkbox" value="debug" defaultChecked={globals.debug === 'debug'} onChange={e => updateGlobals({ debug: e.target.checked ? 'debug' : '' })} />
            </nve-switch>
          </nve-switch-group>
        </nve-drawer-content>
      </nve-drawer>
      <nve-tooltip behavior-trigger anchor="data-hint-btn" trigger="data-hint-btn" hidden>Demo data to be displayed in examples (see datagrid)</nve-tooltip>
    </div>) : ''
  );
}

addons.register('my-addon', () => {
  addons.add('my-addon/toolbar', {
    title: 'Theme Sync',
    type: types.TOOL,
    render: () => <ThemePicker />,
  });
});
  
addons.setConfig({
  sidebar: {
    showRoots: true,
    collapsedRoots: ['about', 'integrations', 'foundations', 'elements', 'patterns', 'testing', 'labs', 'api-design', 'internal', 'deprecated'],
  },
});

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['nve-button']: any;
      ['nve-icon-button']: any;
      ['nve-tooltip']: any;
      ['nve-divider']: any;
      ['nve-select']: any;
      ['nve-switch']: any;
      ['nve-switch-group']: any;
      ['nve-drawer']: any;
      ['nve-drawer-header']: any;
      ['nve-drawer-content']: any;
      ['nvx-theme']: any;
    }
  }
}
