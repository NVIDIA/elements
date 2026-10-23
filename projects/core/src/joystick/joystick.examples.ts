// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/joystick/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/range/define.js';

export default { title: 'Elements/Joystick', component: 'nve-joystick' };

/**
 * @summary Select a direction and intensity with a circular movement region. Release the pointer or arrow keys to return to center.
 * @description Both axes use normalized values from -1 to 1. Applications can derive length with Math.hypot(x, y) and angle with Math.atan2(-y, x). This angle uses radians from the rightward direction with counterclockwise positive rotation. Use undefined at neutral. Keep these derived quantities outside the writable value. The angle does not describe the robot's heading.
 */
export const Default = {
  render: () => html`<nve-joystick aria-label="Movement"></nve-joystick>`
};

/**
 * @summary Choose small, medium, or large controls to fit the available space. Each size scales the movement surface and thumb together.
 */
export const Size = {
  render: () => html`
    <div nve-layout="row gap:lg align:wrap">
      <nve-joystick aria-label="Small movement" size="sm"></nve-joystick>
      <nve-joystick aria-label="Medium movement" size="md"></nve-joystick>
      <nve-joystick aria-label="Large movement" size="lg"></nve-joystick>
    </div>
  `
};

/**
 * @summary Overlay a joystick with a translucent background on a checkered scene. Keep the border and thumb at full opacity for contrast.
 * @tags theme
 */
export const Opacity = {
  render: () => html`
    <div
      nve-layout="row align:center pad:lg"
      style="
        width: 100%;
        min-height: 16rem;
        background: repeating-conic-gradient(
            var(--nve-sys-layer-container-background) 0% 25%,
            var(--nve-sys-layer-canvas-background) 0% 50%
          )
          center / 2rem 2rem;
      "
    >
      <nve-joystick aria-label="Movement" opacity></nve-joystick>
    </div>
  `
};

/**
 * @summary Compare circular, square, and single-axis movement regions. Choose a constraint that matches the available commands.
 * @description Circle bounds normalized magnitude to one. Square allows independent full-scale axes and a magnitude of up to Math.SQRT2. Use circle for planar direction and intensity, or square for independent limits such as forward velocity and turning rate. Equally scaled planar velocity axes can produce about 41% greater diagonal speed with square input.
 */
export const Constraints = {
  render: () => html`
    <div nve-layout="row gap:lg align:wrap">
      <nve-joystick aria-label="Circular movement"></nve-joystick>
      <nve-joystick aria-label="Independent axes" constraint="square"></nve-joystick>
      <nve-joystick aria-label="Turn" constraint="horizontal"></nve-joystick>
      <nve-joystick aria-label="Vertical movement" constraint="vertical"></nve-joystick>
    </div>
  `
};

/**
 * @summary Keep the last position after release for persistent target selection. Press Escape during an interaction to return to center.
 */
export const Hold = {
  render: () => html`<nve-joystick aria-label="Persistent target" release="hold"></nve-joystick>`
};

/**
 * @summary Display recorded input without generating control events. Use read-only state for inspection and disabled state for unavailable controls.
 * @description Set readOnly to true before assigning recorded vectors through .value. Use undefined for an absent sample and a zero vector for recorded neutral input. The recording layer captures source, sample time, engagement transitions, and mapping configuration. Preserve its clock during replay and avoid applying input shaping to recorded samples again.
 */
export const States = {
  render: () => html`
    <div nve-layout="row gap:lg align:wrap">
      <nve-joystick aria-label="Recorded input" readonly value='{"x":0.4,"y":-0.6}'></nve-joystick>
      <nve-joystick aria-label="Unavailable control" disabled></nve-joystick>
    </div>
  `
};

/**
 * @summary Map travel and turn input to body-frame velocities in meters and radians per second. Engage either joystick to update its command axes.
 * @description Input maps to ROS body axes: x-forward, y-left, z-up, with positive yaw counterclockwise. Travel uses square constraints for independent axis limits; use circle to bound normalized translation magnitude. The illustrative maxima are 1 m/s forward, 0.5 m/s lateral, and 1 rad/s yaw. Each control's :state(active) CSS custom state gates its displayed velocity. Interaction events refresh the readouts. The application chooses its limits and publishes the latest command at its own cadence, including while input remains stationary.
 */
export const TravelTurn = {
  render: () => html`
    <div id="joystick-travel-turn" nve-layout="column gap:lg">
      <div nve-layout="row gap:lg align:wrap">
        <div nve-layout="column gap:sm">
          <label for="joystick-travel">Travel</label>
          <nve-joystick id="joystick-travel" constraint="square"></nve-joystick>
          <output data-travel style="width: 170px">Released: x 0.00, y 0.00</output>
        </div>
        <div nve-layout="column gap:sm">
          <label for="joystick-turn">Turn</label>
          <nve-joystick id="joystick-turn" constraint="horizontal"></nve-joystick>
          <output data-turn>Released: x 0.00, y 0.00</output>
        </div>
      </div>
      <output data-command>vx 0.00 m/s, vy 0.00 m/s, wz 0.00 rad/s</output>
    </div>
    <script type="module">
      const group = document.querySelector('#joystick-travel-turn');
      const travel = group.querySelector('#joystick-travel');
      const turn = group.querySelector('#joystick-turn');
      const maxForwardMps = 1;
      const maxLateralMps = 0.5;
      const maxYawRadps = 1;

      function describe(control) {
        const value = control.value;
        const state = control.matches(':state(active)') ? 'Engaged' : 'Released';
        return state + ': ' + (value ? 'x ' + value.x.toFixed(2) + ', y ' + value.y.toFixed(2) : 'No sample');
      }

      function update() {
        group.querySelector('[data-travel]').textContent = describe(travel);
        group.querySelector('[data-turn]').textContent = describe(turn);
        const translation = travel.matches(':state(active)') ? travel.value : undefined;
        const rotation = turn.matches(':state(active)') ? turn.value : undefined;
        const command = {
          vx: -(translation?.y ?? 0) * maxForwardMps,
          vy: -(translation?.x ?? 0) * maxLateralMps,
          wz: -(rotation?.x ?? 0) * maxYawRadps
        };
        group.querySelector('[data-command]').textContent =
          'vx ' + command.vx.toFixed(2) + ' m/s, vy ' + command.vy.toFixed(2) + ' m/s, wz ' + command.wz.toFixed(2) + ' rad/s';
      }

      for (const type of ['input', 'interaction-start', 'interaction-end']) group.addEventListener(type, update);
      await customElements.whenDefined('nve-joystick');
      update();
    </script>
  `
};

