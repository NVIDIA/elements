import { html } from 'lit';
import { appendRootNodeStyle, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import globalStyles from './color.global.css?inline';
import styles from './color.css?inline';

/**
 * @element mlv-color
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-color-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=157-16178&t=CAAM7yEBvG18tRRa-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color
 */
export class Color extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-color',
    version: 'PACKAGE_VERSION'
  };

  protected get suffixContent() {
    return html`<mlv-icon-button icon-name="dropper" interaction="ghost" @click=${() =>  this.#select()}></mlv-icon-button>`;
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);

    if (this.input.value === '#000000' || this.input.value === '') {
      this.input.value = getComputedStyle(this).getPropertyValue('--background').trim();
    }
  }

  #select() {
    new (window as any).EyeDropper().open().then(color => this.input.value = color.sRGBHex).catch(() => null);
  }
}
