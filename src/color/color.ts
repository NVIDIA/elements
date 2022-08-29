import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './color.css?inline';

declare const EyeDropper: any;

/**
 * @alpha
 * @element nve-color
 */
export class Color extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  protected get suffixContent() {
    return html`<nve-icon-button icon-name="free-text" interaction="ghost" @click=${() =>  this.#select()}></nve-icon-button>`;
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.input.value === '#000000' || this.input.value === '') {
      this.input.value = getComputedStyle(this).getPropertyValue('--background').trim();
    }
  }

  #select() {
    new (window as any).EyeDropper().open().then(color => this.input.value = color.sRGBHex).catch(() => {});
  }
}
