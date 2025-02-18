import { LitElement, unsafeCSS, html } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/app-header/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/notification/define.js';
import '@nvidia-elements/core/panel/define.js'
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/select/define.js';
import { generateId } from '@nvidia-elements/core/internal';

export default {
  title: 'Elements/Data Grid/Examples',
  component: 'nve-grid',
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
  position?: 'fixed' | 'sticky';
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

  @state() private workflowNotification: { status: 'danger' | 'success'; title: string; message: string; } = null;

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
    <nve-app-header>
      <nve-logo></nve-logo>
      <h2 slot="title">Workflows</h2>
      <nve-button slot="nav-items" active>Link 1</nve-button>
      <nve-button slot="nav-items">Link 2</nve-button>
      <nve-icon-button icon-name="chat-bubble" slot="nav-actions"></nve-icon-button>
      <nve-icon-button icon-name="switch-apps" slot="nav-actions"></nve-icon-button>
      <nve-icon-button interaction="emphasis" slot="nav-actions" size="sm">EL</nve-icon-button>
    </nve-app-header>
    `
  }

  get #header() {
    return html`
    <nve-card container="full" style="max-height: 120px">
      <nve-card-content nve-layout="column gap:md align:horizontal-stretch">
        <div nve-layout="row gap:md align:center">
          <h1 nve-text="heading lg semibold">Workflows</h1>
          <div nve-layout="row gap:sm" style="margin-left: auto">
            <nve-icon-button @click=${() => this.showAboutDialog = true} icon-name="information-circle-stroke" aria-label="about kitchen sink"></nve-icon-button>
            <nve-icon-button icon-name="more-actions" aria-label="additional actions"></nve-icon-button>
          </div>
        </div>
        <div nve-layout="row gap:xl align:vertical-center">
          <section nve-layout="row gap:xs align:center">
            <span nve-text="body sm muted">Service Location</span>
            <span nve-text="body sm bold">Santa Clara</span>
          </section>
          <section nve-layout="row gap:xs align:center">
            <span nve-text="body sm muted">Status</span>
            <span nve-text="body sm bold"><nve-badge status="success">available</nve-badge></span>
          </section>
        </div>
      </nve-card-content>
    </nve-card>
    `
  }

  get #settingsDropdown() {
    return html`
    <nve-dropdown anchor="column-settings-btn" ?hidden=${!this.workflowGridSettings} @close=${() => this.workflowGridSettings = false}>
      <h2 nve-text="heading sm">Settings</h2>
      <nve-divider></nve-divider>
      <nve-checkbox-group style="min-width: 200px">
        ${Object.entries(this.columns).filter(([name]) => name !== 'workflow' && name !== 'status').map(([name, column]) => html`
          <nve-checkbox>
            <label>${name}</label>
            <input type="checkbox" ?checked=${column.visible} @input=${() => (this.columns = { ...this.columns, [name]: { visible: !this.columns[name].visible } })} />
          </nve-checkbox>
        `)}
      </nve-checkbox-group>
    </nve-dropdown>
    `
  }

  get #actionBar() {
    return html`
    <div nve-layout="grid gap:md">
      <nve-search container="flat" nve-layout="span:12">
        <input type="search" placeholder="search" aria-label="search workflows" .value=${this.search} @input=${e => this.#search(e.target.value)} />
      </nve-search>
      <div nve-layout="row gap:sm align:vertical-center span:3">
        <p nve-text="body muted">1,145 results found</p>
        <nve-button id="column-settings-btn" container="flat" @click=${() => this.workflowGridSettings = !this.workflowGridSettings}>
          <nve-icon name="gear"></nve-icon>  display settings
        </nve-button>
      </div>
      <div nve-layout="span:5"></div>
      <div nve-layout="row gap:sm align:bottom span:4" style="margin-left: auto">
        <nve-button @click=${() => this.showCreateWorkflowDialog = true} interaction="emphasis">create</nve-button>
      </div>
    </div>`
  }

  get #detailPanel() {
    return html`
    <nve-panel ?expanded=${!!this.workflowDetail} @close=${() => this.workflowDetail = null} closable style="min-width: 400px">
      <nve-panel-header>
        <h2 slot="title">Workflow: ${this.workflowDetail?.id}</h2>
      </nve-panel-header>
      <nve-panel-content nve-layout="column gap:xl">
        <div nve-layout="column gap:xs">
          <label nve-text="body sm muted">Task</label>
          <p nve-text="eyebrow sm">${this.workflowDetail?.task}</p>
        </div>
        <div nve-layout="column gap:xs">
          <label nve-text="body sm muted">Priority</label>
          <nve-badge status="pending">${this.workflowDetail?.priority}</nve-badge>
        </div>
        <div nve-layout="column gap:xs">
          <label nve-text="body sm muted">Status</label>
          <nve-badge status=${this.workflowDetail?.status}>${this.workflowDetail?.status}</nve-badge>
        </div>
        <div nve-layout="column gap:xs">
          <label nve-text="body sm muted">Coverage</label>
          <nve-badge status=${getTrend(this.workflowDetail?.coverage)}>
            ${this.workflowDetail?.coverage > 0 ? '+' : ''}${this.workflowDetail?.coverage}%
          </nve-badge>
        </div>
        <div nve-layout="column gap:xs">
          <label nve-text="body sm muted">Reviews</label>
          <p nve-text="eyebrow sm">${this.workflowDetail?.reviews}</p>
        </div>
        <div nve-layout="column gap:xs">
          <label nve-text="body sm muted">Region</label>
          <p nve-text="eyebrow sm">${this.workflowDetail?.region}</p>
        </div>
        <div nve-layout="column gap:xs">
          <label nve-text="body sm muted">Created</label>
          <p nve-text="eyebrow sm">${this.workflowDetail?.created}</p>
        </div>
      </nve-panel-content>
      <nve-panel-footer>
        <nve-button @click=${() => this.#deleteWorkflow(this.workflowDetail)} interaction="destructive">delete</nve-button>
      </nve-panel-footer>
    </nve-panel>`
  }

  get #placeholder() {
    return !this.filteredWorkflows.length ? html`
    <nve-grid-placeholder>
      <div nve-layout="column gap:md align:center">
        <nve-alert status="accent">No active workflows found. Try adjusting your filters or reloading.</nve-alert>
        <nve-button @click=${() => this.#reloadWorkflows()}>reload workflows <nve-icon name="refresh"></nve-icon></nve-button>
      </div>
    </nve-grid-placeholder>` : '';
  }

  get #createWorkflowDialog() {
    return html`
    <nve-dialog closable modal .hidden=${!this.showCreateWorkflowDialog} @close=${() => this.showCreateWorkflowDialog = false}>
      <nve-dialog-header>
        <h2 nve-text="heading">Workflow</h2>
      </nve-dialog-header>
      <nve-dialog-content>
        <form id="workflow-form" nve-layout="column gap:md" style="width: 200px">
          <nve-select>
            <label>Task</label>
            <select name="task">
              <option value="build">Build</option>
              <option value="test">Test</option>
              <option value="integration">Integration</option>
            </select>
          </nve-select>
          <nve-select>
            <label>Priority</label>
            <select name="priority">
              <option value="p0">p0</option>
              <option value="p1">p1</option>
              <option value="p2">p2</option>
            </select>
          </nve-select>
          <nve-select>
            <label>Region</label>
            <select name="region">
              <option value="Santa Clara">Santa Clara</option>
              <option value="Munich">Munich</option>
              <option value="Redmond">Redmond</option>
            </select>
          </nve-select>
          &nbsp;
        </form>
      </nve-dialog-content>
      <nve-dialog-footer>
        <nve-button @click=${() => this.#createWorkflow()}>Create Workflow</nve-button>
      </nve-dialog-footer>
    </nve-dialog>`
  }

  get #aboutDialog() {
    return html`
    <nve-dialog closable modal .hidden=${!this.showAboutDialog} @close=${() => this.showAboutDialog = false}>
      <nve-dialog-header>
        <h2 nve-text="heading">About Grid Kitchen Sink</h2>
      </nve-dialog-header>
      <nve-dialog-content>
        <p nve-text="body wrap">
          This is a demo that demonstrates the full feature set of the datgrid component.
        </p>
      </nve-dialog-content>
    </nve-dialog>`
  }

  get #notification() {
    return html`
    <nve-notification .hidden=${!this.workflowNotification} @close=${() => this.workflowNotification = null} status=${this.workflowNotification?.status} close-timeout="4000" position="top">
      <h3 nve-text="label">${this.workflowNotification?.title}</h3>
      <p nve-text="body">${this.workflowNotification?.message}</p>
    </nve-notification>`
  }

  get #bulkActions() {
    return this.#selectedCount ? html`
    <nve-toolbar slot="footer" status="accent">
      <nve-icon-button container="flat" icon-name="cancel" slot="prefix" @click=${() => this.#selectAll(false)}></nve-icon-button>
      <p nve-text="body">${this.#selectedCount} selected</p>
      <nve-button @click=${() => this.showCreateWorkflowDialog = true} .disabled=${this.#selectedCount !== 1} container="flat" slot="suffix">edit</nve-button>
      <nve-button icon-name="delete" @click=${() => this.#deleteSelectedWorkflows()} .disabled=${this.#selectedCount < 1} container="flat" interaction="destructive" slot="suffix">delete</nve-button>
    </nve-toolbar>` : '';
  }

  render() {
    return html`
      ${this.#appHeader}
      <div nve-layout="column align:horizontal-stretch" style="height: calc(100vh - 52px)" no-story-container>
        ${this.#header}
        <div nve-layout="row align:stretch">
          ${this.#settingsDropdown}
          <div nve-layout="column gap:md pad:md full">
            ${this.#actionBar}
            <nve-grid style="--scroll-height: calc(100vh - 330px); --row-height: 48px">
              <nve-grid-header>
                <nve-grid-column position="fixed" width="max-content">
                  <nve-checkbox>
                    <input type="checkbox" aria-label="select all rows" @change=${e => this.#selectAll(e.target.checked)} />
                  </nve-checkbox>
                </nve-grid-column>
                ${Object.entries(this.columns).map(([name, column]) => column.visible ? html`<nve-grid-column .position=${column.position} .width=${column.width}>${name}</nve-grid-column>` : '')}
                <nve-grid-column position="fixed" width="max-content"></nve-grid-column>
              </nve-grid-header>
              ${this.filteredWorkflows.map(workflow => html`
              <nve-grid-row ?selected=${this.workflowDetail?.id === workflow.id}>
                <nve-grid-cell>
                  <nve-checkbox>
                    <input type="checkbox" @change=${e => this.#selectWorkflow(e, workflow)} .checked=${workflow.selected} aria-label="select drive ${workflow.id}" />
                  </nve-checkbox>
                </nve-grid-cell>
                <nve-grid-cell>
                  <div nve-layout="column gap:xs">
                    <div nve-text="body">${workflow.task}</div>
                    <div nve-text="body sm muted">${workflow.id}</div>
                  </div>
                </nve-grid-cell>
                ${this.columns.status.visible ? html`<nve-grid-cell><nve-badge status=${workflow.status}>${workflow.status}</nve-badge></nve-grid-cell>` : ''}
                ${this.columns.priority.visible ? html`<nve-grid-cell><nve-badge status="pending">${workflow.priority}</nve-badge></nve-grid-cell>`: ''}
                ${this.columns.coverage.visible ? html`<nve-grid-cell><nve-badge status=${getTrend(workflow.coverage)}>${workflow.coverage > 0 ? '+' : ''}${workflow.coverage}%</nve-badge></nve-grid-cell>` : ''}
                ${this.columns.reviews.visible ? html`<nve-grid-cell>${workflow.reviews}</nve-grid-cell>` : ''}
                ${this.columns.region.visible ? html`<nve-grid-cell>${workflow.region}</nve-grid-cell>` : ''}
                ${this.columns.created.visible ? html`<nve-grid-cell>${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(workflow.created)}</nve-grid-cell>` : ''}
                <nve-grid-cell>
                  <nve-icon-button container="flat" icon-name="more-actions" @click=${() => this.workflowDetail = workflow}></nve-icon-button>
                </nve-grid-cell>
              </nve-grid-row>`)}
              ${this.#placeholder}
              <nve-grid-footer>
                <p nve-text="label muted sm">last updated ${new Date()}</p>
              </nve-grid-footer>
              ${this.#bulkActions}
            </nve-grid>
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
<div no-story-container>
  <ksg-demo></ksg-demo>
</div>
  `
};
