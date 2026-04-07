import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { FormatRelativeTime } from '@nvidia-elements/core/format-relative-time';
import '@nvidia-elements/core/format-relative-time/define.js';

const NOW = new Date('2023-07-28T12:00:00.000Z');

describe(FormatRelativeTime.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: FormatRelativeTime;
  let originalDocumentLang: string;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    originalDocumentLang = document.documentElement.lang;

    fixture = await createFixture(
      html`<nve-format-relative-time locale="en-US" date="2023-07-27T12:00:00.000Z"></nve-format-relative-time>`
    );
    element = fixture.querySelector(FormatRelativeTime.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.lang = originalDocumentLang;
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(FormatRelativeTime.metadata.tag)).toBeDefined();
  });

  it('should render relative time from date attribute', async () => {
    const time = element.shadowRoot!.querySelector('time');
    expect(time).toBeTruthy();
    expect(time!.textContent!.trim()).toBe('1 day ago');
  });

  it('should render semantic time element with datetime attribute', async () => {
    const time = element.shadowRoot!.querySelector('time');
    expect(time).toBeTruthy();
    expect(time!.getAttribute('datetime')).toBe('2023-07-27T12:00:00.000Z');
  });

  it('should render relative time from slot content', async () => {
    removeFixture(fixture);

    fixture = await createFixture(
      html`<nve-format-relative-time locale="en-US">2023-07-27T12:00:00.000Z</nve-format-relative-time>`
    );
    element = fixture.querySelector(FormatRelativeTime.metadata.tag);
    await elementIsStable(element);

    const time = element.shadowRoot!.querySelector('time');
    expect(time!.textContent!.trim()).toBe('1 day ago');
  });

  it('should use date attribute over slot content', async () => {
    removeFixture(fixture);

    fixture = await createFixture(
      html`<nve-format-relative-time locale="en-US" date="2023-07-26T12:00:00.000Z">2023-07-27T12:00:00.000Z</nve-format-relative-time>`
    );
    element = fixture.querySelector(FormatRelativeTime.metadata.tag);
    await elementIsStable(element);

    const time = element.shadowRoot!.querySelector('time');
    expect(time!.textContent!.trim()).toBe('2 days ago');
  });

  it('should re-render when slot content changes', async () => {
    removeFixture(fixture);

    fixture = await createFixture(
      html`<nve-format-relative-time locale="en-US">2023-07-27T12:00:00.000Z</nve-format-relative-time>`
    );
    element = fixture.querySelector(FormatRelativeTime.metadata.tag);
    await elementIsStable(element);

    element.textContent = '2023-07-26T12:00:00.000Z';
    await elementIsStable(element);

    const time = element.shadowRoot!.querySelector('time');
    expect(time!.getAttribute('datetime')).toBe('2023-07-26T12:00:00.000Z');
    expect(time!.textContent!.trim()).toBe('2 days ago');
  });

  describe('numeric', () => {
    it('should format with numeric auto for natural language', async () => {
      element.date = '2023-07-27T12:00:00.000Z';
      element.numeric = 'auto';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('yesterday');
    });
  });

  describe('format-style', () => {
    it('should format with long style', async () => {
      element.date = '2023-07-25T12:00:00.000Z';
      element.formatStyle = 'long';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('3 days ago');
    });

    it('should format with short style', async () => {
      element.date = '2023-04-28T12:00:00.000Z';
      element.formatStyle = 'short';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('3 mo. ago');
    });

    it('should format with narrow style', async () => {
      element.date = '2023-07-25T12:00:00.000Z';
      element.formatStyle = 'narrow';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('3d ago');
    });
  });

  describe('unit', () => {
    it('should auto-select seconds for recent times', async () => {
      element.date = '2023-07-28T11:59:30.000Z';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('30 seconds ago');
    });

    it('should auto-select minutes for sub-hour times', async () => {
      element.date = '2023-07-28T11:15:00.000Z';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('45 minutes ago');
    });

    it('should auto-select hours for same-day times', async () => {
      element.date = '2023-07-28T09:00:00.000Z';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('3 hours ago');
    });

    it('should auto-select days within a week', async () => {
      element.date = '2023-07-25T12:00:00.000Z';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('3 days ago');
    });

    it('should auto-select weeks within a month', async () => {
      element.date = '2023-07-14T12:00:00.000Z';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('2 weeks ago');
    });

    it('should auto-select months for older dates', async () => {
      element.date = '2023-04-28T12:00:00.000Z';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('3 months ago');
    });

    it('should auto-select years for very old dates', async () => {
      element.date = '2021-07-28T12:00:00.000Z';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('2 years ago');
    });

    it('should handle date equal to now', async () => {
      element.date = '2023-07-28T12:00:00.000Z';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('in 0 seconds');
    });

    it('should use explicit unit when specified', async () => {
      element.date = '2023-07-27T12:00:00.000Z';
      element.unit = 'hour';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('24 hours ago');
    });

    it('should format future dates', async () => {
      element.date = '2023-07-29T12:00:00.000Z';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('in 1 day');
    });
  });

  describe('locale', () => {
    it('should fall back to document lang when locale is omitted', async () => {
      document.documentElement.lang = 'de-DE';
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-relative-time date="2023-07-27T12:00:00.000Z"></nve-format-relative-time>`
      );
      element = fixture.querySelector(FormatRelativeTime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toContain('Tag');
    });

    it('should format with de-DE locale', async () => {
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-relative-time locale="de-DE" date="2023-07-27T12:00:00.000Z"></nve-format-relative-time>`
      );
      element = fixture.querySelector(FormatRelativeTime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toContain('Tag');
    });

    it('should format with ja locale', async () => {
      removeFixture(fixture);

      fixture = await createFixture(
        html`<nve-format-relative-time locale="ja" date="2023-07-27T12:00:00.000Z"></nve-format-relative-time>`
      );
      element = fixture.querySelector(FormatRelativeTime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('1 日前');
    });
  });

  describe('sync', () => {
    it('should update displayed text after interval', async () => {
      element.date = '2023-07-28T11:59:30.000Z';
      element.sync = true;
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('30 seconds ago');

      vi.setSystemTime(new Date('2023-07-28T12:01:00.000Z'));
      vi.advanceTimersByTime(10000);
      await elementIsStable(element);

      expect(time!.textContent!.trim()).toBe('2 minutes ago');
    });

    it('should stop updating when sync is disabled', async () => {
      element.date = '2023-07-28T11:59:30.000Z';
      element.sync = true;
      await elementIsStable(element);

      element.sync = false;
      await elementIsStable(element);

      const text = element.shadowRoot!.querySelector('time')!.textContent!.trim();
      vi.setSystemTime(new Date('2023-07-28T12:05:00.000Z'));
      vi.advanceTimersByTime(60000);

      expect(element.shadowRoot!.querySelector('time')!.textContent!.trim()).toBe(text);
    });

    it('should clean up timer on disconnect', async () => {
      element.date = '2023-07-28T11:59:30.000Z';
      element.sync = true;
      await elementIsStable(element);

      const text = element.shadowRoot!.querySelector('time')!.textContent!.trim();
      element.remove();

      vi.setSystemTime(new Date('2023-07-28T12:05:00.000Z'));
      vi.advanceTimersByTime(60000);

      expect(element.shadowRoot!.querySelector('time')!.textContent!.trim()).toBe(text);
    });

    it('should restart sync when re-enabled', async () => {
      element.date = '2023-07-28T11:59:30.000Z';
      element.sync = true;
      await elementIsStable(element);

      element.sync = false;
      await elementIsStable(element);

      element.sync = true;
      await elementIsStable(element);

      vi.setSystemTime(new Date('2023-07-28T12:01:00.000Z'));
      vi.advanceTimersByTime(10000);
      await elementIsStable(element);

      expect(element.shadowRoot!.querySelector('time')!.textContent!.trim()).toBe('2 minutes ago');
    });

    it('should adapt interval as time distance grows', async () => {
      element.date = '2023-07-28T11:59:50.000Z';
      element.sync = true;
      await elementIsStable(element);

      expect(element.shadowRoot!.querySelector('time')!.textContent!.trim()).toBe('10 seconds ago');

      vi.setSystemTime(new Date('2023-07-28T12:02:00.000Z'));
      vi.advanceTimersByTime(10000);
      await elementIsStable(element);

      expect(element.shadowRoot!.querySelector('time')!.textContent!.trim()).toBe('2 minutes ago');

      vi.setSystemTime(new Date('2023-07-28T13:00:00.000Z'));
      vi.advanceTimersByTime(30000);
      await elementIsStable(element);

      expect(element.shadowRoot!.querySelector('time')!.textContent!.trim()).toBe('1 hour ago');
    });
  });

  describe('fallback', () => {
    it('should show raw string for invalid date', async () => {
      element.date = 'not-a-date';
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('not-a-date');
    });

    it('should render empty for no content', async () => {
      removeFixture(fixture);

      fixture = await createFixture(html`<nve-format-relative-time></nve-format-relative-time>`);
      element = fixture.querySelector(FormatRelativeTime.metadata.tag);
      await elementIsStable(element);

      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('');
    });

    it('should fall back to raw string for invalid options', async () => {
      element.setAttribute('format-style', 'banana');
      await elementIsStable(element);
      const time = element.shadowRoot!.querySelector('time');
      expect(time!.textContent!.trim()).toBe('2023-07-27T12:00:00.000Z');
    });
  });
});
