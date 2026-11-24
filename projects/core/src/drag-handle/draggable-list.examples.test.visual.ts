// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import type { Locator, Page } from 'playwright';
import examples from '@nvidia-elements/foundations/draggable-list/draggable-list.examples.json' with { type: 'json' };

function template(name: string): string {
  const example = examples.items.find(item => item.name === name);
  if (!example) throw new Error(`Missing generated draggable-list example: ${name}`);
  return example.template;
}

const rows = 'css:light=:scope > div:not([nve-draggable~="dropzone"])';

const handleLabels = (list: Locator) =>
  list.locator('nve-drag-handle').evaluateAll(handles => handles.map(handle => handle.getAttribute('aria-label')));

async function usePlaceholderText(page: Page) {
  await page.locator('nve-draggable-list > div > span, nve-card-header h3').evaluateAll(elements => {
    for (const element of elements) element.textContent = '••• •••';
  });
}

describe('published draggable list examples', () => {
  test.each(['Default', 'Horizontal'])('%s reorders content through its handles', async name => {
    await visualRunner.inspect(`draggable-list.example-${name.toLowerCase()}`, template(name), async page => {
      await usePlaceholderText(page);
      expect(await page.locator('nve-draggable-list > nve-button').count()).toBe(0);
      const list = page.locator('nve-draggable-list');
      const items = list.locator(rows);
      const labels = await handleLabels(list);
      expect(labels.length).toBeGreaterThan(1);
      const label = labels[0];
      if (!label) throw new Error('The example requires a labeled drag handle');
      const handle = page.locator(`nve-drag-handle[aria-label="${label}"]`);
      const bounds = await items.last().boundingBox();
      if (!bounds) throw new Error('The last example item must be visible');
      const position = { x: bounds.width - 4, y: bounds.height - 4 };

      await handle.dragTo(items.last(), { targetPosition: position });
      expect(await handleLabels(list)).toEqual([...labels.slice(1), label]);

      await handle.focus();
      await page.keyboard.press('Space');
      await page.keyboard.press('Home');
      await page.keyboard.press('Enter');
      expect(await handleLabels(list)).toEqual(labels);

      await handle.click();
      await items.last().click({ position });
      expect(await handleLabels(list)).toEqual([...labels.slice(1), label]);
    });
  });

  test('Connected transfers content into empty lists through dragging, keyboard and click placement', async () => {
    await visualRunner.inspect('draggable-list.example-connected', template('Connected'), async page => {
      await usePlaceholderText(page);
      const lists = page.locator('#job-queues > nve-card > nve-card-content > nve-draggable-list');
      expect(await lists.count()).toBe(2);
      const pending = lists.nth(0);
      const scheduled = lists.nth(1);
      const handle = page.locator('nve-drag-handle[aria-label="Move training job"]');
      const backgroundPosition = { x: 10, y: 140 };

      await handle.dragTo(scheduled, { targetPosition: backgroundPosition });
      expect(await handleLabels(pending)).toEqual(['Move evaluation job']);
      expect(await handleLabels(scheduled)).toEqual(['Move training job']);

      await handle.focus();
      await page.keyboard.press('Space');
      await pending.focus();
      await page.keyboard.press('Enter');
      expect(await handleLabels(pending)).toEqual(['Move evaluation job', 'Move training job']);
      expect(await scheduled.locator(rows).count()).toBe(0);

      await pending
        .locator('nve-drag-handle[aria-label="Move evaluation job"]')
        .dragTo(pending, { targetPosition: backgroundPosition });
      expect(await handleLabels(pending)).toEqual(['Move training job', 'Move evaluation job']);

      await handle.click();
      await scheduled.click({ position: backgroundPosition });
      expect(await handleLabels(pending)).toEqual(['Move evaluation job']);
      expect(await handleLabels(scheduled)).toEqual(['Move training job']);
    });
  });
});
