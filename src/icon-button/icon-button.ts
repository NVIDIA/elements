import { html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Button } from '@elements/elements/button';
import styleSheet from './icon-button.css?inline';
import { IconNames } from '@elements/elements/icon';

const componentStyling = unsafeCSS(styleSheet);

/**
 * @element nve-icon-button
 */
export class IconButton extends Button {
static styles = [...Button.styles, componentStyling];

  @property({ type: String }) name: IconNames;

  render() {
    return html`
      <div internal-host>
        <nve-icon .name="${this.name}"></nve-icon>
      </div>
    `;
  }
}
