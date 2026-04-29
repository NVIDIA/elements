---
{
  title: 'Data Grid Integrations',
  description: 'Connect NVIDIA Elements Data Grid to popular frameworks: React, Angular, Vue, and Svelte adapters.',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

The Data Grid uses a declarative approach to enable apps to choose the best rendering techniques that fit their use cases. When using a framework or library such as Angular, leverage the frameworks default syntax and conventions for rendering lists of DOM elements.

## Angular {% svg-logo 'angular' '20' %}

In Angular you can use `*ngFor` directive and have full render control of when and how the framework creates rows. This enables more advanced performance optimizations such as [trackBy](https://angular.io/api/core/TrackByFunction#description).

```typescript
@Component({
  selector: 'demo-grid',
  template: `
    <nve-grid>
      <nve-grid-header>
        <nve-grid-column *ngFor="let field of workflows[0] | keyvalue">{{field.name}}</nve-grid-column>
      </nve-grid-header>
      <nve-grid-row *ngFor="let workflow of workflows">
        <nve-grid-cell *ngFor="let field of workflow | keyvalue">{{field.value}}</nve-grid-cell>
      </nve-grid-row>
    </nve-grid>
  `
})
export class App {
  workflows = [
    { id: '1', status: 'complete' },
    { id: '2', status: 'failed' },
    ...
  ];
}
```

## Lit {% svg-logo 'lit' '18' %}

Creating dynamic grid rows and cells in Lit uses the [standard array syntax](https://lit.dev/docs/templates/lists/).

```typescript
@customElement('demo-grid')
export class App {
  @state() workflows = [
    { id: '1', status: 'complete' },
    { id: '2', status: 'failed' },
    ...
  ];

  render() {
    return html`
    <nve-grid>
      <nve-grid-header>
        ${Object.keys(this.workflows[0]).map(field => html`<nve-grid-column>${field}</nve-grid-column>`)}
      </nve-grid-header>
      ${this.workflows.map(workflow => html`
      <nve-grid-row>
        ${Object.entries(workflow).map(([field, value]) => html`<nve-grid-cell>${value}</nve-grid-cell>`)}
      </nve-grid-row>`)}
    </nve-grid>`
  }
}
```
