import { html } from 'lit';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/drawer/define.js';

export default {
  title: 'Elements/Drawer/Examples',
  component: 'nve-drawer',
  inline: false
};

export const Default = {
  render: () => html`
<nve-drawer closable>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
  `,
};

export const Scroll = {
  render: () => html`
<nve-drawer closable>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body" style="height: 2500px">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
  `,
};

export const Interactive = {
  render: () => html`
<nve-button id="drawer-btn">open</nve-button>
<nve-drawer closable modal hidden position="right">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
<script type="module">
  const drawer = document.querySelector('nve-drawer');
  const btn = document.querySelector('#drawer-btn');
  btn.addEventListener('click', () => drawer.hidden = false);
  drawer.addEventListener('close', () => drawer.hidden = true);
</script>
  `
};

export const BehaviorTrigger = {
  render: () => html`
<nve-button id="drawer-btn">open</nve-button>
<nve-drawer behavior-trigger trigger="drawer-btn" closable modal hidden position="right">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
  `
};

export const Small = {
  render: () => html`
<nve-drawer size="sm" closable>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
  `
};

export const Large = {
  render: () => html`
<nve-drawer size="lg" closable>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
  `
};

export const NonClosable = {
  render: () => html`
<nve-button id="open-btn">open</nve-button>
<nve-drawer hidden modal>
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
<script type="module">
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
    <h3 nve-text="heading">Drawer Header Left</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>

<nve-drawer closable modal hidden position="right">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Right</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">some text content in a right closable drawer</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">some text footer content</p>
  </nve-drawer-footer>
</nve-drawer>
<script type="module">
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


export const Inline = {
  render: () => html`
<div nve-layout="row align:stretch">
  <div nve-layout="column gap:md align:stretch">
    <nve-card style="height: 200px">
      <nve-card-content>
        <nve-button>open inline drawer</nve-button>
      </nve-card-content>
    </nve-card>
    <nve-card style="height: 200px"></nve-card>
  </div>

  <nve-drawer hidden closable modal inline position="right">
    <nve-drawer-header>
      <h3 nve-text="heading semibold sm">Drawer Header</h3>
    </nve-drawer-header>
    <nve-drawer-content>
      <p nve-text="body">drawer content</p>
    </nve-drawer-content>
    <nve-drawer-footer>
      <p nve-text="body">drawer footer</p>
    </nve-drawer-footer>
  </nve-drawer>
</div>
<script type="module">
  const drawer = document.querySelector('nve-drawer');
  const open = document.querySelector('nve-button');
  open.addEventListener('click', () => drawer.hidden = false);
  drawer.addEventListener('close', () => drawer.hidden = true);
</script>
  `
};
