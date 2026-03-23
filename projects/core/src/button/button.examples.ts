import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/toggletip/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/search/define.js';

export default {
  title: 'Elements/Button',
  component: 'nve-button'
};

/**
 * @summary Basic button component with standard appearance and behavior for primary user actions.
 */
export const Default = {
  render: () => html`<nve-button>standard</nve-button>`
};

/**
 * @summary Button interaction states including hover, focus, pressed, selected, and disabled.
 * @tags test-case
 */
export const GroupStates = {
  render: () => html`
    <div nve-layout="row gap:xs">
      <nve-button>standard</nve-button>
      <nve-button selected>selected</nve-button>
      <nve-button pressed>pressed</nve-button>
      <nve-button disabled>disabled</nve-button>
    </div>
  `
}

/**
 * @summary Interaction states that communicate button hierarchy, importance, and availability to users.
 */
export const Interaction = {
  render: () => html`
    <div nve-layout="row gap:xs">
      <nve-button>standard</nve-button>
      <nve-button interaction="emphasis">emphasis</nve-button>
      <nve-button interaction="destructive">destructive</nve-button>
    </div>
  `
}

/**
 * @summary Container style variants for buttons to accommodate different visual weight and context.
 */
export const Container = {
  render: () => html`
    <div nve-layout="row gap:xs align:vertical-center">
      <nve-button container="inline">inline</nve-button>
      <nve-button container="flat">flat</nve-button>
      <nve-button>default</nve-button>
    </div>
  `
}

/**
 * @summary Button size variants to accommodate layout densities and touch target requirements.
 */
export const Size = {
  render: () => html`
    <div nve-layout="row gap:xs">
      <nve-button size="sm">small button</nve-button>
      <nve-button>standard button</nve-button>
      <nve-button size="lg">large button</nve-button>
    </div>
  `
}

/**
 * @summary Pressed state for toggle buttons marking active/selected state with clear visual feedback.
 */
export const Pressed = {
  render: () => html`
    <div nve-layout="row gap:xs align:vertical-center">
      <nve-button pressed container="inline">pressed inline</nve-button>
      <nve-button pressed container="flat">pressed flat</nve-button>
      <nve-button pressed>pressed</nve-button>
    </div>
  `
}

/**
 * @summary Button selection states to accommodate different visual weight and context.
 */
export const Selected = {
  render: () => html`
    <div nve-layout="row gap:xs align:vertical-center">
      <nve-button selected container="inline">selected inline</nve-button>
      <nve-button selected container="flat">selected flat</nve-button>
      <nve-button selected>selected</nve-button>
    </div>
  `
}

/**
 * @summary Button disabled states to accommodate different visual weight and context.
 */
export const Disabled = {
  render: () => html`
    <div nve-layout="row gap:xs align:vertical-center">
      <nve-button disabled container="inline">disabled inline</nve-button>
      <nve-button disabled container="flat">disabled flat</nve-button>
      <nve-button disabled>disabled</nve-button>
    </div>
  `
}

/**
 * @summary Use the `commandfor` and `command` attributes to trigger custom Invoker Commands, such as rotating an image.
 */
export const InvokerCommand = {
  render: () => html`
    <img id="logo" src="https://NVIDIA.github.io/elements/favicon.svg" alt="logo" style="width: 100px; height: 100px;" />
    <section>
      <nve-button commandfor="logo" command="--rotate-left">Rotate left</nve-button>
      <nve-button commandfor="logo" command="--rotate-right">Rotate right</nve-button>
      <nve-button commandfor="popover" command="toggle-popover">toggle-popover</nve-button>
    </section>
    <nve-toggletip id="popover">popover</nve-toggletip>
    <script type="module">
      const logo = document.getElementById('logo');
      logo.addEventListener('command', (event) => {
        if (event.command == '--rotate-left') {
          logo.style.rotate = '-90deg';
        } else if (event.command == '--rotate-right') {
          logo.style.rotate = '90deg';
        }
      });
    </script>
  `
};

/**
 * @summary Button with icons positioned before or after text to enhance visual clarity and user understanding.
 */
export const WithIcon = {
  render: () => html`
    <nve-button><nve-icon name="person"></nve-icon> button</nve-button>
    <nve-button>button <nve-icon name="person"></nve-icon></nve-button>
  `
};

/**
 * @summary Flat button style for secondary actions with minimal visual weight, maintaining clear interaction states.
 */
export const Flat = {
  render: () => html`
    <div nve-layout="row gap:xs">
      <nve-button container="flat">standard</nve-button>
      <nve-button container="flat" interaction="emphasis">emphasis</nve-button>
      <nve-button container="flat" interaction="destructive">destructive</nve-button>
      <nve-button container="flat" disabled>disabled</nve-button>
    </div>
  `
}

