import React from 'react';
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
  const themes = [globals.theme, globals.scale, globals.debug, globals.animation, globals.experimental, globals.systemOptions].filter(i => i !== '').join(' ').trim();
  updateTheme(themes);

  return (
    globals.theme || globals.theme === '' ?
    (<div style={{ 'display': 'flex', 'width': '100%'}}>
      <nve-button container="flat"><a target="_blank" href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html">Playground</a></nve-button>
      <nve-button container="flat"><a target="_blank" href="https://NVIDIA.github.io/elements/demos/">Demos</a></nve-button>
      <nve-button container="flat"><a target="_blank" href="https://github.com/NVIDIA/elements">Gitlab</a></nve-button>
      <nve-button container="flat" id="dropdown-btn" style={{ marginLeft: 'auto' }}>System Options</nve-button>
      <nve-drawer id="system-options-drawer" position="right" size="sm" anchor="dropdown-btn" trigger="dropdown-btn" behavior-trigger closable hidden nve-layout="column gap:md align:horizontal-stretch" style={{'--top': '47px', '--box-shadow': '0'}}>
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
        <nve-divider style={{'width': '100%'}}></nve-divider>
        <nve-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <nve-switch-group>
            <label>API <nve-icon-button slot="label" id="api-hint-btn" container="flat" icon-name="information-circle-stroke" size="sm" style={{'--height': '12px'}}></nve-icon-button></label>
            {/* <nve-switch>
              <label>Maglev Scope</label>
              <input type="checkbox" value="scope" defaultChecked={globals.scope === 'mlv'} onChange={e => updateGlobals({ scope: e.target.checked ? 'mlv' : 'nve' })} />
            </nve-switch> */}
            <nve-switch>
              <label>React</label>
              <input type="checkbox" value="sourceType" defaultChecked={globals.sourceType === 'react'} onChange={e => updateGlobals({ sourceType: e.target.checked ? 'react' : 'html' })} />
            </nve-switch>
          </nve-switch-group>
          <nve-tooltip behavior-trigger anchor="api-hint-btn" trigger="api-hint-btn" hidden style={{'--width': '280px'}}>
            <p nve-text="body sm">Preview code blocks with <code>@nvidia-elements/react</code> components or the <code>nve</code> namespace.</p>
          </nve-tooltip>
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
