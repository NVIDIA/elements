---
{
  title: 'Stateless',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Escape Hatch - anti-pattern

Elements are intentionally as stateless as possible. This means elements do not maintain any internal state but rather only render based on the information/state passed to the element via properties/attributes. Let's take a look at an example with a modal element.

```html
<nve-modal></nve-modal>
```

With the modal, we want to show or hide based on some application logic. We don't define a open or show property. The logic to determine if the modal should be shown is fully controlled by the application.

<nve-alert status="warning">Warning: Elements can be hidden via CSS, hidden attribute or added/removed from the DOM. Elements should be visible by default, providing the most flexibility to the consumer.</nve-alert>

Instead of defining an `open` or `show` state, we provide a `close` event. This event fires when the user has clicked the close button within the modal. The modal itself does nothing but emit the event. The modal only notifies the application the user had clicked the close button. We leave it to the application to determine what it should do.

This is important as it provides a much more flexible API and prevents "escape hatch" APIs. If the modal controls the visibility state, and the application needs to validate logic before closing, we would have to introduce yet another API to intercept before the close event (example: `onBeforeClose`). Let's take a look at how an Angular app would use a stateless example.

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

Because we defer the state to the application, the developer now has the flexibility to intercept and run additional checks before closing the modal. While this is a subtle difference when compared to the stateful version, it provides a more flexible element and keeps the overall public API surface small.

<nve-alert status="accent">Tip: A guiding principle for element API design is to ask, “Can you prototype/demo any visual state of the element with using only HTML?”</nve-alert>

## Synchronizing State

Stateless elements also prevent the state from becoming out of sync. If our modal retains an internal visibility state, this opens up the potential for bugs where the element is out of sync with the application state. View the demos below to learn more detail about the risks of stateful leaf elements.

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn:&nbsp;<a href="https://stackblitz.com/edit/angular-ivy-cjr3hj?file=src%2Fapp%2Fapp.component.html">Stateless vs Stateful Demo Angular</a></nve-alert>
<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn:&nbsp;<a href="https://stackblitz.com/edit/http-server-kojqdg?file=src%2FApp.tsx">Stateless vs Stateful Demo React</a></nve-alert>

## Stateful Events - anti-pattern

Do not emit/reflect events in response to state being set on the element. This is unnecessary from the consumer API as the application component does not need event updates for the state it maintains . Example: when an expand property is set, do not emit an expand-change event in response. Events should almost always be triggered by only user interactions, not property updates.

<nve-alert status="warning">Reflective state update events can also trigger infinite loops in certain situations.</nve-alert>

Internal state should always be derived from incoming properties and not user actions. Example, setting a expanded property on an element can cause the element to set various css classes or aria-\* attributes to visually and semantically represent the expanded state.

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: web.dev&nbsp;<a href="https://web.dev/custom-elements-best-practices/#events">Custom Element Event Best Practices</a></nve-alert>

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Case Study:&nbsp;<a href="https://github.com/vmware-clarity/core/blob/main/projects/core/src/tag/tag.element.ts#L74">A tag element setting child badge component to align visual status</a></nve-alert>
