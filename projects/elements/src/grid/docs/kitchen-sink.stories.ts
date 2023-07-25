import { LitElement, unsafeCSS, html } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import layout from '@elements/elements/css/module.layout.css?inline';
import typography from '@elements/elements/css/module.typography.css?inline';
import '@elements/elements/grid/define.js';
import '@elements/elements/alert/define.js';
import '@elements/elements/app-header/define.js';
import '@elements/elements/badge/define.js';
import '@elements/elements/bulk-actions/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/checkbox/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/dialog/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/logo/define.js';
import '@elements/elements/notification/define.js';
import '@elements/elements/panel/define.js'
import '@elements/elements/search/define.js';
import '@elements/elements/select/define.js';
import { generateId } from '@elements/elements/internal';

export default {
  title: 'Elements/Data Grid/Examples',
  component: 'mlv-grid',
};

interface Workflow {
  id: string;
  task: 'build' | 'test' | 'integration',
  priority: 'p0' | 'p1' | 'p2'
  status: 'finished' | 'pending' | 'running' | 'queued',
  coverage: number,
  reviews: string,
  region: 'Santa Clara' | 'Munich' | 'Redmond',
  created: Date,
  selected: boolean
}

interface WorkflowColumn {
  visible: boolean;
  width?: string;
  position?: string;
}

function workflowData(rows = 100) {
  return Array(rows).fill('').map(() => {
    const status = ['finished', 'pending', 'running', 'queued'][Math.floor(Math.random() * 4)];
    return {
      id: `${generateId()}`,
      task: ['build', 'test', 'integration'][Math.floor(Math.random()*3)],
      priority: ['p0', 'p1', 'p2'][Math.floor(Math.random()*3)],
      status,
      coverage: status === 'finished' ? Math.floor(Math.random() * (10 - -5 + 1) + -5) : 0,
      reviews: '0/3',
      region: ['Santa Clara', 'Munich', 'Redmond'][Math.floor(Math.random()*3)],
      created: new Date(new Date(2020, 0, 1).getTime() + Math.random() * (new Date().getTime() - new Date(2012, 0, 1).getTime())),
      selected: false
    } as Workflow;
  });
}

function getTrend(value: number) {
  if (value > 0) {
    return 'trend-up';
  } else if (value < 0) {
    return 'trend-down';
  } else {
    return 'trend-neutral';
  }
}

@customElement('ksg-demo')
class KitchenSinkDemo extends LitElement {
  @state() private search = '';

  @state() private workflowDetail: Workflow = null;

  @state() private workflowGridSettings = false;

  @state() private showAboutDialog = false;

  @state() private showCreateWorkflowDialog = false;

  @state() private workflowNotification: { status: string; title: string, message: string; } = null;

  @state() private columns: { [key: string]: WorkflowColumn } = {
    workflow: { visible: true, width: '150px', position: 'fixed' },
    status: { visible: true },
    priority: { visible: true },
    coverage: { visible: true },
    reviews: { visible: true },
    region: { visible: true },
    created: { visible: true, width: '280px' }
  }

  #workflows = workflowData();

  @state() private filteredWorkflows = this.#workflows;

  static styles = [unsafeCSS(layout), unsafeCSS(typography)];

