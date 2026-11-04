// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

declare global {
  interface Window {
    replayVideoProbe: {
      currentTime: number;
      seeking: boolean;
      active: Map<number, VideoFrameRequestCallback>;
      callbacks: Map<number, VideoFrameRequestCallback>;
      present(time: number, id?: number): void;
      command(command: string, value?: number): void;
    };
  }
}

describe('replay video synchronization', () => {
  test('uses presented frames through delayed decoding, seeks, pause, speed changes, and looping', async () => {
    const result = await visualRunner.inspect('scene-replay-video-clock', replayTemplate(), async page => {
      await page.waitForFunction(() =>
        document.querySelector('#lerobot-frame-time')?.textContent?.startsWith('Frame 0 / 95')
      );
      return page.evaluate(async () => {
        const video = document.querySelector<HTMLVideoElement>('#lerobot-episode-video')!;
        const output = document.querySelector<HTMLOutputElement>('#lerobot-frame-time')!;
        const probe = window.replayVideoProbe;
        const frame = () => Number(output.value.match(/^Frame (\d+)/)?.[1]);
        const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
        video.dispatchEvent(new Event('canplay'));
        probe.present(0);
        probe.command('--seek', 1);
        const obsolete = [...probe.active.keys()][0]!;
        await nextFrame();
        const delayed = frame();
        probe.command('--seek', 2);
        probe.present(1, obsolete);
        const stale = frame();
        // Even a current callback can contain a queued image from before the seek.
        probe.present(0);
        const queued = frame();
        probe.present(2);
        const sought = frame();
        probe.command('--seek', 1);
        probe.command('--toggle-play');
        probe.command('--toggle-play');
        probe.present(1);
        const paused = { frame: frame(), pending: probe.active.size, videoPaused: video.paused };
        probe.command('--toggle-play');
        probe.currentTime = 3;
        await nextFrame();
        const mediaClockAhead = frame();
        probe.command('--set-playback-rate', 2);
        probe.present(1.5);
        const playback = { frame: frame(), rate: video.playbackRate };
        probe.present(962 / 30);
        const looping = { frame: frame(), requestedTime: probe.currentTime };
        probe.present(0);
        const looped = frame();
        probe.command('--seek', 2);
        video.dispatchEvent(new Event('error'));
        const fallbackSeek = frame();
        probe.command('--seek', 1);
        const fallback = { frame: frame(), hidden: video.hidden, pending: probe.active.size };
        document.querySelector('#lerobot-episode-replay')!.remove();
        await nextFrame();
        for (const id of probe.callbacks.keys()) probe.present(3, id);
        return {
          delayed,
          stale,
          queued,
          sought,
          paused,
          mediaClockAhead,
          playback,
          looping,
          looped,
          fallback,
          fallbackSeek,
          afterRemoval: frame()
        };
      });
    });
    expect(result).toEqual({
      delayed: 0,
      stale: 0,
      queued: 0,
      sought: 60,
      paused: { frame: 30, pending: 0, videoPaused: true },
      mediaClockAhead: 30,
      playback: { frame: 45, rate: 2 },
      looping: { frame: 45, requestedTime: 0 },
      looped: 0,
      fallback: { frame: 30, hidden: true, pending: 0 },
      fallbackSeek: 60,
      afterRemoval: 30
    });
  });

  test('uses the recording clock when video frame callbacks are unavailable', async () => {
    const result = await visualRunner.inspect('scene-replay-video-fallback', replayTemplate(false), async page => {
      await page.waitForFunction(() =>
        document.querySelector('#lerobot-frame-time')?.textContent?.startsWith('Frame 0 / 95')
      );
      return page.evaluate(() => {
        const video = document.querySelector<HTMLVideoElement>('#lerobot-episode-video')!;
        video.dispatchEvent(new Event('canplay'));
        window.replayVideoProbe.command('--seek', 2);
        return {
          hidden: video.hidden,
          output: document.querySelector<HTMLOutputElement>('#lerobot-frame-time')!.value
        };
      });
    });
    expect(result.hidden).toBe(true);
    expect(result.output).toMatch(/^Frame 60 /);
  });
});

function replayTemplate(callbacksSupported = true): string {
  const source = readFileSync(new URL('./replay.examples.ts', import.meta.url), 'utf8');
  const markup = source.slice(source.indexOf('<div id="lerobot-episode-replay"'), source.lastIndexOf('  `'));
  const names = ['shoulder_pan', 'shoulder_lift', 'elbow_flex', 'wrist_flex', 'wrist_roll', 'gripper'];
  const links = ['base', 'shoulder', 'upper_arm', 'lower_arm', 'wrist', 'gripper', 'jaw'];
  const urdf = `<robot name="test">${links.map(name => `<link name="${name}"/>`).join('')}${names
    .map(
      (name, index) =>
        `<joint name="${name}" type="continuous"><parent link="${links[index]}"/><child link="${links[index + 1]}"/></joint>`
    )
    .join('')}</robot>`;
  const recording = Array.from({ length: 96 }, (_, index) =>
    ['/joint_states', '/commanded_joint_states']
      .map(topic =>
        JSON.stringify({
          topic,
          msg: {
            name: names,
            position: names.map(() => index / 100),
            header: { stamp: { secs: Math.floor(index / 30), nsecs: Math.round(((index % 30) / 30) * 1e9) } }
          }
        })
      )
      .join('\n')
  ).join('\n');
  return /* html */ `
    <script>
      const probe = window.replayVideoProbe = {
        currentTime: 0, seeking: false, paused: true, nextId: 0,
        active: new Map(), callbacks: new Map(),
        present(time, id = [...this.active.keys()][0]) {
          this.seeking = false;
          this.active.delete(id);
          const callback = this.callbacks.get(id);
          if (!callback) throw new Error('No pending video callback.');
          callback(performance.now(), {mediaTime: time});
        },
        command(command, value) {
          const event = new Event('command');
          const range = document.querySelector('#lerobot-frame-range');
          if (value !== undefined) range.valueAsNumber = value;
          Object.defineProperties(event, {command: {value: command}, source: {value: range}});
          document.querySelector('#lerobot-episode-replay').dispatchEvent(event);
        }
      };
      Object.defineProperties(HTMLVideoElement.prototype, {
        src: {configurable: true, set() {}},
        currentTime: {configurable: true, get() {return probe.currentTime;}, set(time) {probe.currentTime = time; probe.seeking = true;}},
        seeking: {configurable: true, get() {return probe.seeking;}},
        paused: {configurable: true, get() {return probe.paused;}},
        play: {configurable: true, value() {probe.paused = false; return Promise.resolve();}},
        pause: {configurable: true, value() {probe.paused = true;}},
        load: {configurable: true, value() {}},
        requestVideoFrameCallback: {configurable: true, value: ${
          callbacksSupported
            ? `function(callback) {
          const id = ++probe.nextId;
          probe.callbacks.set(id, callback);
          probe.active.set(id, callback);
          return id;
        }`
            : 'undefined'
        }},
        cancelVideoFrameCallback: {configurable: true, value(id) {probe.active.delete(id);}}
      });
      const recording = ${JSON.stringify(recording)};
      const urdf = ${JSON.stringify(urdf)};
      globalThis.fetch = async url => new Response(String(url).endsWith('.ndjson') ? recording : urdf);
    </script>
    ${markup}
  `;
}
