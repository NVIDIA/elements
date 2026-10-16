---
{
  title: 'Stateless',
  description: 'How NVIDIA Elements keeps business state in the application, and how dialog presentation uses the browser Popover API.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Application state and presentation state

Elements keep business state in the application. A component can still manage interaction details, and the browser can manage presentation. [`nve-dialog`](/docs/elements/dialog/) is the current dialog. It uses the native [Popover API](/docs/foundations/popovers/).

The application owns the decision to accept, reject, or validate work. The browser owns whether the dialog is showing. `nve-dialog` sets the `popover` attribute to `auto` when `modal` is present and to `manual` otherwise. Open and close that presentation with `popovertarget`, [invoker commands](/docs/foundations/popovers/#invoker-commands), or the native `showPopover()` and `hidePopover()` methods.

`closable` adds a close button. On a modal dialog it also allows a click outside the dialog to dismiss it. Those controls change presentation. They do not store the application's result.

The dialog dispatches `beforetoggle` and `toggle` from the Popover API, then dispatches `open` or `close` after the presentation changes. Listen to those events when application state needs to follow the dialog. The `close` event reports a dialog that has already closed. It does not wait for application validation.

Native popovers also close when the user presses Escape. The [popover guide](/docs/foundations/popovers/#closable) describes that behavior.

<nve-alert status="warning">You can hide an element with the `hidden` attribute, CSS, or by removing it from the DOM. For `nve-dialog`, use the Popover API so focus and the top layer stay with the browser.</nve-alert>

### Confirm in application code

This example opens a modal dialog from a button. The Save button runs application logic, then calls `hidePopover()` only when that logic accepts the change. The close button, an outside click, and Escape can still hide the dialog, because the browser owns that presentation.

```html
<div nve-layout="column gap:md">
  <nve-button popovertarget="review-dialog">Review changes</nve-button>
  <nve-dialog id="review-dialog" modal closable>
    <nve-dialog-header>
      <h2 nve-text="heading semibold">Review changes</h2>
    </nve-dialog-header>
    <p nve-text="body">Save these settings before you leave this page.</p>
    <nve-dialog-footer>
      <nve-button id="save-changes" interaction="emphasis">Save</nve-button>
    </nve-dialog-footer>
  </nve-dialog>
</div>
```

```html
<script type="module">
  import '@nvidia-elements/core/button/define.js';
  import '@nvidia-elements/core/dialog/define.js';

  const dialog = document.querySelector('#review-dialog');
  const save = document.querySelector('#save-changes');

  save.addEventListener('click', async () => {
    const accepted = await acceptChanges();
    if (accepted) {
      dialog.hidePopover();
    }
  });

  dialog.addEventListener('close', () => {
    console.log('dialog presentation closed');
  });

  async function acceptChanges() {
    return true;
  }
</script>
```

`nve-layout` and `nve-text` come from `@nvidia-elements/styles`. Import `layout.css` and `typography.css` with the theme when you use them outside the documentation site. The dialog import also registers `nve-dialog-header` and `nve-dialog-footer`.

In Chrome, opening this modal dialog moves focus to the dialog. Tab reaches the close button. Escape closes the dialog and returns focus to the trigger. A `beforetoggle` event for that close is not cancelable, so application code cannot veto Escape, the close button, or `hidePopover()`.

<nve-alert status="accent">Tip: ask whether you can show each visual state in HTML. `popovertarget`, `modal`, and `closable` cover open and closed dialog presentation. The acceptance decision stays in application code.</nve-alert>

## Synchronizing state

Keep a copy of presentation state in the application only when another view depends on it. The browser can close a dialog through Escape, the close button, or an outside click. If the application also stores an open flag, update that flag from `toggle` or `close` so the two stay aligned.

<nve-alert><nve-icon slot="icon" name="academic-cap"></nve-icon> Learn:&nbsp;<a href="/docs/elements/dialog/">dialog events and examples</a></nve-alert>

## Stateful events

Do not emit an event because application code set a property. The application already knows the value it wrote. Emit events for user or browser interaction. Setting `expanded` can update CSS classes and ARIA state inside the element. That property update should not also emit an expand-change event.

<nve-alert status="warning">An event that echoes a property write can loop when the listener writes the property again.</nve-alert>

`open` and `close` on `nve-dialog` follow the popover toggle. They are interaction events, not echoes of a property assignment.

<nve-alert><nve-icon slot="icon" name="academic-cap"></nve-icon> Learn: web.dev&nbsp;<a href="https://web.dev/custom-elements-best-practices/#events">Custom Element Event Best Practices</a></nve-alert>
