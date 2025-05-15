import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/drawer/define.js';

export default {
  title: 'Elements/Drawer',
  component: 'nve-drawer',
  inline: false
};

export const Default = {
  render: () => html`
<nve-drawer id="drawer" closable modal>
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
<nve-button popovertarget="drawer">button</nve-button>
  `,
};

export const Visual = {
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

export const Events = {
  render: () => html`
<nve-drawer id="drawer" closable modal position="right">
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
<nve-button popovertarget="drawer">open</nve-button>
<script type="module">
  const drawer = document.querySelector('nve-drawer');
  drawer.addEventListener('open', () => console.log('open'));
  drawer.addEventListener('close', () => console.log('close'));
</script>
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
<div nve-layout="row align:center gap:md">
  <nve-button popovertarget="popover-top">open top</nve-button>
  <nve-button popovertarget="popover-left">open left</nve-button>
  <nve-button popovertarget="popover-right">open right</nve-button>
  <nve-button popovertarget="popover-bottom">open bottom</nve-button>
</div>

<nve-drawer id="popover-top" closable modal position="top">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Top</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body" style="height: 200px">some text content in a top closable drawer</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">some text footer content</p>
  </nve-drawer-footer>
</nve-drawer>

<nve-drawer id="popover-left" closable modal position="left">
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

<nve-drawer id="popover-right" closable modal position="right">
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

<nve-drawer id="popover-bottom" closable modal position="bottom">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Bottom</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body" style="height: 200px">some text content in a bottom closable drawer</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">some text footer content</p>
  </nve-drawer-footer>
</nve-drawer>
  `
};

export const LegacyPosition = {
  inline: false,
  render: () => html`
<div nve-layout="row align:center gap:md" style="height: 95vh">
  <nve-button class="drawer-btn-left">open left</nve-button>
  <nve-button class="drawer-btn-right">open right</nve-button>
  <nve-button class="drawer-btn-bottom">open bottom</nve-button>
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

<nve-drawer closable modal hidden position="bottom">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Bottom</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">some text content in a bottom closable drawer</p>
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

  const bottomDrawer = document.querySelector('nve-drawer[position="bottom"]');
  document.querySelector('.drawer-btn-bottom').addEventListener('click', () => {
    bottomDrawer.position = 'bottom';
    bottomDrawer.hidden = false;
  });

  leftDrawer.addEventListener('close', () => leftDrawer.hidden = true);
  rightDrawer.addEventListener('close', () => rightDrawer.hidden = true);
  bottomDrawer.addEventListener('close', () => bottomDrawer.hidden = true);
</script>
  `
};


export const Inline = {
  render: () => html`
<div nve-layout="row align:horizontal-stretch">
  <div nve-layout="column gap:md align:stretch">
    <nve-card style="height: 200px">
      <nve-card-content>
        <nve-button popovertarget="drawer">inline drawer</nve-button>
      </nve-card-content>
    </nve-card>
    <nve-card style="height: 200px"></nve-card>
  </div>

  <nve-drawer id="drawer" closable modal inline position="right">
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
  `
};

export const InlineVisible = {
  render: () => html`
<div nve-layout="row align:horizontal-stretch">
  <div nve-layout="column gap:md align:stretch">
    <nve-card style="height: 200px">
      <nve-card-content>
        open inline drawer
      </nve-card-content>
    </nve-card>
    <nve-card style="height: 200px"></nve-card>
  </div>

  <nve-drawer id="drawer" inline position="right">
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
  `
};

export const LegacyInline = {
  render: () => html`
<div nve-layout="row align:stretch">
  <div nve-layout="column gap:md align:horizontal-stretch">
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

export const LegacyBehaviorTrigger = {
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
