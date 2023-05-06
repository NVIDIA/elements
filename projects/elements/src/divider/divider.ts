import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, attachInternals } from '@elements/elements/internal';
import styles from './divider.css?inline';

/**
 * @element mlv-divider
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --size
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-divider-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-17&t=amYlOylF8PkKNaxU-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/separator_role
 * @stable false
 */
export class Divider extends LitElement {
  declare _internals: ElementInternals;

  @property({ type: String }) orientation: 'vertical' | 'horizontal' = 'horizontal';

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-divider',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`<div internal-host></div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'separator';
    this._internals.ariaOrientation = this.orientation;
  }
}
