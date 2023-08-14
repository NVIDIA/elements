import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Drawer } from '@elements/elements/drawer';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/drawer/define.js';

export default {
  title: 'Elements/Drawer/Examples',
  component: 'nve-drawer',
  inline: false,
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
      defaultValue: 'center'
    },
    alignment: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      defaultValue: 'center'
    }
  }
};

type ArgTypes = Drawer;

export const Default = {
  inline: false,
  render: (args: ArgTypes) => html`
    <nve-drawer ${spread(args)} closable>
      <nve-drawer-header>
        <h3 nve-text="heading semibold sm">Title</h3>
      </nve-drawer-header>
      <p nve-text="body">some text content in a closable drawer</p>
    </nve-drawer>
  `,
  args: { textContent: 'hello there' }
};

export const Interactive = {
  inline: false,
  render: () => html`
<nve-button id="drawer-btn">open</nve-button>
<nve-drawer closable modal hidden position="right">
  <h3 nve-text="heading">Title</h3>
  <p nve-text="body">some text content in a closable drawer</p>
</nve-drawer>
<script>
  const drawer = document.querySelector('nve-drawer');
  const btn = document.querySelector('#drawer-btn');
  btn.addEventListener('click', () => drawer.hidden = false);
  drawer.addEventListener('close', () => drawer.hidden = true);
</script>
  `
};

export const Small = {
  render: () => html`
<nve-drawer size="sm" closable>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Small</h3>
  </nve-drawer-header>
  <p nve-text="body">some text content in a small drawer</p>
</nve-drawer>
  `
};

export const Large = {
  render: () => html`
<nve-drawer size="lg" closable>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Large</h3>
  </nve-drawer-header>
  <p nve-text="body">some text content in a large drawer</p>
</nve-drawer>
  `
};

export const NonClosable = {
  render: () => html`
<nve-button id="open-btn">open</nve-button>
<nve-drawer hidden modal>
  <h3 nve-text="heading">Non-Closable Drawer</h3>
  <p nve-text="body">escape key and light dismiss will not work here</p>
  <nve-drawer-footer>
    <nve-button id="cancel-btn">cancel</nve-button>
  </nve-drawer-footer>
</nve-drawer>
<script>
  const drawer = document.querySelector('nve-drawer');
  const open = document.querySelector('#open-btn');
  const cancel = document.querySelector('#cancel-btn');
  open.addEventListener('click', () => drawer.hidden = false);
  cancel.addEventListener('click', () => drawer.hidden = true);
</script>
  `
};

export const Position = {
  inline: false,
  render: () => html`
<div nve-layout="row align:center gap:md" style="height: 98vh">
  <nve-button class="drawer-btn-left">open left</nve-button>
  <nve-button class="drawer-btn-right">open right</nve-button>
</div>

<nve-drawer closable modal hidden position="left">
  <nve-drawer-header>
    <h3 nve-text="heading">Left</h3>
  </nve-drawer-header>
  <p nve-text="body">some text content in a left closable drawer</p>
</nve-drawer>

<nve-drawer closable modal hidden position="right">
  <nve-drawer-header>
    <h3 nve-text="heading">Right</h3>
  </nve-drawer-header>
  <p nve-text="body">some text content in a right closable drawer</p>
</nve-drawer>
<script>
  const leftDrawer = document.querySelector('nve-drawer[position="left"]');
  document.querySelector('.drawer-btn-left').addEventListener('click', () => {
    leftDrawer.position = 'left';
    leftDrawer.hidden = false;
  });

  const rightDrawer = document.querySelector('nve-drawer[position="right"]');
  document.querySelector('.drawer-btn-right').addEventListener('click', () => {
    rightDrawer.position = 'right';
    rightDrawer.hidden = false;
  });

  leftDrawer.addEventListener('close', () => leftDrawer.hidden = true);
  rightDrawer.addEventListener('close', () => rightDrawer.hidden = true);
</script>
  `
};
