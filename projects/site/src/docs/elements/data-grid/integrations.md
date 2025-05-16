---
{
  title: 'Data Grid Integrations',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell']
}
---

The Data Grid is designed to be declarative to enable apps to choose the best rendering techniques that fit their use cases. When using a framework or library such as Angular, leverage the frameworks default syntax and conventions for rendering lists of DOM elements.

{% svg-logos 'angular' %}

## Angular <svg width="20" height="20"><use href="#angular-svg"></use></svg>

In Angular you can use `*ngFor` directive and have full render control of when and how rows are created. This enables more advanced performance optomizations such as [trackBy](https://angular.io/api/core/TrackByFunction#description).

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

{% svg-logos 'lit' %}

## Lit <svg width="18" height="18"><use href="#lit-svg"></use></svg></svg>

Creating dynamic grid rows adn cells in Lit uses the [standard array syntax](https://lit.dev/docs/templates/lists/).

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
