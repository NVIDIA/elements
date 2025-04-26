import { css, html, LitElement } from 'lit';
import type { PropertyValues } from 'lit';

import { customElement } from 'lit/decorators/custom-element.js';
import type { Ref } from 'lit/directives/ref.js';
import { ref, createRef } from 'lit/directives/ref.js';

import '@nvidia-elements/core/tooltip/define.js';

@customElement('dynamic-anchor-position-demo')
export class DynamicAnchorPositionDemo extends LitElement {
  /* eslint no-unused-vars: 0 */
  static styles = [
    css`
    :host {
      position: relative;
      width: 97vw;
      height: 97vh;
      display: block;
      left: 0;
      transition: left 1s linear;
    }

    #anchor {
      top: 50vh;
      left: 50vw;
      width: 1px;
      height: 1px;
      position: absolute;
    }
  `
  ];

  #anchor: Ref<HTMLElement> = createRef();

  render() {
    return html`
      <!-- <div ${ref(this.#anchor)} id="anchor"></div> -->
       <!-- TODO why is this not working? https://issues.chromium.org/issues/391903229 -->
      <nve-tooltip anchor="anchor">tooltip</nve-tooltip>
    `;
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.addEventListener(
      'mousemove',
      e => (this.#anchor.value.style.inset = `${e.clientY - 15}px auto auto ${e.clientX - 15}px`)
    );
  }
}
