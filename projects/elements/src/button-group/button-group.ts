import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import type { KeynavListConfig, Interaction, Size } from '@nvidia-elements/core/internal';
import { attachInternals, keyNavigationList, useStyles, audit, appendRootNodeStyle } from '@nvidia-elements/core/internal';
import type { IconButton } from '@nvidia-elements/core/icon-button';
import type { Button } from '@nvidia-elements/core/button';
import type { Divider } from '@nvidia-elements/core/divider';
import styles from './button-group.css?inline';
import globalStyles from './button-group.global.css?inline';

/**
 * @element nve-button-group
 * @description A button group is a control that enables users to choose between two or more distinct mutually exclusive options.
 * @since 0.16.0
 * @entrypoint \@nvidia-elements/core/button-group
 * @slot - default slot for `nve-button` or `nve-icon-button`
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --width
 * @cssprop --height
 * @cssprop --color
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/group_role
 */
@audit()
@keyNavigationList<ButtonGroup>()
export class ButtonGroup extends LitElement {
  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.#buttons,
      layout: this.orientation
    };
  }

  /** By default the button group is stateless. Add the `behavior-select` attribute and set to `single` or `multi` to enable stateful selction handling. */
  @property({ type: String, attribute: 'behavior-select' }) behaviorSelect: 'single' | 'multi';

  /** Set the style of the button group using the `container` property. Options are the default display when omitting the attribute, `flat` or `rounded`. */
  @property({ type: String, reflect: true }) container?: 'flat' | 'rounded';

  /** Determines the orientation direction of the group. Vertical groups support icon buttons only. */
  @property({ type: String, reflect: true }) orientation?: 'horizontal' | 'vertical' = 'horizontal';

  /** Use the `interaction` property on `button-group` in combination with `divider` for color-coded split buttons */
  @property({ type: String, reflect: true }) interaction: Interaction;

  /** Determines size of button */
  @property({ type: String, reflect: true }) size?: Size;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-button-group',
    version: '0.0.0',
    children: ['nve-button', 'nve-icon-button', 'nve-divider']
  };

  /** @private */
  declare _internals: ElementInternals;

  @queryAssignedElements({ selector: 'nve-divider, nve-divider' }) private dividers!: Divider[];

  @queryAssignedElements({ selector: 'nve-icon-button, nve-icon-button' }) private iconButtons!: IconButton[];

  @queryAssignedElements({ selector: 'nve-button, nve-button' }) private buttons!: Button[];

  get #buttons() {
    return [...this.iconButtons, ...this.buttons];
  }

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${this.#syncStyleStates}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    appendRootNodeStyle(this, globalStyles);
    this._internals.role = 'group';
    this.addEventListener('click', e => this.#selectButton(e.target as HTMLElement & { pressed?: boolean }));
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#syncStyleStates();
  }

  #syncStyleStates() {
    if (this.container === 'flat') {
      this.#buttons.forEach(btn => (btn.container = 'flat'));
    }

    if (this.interaction) {
      this.#buttons.forEach(btn => (btn.interaction = this.interaction));
    }

    this.dividers.length ? this._internals.states.add('split') : this._internals.states.delete('split');
  }

  #selectButton(button: HTMLElement & { pressed?: boolean }) {
    if (!button.matches?.('nve-button, nve-button, nve-icon-button, nve-icon-button')) {
      return;
    }

    if (this.behaviorSelect === 'single') {
      this.#buttons.forEach(i => (i.pressed = false));
      button.pressed = true;
    } else if (this.behaviorSelect === 'multi') {
      button.pressed = !button.pressed;
    }
  }
}
