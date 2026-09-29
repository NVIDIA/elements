// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getApi } from './api.utils.js';

type Api = Awaited<ReturnType<typeof getApi>>;
type ApiElement = Api['data']['elements'][number];

function getElement(api: Api, name: string) {
  return api.data.elements.find(element => element.name === name);
}

function getField(element: ApiElement | undefined, name: string) {
  return element?.manifest?.members.filter(member => member.kind === 'field').find(member => member.name === name);
}

function getAttribute(element: ApiElement | undefined, name: string) {
  return element?.manifest?.attributes?.find(attribute => attribute.name === name);
}

describe('ApiUtils', () => {
  it('should return the api json', async () => {
    expect(getApi).toBeDefined();
  });

  it('should include attribute names for inherited button members', async () => {
    const api = await getApi();
    const button = getElement(api, 'nve-button');

    expect(getField(button, 'pressed')?.attribute).toBe('pressed');
    expect(getField(button, 'readOnly')?.attribute).toBe('readonly');
    expect(getField(button, 'commandForElement')?.attribute).toBe('commandfor');
    expect(button?.markdown).toContain('| readOnly (readonly) |');
  });

  it('should project checkbox and button mixin APIs onto media mute button', async () => {
    const api = await getApi();
    const muteButton = getElement(api, 'nve-media-mute-button');

    expect(getField(muteButton, 'pressed')?.attribute).toBe('pressed');
    expect(getField(muteButton, 'checked')?.attribute).toBe('checked');
    expect(getField(muteButton, 'readOnly')?.attribute).toBe('readonly');
    expect(getField(muteButton, 'commandForElement')?.attribute).toBe('commandfor');
    expect(getAttribute(muteButton, 'commandForElement')).toBeUndefined();
    expect(muteButton?.markdown).toContain('| checked |');
  });

  it('should project slider mixin APIs onto media time range', async () => {
    const api = await getApi();
    const timeRange = getElement(api, 'nve-media-time-range');

    expect(getField(timeRange, 'min')?.attribute).toBe('min');
    expect(getField(timeRange, 'valueAsNumber')?.attribute).toBeUndefined();
    expect(getAttribute(timeRange, 'commandForElement')).toBeUndefined();
    expect(timeRange?.markdown).toContain('| valueAsNumber |');
  });

  it('should project select mixin APIs onto media playback rate select', async () => {
    const api = await getApi();
    const playbackRateSelect = getElement(api, 'nve-media-playback-rate-select');

    expect(getField(playbackRateSelect, 'selectedIndex')?.attribute).toBeUndefined();
    expect(getField(playbackRateSelect, 'value')?.attribute).toBe('value');
    expect(getAttribute(playbackRateSelect, 'commandForElement')).toBeUndefined();
    expect(playbackRateSelect?.markdown).toContain('| selectedIndex |');
  });
});
