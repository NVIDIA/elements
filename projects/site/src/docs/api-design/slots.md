---
{
  title: 'Slots',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Slots enable dynamic content to be rendered into the template of a given element.

📘 Tip: general rule, if the text will be visible to the user then likely the API should use a Slot.

📘 Tip: slot projection of text content, enables apps to use i18n strategy of their choice

## Flexibility

Slots provide flexibility for content that is controlled by the host application and cannot be guaranteed to be represented accurately through a specific element API.

```html
<nve-alert status="success">
  <p>Hello <strong>There</strong>!</p>
</nve-alert>
```

## Composition

Slots enable an easy way for component composition and decoupling from precise use cases that are application specific. This also decouples layout behaviors such as icon and button placement, giving the application control on DOM ordering.

```html
<nve-card>
  <nve-card-header>
    <h3>Plugin</h3>
    <a href="#">Learn More</a>
  </nve-card-header>
  <nve-card-body>
    <p>Cool new plugin features!</p>
  </nve-card-body>
  <nve-card-footer>
    <nve-button>Enable</nve-button>
  </nve-card-footer>
</nve-card>
```

Avoid exposing slot APIs as part of the public API. Rather than requiring the consumer to set a slot name on elements, have the element assign its own slot automatically.

```typescript
class Modal {
  redner() {
  	return `
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
    `;
  }
}

class ModalFooter {
  connectedCallback() {
    this.slot = this.slot ?? 'footer';
  }
}
```

If the footer element assigns its own slot it prevents the consumer from having to know or remember the underlying slot names reducing the API surface area.

🎓 Case Study: example of automatic slot assignment

## Rendering

Composition based APIs also provide flexibility for the host application to choose the most appropriate render strategy for large lists of elements. For example, a tree view component can have hundreds or thousands of potential nodes of varying complexity.

```html
<nve-tree>
  <nve-tree-item>item</nve-tree-item>
  <nve-tree-item>item</nve-tree-item>
  <nve-tree-item>item</nve-tree-item>
</nve-tree>
```

```html
<nve-tree>
  <nve-tree-item>item</nve-tree-item>
  <nve-tree-item>item</nve-tree-item>
  <nve-tree-item expanded>
  	<nve-tree-item>item</nve-tree-item>
    <nve-tree-item>item</nve-tree-item>
    <nve-tree-item>item</nve-tree-item>
  </nve-tree-node>
</nve-tree>
```

By leveraging composition the host application has full render control in their native framework API.

```html
<!-- Angular -->
<nve-tree>
  <nve-tree-item *ngFor="let item of items">{{item.id}}</nve-tree-item>
</nve-tree>
```

```tsx
// JSX
<nve-tree>
  {items.map(item => <nve-tree-item>{item.id}</nve-tree-item>)}
</nve-tree>
```

This enables full control of conditional rendering of tree nodes as well as more advanced features like lazy and virtual scrolling.

```html
<!-- Angular, only create nodes if the item meets a certain condition -->
<nve-tree>
  <ng-container *ngFor="let item of items">
    <nve-tree-item *ngIf="item.active">{{item.id}}</nve-tree-item>
  </ng-container>
</nve-tree>
```