  get #selectedCount() {
    return this.filteredWorkflows.filter(r => r.selected).length;
  }

  get #workflowForm() {
    return this.shadowRoot.querySelector<HTMLFormElement>('#workflow-form');
  }

  get #appHeader() {
    return html`
    <mlv-app-header>
      <mlv-logo></mlv-logo>
      <h2 slot="title">Workflows</h2>
      <mlv-button slot="nav-items" active>Link 1</mlv-button>
      <mlv-button slot="nav-items">Link 2</mlv-button>
      <mlv-icon-button icon-name="assist" slot="nav-actions"></mlv-icon-button>
      <mlv-icon-button icon-name="app-switcher" slot="nav-actions"></mlv-icon-button>
      <mlv-icon-button interaction="emphasize" slot="nav-actions" size="sm">EL</mlv-icon-button>
    </mlv-app-header>
    `
  }

  get #header() {
    return html`
    <mlv-card container="full" style="max-height: 120px">
      <mlv-card-content mlv-layout="column gap:md align:horizontal-stretch">
        <div mlv-layout="row gap:md align:center">
          <h1 mlv-text="heading lg semibold">Workflows</h1>
          <div mlv-layout="row gap:sm" style="margin-left: auto">
            <mlv-icon-button @click=${() => this.showAboutDialog = true} icon-name="information" aria-label="about kitchen sink"></mlv-icon-button>
            <mlv-icon-button icon-name="additional-actions" aria-label="additional actions"></mlv-icon-button>
          </div>
        </div>
        <div mlv-layout="row gap:xl align:vertical-center">
          <section mlv-layout="row gap:xs align:center">
            <span mlv-text="body sm muted">Service Location</span>
            <span mlv-text="body sm bold">Santa Clara</span>
          </section>
          <section mlv-layout="row gap:xs align:center">
            <span mlv-text="body sm muted">Status</span>
            <span mlv-text="body sm bold"><mlv-badge status="success">available</mlv-badge></span>
          </section>
        </div>
      </mlv-card-content>
    </mlv-card>
    `
  }

  get #settingsDropdown() {
    return html`
    <mlv-dropdown anchor="column-settings-btn" ?hidden=${!this.workflowGridSettings} @close=${() => this.workflowGridSettings = false}>
      <h2 mlv-text="heading sm">Settings</h2>
      <mlv-divider></mlv-divider>
      <mlv-checkbox-group style="min-width: 200px">
        ${Object.entries(this.columns).filter(([name]) => name !== 'workflow' && name !== 'status').map(([name, column]) => html`
          <mlv-checkbox>
            <label>${name}</label>
            <input type="checkbox" ?checked=${column.visible} @input=${() => (this.columns = { ...this.columns, [name]: { visible: !this.columns[name].visible } })} />
          </mlv-checkbox>
        `)}
      </mlv-checkbox-group>
    </mlv-dropdown>
    `
  }

  get #actionBar() {
    return html`
    <div mlv-layout="grid gap:md">
      <mlv-search container="flat" mlv-layout="span:12">
        <input type="search" placeholder="search" aria-label="search workflows" .value=${this.search} @input=${e => this.#search(e.target.value)} />
      </mlv-search>
      <div mlv-layout="row gap:sm align:vertical-center span:3">
        <p mlv-text="body muted">1,145 results found</p>
        <mlv-button id="column-settings-btn" @click=${() => this.workflowGridSettings = !this.workflowGridSettings}>display settings</mlv-button>
      </div>
      <div mlv-layout="span:5"></div>
      <div mlv-layout="row gap:sm align:bottom span:4" style="margin-left: auto">
        <mlv-button @click=${() => this.showCreateWorkflowDialog = true} interaction="emphasize">create</mlv-button>
      </div>
    </div>`
  }

  get #detailPanel() {
    return html`
    <mlv-panel ?expanded=${!!this.workflowDetail} @close=${() => this.workflowDetail = null} closable style="min-width: 400px">
      <mlv-panel-header>
        <h2 slot="title">Workflow: ${this.workflowDetail?.id}</h2>
      </mlv-panel-header>
      <mlv-panel-content mlv-layout="column gap:xl">
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm muted">Task</label>
          <p mlv-text="eyebrow sm">${this.workflowDetail?.task}</p>
        </div>
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm muted">Priority</label>
          <mlv-badge status="pending">${this.workflowDetail?.priority}</mlv-badge>
        </div>
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm muted">Status</label>
          <mlv-badge status=${this.workflowDetail?.status}>${this.workflowDetail?.status}</mlv-badge>
        </div>
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm muted">Coverage</label>
          <mlv-badge status=${getTrend(this.workflowDetail?.coverage)}>
            ${this.workflowDetail?.coverage > 0 ? '+' : ''}${this.workflowDetail?.coverage}%
          </mlv-badge>
        </div>
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm muted">Reviews</label>
          <p mlv-text="eyebrow sm">${this.workflowDetail?.reviews}</p>
        </div>
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm muted">Region</label>
          <p mlv-text="eyebrow sm">${this.workflowDetail?.region}</p>
        </div>
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm muted">Created</label>
          <p mlv-text="eyebrow sm">${this.workflowDetail?.created}</p>
        </div>
      </mlv-panel-content>
      <mlv-panel-footer>
        <mlv-button @click=${() => this.#deleteWorkflow(this.workflowDetail)} interaction="destructive">delete</mlv-button>
      </mlv-panel-footer>
    </mlv-panel>`
  }

  get #placeholder() {
    return !this.filteredWorkflows.length ? html`
    <mlv-grid-placeholder>
      <div mlv-layout="column gap:md align:center">
        <mlv-alert status="accent">No active workflows found. Try adjusting your filters or reloading.</mlv-alert>
        <mlv-button @click=${() => this.#reloadWorkflows()}>reload workflows <mlv-icon name="refresh"></mlv-icon></mlv-button>
      </div>
    </mlv-grid-placeholder>` : '';
  }

  get #createWorkflowDialog() {
    return html`
    <mlv-dialog closable modal .hidden=${!this.showCreateWorkflowDialog} @close=${() => this.showCreateWorkflowDialog = false}>
      <mlv-dialog-header>
        <h2 mlv-text="heading">Workflow</h2>
      </mlv-dialog-header>
      <mlv-dialog-content>
        <form id="workflow-form" mlv-layout="column gap:md" style="width: 200px">
          <mlv-select>
            <label>Task</label>
            <select name="task">
              <option value="build">Build</option>
              <option value="test">Test</option>
              <option value="integration">Integration</option>
            </select>
          </mlv-select>
          <mlv-select>
            <label>Priority</label>
            <select name="priority">
              <option value="p0">p0</option>
              <option value="p1">p1</option>
              <option value="p2">p2</option>
            </select>
          </mlv-select>
          <mlv-select>
            <label>Region</label>
            <select name="region">
              <option value="Santa Clara">Santa Clara</option>
              <option value="Munich">Munich</option>
              <option value="Redmond">Redmond</option>
            </select>
          </mlv-select>
          &nbsp;
        </form>
      </mlv-dialog-content>
      <mlv-dialog-footer>
        <mlv-button @click=${() => this.#createWorkflow()}>Create Workflow</mlv-button>
      </mlv-dialog-footer>
    </mlv-dialog>`
  }

  get #aboutDialog() {
    return html`
    <mlv-dialog closable modal .hidden=${!this.showAboutDialog} @close=${() => this.showAboutDialog = false}>
      <mlv-dialog-header>
        <h2 mlv-text="heading">About Grid Kitchen Sink</h2>
      </mlv-dialog-header>
      <mlv-dialog-content>
        <p mlv-text="body wrap">
          This is a demo that demonstrates the full feature set of the datgrid component.
        </p>
      </mlv-dialog-content>
    </mlv-dialog>`
  }

  get #notification() {
    return html`
    <mlv-notification .hidden=${!this.workflowNotification} @close=${() => this.workflowNotification = null} status=${this.workflowNotification?.status as any} close-timeout="4000" position="top">
      <h3 mlv-text="label">${this.workflowNotification?.title}</h3>
      <p mlv-text="body">${this.workflowNotification?.message}</p>
    </mlv-notification>`
  }

  get #bulkActions() {
    return this.#selectedCount ? html`
    <mlv-bulk-actions slot="footer" status="accent" closable @close=${() => this.#selectAll(false)}>
      ${this.#selectedCount} selected
      <mlv-button @click=${() => this.showCreateWorkflowDialog = true} .disabled=${this.#selectedCount !== 1} interaction="flat">edit</mlv-button>
      <mlv-button icon-name="delete" @click=${() => this.#deleteSelectedWorkflows()} .disabled=${this.#selectedCount < 1} interaction="flat-destructive">delete</mlv-button>
    </mlv-bulk-actions>` : ''
  }

  render() {
    return html`
      ${this.#appHeader}
      <div mlv-layout="column align:horizontal-stretch" style="height: calc(100vh - 52px)" no-story-container>
        ${this.#header}
        <div mlv-layout="row align:stretch">
          ${this.#settingsDropdown}
          <div mlv-layout="column gap:md pad:md grow">
            ${this.#actionBar}
            <mlv-grid style="--scroll-height: calc(100vh - 330px); --row-height: 48px">
              <mlv-grid-header>
                <mlv-grid-column position="fixed" width="max-content">
                  <mlv-checkbox>
                    <input type="checkbox" aria-label="select all rows" @change=${e => this.#selectAll(e.target.checked)} />
                  </mlv-checkbox>
                </mlv-grid-column>
                ${Object.entries(this.columns).map(([name, column]) => column.visible ? html`<mlv-grid-column .position=${column.position as any} .width=${column.width as any}>${name}</mlv-grid-column>` : '')}
                <mlv-grid-column position="fixed" width="max-content"></mlv-grid-column>
              </mlv-grid-header>
              ${this.filteredWorkflows.map(workflow => html`
              <mlv-grid-row ?selected=${this.workflowDetail?.id === workflow.id}>
                <mlv-grid-cell>
                  <mlv-checkbox>
                    <input type="checkbox" @change=${e => this.#selectWorkflow(e, workflow)} .checked=${workflow.selected} aria-label="select drive ${workflow.id}" />
                  </mlv-checkbox>
                </mlv-grid-cell>
                <mlv-grid-cell>
                  <div mlv-layout="column gap:xs">
                    <div mlv-text="body">${workflow.task}</div>
                    <div mlv-text="body sm muted">${workflow.id}</div>
                  </div>
                </mlv-grid-cell>
                ${this.columns.status.visible ? html`<mlv-grid-cell><mlv-badge status=${workflow.status}>${workflow.status}</mlv-badge></mlv-grid-cell>` : ''}
                ${this.columns.priority.visible ? html`<mlv-grid-cell><mlv-badge status="pending">${workflow.priority}</mlv-badge></mlv-grid-cell>`: ''}
                ${this.columns.coverage.visible ? html`<mlv-grid-cell><mlv-badge status=${getTrend(workflow.coverage)}>${workflow.coverage > 0 ? '+' : ''}${workflow.coverage}%</mlv-badge></mlv-grid-cell>` : ''}
                ${this.columns.reviews.visible ? html`<mlv-grid-cell>${workflow.reviews}</mlv-grid-cell>` : ''}
                ${this.columns.region.visible ? html`<mlv-grid-cell>${workflow.region}</mlv-grid-cell>` : ''}
                ${this.columns.created.visible ? html`<mlv-grid-cell>${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(workflow.created)}</mlv-grid-cell>` : ''}
                <mlv-grid-cell>
                  <mlv-icon-button interaction="flat" icon-name="additional-actions" @click=${() => this.workflowDetail = workflow}></mlv-icon-button>
                </mlv-grid-cell>
              </mlv-grid-row>`)}
              ${this.#placeholder}
              <mlv-grid-footer>
                <p mlv-text="label muted sm">last updated ${new Date()}</p>
              </mlv-grid-footer>
              ${this.#bulkActions}
            </mlv-grid>
          </div>
          ${this.#detailPanel}
        </div>
      </div>
    </div>
    ${this.#createWorkflowDialog}
    ${this.#aboutDialog}
    ${this.#notification}
    `
  }

  #search(value: string) {
    this.search = value;
    this.#updateWorkflows();
  }

  #selectAll(select: boolean) {
    this.#workflows.forEach(r => r.selected = select);
    this.#updateWorkflows();
  }

  #selectWorkflow(event, workflow) {
    workflow.selected = event.target.checked;
    this.#updateWorkflows();
  }

  #deleteSelectedWorkflows() {
    this.#workflows = this.#workflows.filter(w => !w.selected);
    this.#updateWorkflows();
    setTimeout(() => this.workflowNotification = { status: 'danger', title: 'Workflows Deleted', message: 'workflows removed from queue' }, 1000);
  }

  #createWorkflow() {
    const values: Partial<Workflow> = Object.fromEntries(new FormData(this.#workflowForm));
    const workflow: Workflow = { task: values.task, priority: values.priority, region: values.region, id: generateId(), status: 'pending', coverage: 0, reviews: '0/3', selected: false, created: new Date() };
    this.#workflows.unshift(workflow);
    this.#updateWorkflows();
    this.showCreateWorkflowDialog = false;
    setTimeout(() => this.workflowNotification = { status: 'success', title: 'Workflow Created', message: 'submitted to queue' }, 1000);
  }

  #deleteWorkflow(workflow: Workflow) {
    this.#workflows = this.#workflows.filter(w => w !== workflow);
    this.workflowDetail = null;
    this.#updateWorkflows();
    setTimeout(() => this.workflowNotification = { status: 'danger', title: 'Workflow Deleted', message: 'workflow removed from queue' }, 1000);
  }

  #reloadWorkflows() {
    this.search = '';
    this.#workflows = workflowData();
    this.#updateWorkflows();
  }

  #updateWorkflows() {
    this.filteredWorkflows = [...this.#workflows].filter(row => JSON.stringify(row).toLowerCase().includes(this.search.toLowerCase()));
  }
}

export const KitchenSink = {
  render: () => html`
<div mlv-theme="root" no-story-container>
  <ksg-demo></ksg-demo>
</div>
  `
};
