// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const mediaCommands = {
  play: '--play',
  pause: '--pause',
  togglePlayback: '--toggle-play',
  mute: '--mute',
  unmute: '--unmute',
  toggleMuted: '--toggle-mute',
  seek: '--seek',
  seekToStart: '--seek-start',
  seekToEnd: '--seek-end',
  seekBackward: '--seek-backward',
  seekForward: '--seek-forward',
  setVolume: '--set-volume',
  setPlaybackRate: '--set-playback-rate',
  enterFullscreen: '--enter-fullscreen',
  exitFullscreen: '--exit-fullscreen',
  toggleFullscreen: '--toggle-fullscreen'
} as const;

export type MediaCommand = (typeof mediaCommands)[keyof typeof mediaCommands];

export type MediaSeekAction = 'start' | 'backward' | 'forward' | 'end';

export type MediaCommandSource = HTMLElement & {
  valueAsNumber?: number;
  value?: string;
};

export type MediaCommandEvent = Event & {
  command?: string;
  source?: MediaCommandSource | null;
};

export function isMediaCommand(command: string | undefined): command is MediaCommand {
  return Object.values(mediaCommands).includes(command as MediaCommand);
}
