import { html } from 'lit';
import { appendRootNodeStyle, openEyeDropper, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { inputStyles } from '@nvidia-elements/core/input';
import globalStyles from './color.global.css?inline';
import styles from './color.css?inline';

/**
 * @element nve-color
 * @description A color picker is a control that enables users to choose a color value.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/color
 * @storybook https://NVIDIA.github.io/elements/docs/elements/color/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=157-16178&t=CAAM7yEBvG18tRRa-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color
 * @themes false
 */
export class Color extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-color',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  protected get suffixContent() {
    return html`<nve-icon-button .role=${'button'} .ariaLabel=${this.i18n.expand} icon-name="dropper" container="inline" @click=${() => this.#select()}></nve-icon-button>`;
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
    if (this.input.value === '#000000') {
      const color = getComputedStyle(this).getPropertyValue('--background').trim();
      if (color.includes('#')) {
        this.input.value = color;
      }
    }
  }

  async #select() {
    this.input.value = await openEyeDropper();
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
