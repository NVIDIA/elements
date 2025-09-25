import { html, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { useStyles, I18nController } from '@nvidia-elements/core/internal';
import { Button } from '@nvidia-elements/core/button';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './copy-button.css?inline';

/**
 * @element nve-copy-button
 * @description A copy button is a button that easily enables the copy to clipboard pattern.
 * @since 1.1.4
 * @entrypoint \@nvidia-elements/core/copy-button
 * @slot - default
 * @slot icon - slot for custom icon
 * @storybook https://NVIDIA.github.io/elements/docs/elements/copy-button/
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=8776-101652&t=1wXXkUNtvP4Bz5RY-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 *
 */
export class CopyButton extends Button {
  @state() private copied = false;

  @state() private showToast = false;

  @state() private showTooltip = false;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /**
   * Determines if the copy button should auto write to clipboard by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-copy' }) behaviorCopy: boolean;

  /**
   * Defines the value to be copied to user clipboard. Use `aria-label` to set the tooltip hint.
   */
  @property({ type: String, reflect: true }) value: string;

  static styles = useStyles([...Button.styles, styles]);

  static readonly metadata = {
    tag: 'nve-copy-button',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  // todo
  /* eslint-disable @nvidia-elements/lint/no-deprecated-popover-attributes */
  render() {
    return html`
     <div id="btn" internal-host interaction-state focus-within>
        <slot></slot>
        ${
          this.copied
            ? html`<nve-icon name="check" status="success" .size=${this.size} aria-hidden="true"></nve-icon>`
            : html`<slot name="icon"><nve-icon name="copy" .size=${this.size} aria-hidden="true"></nve-icon></slot>`
        }
     </div>
     ${this.showToast ? html`<nve-toast @close=${this.#close} status="success" anchor="btn" trigger="btn" position="top" close-timeout="1500">${this.i18n.copied}</nve-toast>` : nothing}
     ${this.showTooltip && !this.showToast ? html`<nve-tooltip anchor="btn" trigger="btn">${this.ariaLabel ?? this.i18n.copy}</nve-tooltip>` : nothing}
   `;
  }

  constructor() {
    super();
    this.addEventListener('click', this.#copy);
    this.addEventListener('mouseenter', this.#openTooltip);
    this.addEventListener('mouseleave', this.#closeTooltip);
  }

  #copy() {
    if (this.behaviorCopy) {
      navigator.clipboard
        .writeText(this.value)
        .then(() => {
          this.showToast = true;
          this.copied = true;
        })
        .catch(err => {
          this.showToast = false;
          console.error(err);
        });
    }
  }

  #close() {
    this.showToast = false;
    this.copied = false;
    this.showTooltip = false;
  }

  #openTooltip() {
    this.showTooltip = true;
  }

  #closeTooltip() {
    this.showTooltip = false;
  }
}
