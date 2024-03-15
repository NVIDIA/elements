import React, { useRef, useEffect } from 'react';
import { addons, types, useGlobals } from '@storybook/manager-api';

import '@elements/elements/forms/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/switch/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/drawer/define.js';
import '@elements/elements/divider/define.js';
import '@elements/elements/tooltip/define.js';
import '@elements/elements/icon-button/define.js';

// updateTheme('dark');

function updateTheme(themes) {
  const preview = window.parent.document.querySelector('#storybook-preview-wrapper');
  const manager = window.parent.document.querySelector('html') as HTMLElement;
  const story = document.querySelector('html')  as HTMLElement;
  manager.setAttribute('nve-theme', themes);

  if (preview) {
    story.setAttribute('nve-theme', themes);
    Array.from(document.querySelectorAll('iframe')).forEach((i: HTMLIFrameElement) => i.contentWindow?.document?.querySelector('html')?.setAttribute('nve-theme', themes));
  } else {
    const nestedStories = Array.from(window.parent.document.querySelectorAll('iframe')).map(i => i.contentWindow?.document.querySelector('html'));
    nestedStories.forEach(i => i?.setAttribute('nve-theme', manager.getAttribute('nve-theme') as string));
  }
}

const ThemePicker = () => {
  const [globals, updateGlobals] = useGlobals();
  const themes = [globals.theme, globals.scale, globals.debug, globals.animation, globals.experimental, globals.systemOptions].filter(i => i !== '').join(' ');
  updateTheme(themes);

  return (
    globals.theme || globals.theme === '' ?
    (<div style={{ 'display': 'flex', 'justifyContent': 'end', 'width': '100%'}}>
      <nve-button selected container="flat" id="dropdown-btn">System Options</nve-button>
      <nve-drawer id="system-options-drawer" position="right" size="sm" anchor="dropdown-btn" trigger="dropdown-btn" behavior-trigger closable hidden nve-layout="column gap:md align:horizontal-stretch" style={{'--top': '47px', '--box-shadow': '0'}}>
        <nve-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <nve-select style={{'--background': 'transparent', '--min-width': '180px'}}>
            <label>Theme</label>
            <select size={5} defaultValue={globals.theme} onChange={e => updateGlobals({ theme: e.target.value })}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="high-contrast">High Contrast</option>
              <option value="brand">Brand Light (experimental)</option>
              <option value="brand dark">Brand Dark (experimental)</option>
            </select>
          </nve-select>
        </nve-drawer-content>
        <nve-divider style={{'width': '100%'}}></nve-divider>
        <nve-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <nve-tooltip behavior-trigger anchor="data-hint-btn" trigger="data-hint-btn" hidden>Demo data to be displayed in examples (see datagrid)</nve-tooltip>
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
