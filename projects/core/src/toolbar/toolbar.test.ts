// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Toolbar } from '@nvidia-elements/core/toolbar';
import { ButtonGroup } from '@nvidia-elements/core/button-group';
import { Divider } from '@nvidia-elements/core/divider';
import { Select } from '@nvidia-elements/core/select';
import { Input } from '@nvidia-elements/core/input';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(Toolbar.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toolbar>
        <div slot="prefix">prefix</div>
        <div>content</div>
        <div slot="suffix">suffix</div>
      </nve-toolbar>
    `);
    element = fixture.querySelector(Toolbar.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Toolbar.metadata.tag)).toBeDefined();
  });

  it('should initialize role toolbar', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('toolbar');
  });

  it('should reflect a container attribute', async () => {
    expect(element.container).toBe(undefined);
    expect(element.hasAttribute('container')).toBe(false);

    element.container = 'flat';
    await elementIsStable(element);
    expect(element.getAttribute('container')).toBe('flat');
  });

  it('should reflect a content attribute', async () => {
    expect(element.content).toBe('scroll');
    expect(element.getAttribute('content')).toBe('scroll');

    element.content = 'wrap';
    await elementIsStable(element);
    expect(element.getAttribute('content')).toBe('wrap');
  });

  it('should reflect a orientation attribute', async () => {
    expect(element.orientation).toBe('horizontal');
    expect(element.getAttribute('orientation')).toBe('horizontal');

    element.orientation = 'vertical';
    await elementIsStable(element);
    expect(element.getAttribute('orientation')).toBe('vertical');
  });

  it('should reflect a status attribute', async () => {
    expect(element.status).toBe(undefined);
    expect(element.hasAttribute('status')).toBe(false);

    element.status = 'accent';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('accent');
  });

  it('should not apply --scrollbar state when there is no center content overflow', async () => {
    await elementIsStable(element);
    expect(element.matches(':state(scrollbar)')).toBe(false);
  });
});

describe(`${Toolbar.metadata.tag}: scrollbar state`, () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toolbar style="width: 200px">
        <div slot="prefix">prefix</div>
        <div>content content content content content content</div>
        <div slot="suffix">suffix</div>
      </nve-toolbar>
    `);
    element = fixture.querySelector(Toolbar.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should apply --scrollbar state when there is center content overflow', async () => {
    await elementIsStable(element);
    expect(element.matches(':state(scrollbar)')).toBe(true);
  });

  it('should remove --scrollbar state when there is no center content overflow', async () => {
    element.querySelector('div:not([slot])').remove();
    await elementIsStable(element);
    expect(element.matches(':state(scrollbar)')).toBe(false);
  });
});

describe(`${Toolbar.metadata.tag}: orientation`, () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toolbar orientation="vertical">
        <nve-button-group>
          <nve-icon-button pressed icon-name="bars-3-bottom-left"></nve-icon-button>
          <nve-icon-button icon-name="bars-3-bottom-right"></nve-icon-button>
          <nve-icon-button icon-name="bars-4"></nve-icon-button>
        </nve-button-group>

        <nve-divider></nve-divider>

        <nve-button-group>
          <nve-icon-button icon-name="bold" size="sm"></nve-icon-button>
          <nve-icon-button icon-name="italic" size="sm"></nve-icon-button>
          <nve-icon-button icon-name="strikethrough"></nve-icon-button>
        </nve-button-group>
      </nve-toolbar>
    `);
    element = fixture.querySelector(Toolbar.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync orientation of slotted elements', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector<ButtonGroup>(ButtonGroup.metadata.tag).orientation).toBe('vertical');
    expect(fixture.querySelector<Divider>(Divider.metadata.tag).orientation).toBe('horizontal');

    element.orientation = 'horizontal';
    await elementIsStable(element);
    expect(fixture.querySelector<ButtonGroup>(ButtonGroup.metadata.tag).orientation).toBe('horizontal');
    expect(fixture.querySelector<Divider>(Divider.metadata.tag).orientation).toBe('vertical');
  });
});

describe(`${Toolbar.metadata.tag}: container`, () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toolbar container="flat">
        <nve-select>
          <select aria-label="element type">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="p">Paragraph</option>
          </select>
        </nve-select>

        <nve-input>
          <input aria-label="input" />
        </nve-input>

        <nve-button-group>
          <nve-icon-button pressed icon-name="bars-3-bottom-left"></nve-icon-button>
          <nve-icon-button icon-name="bars-3-bottom-right"></nve-icon-button>
          <nve-icon-button icon-name="bars-4"></nve-icon-button>
        </nve-button-group>

        <nve-button><nve-icon name="delete"></nve-icon> delete</nve-button>
        <nve-icon-button icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
      </nve-toolbar>
    `);
    element = fixture.querySelector(Toolbar.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync container of slotted elements', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector<Select>(Select.metadata.tag).container).toBe('flat');
    expect(fixture.querySelector<Input>(Input.metadata.tag).container).toBe('flat');
    expect(fixture.querySelector<ButtonGroup>(ButtonGroup.metadata.tag).container).toBe('flat');
    expect(fixture.querySelector<IconButton>(IconButton.metadata.tag).container).toBe('flat');
    expect(fixture.querySelector<Button>(Button.metadata.tag).container).toBe('flat');
  });
});
