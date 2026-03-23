import { LitElement, html } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Color } from '@nvidia-elements/core/internal';
import { colorStateStyles, appendRootNodeStyle } from '@nvidia-elements/core/internal';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './chat-message.css?inline';
import globalStyles from './chat-message.global.css?inline';

/**
 * @element nve-chat-message
 * @description A chat message component displays a text message within a conversation, sent between users or bots
 * @since 1.25.0
 * @entrypoint \@nvidia-elements/core/chat-message
 * @slot - default slot for content
 * @slot prefix - for avatar/img content
 * @slot suffix - for avatar/img content
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --border-radius
 * @cssprop --font-size
 * @cssprop --line-height
 * @cssprop --overflow
 * @cssprop --top-offset - Vertical offset for aligning message with avatar

 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 * @stable false
 */
export class ChatMessage extends LitElement {
  static styles = useStyles([styles, colorStateStyles]);

  static readonly metadata = {
    tag: 'nve-chat-message',
    version: '0.0.0'
  };

  @property({ type: String, reflect: true }) container: 'flat';

  @property({ type: String, reflect: true }) color: Color;

  @property({ type: String, reflect: true, attribute: 'arrow-position' }) arrowPosition:
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end';

  render() {
    return html`
      <div internal-host>
        <slot name="prefix"></slot>
        <slot part="_message"></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
  }
}
