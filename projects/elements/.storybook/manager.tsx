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
      <mlv-button container="flat"><a target="_blank" href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html">Playground</a></mlv-button>
      <mlv-button container="flat"><a target="_blank" href="https://NVIDIA.github.io/elements/demos/">Demos</a></mlv-button>
      <mlv-button container="flat"><a target="_blank" href="https://github.com/NVIDIA/elements">Gitlab</a></mlv-button>
      <mlv-button container="flat" id="dropdown-btn" style={{ marginLeft: 'auto' }}>System Options</mlv-button>
      <mlv-drawer id="system-options-drawer" position="right" size="sm" anchor="dropdown-btn" trigger="dropdown-btn" behavior-trigger closable hidden mlv-layout="column gap:md align:horizontal-stretch" style={{'--top': '47px', '--box-shadow': '0'}}>
        <mlv-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <mlv-select style={{'--background': 'transparent', '--min-width': '180px'}}>
            <label>Theme</label>
            <select size={6} defaultValue={globals.theme} onChange={e => updateGlobals({ theme: e.target.value })}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="high-contrast">High Contrast</option>
              <option value="ddb-dark">DDB Dark (experimental)</option>
              <option value="brand">Brand (experimental)</option>
              <option value="brand-dark">Brand Dark (experimental)</option>
            </select>
          </mlv-select>
        </mlv-drawer-content>
        <mlv-divider style={{'width': '100%'}}></mlv-divider>
        <mlv-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <mlv-tooltip behavior-trigger anchor="data-hint-btn" trigger="data-hint-btn" hidden>Demo data to be displayed in examples (see datagrid)</mlv-tooltip>
          <mlv-select style={{'--background': 'transparent', '--min-width': '170px'}}>
            <label>Data</label>
            <mlv-icon-button slot="label" id="data-hint-btn" size="sm" container="flat" icon-name="information-circle-stroke" style={{'--height': '12px'}}></mlv-icon-button>
            <select size={3} defaultValue={globals.dataTheme} onChange={e => updateGlobals({ dataTheme: e.target.value })}>
              <option value="models">AI/ML</option>
              <option value="">Infra</option>
              <option value="hardware">Hardware</option>
            </select>
          </mlv-select>
        </mlv-drawer-content>
        <mlv-divider style={{'width': '100%'}}></mlv-divider>
        <mlv-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <mlv-switch-group>
            <label>Options</label>
            <mlv-switch>
              <label>Compact</label>
              <input type="checkbox" value="compact" defaultChecked={globals.scale === 'compact'} onChange={e => updateGlobals({ scale: e.target.checked ? 'compact' : ''})} />
            </mlv-switch>
            <mlv-switch>
              <label>Reduced Motion</label>
              <input type="checkbox" value="reduced-motion" defaultChecked={globals.animation === 'reduced-motion'} onChange={e => updateGlobals({ animation: e.target.checked ? 'reduced-motion' : '' })} />
            </mlv-switch>
            <mlv-switch>
              <label>Debug</label>
              <input type="checkbox" value="debug" defaultChecked={globals.debug === 'debug'} onChange={e => updateGlobals({ debug: e.target.checked ? 'debug' : '' })} />
            </mlv-switch>
          </mlv-switch-group>
        </mlv-drawer-content>
        <mlv-divider style={{'width': '100%'}}></mlv-divider>
        <mlv-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <mlv-switch-group>
            <label>API <mlv-icon-button slot="label" id="api-hint-btn" container="flat" icon-name="information-circle-stroke" size="sm" style={{'--height': '12px'}}></mlv-icon-button></label>
            {/* <mlv-switch>
              <label>Maglev Scope</label>
              <input type="checkbox" value="scope" defaultChecked={globals.scope === 'mlv'} onChange={e => updateGlobals({ scope: e.target.checked ? 'mlv' : 'nve' })} />
            </mlv-switch> */}
            <mlv-switch>
              <label>React</label>
              <input type="checkbox" value="sourceType" defaultChecked={globals.sourceType === 'react'} onChange={e => updateGlobals({ sourceType: e.target.checked ? 'react' : 'html' })} />
            </mlv-switch>
          </mlv-switch-group>
          <mlv-tooltip behavior-trigger anchor="api-hint-btn" trigger="api-hint-btn" hidden style={{'--width': '280px'}}>
            <p mlv-text="body sm">Preview code blocks with <code>@nvidia-elements/react</code> components or the <code>nve</code> namespace.</p>
          </mlv-tooltip>
        </mlv-drawer-content>
      </mlv-drawer>
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
      ['mlv-button']: any;
      ['mlv-icon-button']: any;
      ['mlv-tooltip']: any;
      ['mlv-divider']: any;
      ['mlv-select']: any;
      ['mlv-switch']: any;
      ['mlv-switch-group']: any;
      ['mlv-drawer']: any;
      ['mlv-drawer-header']: any;
      ['mlv-drawer-content']: any;
      ['nvx-theme']: any;
    }
  }
}
