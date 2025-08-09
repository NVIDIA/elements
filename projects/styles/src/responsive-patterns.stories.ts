import { html } from 'lit';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Patterns/Responsive',
  component: 'nve-internal-patterns'
};

export const ResponsiveTabs = {
  render: () => html`
    <style>
      .responsive-tabs {
        overflow: hidden;
        resize: horizontal;
        border: 1px solid #ccc;
        max-width: 600px;
        min-width: 240px;
      }
    </style>

    <div class="responsive-tabs" nve-layout="pad:md">
      <nve-tabs behavior-select>
        <nve-tabs-item selected>Tab 1</nve-tabs-item>
        <nve-tabs-item>Tab 2</nve-tabs-item>
        <nve-tabs-item>Tab 3</nve-tabs-item>
        <nve-tabs-item nve-display="hide &sm|show">Tab 4</nve-tabs-item>
        <nve-tabs-item nve-display="hide &sm|show">Tab 5</nve-tabs-item>
        <nve-tabs-item nve-display="hide &sm|show">Tab 6</nve-tabs-item>
        <nve-tabs-item popovertarget="more-tabs" nve-display="&sm|hide">
          <nve-icon name="more-actions"></nve-icon>
        </nve-tabs-item>
      </nve-tabs>

      <nve-dropdown id="more-tabs">
        <nve-menu>
          <nve-menu-item>Tab 4</nve-menu-item>
          <nve-menu-item>Tab 5</nve-menu-item>
          <nve-menu-item>Tab 6</nve-menu-item>
        </nve-menu>
      </nve-dropdown>
    </div>

    <p>Resize the container to see tabs hide and the "more" menu appear on smaller container sizes.</p>
  `
};

export const ResponsiveToolbar = {
  render: () => html`
    <style>
      .responsive-toolbar {
        overflow: hidden;
        resize: horizontal;
        border: 1px solid #ccc;
        max-width: 700px;
        min-width: 260px;
      }
    </style>

    <div class="responsive-toolbar" nve-layout="pad:md">
      <nve-toolbar>
        <nve-search>
          <input type="search" placeholder="Search..." />
        </nve-search>
        
        <nve-button container="flat" slot="suffix">
          <nve-icon name="filter"></nve-icon> Filter
        </nve-button>

        <nve-button container="flat" slot="suffix" nve-display="hide &md|show">
          <nve-icon name="sort-ascending"></nve-icon> Sort
        </nve-button>

        <nve-button container="flat" slot="suffix" nve-display="hide &md|show">
          <nve-icon name="download"></nve-icon> Export
        </nve-button>

        <nve-icon-button container="flat" slot="suffix" icon-name="gear" aria-label="Settings" nve-display="hide &md|show"></nve-icon-button>

        <nve-icon-button container="flat" slot="suffix" icon-name="more-actions" aria-label="More actions" popovertarget="toolbar-more-actions" nve-display="&md|hide"></nve-icon-button>
      </nve-toolbar>

      <nve-dropdown id="toolbar-more-actions">
        <nve-menu>
          <nve-menu-item>
            <nve-icon name="sort-ascending"></nve-icon> Sort
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="download"></nve-icon> Export
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="gear"></nve-icon> Settings
          </nve-menu-item>
        </nve-menu>
      </nve-dropdown>
    </div>

    <p>Resize the container to see toolbar actions collapse into the "more actions" menu on smaller container sizes.</p>
  `
};

export const ResponsiveNavigation = {
  render: () => html`
    <style>
      .demo-section {
        overflow: hidden;
        resize: both;
        border: 1px solid #ccc;
        width: 100%;
        max-width: 800px;
        padding: 12px;
        margin-bottom: 24px;
      }
      
      .nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
    </style>

    <div class="demo-section">
      <div class="nav-header">
        <h3>My Application</h3>
        <nve-icon-button 
          icon-name="bars-3" 
          aria-label="Menu" 
          popovertarget="mobile-menu"
          nve-display="@lg|hide"
        ></nve-icon-button>
      </div>

      <nav nve-display="hide @lg|show">
        <nve-tabs>
          <nve-tabs-item selected>Dashboard</nve-tabs-item>
          <nve-tabs-item>Products</nve-tabs-item>
          <nve-tabs-item>Customers</nve-tabs-item>
          <nve-tabs-item>Reports</nve-tabs-item>
          <nve-tabs-item>Settings</nve-tabs-item>
        </nve-tabs>
      </nav>

      <nve-dropdown id="mobile-menu">
        <nve-menu>
          <nve-menu-item selected>Dashboard</nve-menu-item>
          <nve-menu-item>Products</nve-menu-item>
          <nve-menu-item>Customers</nve-menu-item>
          <nve-menu-item>Reports</nve-menu-item>
          <nve-menu-item>Settings</nve-menu-item>
        </nve-menu>
      </nve-dropdown>
    </div>

    <p>Resize the container to see navigation switch between tabs (desktop) and hamburger menu (mobile).</p>
  `
};