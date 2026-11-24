// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { draggableList } from '@nvidia-elements/foundations/draggable-list';

function drag(element: HTMLElement, type: string) {
  const event = new DragEvent(type, {
    dataTransfer: new DataTransfer(),
    bubbles: true,
    composed: true,
    cancelable: true
  });
  element.dispatchEvent(event);
  return event;
}

@draggableList<CustomList>(host => ({ items: host.querySelectorAll('button'), accepts: () => false }))
class CustomList extends LitElement {
  render() {
    return html`<slot></slot>`;
  }
}
customElements.define('test-draggable-list', CustomList);

describe('draggableList decorator', () => {
  it('allows custom hosts to reject destination drops', async () => {
    const fixture = await createFixture(
      html`<test-draggable-list><button>A</button><button>B</button></test-draggable-list>`
    );
    try {
      const host = fixture.querySelector<CustomList>('test-draggable-list')!;
      await elementIsStable(host);
      const [a, b] = Array.from(host.querySelectorAll('button'));
      const drop = vi.fn();
      host.addEventListener('draggable-drop', drop);
      drag(a, 'dragstart');
      expect(drag(b, 'dragover').defaultPrevented).toBe(false);
      drag(b, 'drop');
      expect(drop).not.toHaveBeenCalled();
    } finally {
      removeFixture(fixture);
    }
  });
});
