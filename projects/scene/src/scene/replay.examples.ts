// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/media/pause-button/define.js';
import '@nvidia-elements/media/playback-rate-select/define.js';
import '@nvidia-elements/media/seek-button/define.js';
import '@nvidia-elements/media/time-range/define.js';
import '@nvidia-elements/scene/axes/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/frame/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/scene/define.js';

export default {
  title: 'Elements/Scene/Replay',
  component: 'nve-scene'
};

/**
 * @summary Replay ROS joint messages from a Hugging Face SO-100 recording beside its camera video. Use STL assets, command comparison, and tool paths to inspect robotics integration behavior.
 * @tags pattern
 */
export const EpisodeReplay = {
  render: () => html`
    <div id="lerobot-episode-replay" nve-layout="column gap:md">
      <div nve-layout="row gap:sm align:wrap pad:sm">
        <h2 nve-text="heading sm">SO-100 robot playback</h2>
        <span nve-text="label sm muted">Episode 0 · 30 Hz · metres · ROS JointState</span>
      </div>
      <div nve-layout="grid gap:md span-items:6">
        <nve-scene id="lerobot-replay-scene" aria-label="Recorded SO-100 robot and commanded tool path" style="height: 400px; min-width: 0;">
          <nve-scene-camera behavior="orbit" target="[0.1,0,0.12]" distance="0.75" polar-angle="0.9" azimuth="0.7" min-distance="0.15" max-distance="2" near="0.001" far="10"></nve-scene-camera>
          <nve-scene-gridlines count="20" spacing="0.05"></nve-scene-gridlines>
          <nve-scene-axes length="0.1"></nve-scene-axes>
          <nve-scene-frame id="lerobot-base" name="base" orientation="[0,0,0.7071067811865475,0.7071067811865476]"></nve-scene-frame>
          <nve-scene-lines id="lerobot-observed-path" width-unit="pixel" topology="strip"></nve-scene-lines>
          <nve-scene-lines id="lerobot-command-path" width-unit="pixel" topology="strip"></nve-scene-lines>
          <p slot="fallback" nve-text="body">The joint readout and playback controls remain available when WebGPU is unavailable.</p>
        </nve-scene>
        <div nve-layout="column gap:sm">
          <video id="lerobot-episode-video" preload="auto" muted playsinline style="width: 100%; max-height: 400px; aspect-ratio: 4 / 3;" aria-label="Original top-camera recording"></video>
        </div>
      </div>
      <div nve-layout="column gap:sm pad:sm">
        <nve-media-time-range id="lerobot-frame-range" commandfor="lerobot-episode-replay" aria-label="Episode playback position" min="0" max="32.033333" step="0.033333" value="0" disabled></nve-media-time-range>
        <div nve-layout="row gap:sm align:wrap align:center" role="group" aria-label="Robot playback controls">
          <nve-media-seek-button id="lerobot-restart" action="start" commandfor="lerobot-episode-replay" disabled></nve-media-seek-button>
          <nve-media-pause-button id="lerobot-play-pause" commandfor="lerobot-episode-replay" checked disabled></nve-media-pause-button>
          <nve-media-seek-button id="lerobot-end" action="end" commandfor="lerobot-episode-replay" disabled></nve-media-seek-button>
          <nve-media-playback-rate-select id="lerobot-speed" commandfor="lerobot-episode-replay" aria-label="Playback speed" value="1" rates="[0.5, 1, 1.5, 2, 4]" disabled></nve-media-playback-rate-select>
          <nve-button id="lerobot-path-toggle" size="sm" pressed disabled>Tool paths</nve-button>
          <nve-button size="sm" popovertarget="lerobot-episode-info">Recording details</nve-button>
        </div>
        <output id="lerobot-frame-time" nve-text="label sm">Loading ROS recording and CAD…</output>
        <div nve-layout="grid gap:sm span-items:4" id="lerobot-joint-readout" aria-label="Observed and commanded joint positions"></div>
        <p nve-text="body sm muted">Observed: solid CAD robot and cyan path. Commanded: magenta path. Joint readouts use radians. The gripper travel and joint zero offsets are visualization estimates; this recording does not include hardware calibration.</p>
      </div>
      <nve-dialog id="lerobot-episode-info" modal closable hidden>
        <nve-dialog-header><h2 nve-text="heading sm">Recording and model</h2></nve-dialog-header>
        <div nve-layout="column gap:md">
          <p nve-text="body"><a href="https://huggingface.co/datasets/lerobot/svla_so100_sorting/tree/13870ca969084d8ce4d8a0391b06cead78e804ba" target="_blank" rel="noreferrer">Hugging Face LeRobot sorting dataset</a> · Apache-2.0 · Episode 0 · 962 samples.</p>
          <p nve-text="body">Task: put the red cube in the right box and the blue cube in the left box.</p>
          <p nve-text="body"><a href="https://github.com/TheRobotStudio/SO-ARM100/tree/5f6d2b876a53a4872e405b991dd925556c9e38a4/Simulation/SO100" target="_blank" rel="noreferrer">Official open hardware SO-100 CAD and URDF</a> · Apache-2.0. Geometry uses the original dimensions in metres.</p>
          <p nve-text="body"><a id="lerobot-recording-source" href="/static/scene/robot-playback/episode-0.ndjson.gz" download>Joint recording</a> · <a id="lerobot-robot-source" href="/static/scene/robot-playback/robot.json" download>Robot metadata</a>. The robot loads the original STL assets locally.</p>
          <p nve-text="body">The recording contains rosbridge publish messages for /joint_states and /commanded_joint_states. Camera video streams from the same pinned Hugging Face revision.</p>
        </div>
      </nve-dialog>
    </div>
    <script type="module">
      import { LineVertexBuffer } from '@nvidia-elements/scene/lines';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/axes/define.js';
      import '@nvidia-elements/scene/frame/define.js';
      import '@nvidia-elements/scene/model/define.js';
      import '@nvidia-elements/scene/lines/define.js';
      import '@nvidia-elements/core/button/define.js';
      import '@nvidia-elements/core/dialog/define.js';
      import '@nvidia-elements/media/pause-button/define.js';
      import '@nvidia-elements/media/playback-rate-select/define.js';
      import '@nvidia-elements/media/seek-button/define.js';
      import '@nvidia-elements/media/time-range/define.js';

      const wrapper = document.querySelector('#lerobot-episode-replay');
      const assetRequests = new AbortController();
      const scene = wrapper.querySelector('#lerobot-replay-scene');
      const base = wrapper.querySelector('#lerobot-base');
      const video = wrapper.querySelector('#lerobot-episode-video');
      const output = wrapper.querySelector('#lerobot-frame-time');
      const range = wrapper.querySelector('#lerobot-frame-range');
      const playPause = wrapper.querySelector('#lerobot-play-pause');
      const speedSelect = wrapper.querySelector('#lerobot-speed');
      const pathButton = wrapper.querySelector('#lerobot-path-toggle');
      const observedPath = wrapper.querySelector('#lerobot-observed-path');
      const commandedPath = wrapper.querySelector('#lerobot-command-path');
      const names = ['shoulder_pan', 'shoulder_lift', 'elbow_flex', 'wrist_flex', 'wrist_roll', 'gripper'];
      const controls = [range, playPause, speedSelect, pathButton,
        wrapper.querySelector('#lerobot-restart'), wrapper.querySelector('#lerobot-end')];
      let samples = [];
      let frames = [];
      let joints = [];
      let currentFrame = 0;
      let playing = false;
      let speed = 1;
      let clockTime = 0;
      let clockStart = 0;
      let animation;
      let videoEnabled = false;
      let videoPending = false;
      let pathsVisible = true;
      let pathBuffers;
      let readouts = [];
      let snapshotCount = 0;
      let jawTip;
      let sceneDiagnostic = '';
      scene.ready.catch(() => {
        sceneDiagnostic = ' · WebGPU unavailable';
        if (readouts.length === names.length) showFrame(currentFrame);
      });

      function multiply(left, right) {
        return [
          left[3]*right[0]+left[0]*right[3]+left[1]*right[2]-left[2]*right[1],
          left[3]*right[1]-left[0]*right[2]+left[1]*right[3]+left[2]*right[0],
          left[3]*right[2]+left[0]*right[1]-left[1]*right[0]+left[2]*right[3],
          left[3]*right[3]-left[0]*right[0]-left[1]*right[1]-left[2]*right[2]
        ];
      }
      function axisAngle(axis, angle) {
        return [...axis.map(value => value * Math.sin(angle / 2)), Math.cos(angle / 2)];
      }
      function rpyQuaternion(rpy) {
        return multiply(multiply(axisAngle([0,0,1],rpy[2]), axisAngle([0,1,0],rpy[1])), axisAngle([1,0,0],rpy[0]));
      }
      // Adapt physical-degree recording zeros to the older SO-100 simulation URDF.
      // These fixed offsets describe a visualization convention, not measured calibration.
      // Wrist roll uses the recorded zero so the claw opens horizontally without an extra quarter-turn.
      function cadAngle(index, angle) {
        return [-angle, 1.8 + angle, angle - Math.PI/2, 1 - Math.PI/2 + angle, -angle, angle][index];
      }
      function poses(positions) {
        return joints.map((joint, index) => ({position: joint.position,
          orientation: multiply(rpyQuaternion(joint.rpy), axisAngle(joint.axis, cadAngle(index, positions[index])))}));
      }
      function applyPoses(next) {
        // Prepare all transforms before the synchronous setters; rendering observes the whole snapshot.
        frames.forEach((frame, index) => frame.setPose(next[index]));
      }
      async function loadCompressed(url) {
        const response = await fetch(url, {signal: assetRequests.signal});
        if (!response.ok) throw new Error('Asset request failed: ' + response.status + ' ' + url);
        if (!response.body) throw new Error('Asset response is empty: ' + url);
        // Browsers decode HTTP gzip responses before exposing their body.
        if (response.headers.get('content-encoding')?.split(',').some(value => value.trim() === 'gzip')) {
          return response.text();
        }
        return new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).text();
      }
      function parseRecording(text) {
        const result = [];
        let pending;
        for (const line of text.trim().split(String.fromCharCode(10))) {
          const message = JSON.parse(line);
          const state = message.msg;
          if (message.op !== 'publish' || !state || !Array.isArray(state.name) ||
              !Array.isArray(state.position) || state.name.length !== 6 || state.position.length !== 6 ||
              new Set(state.name).size !== 6 || !state.position.every(Number.isFinite) ||
              !Array.isArray(state.velocity) || state.velocity.length !== 0 ||
              !Array.isArray(state.effort) || state.effort.length !== 0) throw new Error('Invalid ROS JointState.');
          const stamp = state.header?.stamp;
          if (!stamp || !Number.isInteger(stamp.secs) || !Number.isInteger(stamp.nsecs) ||
              stamp.secs < 0 || stamp.nsecs < 0 || stamp.nsecs >= 1e9) throw new Error('Invalid ROS timestamp.');
          const time = stamp.secs + stamp.nsecs / 1e9;
          const positions = names.map(name => {
            const index = state.name.indexOf(name);
            if (index < 0) throw new Error('Missing robot joint: ' + name);
            return state.position[index];
          });
          if (message.topic === '/joint_states') {
            if (pending || (result.length && time <= result[result.length-1].time)) throw new Error('Unordered recording.');
            pending = {time, observed: positions};
          } else if (message.topic === '/commanded_joint_states' && pending && pending.time === time) {
            result.push({...pending, commanded: positions});
            pending = undefined;
          } else throw new Error('Unmatched recording topic or timestamp.');
        }
        if (pending || result.length !== 962 || result[0].time !== 0) throw new Error('Incomplete episode.');
        return result;
      }
      function nearestFrame(time) {
        let low = 0;
        let high = samples.length - 1;
        while (low < high) {
          const middle = Math.floor((low + high) / 2);
          if (samples[middle].time < time) low = middle + 1;
          else high = middle;
        }
        return low > 0 && time - samples[low-1].time <= samples[low].time - time ? low-1 : low;
      }
      function showFrame(index) {
        currentFrame = Math.min(samples.length-1, Math.max(0, index));
        const sample = samples[currentFrame];
        const next = poses(sample.observed);
        applyPoses(next);
        snapshotCount += 1;
        range.valueAsNumber = sample.time;
        output.value = 'Frame ' + currentFrame + ' / 961 · ' + sample.time.toFixed(3) + ' / 32.033 s · ' + snapshotCount + ' snapshots' + sceneDiagnostic;
        names.forEach((name, index) => {
          readouts[index].textContent = name + ': ' + sample.observed[index].toFixed(3) + ' rad · command ' + sample.commanded[index].toFixed(3) + ' rad';
        });
      }
      function currentTime(now = performance.now()) {
        return videoEnabled ? video.currentTime : clockTime + (playing ? (now-clockStart)/1000*speed : 0);
      }
      function pause() {
        clockTime = currentTime();
        playing = false;
        playPause.checked = true;
        video.pause();
        if (animation !== undefined) cancelAnimationFrame(animation);
        animation = undefined;
      }
      const loopEnd = 962 / 30;
      function tick(now) {
        animation = undefined;
        if (!playing || !wrapper.isConnected) { pause(); return; }
        let time = currentTime(now);
        if (time >= loopEnd) {
          time %= loopEnd;
          clockTime = time;
          clockStart = now;
          if (videoEnabled) video.currentTime = time;
        }
        const index = nearestFrame(time);
        if (index !== currentFrame) showFrame(index);
        animation = requestAnimationFrame(tick);
      }
      function play() {
        if (playing) return;
        if (currentFrame === samples.length-1) seek(0);
        clockStart = performance.now();
        playing = true;
        playPause.checked = false;
        if (videoEnabled) video.play().catch(useOfflineClock);
        animation = requestAnimationFrame(tick);
      }
      function seek(index) {
        const resume = playing;
        pause();
        showFrame(index);
        clockTime = samples[currentFrame].time;
        clockStart = performance.now();
        if (videoEnabled) video.currentTime = clockTime;
        if (resume) play();
      }
      function useOfflineClock() {
        clockTime = samples[currentFrame].time;
        clockStart = performance.now();
        videoEnabled = false;
        videoPending = false;
        video.pause();
      }
      async function buildRobot(robot, metadataUrl) {
        joints = robot.joints;
        jawTip = robot.jawTip;
        const loads = [base.updateComplete];
        let parent = base;
        robot.links.forEach((link, index) => {
          if (index > 0) {
            const frame = document.createElement('nve-scene-frame');
            frame.name = link.name;
            parent.append(frame);
            parent = frame;
            frames.push(frame);
            loads.push(frame.updateComplete);
          }
          for (const visual of link.visuals) {
            const model = document.createElement('nve-scene-model');
            model.featureId = index + 1;
            model.tint = visual.motor ? '#30343b' : '#e8eaed';
            model.asset = new URL(visual.asset, metadataUrl).href;
            parent.append(model);
            loads.push(model.loadComplete);
          }
        });
        await Promise.all(loads);
      }
      function buildPaths() {
        const buffers = [new LineVertexBuffer({capacity: samples.length}), new LineVertexBuffer({capacity: samples.length})];
        samples.forEach(sample => {
          for (const [index, positions] of [sample.observed, sample.commanded].entries()) {
            applyPoses(poses(positions));
            // Jaw tip in the official Moving_Jaw mesh's local frame; no world-space FK reimplementation.
            const point = frames[5].getWorldPoint(jawTip);
            if (!point) throw new Error('Robot frame chain is unresolved.');
            buffers[index].add({position: point, width: 2, color: index === 0 ? 'cyan' : 'magenta'});
          }
        });
        pathBuffers = buffers;
        observedPath.source = buffers[0];
        commandedPath.source = buffers[1];
      }
      wrapper.addEventListener('command', event => {
        if (event.command === '--seek') { pause(); seek(nearestFrame(range.valueAsNumber)); }
        if (event.command === '--toggle-play') playing ? pause() : play();
        if (event.command === '--seek-start') { pause(); seek(0); }
        if (event.command === '--seek-end') { pause(); seek(samples.length-1); }
        if (event.command === '--set-playback-rate') {
          const nextSpeed = event.source?.valueAsNumber;
          if (!Number.isFinite(nextSpeed) || nextSpeed <= 0) return;
          const time = currentTime();
          speed = nextSpeed;
          clockTime = time;
          clockStart = performance.now();
          video.playbackRate = speed;
        }
      });
      pathButton.addEventListener('click', () => {
        pathsVisible = !pathsVisible;
        pathButton.pressed = pathsVisible;
        observedPath.source = pathsVisible ? pathBuffers[0] : null;
        commandedPath.source = pathsVisible ? pathBuffers[1] : null;
      });
      video.addEventListener('canplay', () => {
        if (!videoPending) return;
        const time = currentTime();
        videoPending = false;
        videoEnabled = true;
        video.currentTime = Math.min(time, samples[samples.length-1].time);
        video.playbackRate = speed;
        if (playing) video.play().catch(useOfflineClock);
      });
      video.addEventListener('error', useOfflineClock);
      scene.addEventListener('nve-scene-error', event => {
        sceneDiagnostic = ' · Scene diagnostic: ' + event.detail.code;
        if (readouts.length === names.length) showFrame(currentFrame);
      });
      const disconnectObserver = new MutationObserver(() => {
        if (!wrapper.isConnected) {
          assetRequests.abort();
          pause();
          video.removeAttribute('src');
          video.load();
          disconnectObserver.disconnect();
        }
      });
      disconnectObserver.observe(document.body, {childList: true, subtree: true});
      try {
        const metadataUrl = wrapper.querySelector('#lerobot-robot-source').href;
        const [recording, robot] = await Promise.all([
          loadCompressed(wrapper.querySelector('#lerobot-recording-source').href),
          fetch(metadataUrl, {signal: assetRequests.signal}).then(response => {
            if (!response.ok) throw new Error('Robot metadata request failed: ' + response.status);
            return response.json();
          })
        ]);
        if (!wrapper.isConnected) throw new DOMException('Example disconnected.', 'AbortError');
        samples = parseRecording(recording);
        await buildRobot(robot, metadataUrl);
        assetRequests.signal.throwIfAborted();
        names.forEach(name => {
          const readout = document.createElement('output');
          readout.setAttribute('nve-text', 'label sm');
          wrapper.querySelector('#lerobot-joint-readout').append(readout);
          readouts.push(readout);
        });
        buildPaths();
        showFrame(0);
        for (const control of controls) control.disabled = false;
        videoPending = true;
        video.src = 'https://huggingface.co/datasets/lerobot/svla_so100_sorting/resolve/13870ca969084d8ce4d8a0391b06cead78e804ba/videos/observation.images.top/chunk-000/file-000.mp4';
        video.load();
      } catch (error) {
        assetRequests.abort();
        base.replaceChildren();
        pause();
        output.value = 'Robot recording unavailable: ' + error.message;
        disconnectObserver.disconnect();
      }
    </script>
  `
};
