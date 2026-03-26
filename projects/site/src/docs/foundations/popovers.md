---
{
  title: 'Popovers',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Elements provides a set of popover type components built on the native browser [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)

## Available Elements

- [tooltip](./docs/elements/tooltip/): contextual text only hints
- [toggletip](./docs/elements/toggletip/): contextual interactive hints
- [dropdown](./docs/elements/dropdown/): interactive navigation or form content
- [dialog](./docs/elements/dialog/): large interactive content, interrupts user flow
- [toast](./docs/elements/toast/): contextual notification
- [notification](./docs/elements/notification/): async non contextual notification
- [drawer](./docs/elements/drawer/): interactive navigation or extra contextual content

## Installation

```typescript
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/toast/define.js';
import '@nvidia-elements/core/notification/define.js';
```

{% example '@nvidia-elements/core/internal/controllers/popover.examples.json' 'Interactive' '{ "inline": false, "height": "450px" }' %}

## Usage

```html
<nve-tooltip id="tooltip">hello there</nve-tooltip>
<nve-button popovertarget="tooltip">button</nve-button>
```

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Default' '{ "inline": false, "height": "150px" }' %}

## Events

Some popover types such as tooltip have complex interactions such as showing when hovered or focused. To simplify these interactions all popover type elements provide a `open` and `close` event to notify when the popover is attempting to close or open based on a user interaction. You can also listen
to the native `toggle` or `beforetoggle` popover events.

- [toggle](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event)
- [beforetoggle](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event)

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Events' '{ "inline": false, "height": "150px" }' %}

## Programmatic Trigger

You can trigger popovers manually via the native popover APIs.

- [showPopover()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/showPopover)
- [hidePopover()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/hidePopover)
- [togglePopover()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/togglePopover)

{% example '@nvidia-elements/core/internal/controllers/popover.examples.json' 'ProgrammaticTrigger' '{ "inline": false, "height": "150px" }' %}

## Positioning

All popovers follow the same `position` and `alignment` APIs. This allows popovers to position themselves relative to their anchor.

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Alignment' '{ "inline": false, "height": "400px" }' %}

## Anchor

The `anchor` property defines what element the popover should position itself relative to. For popovers like modals this defaults to the document body. The Anchor is optional as the popover uses the trigger to determine its anchor by default.

{% example '@nvidia-elements/core/internal/controllers/popover.examples.json' 'Anchor' '{ "inline": false, "height": "250px" }' %}

For elements like tooltips this is often the same as anchor but the anchor and trigger are not always the same as UX patterns such as guided tours may have trigger elements that are not the anchored position. Both `anchor` and `trigger` can take a string idref or a DOM Element reference.

## Closable

<!-- {{ELEMENTS_REPO_BASE_URL}}/-/issues/86#note_27211667 -->

Many of the popovers provide a closable property option. This enables a close button on the popover. When using native HTML popover APIs, it's important to understand how they handle closure via the escape key.
Unlike some third-party solutions, browser-native popovers disable escape key prevention for closure by design, ensuring a seamless user experience. Similarly, native dialogs follow a similar pattern (chromium): only the first press of the escape key can prevent the dialog from closing,
while later presses have no effect. This behavior is for accessibility, preventing a popover from closing can prevent the user from navigating the page and block functionality.

{% example '@nvidia-elements/core/internal/controllers/popover.examples.json' 'Closable' '{ "inline": false, "height": "400px" }' %}

## Nested

{% example '@nvidia-elements/core/internal/controllers/popover.examples.json' 'Nested' '{ "inline": false, "height": "400px" }' %}

## Event Bubbling

{% example '@nvidia-elements/core/internal/controllers/popover.examples.json' 'EventBubbling' '{ "inline": false, "height": "400px" }' %}

## Invoker Commands

The Invoker Command APIs can also dispatch command events to show and hide popovers.

{% example '@nvidia-elements/core/dialog/dialog.examples.json' 'InvokerCommand' '{ "inline": false, "height": "400px" }' %}

## Shadow Root Anchoring

Native [CSS Anchor Positioning](https://developer.chrome.com/blog/anchor-positioning-api) allows two elements to tether together via a unique identifier. This is commonly used for popover-like elements. CSS Anchor Positioning recently enabled cross root associations. https://github.com/w3c/csswg-drafts/issues/9408.

But the declarative native popover API requires popovers and the trigger/source to still exist within the same render root and not separate by Shadow DOM. Elements attempts to bridge this gap by traversing and making the association for the trigger and popover. This is not 100% reliable, in general popovers should ideally be within the same render root for best performance.