/**
 * @summary Adjust a radial dead zone and response curve before mapping input to commands. Compare the shaped vector with the unchanged joystick value.
 * @description A dead zone of zero and response exponent of one leave circular input unchanged. The dead zone makes neutral easier to select; a larger exponent provides finer control near neutral. The remaining range scales back to full output at the boundary and preserves direction. Shaping produces a separate command vector without rewriting .value. Map it to physical units afterward. Apply filtering in one input layer to avoid processing hardware or recorded samples twice. [ROS joystick parameters](https://github.com/ros-drivers/joystick_drivers/blob/ros2/joy/README.md)
 */
export const InputShaping = {
  render: () => html`
    <div id="joystick-shaping" nve-layout="column gap:md">
      <nve-joystick aria-label="Movement" constraint="circle"></nve-joystick>
      <nve-range>
        <label for="joystick-deadzone">Dead zone</label>
        <input id="joystick-deadzone" type="range" min="0" max="0.5" step="0.01" value="0" />
      </nve-range>
      <nve-range>
        <label for="joystick-response">Response exponent</label>
        <input id="joystick-response" type="range" min="1" max="3" step="0.1" value="1" />
      </nve-range>
      <output data-settings>Dead zone 0.00, response 1.0</output>
      <output data-raw>Raw: x 0.00, y 0.00</output>
      <output data-shaped>Shaped: x 0.00, y 0.00</output>
    </div>
    <script type="module">
      const group = document.querySelector('#joystick-shaping');
      const joystick = group.querySelector('nve-joystick');
      const deadzone = group.querySelector('#joystick-deadzone');
      const response = group.querySelector('#joystick-response');

      function shape(value, deadzone, exponent) {
        const magnitude = Math.hypot(value.x, value.y);
        if (magnitude <= deadzone) return { x: 0, y: 0 };
        const strength = ((magnitude - deadzone) / (1 - deadzone)) ** exponent;
        return { x: value.x / magnitude * strength, y: value.y / magnitude * strength };
      }

      function update() {
        const raw = joystick.value ?? { x: 0, y: 0 };
        const shaped = shape(raw, deadzone.valueAsNumber, response.valueAsNumber);
        group.querySelector('[data-settings]').textContent =
          'Dead zone ' + deadzone.valueAsNumber.toFixed(2) + ', response ' + response.valueAsNumber.toFixed(1);
        group.querySelector('[data-raw]').textContent = 'Raw: x ' + raw.x.toFixed(2) + ', y ' + raw.y.toFixed(2);
        group.querySelector('[data-shaped]').textContent = 'Shaped: x ' + shaped.x.toFixed(2) + ', y ' + shaped.y.toFixed(2);
      }

      group.addEventListener('input', update);
      await customElements.whenDefined('nve-joystick');
      update();
    </script>
  `
};

/**
 * @summary Submit both axes as separate named fields and restore the declared position with form reset. Use held values when selecting persistent form targets.
 */
export const Form = {
  render: () => html`
    <form nve-layout="column gap:md">
      <label for="joystick-form">Target</label>
      <nve-joystick id="joystick-form" name="target" release="hold" value='{"x":0.2,"y":-0.3}'></nve-joystick>
      <nve-button type="reset">Reset target</nve-button>
    </form>
  `
};

/**
 * @summary Override joystickPosition through i18n to localize spoken coordinates while keeping built-in position announcements.
 */
export const AccessibleFeedback = {
  render: () => html`
    <nve-joystick aria-label="Movement" i18n='{"joystickPosition":"Horizontal {x}, vertical {y}."}'></nve-joystick>
  `
};

/**
 * @summary Supply application announcements with a labeled output. Disable built-in announcements to avoid duplicate feedback.
 */
export const ExternalFeedback = {
  render: () => html`
    <div id="joystick-external-feedback" nve-layout="column gap:md">
      <nve-joystick aria-label="Target" announce="off" release="hold"></nve-joystick>
      <output aria-live="polite" aria-atomic="true">Target: X 0, Y 0</output>
    </div>
    <script type="module">
      const root = document.querySelector('#joystick-external-feedback');
      const joystick = root.querySelector('nve-joystick');
      const output = root.querySelector('output');
      joystick.addEventListener('change', () => {
        const value = joystick.value;
        output.textContent = value ? 'Target: X ' + value.x + ', Y ' + value.y : 'No target';
      });
    </script>
  `
};
