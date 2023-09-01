import { html } from 'lit';
import { appendRootNodeStyle, openEyeDropper, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import globalStyles from './color.global.css?inline';
import styles from './color.css?inline';

/**
 * @element mlv-color
 * @description A color picker is a control that enables users to choose a color value.
 * @since 0.3.0
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-color-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=157-16178&t=CAAM7yEBvG18tRRa-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color
 * @vqa false
 */
export class Color extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-color',
    version: 'PACKAGE_VERSION'
  };

  protected get suffixContent() {
    return html`<mlv-icon-button icon-name="dropper" interaction="flat" @click=${() =>  this.#select()}></mlv-icon-button>`;
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
    if (this.input.value === '#000000') {
      this.input.value = getComputedStyle(this).getPropertyValue('--background').trim();
    }
  }

  async #select() {
    this.input.value = await openEyeDropper();
  }
}
