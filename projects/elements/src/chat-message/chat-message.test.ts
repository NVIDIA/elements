// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { ChatMessage } from '@nvidia-elements/core/chat-message';
import '@nvidia-elements/core/chat-message/define.js';

describe(ChatMessage.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ChatMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-chat-message id="chat-message-1">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </nve-chat-message>
    `);
    element = fixture.querySelector(ChatMessage.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ChatMessage.metadata.tag)).toBeDefined();
  });

  it('should set color attribute', async () => {
    element.color = 'red-cardinal';
    await elementIsStable(element);
    expect(element.color).toBe('red-cardinal');
  });

  it('should set container attribute', async () => {
    element.container = 'flat';
    await elementIsStable(element);
    expect(element.container).toBe('flat');
  });

  it('should set arrow-position attribute', async () => {
    element.arrowPosition = 'top-start';
    await elementIsStable(element);
    expect(element.arrowPosition).toBe('top-start');
  });
});
