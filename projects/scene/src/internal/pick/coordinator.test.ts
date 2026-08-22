// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { PickCoordinator } from './coordinator.js';

describe(PickCoordinator.name, () => {
  it('releases pointer down/up/click in request order despite completion order', async () => {
    const resolvers = new Map<number, (value: string) => void>();
    const completed: string[] = [];
    const coordinator = new PickCoordinator<string>({
      onComplete: ({ request, hit }) => completed.push(`${request.kind}:${hit ?? 'null'}`)
    });
    const request = (kind: 'pointerdown' | 'pointerup' | 'click') =>
      coordinator.request(kind, ({ sequence }) => new Promise(resolve => resolvers.set(sequence, resolve))).result;

    const down = request('pointerdown');
    const up = request('pointerup');
    const click = request('click');
    await Promise.resolve();
    resolvers.get(3)?.('click-hit');
    resolvers.get(2)?.('up-hit');
    await Promise.resolve();
    expect(completed).toEqual([]);
    resolvers.get(1)?.('down-hit');

    await expect(down).resolves.toBe('down-hit');
    await expect(up).resolves.toBe('up-hit');
    await expect(click).resolves.toBe('click-hit');
    expect(completed).toEqual(['pointerdown:down-hit', 'pointerup:up-hit', 'click:click-hit']);
  });

  it('releases later ordered requests after an earlier readback rejects', async () => {
    let rejectFirst!: (reason: Error) => void;
    let resolveSecond!: (value: string) => void;
    const completed: string[] = [];
    const coordinator = new PickCoordinator<string>({
      onComplete: ({ request, hit }) => completed.push(`${request.kind}:${hit}`)
    });
    const first = coordinator.request(
      'pointerdown',
      () => new Promise<string>((_resolve, reject) => (rejectFirst = reject))
    );
    const second = coordinator.request('click', () => new Promise<string>(resolve => (resolveSecond = resolve)));
    await Promise.resolve();
    resolveSecond('click');
    rejectFirst(new Error('map failed'));

    await expect(first.result).rejects.toThrow('map failed');
    await expect(second.result).resolves.toBe('click');
    expect(completed).toEqual(['click:click']);
  });

  it('runs one hover resolver at a time and keeps only the latest queued request', async () => {
    const resolvers = new Map<number, (value: string) => void>();
    const completed: number[] = [];
    const stale: number[] = [];
    const coordinator = new PickCoordinator<string>({
      onComplete: ({ request }) => completed.push(request.sequence),
      onStaleHover: request => stale.push(request.sequence)
    });
    const hover = () =>
      coordinator.request('hover', ({ sequence }) => new Promise(resolve => resolvers.set(sequence, resolve))).result;

    const first = hover();
    await Promise.resolve();
    const second = hover();
    const third = hover();
    await expect(second).resolves.toBeNull();
    expect([...resolvers.keys()]).toEqual([1]);
    resolvers.get(1)?.('old');
    await expect(first).resolves.toBeNull();
    await vi.waitFor(() => expect(resolvers.has(3)).toBe(true));
    resolvers.get(3)?.('new');
    await expect(third).resolves.toBe('new');
    expect(completed).toEqual([3]);
    expect(stale).toEqual([2, 1]);
  });

  it('notifies stale-hover cleanup when an active hover rejects', async () => {
    const rejects = new Map<number, (reason: Error) => void>();
    const stale: number[] = [];
    const coordinator = new PickCoordinator<string>({ onStaleHover: request => stale.push(request.sequence) });
    const hover = () =>
      coordinator.request(
        'hover',
        ({ sequence }) => new Promise<string>((_resolve, reject) => rejects.set(sequence, reject))
      ).result;

    const first = hover();
    await Promise.resolve();
    const second = hover();
    await Promise.resolve();
    rejects.get(1)?.(new Error('superseded'));
    await expect(first).resolves.toBeNull();
    expect(stale).toEqual([1]);
    await vi.waitFor(() => expect(rejects.has(2)).toBe(true));
    rejects.get(2)?.(new Error('current'));
    await expect(second).rejects.toThrow('current');
  });

  it('bounds a hover burst to one active resolver and measures the latest point latency', async () => {
    let active = 0;
    let maximumActive = 0;
    let now = 10;
    const latencies: Array<{ latency: number; sequence: number }> = [];
    const resolvers = new Map<number, (value: string) => void>();
    const coordinator = new PickCoordinator<string>({
      now: () => now,
      onHoverLatency: (latency, request) => latencies.push({ latency, sequence: request.sequence })
    });
    const hover = () =>
      coordinator.request('hover', ({ sequence }) => {
        active += 1;
        maximumActive = Math.max(maximumActive, active);
        return new Promise<string>(resolve =>
          resolvers.set(sequence, value => {
            active -= 1;
            resolve(value);
          })
        );
      }).result;

    const burst = [hover()];
    await Promise.resolve();
    for (let index = 1; index < 20; index += 1) burst.push(hover());
    now = 20;
    resolvers.get(1)?.('old');
    await vi.waitFor(() => expect(resolvers.has(20)).toBe(true));
    now = 35;
    resolvers.get(20)?.('latest');

    await expect(Promise.all(burst)).resolves.toEqual([...Array.from({ length: 19 }, () => null), 'latest']);
    expect(maximumActive).toBe(1);
    expect([...resolvers.keys()]).toEqual([1, 20]);
    expect(latencies).toEqual([{ latency: 25, sequence: 20 }]);
  });

  it('assigns monotonic sequences across hover and pointer requests', () => {
    const coordinator = new PickCoordinator();
    const first = coordinator.request('hover', () => null);
    const second = coordinator.request('click', () => null);
    expect(first.request.sequence).toBe(1);
    expect(second.request.sequence).toBe(2);
    expect(coordinator.latestSequence).toBe(2);
  });
});
