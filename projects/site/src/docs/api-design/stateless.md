---
{
  title: 'Stateless',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Escape Hatch - anti-pattern

Elements are intentionally as stateless as possible. This means elements do not maintain any internal state but rather only render based on the information/state passed to the element via properties/attributes. Consider the following example with a modal element.

```html
<nve-modal></nve-modal>
```

With the modal, the goal is to show or hide based on some application logic. No open or show property exists. The application fully controls the logic to determine whether to show the modal.

<nve-alert status="warning">Warning: you can hide Elements via CSS, hidden attribute or add/remove them from the DOM. Elements should remain visible by default, providing the most flexibility to the consumer.</nve-alert>

Instead of defining an `open` or `show` state, the element provides a `close` event. This event fires when the user has clicked the close button within the modal. The modal itself does nothing but emit the event. The modal only notifies the application the user had clicked the close button. The application then determines what it should do.

This is important as it provides a much more flexible API and prevents "escape hatch" APIs. If the modal controls the visibility state, and the application needs to check logic before closing, yet another API would need to intercept before the close event (example: `onBeforeClose`). Consider how an Angular app would use a stateless example.

```html
<nve-button (click)="showModal = true">open modal</nve-modal>

<nve-modal *ngIf="showModal" (close)="closeModal($event.detail)">
  Some Content
</nve-modal>
```

```typescript
export class AppComponent {
  showModal = false;

  async closeModal() {
    const valid: boolean = await someAsyncValidationCheck();

    if (valid) {
      this.showModal = false;
    } else {
      warnOfPotentialIssues();
    }
  }
}
```

Because the application manages the state, the developer now has the flexibility to intercept and run extra checks before closing the modal. While this is a subtle difference when compared to the stateful version, it provides a more flexible element and keeps the public API surface small.

<nve-alert status=”accent”>Tip: a guiding principle for element API design is to ask, “Can you prototype/demo any visual state of the element with using only HTML?”</nve-alert>

## Synchronizing State

Stateless elements also prevent the state from becoming out of sync. If the modal retains an internal visibility state, this opens up the potential for bugs where the element is out of sync with the application state. View the demos below to learn more detail about the risks of stateful leaf elements.

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn:&nbsp;<a href="https://stackblitz.com/edit/angular-ivy-cjr3hj?file=src%2Fapp%2Fapp.component.html">stateless vs stateful demo in Angular</a></nve-alert>
<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn:&nbsp;<a href="https://stackblitz.com/edit/http-server-kojqdg?file=src%2FApp.tsx">stateless vs stateful demo in React</a></nve-alert>

## Stateful Events - anti-pattern

Do not emit/reflect events in response to setting state on the element. This is unnecessary from the consumer API as the application component does not need event updates for the state it maintains. Example: when you set an expand property, do not emit an expand-change event in response. Only user interactions, not property updates, should trigger events.

<nve-alert status="warning">Reflective state update events can also trigger infinite loops in certain situations.</nve-alert>

Always derive internal state from incoming properties and not user actions. Example, setting a expanded property on an element can cause the element to set css classes and aria-\* attributes to visually and semantically represent the expanded state.

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: web.dev&nbsp;<a href="https://web.dev/custom-elements-best-practices/#events">Custom Element Event Best Practices</a></nve-alert>

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Case Study:&nbsp;<a href="https://github.com/vmware-clarity/core/blob/main/projects/core/src/tag/tag.element.ts#L74">a tag element setting child badge component to align visual status</a></nve-alert>
