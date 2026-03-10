import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { PopoverType, Size } from '@nvidia-elements/core/internal';
import {
  createGhostElement,
  I18nController,
  popoverStyles,
  scopedRegistry,
  TypeNativePopoverController,
  typeSSR,
  useStyles
} from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import styles from './drawer.css?inline';

/**
 * @element nve-drawer
 * @description Drawer are to display content that is out of context of the rest of the page (notifications, navigation, settings). Or use [Panel](./docs/elements/panel/) inline as its content couples with or closely relates to the content on the page (details, extra actions/options). [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
 * @since 0.16.0
 * @entrypoint \@nvidia-elements/core/drawer
 * @event beforetoggle - Dispatched on a popover just before showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event)
 * @event toggle - Dispatched on a popover element just after showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event)
 * @event open - Dispatched when the drawer opens.
 * @event close - Dispatched when the drawer closes.
 * @slot - default content slot
 * @cssprop --border
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --gap
 * @cssprop --top
 * @cssprop --max-width
 * @cssprop --width
 * @cssprop --animation-duration - Duration of drawer open/close animations
 * @csspart icon-button - The close icon button element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
@typeSSR()
@scopedRegistry()
export class Drawer extends LitElement {
  /**
   * Sets the side position of the popover relative to the provided anchor element.
   * For drawer the anchor defaults to the document body.
   */
  @property({ type: String, reflect: true }) position: 'left' | 'right' | 'bottom' | 'top' = 'left';

  /**
   * Sets the max size of the drawer.
   */
  @property({ type: String, reflect: true }) size?: Size;

  /**
   * Determines if a close button should render within drawer. Non-closable
   * drawers suit drawers that require user confirmation steps.
   */
  @property({ type: Boolean }) closable: boolean;

  /**
   * Determines if a drawer should have a modal backdrop that visually overlays the UI.
   */
  @property({ type: Boolean, reflect: true }) modal: boolean;

  /**
   * (optional) By default the popover will automatically anchor itself relative to the trigger element.
   * Pass an optional custom anchor element as an idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement = globalThis.document?.body;

  /**
   * @deprecated Use the popover API instead.
   * The trigger defines what element triggers an `open` interaction event.
   * A trigger can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) trigger: string | HTMLElement;

  /**
   * Create a inline layout effect while retaining the a11y characteristics and top layer behavior (light dismiss, focus trap, non interactive background)
   * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
   */
  @property({ type: Boolean, reflect: true }) inline: boolean;

  /**
   * @deprecated Use the popover API instead.
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to update for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /** @private */
  get popoverType(): PopoverType {
    return this.modal ? 'auto' : 'manual';
  }

  /** @private */
  get popoverDismissible() {
    return !!this.closable;
  }

  protected typeNativePopoverController = new TypeNativePopoverController<Drawer>(this);

  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-drawer',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  render() {
    return html`
    <div internal-host>
      <div class="header">
        <nve-icon-button part="icon-button" exportparts="icon:icon-button-icon" .hidden=${!this.closable} @click=${this.hidePopover} icon-name="cancel" .ariaLabel=${this.i18n.close} container="flat"></nve-icon-button>
        <slot name="header"></slot>
      </div>
      <div class="content">
        <slot></slot>
      </div>
      <div>
        <slot name="footer"></slot>
      </div>
    </div>
    `;
  }

  #inlineElement: HTMLElement;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('toggle', (e: ToggleEvent) => {
      if (this.inline) {
        if (this.#inlineElement && e.newState === 'closed') {
          this.#inlineElement.remove();
        } else {
          this.#inlineElement = createGhostElement(this);
          this.after(this.#inlineElement);
        }
      }
    });
  }
}
