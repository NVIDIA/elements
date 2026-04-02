import { html } from 'lit';

import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/notification/define.js';

export default {
  title: 'Elements/Icon',
  component: 'nve-icon'
};

/* eslint-disable @nvidia-elements/lint/no-unexpected-attribute-value */

/**
 * @summary Basic icon component with standard appearance and usage for visual communication and interface navigation.
 */
export const Default = {
  render: () => html`<nve-icon name="person"></nve-icon>`
};

/**
 * @summary Semantic color variations to communicate different states, priorities, and contextual meanings in user interfaces.
 */
export const Statuses = {
  render: () => html`
    <nve-icon name="person"></nve-icon>
    <nve-icon name="person" status="accent"></nve-icon>
    <nve-icon name="person" status="success"></nve-icon>
    <nve-icon name="person" status="warning"></nve-icon>
    <nve-icon name="person" status="danger"></nve-icon>
  `
}

/**
 * @summary Icon size variants to accommodate layout densities, touch targets, and visual hierarchy requirements.
 */
export const Size = {
  render: () => html`
    <nve-icon name="person" size="sm"></nve-icon>
    <nve-icon name="person"></nve-icon>
    <nve-icon name="person" size="lg"></nve-icon>
  `
}

/**
 * @summary Directional icons for navigation, movement, and spatial relationships, providing clear visual cues for user actions.
 */
export const Direction = {
  render: () => html`
    <nve-icon name="arrow-stop" direction="left"></nve-icon>
    <nve-icon name="arrow-stop" direction="right"></nve-icon>
    <nve-icon name="arrow" direction="up"></nve-icon>
    <nve-icon name="arrow" direction="down"></nve-icon>
    <nve-icon name="arrow" direction="left"></nve-icon>
    <nve-icon name="arrow" direction="right"></nve-icon>
    <nve-icon name="caret" direction="up"></nve-icon>
    <nve-icon name="caret" direction="down"></nve-icon>
    <nve-icon name="caret" direction="left"></nve-icon>
    <nve-icon name="caret" direction="right"></nve-icon>
    <nve-icon name="chevron" direction="up"></nve-icon>
    <nve-icon name="chevron" direction="down"></nve-icon>
    <nve-icon name="chevron" direction="left"></nve-icon>
    <nve-icon name="chevron" direction="right"></nve-icon>
  `
}

/**
 * @summary Icon appearance across light and dark themes, ensuring proper contrast and visibility in different visual environments.
 * @tags test-case
 */
export const Themes = {
  render: () => html`
    <div nve-theme="root light">
      <nve-icon name="person"></nve-icon>
      <nve-icon name="person" status="accent"></nve-icon>
      <nve-icon name="person" status="success"></nve-icon>
      <nve-icon name="person" status="warning"></nve-icon>
      <nve-icon name="person" status="danger"></nve-icon>
    </div>
    <div nve-theme="root dark">
      <nve-icon name="person"></nve-icon>
      <nve-icon name="person" status="accent"></nve-icon>
      <nve-icon name="person" status="success"></nve-icon>
      <nve-icon name="person" status="warning"></nve-icon>
      <nve-icon name="person" status="danger"></nve-icon>
    </div>
  `
}

/**
 * @summary Register SVG paths and make them accessible to the `<nve-icon>` element. Define icons via a string or async function returning the resulting string.
 * @tags test-case
 */
export const Registration = {
  render: () => html`
    <nve-icon name="smile" style="--width: 75px; --height: 75px;"></nve-icon>

    <script type="module">
      customElements.get('nve-icon').add({
        'smile': {
          svg: () => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="3"/><circle cx="18" cy="20" r="2" fill="currentColor"/><circle cx="30" cy="20" r="2" fill="currentColor"/><path d="M17 29c1.5 2.5 4.2 4 7 4s5.5-1.5 7-4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'
        }
      });
    </script>
  `
}

/**
 * @summary Alias icons to a different name. This supports context-specific names or migrations between icon sets.
 * @tags test-case
 */
export const Alias = {
  render: () => html`
    <script type="module">
      await customElements.whenDefined('nve-icon');
      customElements.get('nve-icon').alias({
        attached: 'paper-clip'
      });
    </script>
    <nve-icon name="paper-clip"></nve-icon>
    <nve-icon name="attached"></nve-icon>
  `
}

/**
 * @summary Provide direct SVG paths for rendering.
 * @tags test-case
 */
export const Source = {
  render: () => html`
    <nve-icon name="/static/images/test-image-1.svg" style="--width: 75px; --height: 75px;"></nve-icon>
  `
}
