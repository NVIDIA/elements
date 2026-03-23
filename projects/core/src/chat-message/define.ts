import { define } from '@nvidia-elements/core/internal';
import { ChatMessage } from '@nvidia-elements/core/chat-message';

define(ChatMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-chat-message': ChatMessage;
  }
}
