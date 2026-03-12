import { css, html, LitElement } from 'lit';
import { typeTouch } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Internal/Controllers'
}

@typeTouch<TouchDemoElement>()
class TouchDemoElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        position: fixed;
        width: 50px;
        height: 50px;
        outline: 1px solid red;
      }
    `,
  ];
}

customElements.get('type-touch-controller-demo-element') || customElements.define('type-touch-controller-demo-element', TouchDemoElement);

/**
 * @summary Touch controller with drag-to-move behavior dispatching start, move, and end events.
 * @tags test-case
 */
export const TouchDemo = {
  render: () => html`
  <type-touch-controller-demo-element></type-touch-controller-demo-element>
  <script type="module">
    const element = document.querySelector('type-touch-controller-demo-element');
    const container = document.querySelector('#touch-demo-container');
    element.addEventListener('nve-touch-start', e => console.log(e.type));
    element.addEventListener('nve-touch-move', position => {
      console.log(position.type);
      element.style.left = position.x + 'px';
      element.style.top = position.y + 'px';
    });
    element.addEventListener('nve-touch-end', e => console.log(e.type));
  </script>
  `
}
