// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import examples from '@nvidia-elements/core/grid/grid.examples.json' with { type: 'json' };

function template(theme = '') {
  return `
    <nve-grid draggable-rows draggable-columns aria-label="Job order" style="--scroll-height: 220px">
      <nve-grid-header>
        <nve-grid-column nve-draggable="before target" width="200px">•••<nve-drag-handle aria-label="Move job column"></nve-drag-handle></nve-grid-column>
        <nve-grid-column nve-draggable="after target">•••<nve-drag-handle aria-label="Move status column"></nve-drag-handle></nve-grid-column>
      </nve-grid-header>
      <nve-grid-row nve-draggable="active"><nve-grid-cell><nve-drag-handle aria-label="Move A"></nve-drag-handle>•••</nve-grid-cell><nve-grid-cell>•••</nve-grid-cell></nve-grid-row>
      <nve-grid-row nve-draggable="before target"><nve-grid-cell><nve-drag-handle aria-label="Move B"></nve-drag-handle>•••</nve-grid-cell><nve-grid-cell>•••</nve-grid-cell></nve-grid-row>
      <nve-grid-row nve-draggable="after target"><nve-grid-cell><nve-drag-handle aria-label="Move C"></nve-drag-handle>•••</nve-grid-cell><nve-grid-cell>•••</nve-grid-cell></nve-grid-row>
      <nve-grid-placeholder nve-draggable="append target">••• •••</nve-grid-placeholder>
    </nve-grid>
    <script type="module">
      import '@nvidia-elements/core/grid/define.js';
      import '@nvidia-elements/core/drag-handle/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
      const grid = document.querySelector('nve-grid');
      grid.addEventListener('draggable-drop', ({detail}) => {
        const {source,target,placement}=detail;
        target.insertAdjacentElement(placement==='after'?'afterend':'beforebegin',source);
      });
    </script>`;
}

describe('draggable grid visual', () => {
  test('the published two-grid example accepts drops on rows and in the remaining space', async () => {
    const example = examples.items.find(item => item.name === 'RowTransfers');
    if (!example) throw new Error('Missing generated RowTransfers example');
    await visualRunner.inspect('grid.row-transfers.example', example.template, async page => {
      await page
        .locator(
          '#grid-queues :is(h3, nve-grid-column:not(:empty), nve-grid-cell:nth-child(n+2), nve-grid-placeholder)'
        )
        .evaluateAll(elements => {
          for (const element of elements) element.textContent = '••• •••';
        });
      const pending = page.locator('nve-grid[aria-label="Pending jobs"]');
      const scheduled = page.locator('nve-grid[aria-label="Scheduled jobs"]');
      const training = page.locator('nve-drag-handle[aria-label="Move training"]');
      const evaluation = page.locator('nve-drag-handle[aria-label="Move evaluation"]');
      const pendingTarget = pending.locator('nve-grid-placeholder');
      const scheduledTarget = scheduled.locator('nve-grid-placeholder');
      expect(await pending.locator('nve-grid-row').count()).toBe(2);
      expect(await scheduled.locator('nve-grid-row').count()).toBe(2);
      expect(await pendingTarget.isVisible()).toBe(true);

      await training.dragTo(scheduled.locator('nve-grid-row').first(), { targetPosition: { x: 100, y: 4 } });
      expect(await pending.locator('nve-grid-row').count()).toBe(1);
      expect(await scheduled.locator('nve-grid-row').count()).toBe(3);
      expect(
        await scheduled.locator('nve-grid-row').first().locator('nve-drag-handle').getAttribute('aria-label')
      ).toBe('Move training');

      const lastRow = await scheduled.locator('nve-grid-row').last().boundingBox();
      const target = await scheduledTarget.boundingBox();
      const viewport = await scheduled.locator('[part="_scrollbox"]').boundingBox();
      if (!lastRow || !target || !viewport) throw new Error('The scheduled grid and drop target must be visible');
      expect(target.y).toBeCloseTo(lastRow.y + lastRow.height);
      expect(target.y + target.height).toBeCloseTo(viewport.y + viewport.height);
      expect(target.width).toBeCloseTo(viewport.width);
      expect(await scheduledTarget.locator('[internal-host]').boundingBox()).toEqual(target);
      await evaluation.dragTo(scheduledTarget, { targetPosition: { x: target.width - 12, y: target.height - 8 } });
      expect(await pending.locator('nve-grid-row').count()).toBe(0);
      expect(await scheduled.locator('nve-grid-row').count()).toBe(4);
      expect(await scheduled.locator('nve-grid-row').last().locator('nve-drag-handle').getAttribute('aria-label')).toBe(
        'Move evaluation'
      );
      expect(await pendingTarget.isVisible()).toBe(true);

      await training.dragTo(pendingTarget);
      expect(await pending.locator('nve-grid-row').count()).toBe(1);
      expect(await scheduled.locator('nve-grid-row').count()).toBe(3);
      expect(await pending.locator('nve-drag-handle[aria-label="Move training"]').count()).toBe(1);
      expect(await pendingTarget.isVisible()).toBe(true);
    });
  });

  test.each(['', 'dark'])('shows row, column, and placeholder drop indicators in theme %s', async theme => {
    const report = await visualRunner.render(`grid.draggable${theme ? '.dark' : ''}`, template(theme));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('starts native row dragging from a handle and preserves keyboard activation', async () => {
    await visualRunner.inspect('grid.draggable.interactions', template(), async page => {
      await page.locator('nve-grid').evaluate(async grid => {
        await customElements.whenDefined('nve-grid');
        if ('updateComplete' in grid) await grid.updateComplete;
      });
      const row = page.locator('nve-grid-row').nth(2);
      await page.locator('nve-drag-handle[aria-label="Move A"]').dragTo(row, { targetPosition: { x: 150, y: 35 } });
      expect(
        await page
          .locator('nve-grid-row nve-drag-handle')
          .evaluateAll(handles => handles.map(handle => handle.getAttribute('aria-label')))
      ).toEqual(['Move B', 'Move C', 'Move A']);
      await page.locator('nve-drag-handle[aria-label="Move A"]').focus();
      await page.keyboard.press('Space');
      await page.keyboard.press('Home');
      await page.keyboard.press('Enter');
      expect(
        await page
          .locator('nve-grid-row nve-drag-handle')
          .evaluateAll(handles => handles.map(handle => handle.getAttribute('aria-label')))
      ).toEqual(['Move A', 'Move B', 'Move C']);
      expect(
        await page
          .locator('nve-drag-handle[aria-label="Move A"]')
          .evaluate(handle => 'pressed' in handle && handle.pressed)
      ).toBe(false);
    });
  });
});
