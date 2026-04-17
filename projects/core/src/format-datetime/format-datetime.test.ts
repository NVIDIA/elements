// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { FormatDatetime } from '@nvidia-elements/core/format-datetime';
import '@nvidia-elements/core/format-datetime/define.js';

describe(FormatDatetime.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: FormatDatetime;
  let originalDocumentLang: string;

  beforeEach(async () => {
    originalDocumentLang = document.documentElement.lang;
    fixture = await createFixture(
      html`<nve-format-datetime locale="en-US" date-style="long" time-zone="UTC">2023-07-28T04:20:17.434Z</nve-format-datetime>`
    );
    element = fixture.querySelector(FormatDatetime.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    document.documentElement.lang = originalDocumentLang;
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(FormatDatetime.metadata.tag)).toBeDefined();
  });

  it('should render formatted date from slot content', async () => {
    const time = element.shadowRoot!.querySelector('time');
    expect(time).toBeTruthy();
    expect(time!.textContent!.trim()).toBe('July 28, 2023');
  });

  it('should render semantic time element with datetime attribute', async () => {
    const time = element.shadowRoot!.querySelector('time');
    expect(time).toBeTruthy();
    expect(time!.getAttribute('datetime')).toBe('2023-07-28T04:20:17.434Z');
  });

  it('should use date attribute over slot content', async () => {
    element.date = '2024-01-15T12:00:00.000Z';
    await elementIsStable(element);
    const time = element.shadowRoot!.querySelector('time');
    expect(time!.getAttribute('datetime')).toBe('2024-01-15T12:00:00.000Z');
    expect(time!.textContent!.trim()).toBe('January 15, 2024');
  });

  it('should re-render when slot content changes', async () => {
    element.textContent = '2024-01-15T12:00:00.000Z';
    await elementIsStable(element);

    const time = element.shadowRoot!.querySelector('time');
    expect(time!.getAttribute('datetime')).toBe('2024-01-15T12:00:00.000Z');
    expect(time!.textContent!.trim()).toBe('January 15, 2024');
  });

  describe('date-style', () => {
    it('should format with date-style full', async () => {
      element.dateStyle = 'full';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toContain('Friday');
      expect(time!.textContent!.trim()).toContain('July 28, 2023');
    });

    it('should format with date-style medium', async () => {
      element.dateStyle = 'medium';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('Jul 28, 2023');
    });

    it('should format with date-style short', async () => {
      element.dateStyle = 'short';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('7/28/23');
    });
  });

  describe('time-style', () => {
    it('should format with time-style short', async () => {
      element.dateStyle = 'short';
      element.timeStyle = 'short';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      const text = time!.textContent!.trim();
      expect(text).toContain('7/28/23');
      expect(text).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
    });
  });

  describe('granular options', () => {
    it('should format with weekday and month', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-datetime locale="en-US" weekday="long" month="short" day="numeric" year="numeric" time-zone="UTC">2023-07-28T04:20:17.434Z</nve-format-datetime>`
      );
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      const text = time!.textContent!.trim();
      expect(text).toContain('Friday');
      expect(text).toContain('Jul');
      expect(text).toContain('28');
      expect(text).toContain('2023');
    });

    it('should format month and year only', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-datetime locale="en-US" month="long" year="numeric" time-zone="UTC">2023-07-28T04:20:17.434Z</nve-format-datetime>`
      );
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('July 2023');
    });

    it('should format time-only with hour and minute', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-datetime locale="en-US" hour="numeric" minute="2-digit" time-zone="UTC">2023-07-28T04:20:17.434Z</nve-format-datetime>`
      );
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
    });
  });

  describe('locale', () => {
    it('should fall back to document lang when locale is omitted', async () => {
      document.documentElement.lang = 'de-DE';
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-datetime date-style="long" time-zone="UTC">2023-07-28T04:20:17.434Z</nve-format-datetime>`
      );
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toContain('Juli');
    });

    it('should format with de-DE locale', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-datetime locale="de-DE" date-style="long" time-zone="UTC">2023-07-28T04:20:17.434Z</nve-format-datetime>`
      );
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toContain('Juli');
    });

    it('should format with ja locale', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-datetime locale="ja" date-style="long" time-zone="UTC">2023-07-28T04:20:17.434Z</nve-format-datetime>`
      );
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('2023年7月28日');
    });
  });

  describe('time-zone', () => {
    it('should format with specific time zone', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-datetime locale="en-US" date-style="short" time-style="short" time-zone="UTC">2023-07-28T04:20:17.434Z</nve-format-datetime>`
      );
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toContain('4:20 AM');
    });

    it('should display short time zone name', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-datetime locale="en-US" hour="numeric" minute="2-digit" time-zone="UTC" time-zone-name="short">2023-07-28T04:20:17.434Z</nve-format-datetime>`
      );
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toContain('UTC');
    });

    it('should display long time zone name', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-datetime locale="en-US" hour="numeric" minute="2-digit" time-zone="UTC" time-zone-name="long">2023-07-28T04:20:17.434Z</nve-format-datetime>`
      );
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toContain('Coordinated Universal Time');
    });

    it('should ignore time zone name when preset styles are used', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(html`
        <div>
          <nve-format-datetime locale="en-US" date-style="long" time-style="long" time-zone="UTC">
            2023-07-28T04:20:17.434Z
          </nve-format-datetime>
          <nve-format-datetime locale="en-US" date-style="long" time-style="long" time-zone="UTC" time-zone-name="short">
            2023-07-28T04:20:17.434Z
          </nve-format-datetime>
        </div>
      `);

      const [withoutZoneName, withZoneName] = Array.from(
        fixture.querySelectorAll(FormatDatetime.metadata.tag)
      ) as FormatDatetime[];
      await elementIsStable(withoutZoneName);
      await elementIsStable(withZoneName);

      const withoutText = withoutZoneName.shadowRoot!.querySelector('time')!.textContent!.trim();
      const withText = withZoneName.shadowRoot!.querySelector('time')!.textContent!.trim();

      expect(withText).toBe(withoutText);
      expect(withText).not.toBe('2023-07-28T04:20:17.434Z');
    });
  });

  describe('priority and fallback', () => {
    it('should prefer dateStyle/timeStyle over granular options', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-datetime locale="en-US" date-style="short" weekday="long" month="long" day="numeric" year="numeric" time-zone="UTC">2023-07-28T04:20:17.434Z</nve-format-datetime>`
      );
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('7/28/23');
    });

    it('should show raw string for invalid date', async () => {
      element.date = 'not-a-date';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('not-a-date');
    });

    it('should fall back to raw string for invalid Intl options', async () => {
      element.setAttribute('date-style', 'banana');
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('2023-07-28T04:20:17.434Z');
    });

    it('should render empty for no content', async () => {
      fixture.innerHTML = '';
      removeFixture(fixture);

      fixture = await createFixture(html`<nve-format-datetime></nve-format-datetime>`);
      element = fixture.querySelector(FormatDatetime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('');
    });
  });
});
