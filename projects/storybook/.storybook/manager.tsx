import React from 'react';
import { addons, types, useGlobals } from '@storybook/manager-api';

import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nve-internals/elements-api/system-settings/define.js';

function updateTheme(themes) {
  const previewIframe = document.querySelector('#storybook-preview-iframe') as any;
  const manager = document.querySelector('html') as HTMLElement;
  manager.setAttribute('nve-theme', themes);
  manager.setAttribute('nve-transition', 'auto');

  if (previewIframe) {
    previewIframe.contentDocument.querySelector('html')?.setAttribute('nve-theme', themes);
  }
}

const PageHeader = () => {
  const [globals] = useGlobals();
  const themes = [globals.theme, globals.font, globals.scale, globals.debug, globals.animation, globals.experimental, globals.systemOptions].filter(i => i !== '').join(' ').trim();
  updateTheme(themes);

  return (
    globals.theme || globals.theme === '' ?
    <>
      <nve-page-header style={{ position: 'fixed', inset: '0 0 auto 0', zIndex: 999 }}>
        <nve-logo slot="prefix" size="sm"></nve-logo>
        <a slot="prefix" href="../">Elements</a>
        <nve-button container="flat"><a href="./?path=/docs/about-installation--docs">Get Started</a></nve-button>
        <nve-button container="flat"><a href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html" target="_blank">Playground</a></nve-button>
        <nve-button container="flat"><a href="../starters/">Starters</a></nve-button>
        <nve-button container="flat"><a href="https://github.com/NVIDIA/elements" target="_blank">Gitlab</a></nve-button>
        <nve-button slot="suffix" popovertarget="system-options-drawer" container="flat" id="dropdown-btn">System Themes</nve-button>
      </nve-page-header>
      <nve-drawer id="system-options-drawer" position="right" size="sm" closable style={{'--top': '47px', '--box-shadow': '0'}}>
        <nve-drawer-content style={{'height': 'initial', 'flex': 'initial'}}>
          <nve-api-system-settings></nve-api-system-settings>
        </nve-drawer-content>
      </nve-drawer>
    </> : ''
  );
}

addons.register('my-addon', () => {
  addons.add('my-addon/toolbar', {
    title: 'Theme Sync',
    type: types.TOOL,
    render: () => <PageHeader />,
  });
});

addons.setConfig({
  navSize: 300,
  showToolbar: false,
  enableShortcuts: false,
  sidebar: {
    showRoots: true,
    collapsedRoots: ['about', 'integrations', 'foundations', 'elements', 'patterns', 'testing', 'labs', 'api-design', 'internal', 'deprecated'],
  },
});

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['nve-button']: any;
      ['nve-divider']: any;
      ['nve-drawer']: any;
      ['nve-drawer-content']: any;
      ['nve-drawer-header']: any;
      ['nve-icon-button']: any;
      ['nve-logo']: any;
      ['nve-page-header']: any;
      ['nve-select']: any;
      ['nve-switch']: any;
      ['nve-switch-group']: any;
      ['nve-theme']: any;
      ['nve-tooltip']: any;
      ['nve-api-system-settings']: any;
    }
  }
}
