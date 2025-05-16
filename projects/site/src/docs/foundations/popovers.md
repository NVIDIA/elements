---
{
  title: 'Popovers',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Elements provides a set of popover type components based on the popover spec and aria guidelines.

- [popover spec](https://open-ui.org/components/popup.research.explainer)
- [w3c aria patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)

## Available Elements

- [tooltip](./docs/elements/tooltip/): contextual text only hints
- [toggletip](./docs/elements/toggletip/): contextual interactive hints
- [dropdown](./docs/elements/dropdown/): interactive navigation or form content
- [dialog](./docs/elements/dialog/): large interactive content, interrupts user flow
- [toast](./docs/elements/toast/): contextual notification
- [notification](./docs/elements/notification/): async non contextual notification
- [drawer](./docs/elements/drawer/): interactive navigation or additional contextual content

## Installation

```typescript
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/toast/define.js';
import '@nvidia-elements/core/notification/define.js';
```

{% story '@nvidia-elements/core/internal/controllers/popover.stories.json', 'Interactive' %}

## Usage

Element popover types use the browser standard [Popover API](https://developer.chrome.com/blog/introducing-popover-api)

```html
<nve-tooltip id="tooltip">hello there</nve-tooltip>
<nve-button popovertarget="tooltip">button</nve-button>
```

{% story 'nve-tooltip', 'Default', '{ "inline": false, "height": "150px" }' %}

## Events

Some popover types such as tooltip have complex interactions such as showing when hovered or focused. To simplify these interactions all popover type elements provide a `open` and `close` event to notify when the popover is attempting to close or open based on a user interaction. You can also listen
to the native `toggle` or `beforetoggle` popover events.

{% story 'nve-tooltip', 'Events', '{ "inline": false, "height": "400px" }' %}

```html
<nve-tooltip id="tooltip">hello there</nve-tooltip>
<nve-button popovertarget="tooltip">button</nve-button>
<script type="module">
  const tooltip = document.querySelector('nve-tooltip');
  tooltip.addEventListener('close', () => console.log('close'));
  tooltip.addEventListener('open', () => console.log('open'));
</script>
```

## Positioning

All popovers follow the same `position` and `alignment` APIs. This allows popovers to be positioned relative to their anchor.

{% story 'nve-tooltip', 'Alignment', '{ "inline": false, "height": "400px" }' %}

## Anchor

The `anchor` property defines what element the popover should position itself relative to. For popovers like modals this defaults to the document body. The Anchor is optional as the popover will use the trigger to determine its anchor by default.

{% story '@nvidia-elements/core/internal/controllers/popover.stories.json', 'Anchor', '{ "inline": false, "height": "250px" }' %}

For elements like tooltips this is often the same as anchor however the anchor and trigger are not always the same as UX patterns such as guided tours may have trigger elements that are not the anchored position. Both `anchor` and `trigger` can take a string idref or a DOM Element reference.

## Closable

<!-- https://github.com/NVIDIA/elements/-/issues/86#note_27211667 -->

Many of the popovers provide a closable property option. This will enable a close button on the popover. When using native HTML popover APIs, it's important to understand how they handle closure via the escape key.
Unlike some third-party solutions, browser-native popovers are designed to disable escape key prevention for closure, ensuring a seamless user experience. Similarly, native dialogs follow a similar pattern (chromium): only the first press of the escape key can be prevented from closing the dialog,
while subsequent presses have no effect. This behavior is for accessibility, preventing a popover from closing can prevent the user from navigating the page and block functionality completely.

{% story '@nvidia-elements/core/internal/controllers/popover.stories.json', 'Closable' %}

## Nested

{% story '@nvidia-elements/core/internal/controllers/popover.stories.json', 'Nested', '{ "inline": false, "height": "400px" }' %}

## Shadow Root Anchoring

Native [CSS Anchor Positioning](https://developer.chrome.com/blog/anchor-positioning-api) allows two elements to be tethered together via a unique identifier. This is commonly used for popover-like elements. However CSS Anchor Positioning is limited to only positioning two elements in the same render root. Examples of rendering accross render roots include in different Shadow Dom Roots or popover top layer instances. This behavior/compatibility issue is being tracked https://github.com/w3c/csswg-drafts/issues/9408.

Element popover positioning will detect instances of cross Shadow Root anchoring attempts and fallback to a JavaScript based positioning system.
This will allow the popover to anchor correctly but at the cost of render reliability and performance when compared to native CSS Anchor Positioning.
