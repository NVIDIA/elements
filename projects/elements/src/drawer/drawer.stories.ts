import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Drawer } from '@elements/elements/drawer';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/drawer/define.js';

export default {
  title: 'Elements/Drawer/Examples',
  component: 'mlv-drawer',
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
    <mlv-drawer ${spread(args)} closable>
      <mlv-drawer-header>
        <h3 mlv-text="heading semibold sm">Title</h3>
      </mlv-drawer-header>
      <p mlv-text="body">some text content in a closable drawer</p>
      <mlv-drawer-footer>
        <div mlv-layout="grid gap:sm span-items:6">
          <mlv-button>cancel</mlv-button>
          <mlv-button>details</mlv-button>
        </div>
      </mlv-drawer-footer>
    </mlv-drawer>
  `,
};

export const Interactive = {
  inline: false,
  render: () => html`
<mlv-button id="drawer-btn">open</mlv-button>
<mlv-drawer closable modal hidden position="right">
  <mlv-drawer-header>
    <h3 mlv-text="heading">Heading</h3>
  </mlv-drawer-header>
  <p mlv-text="body">some text content in a closable drawer</p>
  <mlv-drawer-footer>
    <p mlv-text="body">some text footer content</p>
  </mlv-drawer-footer>
</mlv-drawer>
<script type="module">
  const drawer = document.querySelector('mlv-drawer');
  const btn = document.querySelector('#drawer-btn');
  btn.addEventListener('click', () => drawer.hidden = false);
  drawer.addEventListener('close', () => drawer.hidden = true);
</script>
  `
};

export const Small = {
  render: () => html`
<mlv-drawer size="sm" closable>
  <mlv-drawer-header>
    <h3 mlv-text="heading semibold sm">Small</h3>
  </mlv-drawer-header>
  <p mlv-text="body">some text content in a small drawer</p>
  <mlv-drawer-footer>
    <p mlv-text="body">some text footer content</p>
  </mlv-drawer-footer>
</mlv-drawer>
  `
};

export const Large = {
  render: () => html`
<mlv-drawer size="lg" closable>
  <mlv-drawer-header>
    <h3 mlv-text="heading semibold sm">Large</h3>
  </mlv-drawer-header>
  <p mlv-text="body">some text content in a large drawer</p>
  <mlv-drawer-footer>
    <p mlv-text="body">some text footer content</p>
  </mlv-drawer-footer>
</mlv-drawer>
  `
};

export const NonClosable = {
  render: () => html`
<mlv-button id="open-btn">open</mlv-button>
<mlv-drawer hidden modal>
  <h3 mlv-text="heading">Non-Closable Drawer</h3>
  <p mlv-text="body">escape key and light dismiss will not work here</p>
  <mlv-drawer-footer>
    <p mlv-text="body">some text footer content</p>
  </mlv-drawer-footer>
</mlv-drawer>
<script type="module">
  const drawer = document.querySelector('mlv-drawer');
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
<div mlv-layout="row align:center gap:md" style="height: 98vh">
  <mlv-button class="drawer-btn-left">open left</mlv-button>
  <mlv-button class="drawer-btn-right">open right</mlv-button>
</div>

<mlv-drawer closable modal hidden position="left">
  <mlv-drawer-header>
    <h3 mlv-text="heading">Left</h3>
  </mlv-drawer-header>
  <p mlv-text="body">some text content in a left closable drawer</p>
  <mlv-drawer-footer>
    <p mlv-text="body">some text footer content</p>
  </mlv-drawer-footer>
</mlv-drawer>

<mlv-drawer closable modal hidden position="right">
  <mlv-drawer-header>
    <h3 mlv-text="heading">Right</h3>
  </mlv-drawer-header>
  <p mlv-text="body">some text content in a right closable drawer</p>
  <mlv-drawer-footer>
    <p mlv-text="body">some text footer content</p>
  </mlv-drawer-footer>
</mlv-drawer>
<script type="module">
  const leftDrawer = document.querySelector('mlv-drawer[position="left"]');
  document.querySelector('.drawer-btn-left').addEventListener('click', () => {
    leftDrawer.position = 'left';
    leftDrawer.hidden = false;
  });

  const rightDrawer = document.querySelector('mlv-drawer[position="right"]');
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
<div mlv-layout="row align:stretch">
  <div mlv-layout="column gap:md align:stretch">
    <mlv-card style="height: 200px">
      <mlv-card-content>
        <mlv-button>open inline drawer</mlv-button>
      </mlv-card-content>
    </mlv-card>
    <mlv-card style="height: 200px"></mlv-card>
  </div>

  <mlv-drawer hidden closable modal inline position="right">
    <mlv-drawer-header>
      <h3 mlv-text="heading semibold sm">Small</h3>
    </mlv-drawer-header>
    <p mlv-text="body">some text content in a small drawer</p>
    <mlv-drawer-footer>
      <p mlv-text="body">some text footer content</p>
    </mlv-drawer-footer>
  </mlv-drawer>
</div>
<script type="module">
  const drawer = document.querySelector('mlv-drawer');
  const open = document.querySelector('mlv-button');
  open.addEventListener('click', () => drawer.hidden = false);
  drawer.addEventListener('close', () => drawer.hidden = true);
</script>
  `
};
