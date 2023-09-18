import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import '@elements/elements/breadcrumb/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/menu/define.js';

export default {
  title: 'Elements/Breadcrumb/Examples',
  component: 'mlv-breadcrumb',
};

/* eslint-disable */
export const Default = {
  render: () => html`
    <div style="display: flex; align-items: center; justify-content: center; height: 37px">
      <mlv-breadcrumb>
        <mlv-button><a href="javascript: void(0)">Item 1</a></mlv-button>
        <mlv-button><a href="javascript: void(0)">Item 2</a></mlv-button>
        <mlv-button><a href="javascript: void(0)">Item 3</a></mlv-button>
        <span>You Are Here</span>
      </mlv-breadcrumb>
    </div>
  `
};

export const WithIconButton = {
  render: () => html`
    <div style="display: flex; align-items: center; justify-content: center; height: 37px">
      <mlv-breadcrumb>
        <mlv-icon-button icon-name="home" size="sm"><a href="javascript: void(0)" aria-label="link to first page"></a></mlv-icon-button>
        <mlv-button><a href="javascript: void(0)">Item 1</a></mlv-button>
        <mlv-button><a href="javascript: void(0)">Item 2</a></mlv-button>
        <span>You Are Here</span>
      </mlv-breadcrumb>
    </div>
  `
};

@customElement('breadcrumb-menu-demo')
class BreadcrumbMenuDemo extends LitElement {
  @state() private menuHidden = true;

  render() {
    const ddownId = "more-links";
    return html`
<mlv-breadcrumb>
  <mlv-icon-button id=${ddownId + '-btn'} @click=${() => this.menuHidden = false} icon-name="more-actions"></mlv-icon-button>
  <mlv-button><a href="javascript: void(0)">Item 4</a></mlv-button>
  <mlv-button><a href="javascript: void(0)">Item 5</a></mlv-button>
  <span>You Are Here</span>
</mlv-breadcrumb>
<mlv-dropdown id=${ddownId}
  anchor=${ddownId + '-btn'}
  .hidden=${this.menuHidden}
  @close=${() => this.menuHidden = true}
  arrow>
  <mlv-menu>
    <mlv-menu-item>Item 1</mlv-menu-item>
    <mlv-menu-item>Item 2</mlv-menu-item>
    <mlv-menu-item>Item 3</mlv-menu-item>
  </mlv-menu>
</mlv-dropdown>
`
  }
}

export const WithMenu = {
  render: () => html`
    <breadcrumb-menu-demo></breadcrumb-menu-demo>
  `
};

export const LightTheme = {
  render: () => html`
    <mlv-card mlv-theme="light" style="--border-radius: 4px">
      <mlv-breadcrumb>
        <mlv-icon-button icon-name="home" size="sm"><a href="javascript: void(0)" aria-label="link to first page"></a></mlv-icon-button>
        <mlv-button><a href="javascript: void(0)">Item 1</a></mlv-button>
        <mlv-button><a href="javascript: void(0)">Item 2</a></mlv-button>
        <span>You Are Here</span>
      </mlv-breadcrumb>
    </mlv-card>
  `
}

export const DarkTheme = {
  render: () => html`
    <mlv-card mlv-theme="dark" style="--border-radius: 4px">
      <mlv-breadcrumb>
        <mlv-icon-button icon-name="home" size="sm"><a href="javascript: void(0)" aria-label="link to first page"></a></mlv-icon-button>
        <mlv-button><a href="javascript: void(0)">Item 1</a></mlv-button>
        <mlv-button><a href="javascript: void(0)">Item 2</a></mlv-button>
        <span>You Are Here</span>
      </mlv-breadcrumb>
    </mlv-card>
  `
}
/* eslint-enable */
