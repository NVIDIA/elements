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
import '@nvidia-elements/scene/joint/define.js';
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/body/define.js';
import '@nvidia-elements/scene/mesh/define.js';
import '@nvidia-elements/scene/scene/define.js';

export default {
  title: 'Elements/Scene/Replay',
  component: 'nve-scene'
};

/**
 * @summary Replay ROS joint messages from a Hugging Face SO-100 recording beside its camera video. Use URDF links and joints to construct scene bodies and connections, with command comparison and tool paths to inspect robotics integration behavior.
 * @tags pattern
 */
export const EpisodeReplay = {
  render: () => html`
    <div id="lerobot-episode-replay" nve-layout="column gap:md">
      <div nve-layout="row gap:sm align:wrap pad:sm">
        <h2 nve-text="heading sm">SO-100 robot playback</h2>
        <span nve-text="label sm muted">Episode 0 · 30 Hz · metres · ROS JointState</span>
      </div>
      <div nve-layout="grid gap:none span-items:6">
        <nve-scene id="lerobot-replay-scene" aria-label="Recorded SO-100 robot and commanded tool path" style="height: 400px; min-width: 0;">
          <nve-scene-camera behavior="orbit" target="[0.1,0,0.12]" distance="0.75" polar-angle="0.9" azimuth="0.7" min-distance="0.15" max-distance="2" near="0.001" far="10"></nve-scene-camera>
          <nve-scene-gridlines count="20" spacing="0.05"></nve-scene-gridlines>
          <nve-scene-axes length="0.1"></nve-scene-axes>
          <nve-scene-lines id="lerobot-observed-path" width-unit="pixel" topology="strip"></nve-scene-lines>
          <nve-scene-lines id="lerobot-command-path" width-unit="pixel" topology="strip"></nve-scene-lines>
        </nve-scene>
        <div nve-layout="column gap:sm">
          <video id="lerobot-episode-video" preload="auto" muted playsinline style="width: 100%; max-height: 400px; aspect-ratio: 4 / 3;" aria-label="Original top-camera recording"></video>
        </div>
      </div>
      <div nve-layout="column gap:sm pad:sm">
        <nve-media-time-range id="lerobot-frame-range" commandfor="lerobot-episode-replay" aria-label="Episode playback position" min="0" max="32.033333" step="0.033333" value="0" disabled></nve-media-time-range>
        <div nve-layout="row gap:sm align:wrap align:center" role="group" aria-label="Robot playback controls">
          <nve-media-seek-button action="start" commandfor="lerobot-episode-replay" disabled></nve-media-seek-button>
          <nve-media-pause-button id="lerobot-play-pause" commandfor="lerobot-episode-replay" checked disabled></nve-media-pause-button>
          <nve-media-seek-button action="end" commandfor="lerobot-episode-replay" disabled></nve-media-seek-button>
          <nve-media-playback-rate-select commandfor="lerobot-episode-replay" aria-label="Playback speed" value="1" rates="[0.5, 1, 1.5, 2, 4]" disabled></nve-media-playback-rate-select>
          <nve-button id="lerobot-path-toggle" size="sm" pressed disabled>Tool paths</nve-button>
          <nve-button size="sm" popovertarget="lerobot-episode-info">Recording details</nve-button>
        </div>
        <output id="lerobot-frame-time" nve-text="label sm">Loading ROS recording and CAD…</output>
        <div nve-layout="grid gap:sm span-items:4" id="lerobot-joint-readout" aria-label="Observed and commanded joint positions">
          <output nve-text="label sm"></output>
          <output nve-text="label sm"></output>
          <output nve-text="label sm"></output>
          <output nve-text="label sm"></output>
          <output nve-text="label sm"></output>
          <output nve-text="label sm"></output>
        </div>
        <p nve-text="body sm muted">Observed: solid CAD robot and cyan path. Commanded: magenta path. Joint readouts use radians. The gripper travel and joint zero offsets are visualization estimates; this recording does not include hardware calibration.</p>
      </div>
      <nve-dialog id="lerobot-episode-info" modal closable hidden>
        <nve-dialog-header><h2 nve-text="heading sm">Recording and body</h2></nve-dialog-header>
        <div nve-layout="column gap:md">
          <p nve-text="body"><a href="https://huggingface.co/datasets/lerobot/svla_so100_sorting/tree/13870ca969084d8ce4d8a0391b06cead78e804ba" target="_blank" rel="noreferrer">Hugging Face LeRobot sorting dataset</a> · Apache-2.0 · Episode 0 · 962 samples.</p>
          <p nve-text="body">Task: put the red cube in the right box and the blue cube in the left box.</p>
          <p nve-text="body"><a href="https://github.com/TheRobotStudio/SO-ARM100/tree/5f6d2b876a53a4872e405b991dd925556c9e38a4/Simulation/SO100" target="_blank" rel="noreferrer">Official open hardware SO-100 CAD and URDF</a> · Apache-2.0. Geometry uses the original dimensions in metres.</p>
          <p nve-text="body"><a href="/static/scene/so-100/episode-0.ndjson" download>Joint recording</a> · <a href="/static/scene/so-100/so100.urdf" download>Robot URDF</a>. The robot loads the original STL assets locally.</p>
          <p nve-text="body">The recording contains rosbridge publish messages for /joint_states and /commanded_joint_states. Camera video streams from the same pinned Hugging Face revision.</p>
        </div>
      </nve-dialog>
    </div>
    <script type="module">
      import { LineVertexBuffer } from '@nvidia-elements/scene/lines';
      import { quaternionFromRpy } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/axes/define.js';
      import '@nvidia-elements/scene/joint/define.js';
      import '@nvidia-elements/scene/model/define.js';
      import '@nvidia-elements/scene/body/define.js';
      import '@nvidia-elements/scene/mesh/define.js';
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
      const video = wrapper.querySelector('#lerobot-episode-video');
      const output = wrapper.querySelector('#lerobot-frame-time');
      const range = wrapper.querySelector('#lerobot-frame-range');
      const playPause = wrapper.querySelector('#lerobot-play-pause');
      const pathButton = wrapper.querySelector('#lerobot-path-toggle');
      const observedPath = wrapper.querySelector('#lerobot-observed-path');
      const commandedPath = wrapper.querySelector('#lerobot-command-path');
      const readouts = wrapper.querySelectorAll('#lerobot-joint-readout output');
      const names = ['shoulder_pan', 'shoulder_lift', 'elbow_flex', 'wrist_flex', 'wrist_roll', 'gripper'];
      // Visualization estimates from the earlier replay; these are not measured hardware calibration.
      const replay = {
        joints: {
          shoulder_pan: { scale: -1, offset: 0 },
          shoulder_lift: { scale: 1, offset: 1.8 },
          elbow_flex: { scale: 1, offset: -Math.PI / 2 },
          wrist_flex: { scale: 1, offset: 1 - Math.PI / 2 },
          wrist_roll: { scale: -1, offset: 0 },
          gripper: { scale: 1, offset: 0 }
        },
        // Moving_Jaw.stl bounds: midpoint in x/z at minimum y.
        jawTip: [-0.00115, -0.082, 9.99999999999994e-5],
        linkColors: {
          base: '#ff7a33', shoulder: '#ff7a33', upper_arm: '#ff7a33', lower_arm: '#ff7a33',
          wrist: '#eceae6', gripper: '#eceae6', jaw: '#ff7a33'
        },
        motorColor: '#222326'
      };
      const loopEnd = 962 / 30;
      let arm;
      let samples = [];
      let currentFrame = 0;
      let playing = false;
      let speed = 1;
      let clockTime = 0;
      let clockStart = 0;
      let animation;
      let videoEnabled = false;
      let snapshotCount = 0;
      let sceneDiagnostic = '';

      async function loadText(url) {
        const response = await fetch(url, {signal: assetRequests.signal});
        if (!response.ok) throw new Error('Asset request failed: ' + response.status + ' ' + url);
        return response.text();
      }
      function parseRecording(text) {
        const result = [];
        let pending;
        for (const line of text.trim().split(String.fromCharCode(10))) {
          const { topic, msg } = JSON.parse(line);
          const time = msg.header.stamp.secs + msg.header.stamp.nsecs / 1e9;
          const positions = Object.fromEntries(names.map(name => {
            const index = msg.name.indexOf(name);
            if (index < 0) throw new Error('Missing robot joint: ' + name);
            return [name, msg.position[index]];
          }));
          if (topic === '/joint_states') {
            if (pending || time <= (result.at(-1)?.time ?? -1)) throw new Error('Unordered recording.');
            pending = {time, observed: positions};
          } else if (topic === '/commanded_joint_states' && pending?.time === time) {
            result.push({...pending, commanded: positions});
            pending = undefined;
          } else throw new Error('Unmatched recording topic or timestamp.');
        }
        if (pending || !result.length) throw new Error('Incomplete episode.');
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
        arm.joints.set(sample.observed);
        snapshotCount += 1;
        range.valueAsNumber = sample.time;
        output.value = 'Frame ' + currentFrame + ' / ' + (samples.length-1) + ' · ' + sample.time.toFixed(3) + ' / ' + samples.at(-1).time.toFixed(3) + ' s · ' + snapshotCount + ' snapshots' + sceneDiagnostic;
        names.forEach((name, index) => {
          readouts[index].textContent = name + ': ' + sample.observed[name].toFixed(3) + ' rad · command ' + sample.commanded[name].toFixed(3) + ' rad';
        });
      }
      function showDiagnostic(text) {
        sceneDiagnostic = text;
        if (samples.length) showFrame(currentFrame);
      }
      function currentTime(now = performance.now()) {
        return videoEnabled ? video.currentTime : clockTime + (playing ? (now-clockStart)/1000*speed : 0);
      }
      function pause() {
        clockTime = currentTime();
        playing = false;
        playPause.checked = true;
        video.pause();
        cancelAnimationFrame(animation);
      }
      function tick(now) {
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
      function playVideo() {
        // A later pause or seek rejects a pending play() with AbortError; the video stays usable.
        video.play().catch(error => { if (error.name !== 'AbortError') useOfflineClock(); });
      }
      function play() {
        if (currentFrame === samples.length-1) seek(0);
        clockStart = performance.now();
        playing = true;
        playPause.checked = false;
        if (videoEnabled) playVideo();
        animation = requestAnimationFrame(tick);
      }
      function seek(index) {
        pause();
        showFrame(index);
        clockTime = samples[currentFrame].time;
        if (videoEnabled) video.currentTime = clockTime;
      }
      function useOfflineClock() {
        clockTime = samples[currentFrame].time;
        clockStart = performance.now();
        videoEnabled = false;
        video.pause();
      }
      function stop() {
        assetRequests.abort();
        pause();
        disconnectObserver.disconnect();
      }
      function vector(urdfNode, attribute, fallback) {
        const text = urdfNode?.getAttribute(attribute);
        const values = text ? text.trim().split(' ').filter(Boolean).map(Number) : fallback;
        if (values.length !== 3 || !values.every(Number.isFinite)) throw new Error('Invalid URDF ' + attribute + '.');
        return values;
      }
      function origin(urdfNode) {
        const urdfOrigin = urdfNode.querySelector(':scope > origin');
        return {
          position: vector(urdfOrigin, 'xyz', [0, 0, 0]),
          orientation: quaternionFromRpy(vector(urdfOrigin, 'rpy', [0, 0, 0]))
        };
      }
      async function buildRobot(text, urdfUrl) {
        const xml = new DOMParser().parseFromString(text, 'application/xml');
        if (xml.querySelector('parsererror') || xml.documentElement.localName !== 'robot') throw new Error('Invalid robot URDF.');
        const urdfRobot = xml.documentElement;
        arm = document.createElement('nve-scene-model');
        arm.name = 'arm';
        arm.orientation = quaternionFromRpy([0, 0, Math.PI / 2]);
        scene.append(arm);
        const loads = [arm.updateComplete];
        // urdf* names are parsed XML nodes, which expose only attributes; scene elements take properties.
        // Only direct robot joints define connections; transmissions contain joint references too.
        for (const urdfJoint of urdfRobot.querySelectorAll(':scope > joint')) {
          const name = urdfJoint.getAttribute('name');
          const urdfLimit = urdfJoint.querySelector(':scope > limit');
          const joint = document.createElement('nve-scene-joint');
          Object.assign(joint, {
            name, type: urdfJoint.getAttribute('type'), ...origin(urdfJoint),
            parent: urdfJoint.querySelector(':scope > parent').getAttribute('link'),
            child: urdfJoint.querySelector(':scope > child').getAttribute('link'),
            axis: vector(urdfJoint.querySelector(':scope > axis'), 'xyz', [1, 0, 0]),
            lower: urdfLimit?.hasAttribute('lower') ? Number(urdfLimit.getAttribute('lower')) : null,
            upper: urdfLimit?.hasAttribute('upper') ? Number(urdfLimit.getAttribute('upper')) : null,
            // Recording zeros and directions remain application-specific calibration.
            ...replay.joints[name]
          });
          arm.append(joint);
          loads.push(joint.updateComplete);
        }
        for (const [index, urdfLink] of [...urdfRobot.querySelectorAll(':scope > link')].entries()) {
          const name = urdfLink.getAttribute('name');
          const body = document.createElement('nve-scene-body');
          body.name = name;
          body.featureId = index + 1;
          arm.append(body);
          for (const urdfVisual of urdfLink.querySelectorAll(':scope > visual')) {
            // The pinned SO-100 URDF uses STL meshes for every visual.
            const urdfMesh = urdfVisual.querySelector(':scope > geometry > mesh');
            if (!urdfMesh) throw new Error('Expected an STL mesh visual in the SO-100 URDF.');
            // The URDF marks every servo with the sts3215 material; printed parts take their link color.
            const motor = urdfVisual.querySelector(':scope > material')?.getAttribute('name') === 'sts3215';
            const part = document.createElement('nve-scene-mesh');
            Object.assign(part, {
              ...origin(urdfVisual), scale: vector(urdfMesh, 'scale', [1, 1, 1]),
              color: motor ? replay.motorColor : replay.linkColors[name],
              src: new URL(urdfMesh.getAttribute('filename'), urdfUrl).href
            });
            body.append(part);
          }
          loads.push(body.loadComplete);
        }
        await Promise.all(loads);
      }
      function buildPaths(recording) {
        const jaw = arm.bodies.get('jaw');
        const observed = new LineVertexBuffer({capacity: recording.length});
        const commanded = new LineVertexBuffer({capacity: recording.length});
        for (const sample of recording) {
          for (const [buffer, positions, color] of [[observed, sample.observed, 'cyan'], [commanded, sample.commanded, 'magenta']]) {
            arm.joints.set(positions);
            // Jaw tip in the official Moving_Jaw mesh's local frame; no world-space FK reimplementation.
            const point = jaw.getWorldPoint(replay.jawTip);
            if (!point) throw new Error('Robot frame chain is unresolved.');
            buffer.add({position: point, width: 2, color});
          }
        }
        observedPath.source = observed;
        commandedPath.source = commanded;
      }
      wrapper.addEventListener('command', event => {
        switch (event.command) {
          case '--toggle-play': playing ? pause() : play(); break;
          case '--seek': seek(nearestFrame(range.valueAsNumber)); break;
          case '--seek-start': seek(0); break;
          case '--seek-end': seek(samples.length-1); break;
          case '--set-playback-rate': {
            const rate = event.source?.valueAsNumber;
            if (!Number.isFinite(rate) || rate <= 0) break;
            clockTime = currentTime();
            clockStart = performance.now();
            speed = rate;
            video.playbackRate = speed;
          }
        }
      });
      pathButton.addEventListener('click', () => {
        pathButton.pressed = !pathButton.pressed;
        observedPath.hidden = commandedPath.hidden = !pathButton.pressed;
      });
      video.addEventListener('canplay', () => {
        const time = currentTime();
        videoEnabled = true;
        video.currentTime = Math.min(time, samples.at(-1).time);
        video.playbackRate = speed;
        if (playing) playVideo();
      }, { once: true });
      video.addEventListener('error', useOfflineClock);
      scene.ready.catch(() => showDiagnostic(' · WebGPU unavailable'));
      scene.addEventListener('nve-scene-error', event => showDiagnostic(' · Scene diagnostic: ' + event.detail.code));
      const disconnectObserver = new MutationObserver(() => {
        if (wrapper.isConnected) return;
        stop();
        video.removeAttribute('src');
        video.load();
      });
      disconnectObserver.observe(document.body, {childList: true, subtree: true});
      try {
        const urdfUrl = new URL('/static/scene/so-100/so100.urdf', document.baseURI);
        const [recording, urdf] = await Promise.all([
          loadText('/static/scene/so-100/episode-0.ndjson'),
          loadText(urdfUrl)
        ]);
        const parsed = parseRecording(recording);
        await buildRobot(urdf, urdfUrl);
        assetRequests.signal.throwIfAborted();
        buildPaths(parsed);
        samples = parsed;
        showFrame(0);
        for (const control of wrapper.querySelectorAll('[disabled]')) control.disabled = false;
        video.src = 'https://huggingface.co/datasets/lerobot/svla_so100_sorting/resolve/13870ca969084d8ce4d8a0391b06cead78e804ba/videos/observation.images.top/chunk-000/file-000.mp4';
      } catch (error) {
        stop();
        arm?.remove();
        output.value = 'Robot recording unavailable: ' + error.message;
      }
    </script>
  `
};