/**
 * @summary Inline button style for text-like actions that blend with content while maintaining button functionality.
 */
export const Inline = {
  render: () => html`
    <div nve-layout="row gap:xs">
      <nve-button container="inline">standard</nve-button>
      <nve-button container="inline" interaction="emphasis">emphasis</nve-button>
      <nve-button container="inline" interaction="destructive">destructive</nve-button>
      <nve-button container="inline" disabled>disabled</nve-button>
    </div>
  `
}

/**
 * @summary Button styling applied to links for consistent visual treatment while maintaining semantic navigation behavior.
 */
export const Link = {
  render: () => html`
    <div nve-layout="row gap:xs"> 
      <nve-button><a href="#">standard</a></nve-button>
      <nve-button interaction="emphasis"><a href="#">emphasis</a></nve-button>
      <nve-button interaction="destructive"><a href="#">destructive</a></nve-button>
      <nve-button disabled><a href="#">disabled</a></nve-button>
    </div>
  `
}

/**
 * @summary Flat button selection state for choice groups where one option is active, providing clear selection feedback.
 */
export const SelectedFlat = {
  render: () => html`
    <div nve-layout="row gap:xs">
      <nve-button selected container="flat">selected</nve-button>
      <nve-button container="flat">unselected</nve-button>
    </div>
  `
}

/**
 * @summary Flat button styling for navigation links, providing subtle visual treatment for secondary navigation actions.
 */
export const LinkFlat = {
  render: () => html`
    <div nve-layout="row gap:xs">
      <nve-button container="flat"><a href="#">flat</a></nve-button>
      <nve-button container="flat" interaction="emphasis"><a href="#">flat emphasis</a></nve-button>
      <nve-button container="flat" interaction="destructive"><a href="#">flat destructive</a></nve-button>
    </div>
  `
}

/**
 * @summary Text wrapping behavior in constrained widths, where content adapts to available space.
 * @tags test-case
 */
export const NoWrap = {
  render: () => html`
    <nve-button style="--width: 100px">item item item</nve-button>
    <nve-button style="--width: 100px">
      <span>item</span><span>item</span><span>item</span>
    </nve-button>
  `
}

/**
 * @summary Form submission button with proper form integration and data handling for user input processing.
 */
export const FormSubmit = {
  render: () => html`
<form id="test-form">
  <nve-button name="test-button" value="test-value">submit</nve-button>
</form>
<script type="module">
  const form = document.querySelector('#test-form');
  const button = document.querySelector('[name="test-button"]');

  button.addEventListener('click', e => console.log(e));
  form.addEventListener('submit', e => {
    e.preventDefault();
    console.log(Object.fromEntries(new FormData(form, e.submitter)));
  });
</script>
`
}

/**
 * @summary Form control option allows a button to adopt control field styling. This helps when using a button to trigger custom form control components or dropdowns.
 */
export const FormControl = {
  render: () => html`
<div nve-layout="row gap:xs" style="max-width: 400px">
  <nve-search>
    <input type="search" placeholder="search" aria-label="search" />
  </nve-search>
  <nve-button nve-control>filter option <nve-icon name="caret" direction="down" size="sm"></nve-icon></nve-button>
</div>
  `
}

/**
 * @summary Button integrated with popover API to trigger contextual overlays, providing extra information or controls.
 * @tags test-case
 */
export const Popover = {
  render: () => html`
  <div popover id="popover-example">popover</div>
  <nve-button popovertarget="popover-example">toggle</nve-button>
  `
}

/**
 * @summary Override button appearance with custom CSS properties for brand-specific designs while maintaining functionality.
 * @tags test-case
 */
export const BackgroundOverride = {
  render: () => html`
    <style>
      nve-button.custom {
        --color: var(--nve-sys-text-black-color);
        --background-image: linear-gradient(340deg, rgb(255 234 177) 0%, var(--nve-ref-color-yellow-amber-900) 60%);

        &:hover {
          --background-image: linear-gradient(340deg, rgb(255 234 177) 0%, color-mix(in oklab, var(--nve-ref-color-yellow-amber-900) 100%, #000 4%) 60%);
        }
      }
    </style>

    <nve-button class="custom">Create Account</nve-button>
    <nve-button>Create Account</nve-button>
  `
};

/**
 * @summary Button styled as a link by slotting an anchor tag inside. Use when an action needs button visual treatment while maintaining semantic link navigation and accessibility.
 */
export const ValidLinkButton = {
  render: () => html`
    <nve-button><a href="#">default</a></nve-button>
  `
}

/**
 * @summary Do not wrap buttons in anchor tags.
 * @tags anti-pattern
 */
export const InvalidLinkButton = {
  render: () => html`
    <a href="#"><nve-button>default</nve-button></a>
  `
}
