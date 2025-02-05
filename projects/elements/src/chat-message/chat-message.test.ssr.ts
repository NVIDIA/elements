import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ChatMessage } from '@nvidia-elements/core/chat-message';
import '@nvidia-elements/core/chat-message/define.js';

describe(ChatMessage.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-chat-message>message</nve-chat-message>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-chat-message')).toBe(true);
  });
});
