import { html } from 'lit';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/breadcrumb/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/tabs/define.js';

export default {
  title: 'Patterns/Examples',
  component: 'nve-patterns'
};

/**
 * @summary Use for main page subheaders with breadcrumb, page title, and action buttons in a clean two-row layout.
 * @tags pattern
 */
export const StandardHeaderMainPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader">
        <nve-page-panel-content>
          <div nve-layout="column gap:md align:stretch">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <h1 nve-text="heading lg semibold">Page Title</h1>
              <section nve-layout="row gap:sm align:vertical-center">
                <nve-button>Default</nve-button>
                <nve-button interaction="emphasis">Emphasis</nve-button>
                <nve-icon-button icon-name="more-actions"></nve-icon-button>
              </section>
            </div>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Use for main page subheaders with tabbed navigation below the title. Uses custom padding to align tabs flush with panel edges.
 * @tags pattern test-case
 */
export const TabsHeaderMainPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader" style="--padding: 0">
        <nve-page-panel-content style="--padding: 0">
          <div nve-layout="column gap:md align:stretch pad-x:lg pad-top:md">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <h1 nve-text="heading lg semibold">Page Title</h1>
              <div nve-layout="row gap:sm align:vertical-center">
                <nve-button>Default</nve-button>
                <nve-button interaction="emphasis">Emphasis</nve-button>
                <nve-icon-button icon-name="more-actions"></nve-icon-button>
              </div>
            </div>

            <nve-tabs behavior-select>
              <nve-tabs-item selected>Tab 1</nve-tabs-item>
              <nve-tabs-item>Tab 2</nve-tabs-item>
              <nve-tabs-item>Tab 3</nve-tabs-item>
              <nve-tabs-item>Tab 4</nve-tabs-item>
            </nve-tabs>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Main page subheader with key-value metadata row stacked below the title. Ideal for displaying session details, status badges, and entity relationships.
 * @tags pattern
 */
export const StackedMetadataHeaderMainPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader">
        <nve-page-panel-content>
          <div nve-layout="column gap:md align:stretch">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <h1 nve-text="heading lg semibold">Page Title</h1>

              <section nve-layout="row gap:sm align:vertical-center">
                <nve-button>Default</nve-button>
                <nve-button interaction="emphasis">Emphasis</nve-button>
                <nve-icon-button icon-name="more-actions"></nve-icon-button>
              </section>
            </div>

            <section nve-layout="row gap:xl align:vertical-center">
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Session ID</span>
                <a nve-text="body sm bold link" href="#">13245768</a>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Driver</span>
                <span nve-text="body sm bold">Jane Doe</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Co-Pilot</span>
                <span nve-text="body sm bold">John Doe</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Route</span>
                <span nve-text="body sm bold">Santa Clara</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Status</span>
                <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
              </div>
            </section>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Use for main page subheaders with metadata columns inline beside the title. Uses vertical divider to separate metadata from action buttons.
 * @tags pattern test-case
 */
export const InlineMetadataHeaderMainPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader">
        <nve-page-panel-content>
          <div nve-layout="column gap:md align:stretch">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <h1 nve-text="heading lg semibold">Page Title</h1>

              <div nve-layout="row gap:xl align:vertical-center">
                <section nve-layout="row gap:xl align:vertical-center">
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Session ID</span>
                    <a nve-text="body sm bold link" href="#">13245768</a>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Driver</span>
                    <span nve-text="body sm bold">Jane Doe</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Co-Pilot</span>
                    <span nve-text="body sm bold">John Doe</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Route</span>
                    <span nve-text="body sm bold">Santa Clara</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Status</span>
                    <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
                  </div>
                </section>

                <nve-divider orientation="vertical"></nve-divider>

                <section nve-layout="row gap:sm align:vertical-center">
                  <nve-button>Default</nve-button>
                  <nve-button interaction="emphasis">Emphasis</nve-button>
                  <nve-icon-button icon-name="more-actions"></nve-icon-button>
                </section>
              </div>
            </div>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Use for feature-rich main page subheaders combining back navigation, inline metadata, divider, and tabbed navigation at max complexity.
 * @tags pattern test-case
 */
export const InlineKitchenSinkHeaderMainPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader" style="--padding: 0">
        <nve-page-panel-content style="--padding: 0">
          <div nve-layout="column gap:md align:stretch pad-x:lg pad-top:md">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <nve-button><a href="#" target="_self">Item 2</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <section nve-layout="row gap:sm align:vertical-center">
                <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
                <h1 nve-text="heading lg semibold">Page Title</h1>
              </section>

              <div nve-layout="row gap:xl align:vertical-center">
                <section nve-layout="row gap:xl align:vertical-center">
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Session ID</span>
                    <a nve-text="body sm bold link" href="#">13245768</a>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Driver</span>
                    <span nve-text="body sm bold">Jane Doe</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Co-Pilot</span>
                    <span nve-text="body sm bold">John Doe</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Route</span>
                    <span nve-text="body sm bold">Santa Clara</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Status</span>
                    <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
                  </div>
                </section>

                <nve-divider orientation="vertical"></nve-divider>

                <section nve-layout="row gap:sm align:vertical-center">
                  <nve-button>Default</nve-button>
                  <nve-icon-button icon-name="more-actions"></nve-icon-button>
                </section>
              </div>
            </div>

            <nve-tabs behavior-select>
              <nve-tabs-item selected>Tab 1</nve-tabs-item>
              <nve-tabs-item>Tab 2</nve-tabs-item>
              <nve-tabs-item>Tab 3</nve-tabs-item>
              <nve-tabs-item>Tab 4</nve-tabs-item>
            </nve-tabs>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Feature-rich main page subheader with back navigation, stacked metadata row, and tabbed navigation. Alternative to inline layout for data-heavy contexts.
 * @tags pattern test-case
 */
export const StackedKitchenSinkHeaderMainPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader" style="--padding: 0">
        <nve-page-panel-content style="--padding: 0">
          <div nve-layout="column gap:md align:stretch pad-x:lg pad-top:md">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <nve-button><a href="#" target="_self">Item 2</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <section nve-layout="row gap:sm align:vertical-center">
                <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
                <h1 nve-text="heading lg semibold">Page Title</h1>
              </section>

              <section nve-layout="row gap:sm align:vertical-center">
                <nve-button>Default</nve-button>
                <nve-icon-button icon-name="more-actions"></nve-icon-button>
              </section>
            </div>

            <section nve-layout="row gap:xl align:vertical-center">
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Session ID</span>
                <a nve-text="body sm bold link" href="#">13245768</a>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Driver</span>
                <span nve-text="body sm bold">Jane Doe</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Co-Pilot</span>
                <span nve-text="body sm bold">John Doe</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Route</span>
                <span nve-text="body sm bold">Santa Clara</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Status</span>
                <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
              </div>
            </section>

            <nve-tabs behavior-select>
              <nve-tabs-item selected>Tab 1</nve-tabs-item>
              <nve-tabs-item>Tab 2</nve-tabs-item>
              <nve-tabs-item>Tab 3</nve-tabs-item>
              <nve-tabs-item>Tab 4</nve-tabs-item>
            </nve-tabs>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Detail page subheader with back arrow navigation, multi-level breadcrumb, and minimal action buttons. Use for drilling into specific records.
 * @tags pattern
 */
export const StandardHeaderDetailPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader">
        <nve-page-panel-content>
          <div nve-layout="column gap:md align:stretch">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <nve-button><a href="#" target="_self">Item 2</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <section nve-layout="row gap:sm align:vertical-center">
                <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
                <h1 nve-text="heading lg semibold">Page Title</h1>
              </section>

              <section nve-layout="row gap:sm align:vertical-center">
                <nve-button>Default</nve-button>
                <nve-icon-button icon-name="more-actions"></nve-icon-button>
              </section>
            </div>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Detail page subheader with back navigation and tabbed content sections. Ideal for entity detail views with many data categories.
 * @tags pattern
 */
export const TabsHeaderDetailPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader" style="--padding: 0">
        <nve-page-panel-content style="--padding: 0">
          <div nve-layout="column gap:md align:stretch pad-x:lg pad-top:md">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <nve-button><a href="#" target="_self">Item 2</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <section nve-layout="row gap:sm align:vertical-center">
                <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
                <h1 nve-text="heading lg semibold">Page Title</h1>
              </section>

              <div nve-layout="row gap:sm align:vertical-center">
                <nve-button>Default</nve-button>
                <nve-icon-button icon-name="more-actions"></nve-icon-button>
              </div>
            </div>

            <nve-tabs behavior-select>
              <nve-tabs-item selected>Tab 1</nve-tabs-item>
              <nve-tabs-item>Tab 2</nve-tabs-item>
              <nve-tabs-item>Tab 3</nve-tabs-item>
              <nve-tabs-item>Tab 4</nve-tabs-item>
            </nve-tabs>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Use for detail page subheaders with a stacked metadata row showing entity attributes as key-value pairs horizontally below the title.
 * @tags pattern test-case
 */
export const StackedMetadataHeaderDetailPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader">
        <nve-page-panel-content>
          <div nve-layout="column gap:md align:stretch">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <nve-button><a href="#" target="_self">Item 2</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <section nve-layout="row gap:sm align:vertical-center">
                <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
                <h1 nve-text="heading lg semibold">Page Title</h1>
              </section>

              <section nve-layout="row gap:sm align:vertical-center">
                <nve-button>Default</nve-button>
                <nve-icon-button icon-name="more-actions"></nve-icon-button>
              </section>
            </div>

            <section nve-layout="row gap:xl align:vertical-center">
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Session ID</span>
                <a nve-text="body sm bold link" href="#">13245768</a>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Driver</span>
                <span nve-text="body sm bold">Jane Doe</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Co-Pilot</span>
                <span nve-text="body sm bold">John Doe</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Route</span>
                <span nve-text="body sm bold">Santa Clara</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Status</span>
                <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
              </div>
            </section>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Use for detail page subheaders with inline metadata columns beside the title. Uses vertical divider to visually separate metadata from action buttons.
 * @tags pattern test-case
 */
export const InlineMetadataHeaderDetailPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader">
        <nve-page-panel-content>
          <div nve-layout="column gap:md align:stretch">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <nve-button><a href="#" target="_self">Item 2</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <section nve-layout="row gap:sm align:vertical-center">
                <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
                <h1 nve-text="heading lg semibold">Page Title</h1>
              </section>

              <div nve-layout="row gap:xl align:vertical-center">
                <section nve-layout="row gap:xl align:vertical-center">
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Session ID</span>
                    <a nve-text="body sm bold link" href="#">13245768</a>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Driver</span>
                    <span nve-text="body sm bold">Jane Doe</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Co-Pilot</span>
                    <span nve-text="body sm bold">John Doe</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Route</span>
                    <span nve-text="body sm bold">Santa Clara</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Status</span>
                    <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
                  </div>
                </section>

                <nve-divider orientation="vertical"></nve-divider>

                <section nve-layout="row gap:sm align:vertical-center">
                  <nve-button>Default</nve-button>
                  <nve-icon-button icon-name="more-actions"></nve-icon-button>
                </section>
              </div>
            </div>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Use for comprehensive detail page subheaders with inline metadata, divider, and tabs. Ideal for complex entity views needing max feature density.
 * @tags pattern test-case
 */
export const InlineKitchenSinkHeaderDetailPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader" style="--padding: 0">
        <nve-page-panel-content style="--padding: 0">
          <div nve-layout="column gap:md align:stretch pad-x:lg pad-top:md">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <nve-button><a href="#" target="_self">Item 2</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <section nve-layout="row gap:sm align:vertical-center">
                <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
                <h1 nve-text="heading lg semibold">Page Title</h1>
              </section>

              <div nve-layout="row gap:xl align:vertical-center">
                <section nve-layout="row gap:xl align:vertical-center">
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Session ID</span>
                    <a nve-text="body sm bold link" href="#">13245768</a>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Driver</span>
                    <span nve-text="body sm bold">Jane Doe</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Co-Pilot</span>
                    <span nve-text="body sm bold">John Doe</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Route</span>
                    <span nve-text="body sm bold">Santa Clara</span>
                  </div>
                  <div nve-layout="column gap:sm align:left">
                    <span nve-text="body sm muted">Status</span>
                    <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
                  </div>
                </section>

                <nve-divider orientation="vertical"></nve-divider>

                <section nve-layout="row gap:sm align:vertical-center">
                  <nve-button>Default</nve-button>
                  <nve-icon-button icon-name="more-actions"></nve-icon-button>
                </section>
              </div>
            </div>

            <nve-tabs behavior-select>
              <nve-tabs-item selected>Tab 1</nve-tabs-item>
              <nve-tabs-item>Tab 2</nve-tabs-item>
              <nve-tabs-item>Tab 3</nve-tabs-item>
              <nve-tabs-item>Tab 4</nve-tabs-item>
            </nve-tabs>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Use for comprehensive detail page subheaders with stacked metadata row and tabs. Ideal for better vertical organization when metadata items are many.
 * @tags pattern test-case
 */
export const StackedKitchenSinkHeaderDetailPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader" style="--padding: 0">
        <nve-page-panel-content style="--padding: 0">
          <div nve-layout="column gap:md align:stretch pad-x:lg pad-top:md">
            <nve-breadcrumb>
              <nve-button><a href="#" target="_self">Item 1</a></nve-button>
              <nve-button><a href="#" target="_self">Item 2</a></nve-button>
              <span>You Are Here</span>
            </nve-breadcrumb>

            <div nve-layout="row align:space-between align:vertical-center">
              <section nve-layout="row gap:sm align:vertical-center">
                <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
                <h1 nve-text="heading lg semibold">Page Title</h1>
              </section>

              <section nve-layout="row gap:sm align:vertical-center">
                <nve-button>Default</nve-button>
                <nve-icon-button icon-name="more-actions"></nve-icon-button>
              </section>
            </div>

            <section nve-layout="row gap:xl align:vertical-center">
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Session ID</span>
                <a nve-text="body sm bold link" href="#">13245768</a>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Driver</span>
                <span nve-text="body sm bold">Jane Doe</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Co-Pilot</span>
                <span nve-text="body sm bold">John Doe</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Route</span>
                <span nve-text="body sm bold">Santa Clara</span>
              </div>
              <div nve-layout="row gap:sm align:center">
                <span nve-text="body sm muted">Status</span>
                <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
              </div>
            </section>

            <nve-tabs behavior-select>
              <nve-tabs-item selected>Tab 1</nve-tabs-item>
              <nve-tabs-item>Tab 2</nve-tabs-item>
              <nve-tabs-item>Tab 3</nve-tabs-item>
              <nve-tabs-item>Tab 4</nve-tabs-item>
            </nve-tabs>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Page content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Viewer page subheader with centered zoom/layout controls and grouped action buttons. Ideal for media viewers, document previews, and split-pane layouts.
 * @tags pattern
 */
export const StandardHeaderViewerPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader">
        <nve-page-panel-content>
          <div nve-layout="row align:space-between align:vertical-center">
            <section nve-layout="row gap:sm align:vertical-center">
              <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
              <h1 nve-text="heading xs semibold">Page Title</h1>
            </section>

            <section nve-layout="row align:center align:vertical-center gap:xxxs">
              <nve-select container="flat" style="--border-bottom: 0">
                <select aria-label="zoom level">
                  <option value="1">100%</option>
                  <option value="2">75%</option>
                  <option value="3">50%</option>
                  <option value="4">25%</option>
                </select>
              </nve-select>
              <nve-button-group container="flat" behavior-select="single">
                <nve-icon-button size="sm" pressed icon-name="view-as-grid"></nve-icon-button>
                <nve-icon-button size="sm" icon-name="split-vertical"></nve-icon-button>
                <nve-icon-button size="sm" icon-name="split-horizontal"></nve-icon-button>
                <nve-icon-button size="sm" icon-name="split-none"></nve-icon-button>
              </nve-button-group>
            </section>

            <nve-button-group container="flat">
              <nve-icon-button size="sm" icon-name="download"></nve-icon-button>
              <nve-icon-button size="sm" icon-name="refresh"></nve-icon-button>
              <nve-icon-button size="sm" icon-name="more-actions"></nve-icon-button>
            </nve-button-group>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Viewer content area</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Editor-style toolbar subheader with left tool groups, centered title, and right action buttons. Use for canvas editors and creative tools.
 * @tags pattern
 */
export const StandardHeaderToolbarPage = {
  render: () => html`
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 nve-text="heading" slot="prefix">Application</h2>
        <nve-button selected container="flat">Link 1</nve-button>
        <nve-button container="flat">Link 2</nve-button>
        <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
      </nve-page-header>

      <nve-page-panel slot="subheader">
        <nve-page-panel-content>
          <div nve-layout="row align:space-between align:vertical-center">
            <section nve-layout="row gap:md align:left align:vertical-center" style="width: 33%">
              <div>
                <nve-button-group container="flat">
                  <nve-icon-button size="sm" icon-name="layers"></nve-icon-button>
                  <nve-icon-button size="sm" icon-name="cursor-rays"></nve-icon-button>
                  <nve-icon-button size="sm" pressed icon-name="hand"></nve-icon-button>
                </nve-button-group>
              </div>
              <div nve-layout="row gap:sm">
                <nve-button container="flat">Edit</nve-button>
                <nve-button container="flat">History</nve-button>
                <nve-button container="flat">Docs</nve-button>
              </div>
            </section>

            <h1 nve-text="heading xs semibold">Page Title</h1>

            <nve-button-group container="flat" style="width: 33%">
              <nve-icon-button size="sm" icon-name="add-comment" style="margin-left: auto"></nve-icon-button>
              <nve-icon-button size="sm" icon-name="bell"></nve-icon-button>
              <nve-icon-button size="sm" icon-name="more-actions"></nve-icon-button>
            </nve-button-group>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>

      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
        <p nve-text="body muted">Toolbar content area</p>
      </main>
    </nve-page>
  `
}
