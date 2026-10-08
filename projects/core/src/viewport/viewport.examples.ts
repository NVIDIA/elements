// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/viewport/define.js';

export default {
  title: 'Elements/Viewport',
  component: 'nve-viewport'
};

/**
 * @summary Navigate a bounded SVG with pan, zoom, gridlines, and a minimap. Fixed overlay controls adjust zoom without moving with the content.
 */
export const Default = {
  render: () => html`
    <nve-viewport id="viewport-default" autofit fit-inset="24" behavior-pan behavior-zoom style="height: 420px">
      <nve-viewport-gridlines></nve-viewport-gridlines>

      <svg
        role="img"
        aria-label="Three geometric forms in a spatial field"
        width="900"
        height="600"
        viewBox="0 0 900 600"
        style="position: absolute; left: 0; top: 0"
      >
        <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
        <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
        <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        <rect x="1" y="1" width="898" height="598" rx="24" fill="none" stroke="var(--nve-ref-border-color-emphasis)" stroke-width="2" stroke-dasharray="32 20" vector-effect="non-scaling-stroke"></rect>
      </svg>

      <nve-viewport-minimap></nve-viewport-minimap>
      <nve-toolbar slot="overlay" orientation="vertical" aria-label="Viewport zoom controls"
        style="position: absolute; inset-block-start: var(--nve-ref-space-md); inset-inline-start: var(--nve-ref-space-md); width: fit-content">
        <nve-button commandfor="viewport-default" command="--zoom-in" aria-label="Zoom in">+</nve-button>
        <nve-viewport-zoom-range commandfor="viewport-default" orientation="vertical" aria-label="Viewport zoom"></nve-viewport-zoom-range>
        <nve-button commandfor="viewport-default" command="--zoom-out" aria-label="Zoom out">−</nve-button>
      </nve-toolbar>
    </nve-viewport>
  `
};

/**
 * @summary Provide custom minimap content to replace the default bounding boxes with a simplified representation of the viewport content.
 */
export const Minimap = {
  render: () => html`
    <nve-viewport autofit fit-inset="24" behavior-pan behavior-zoom style="height: 420px">
      <nve-viewport-gridlines></nve-viewport-gridlines>

      <svg
        role="img"
        aria-label="Three geometric forms in a spatial field"
        width="900"
        height="600"
        viewBox="0 0 900 600"
        style="position: absolute; left: 0; top: 0"
      >
        <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
        <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
        <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        <rect x="1" y="1" width="898" height="598" rx="24" fill="none" stroke="var(--nve-ref-border-color-emphasis)" stroke-width="2" stroke-dasharray="32 20" vector-effect="non-scaling-stroke"></rect>
      </svg>

      <nve-viewport-minimap>
        <svg slot="preview" width="900" height="600" viewBox="0 0 900 600" style="position: absolute; left: 0; top: 0">
          <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
          <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
          <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        </svg>
      </nve-viewport-minimap>
    </nve-viewport>
  `
};

/**
 * @summary Place native and Elements controls inside a viewport without losing their standard interactions.
 */
export const InteractiveContent = {
  render: () => html`
    <nve-viewport x="-20" y="-20" scale="0.9" behavior-pan behavior-zoom style="height: 420px">
      <nve-viewport-gridlines step="20" target-spacing="72"></nve-viewport-gridlines>

      <nve-card style="position: absolute; left: 280px; top: 110px; width: 300px">
        <nve-card-header>
          <h2 nve-text="heading sm bold">Viewport content</h2>
        </nve-card-header>
        <nve-card-content>
          <nve-input>
            <label>Label</label>
            <input value="Editable value" />
          </nve-input>
        </nve-card-content>
      </nve-card>
    </nve-viewport>
  `
};

/**
 * @summary Configure panning to require Space when application content needs to handle its own drag interactions.
 */
export const PanWithSpace = {
  render: () => html`
    <style>
      #viewport-space-pan-card {
        cursor: var(--drag-cursor, auto);
      }

      #viewport-space-pan-card:hover {
        --drag-cursor: grab;
      }

      #viewport-space-pan-card[data-dragging] {
        --background: var(--nve-sys-layer-overlay-background);
        --box-shadow: var(--nve-ref-shadow-300);
        --drag-cursor: grabbing;
      }
    </style>

    <div nve-layout="column align:horizontal-stretch" style="height: 420px">
      <nve-alert-group status="accent">
        <nve-alert>
          <p nve-text="body sm medium">
            Pan the viewport with <kbd nve-text="code">Space</kbd>, or using the middle mouse button.
          </p>
        </nve-alert>
      </nve-alert-group>

      <nve-viewport
        id="viewport-space-pan-demo"
        behavior-pan="space"
        behavior-zoom
        style="flex: 1; --min-height: 0"
      >
        <nve-viewport-gridlines step="20"></nve-viewport-gridlines>

        <nve-card
          id="viewport-space-pan-card"
          data-draggable-card
          data-card-drag-handle
          style="position: absolute; left: 290px; top: 120px; width: 300px"
        >
          <nve-card-header>
            <h2 nve-text="heading sm bold">Drag this card</h2>
          </nve-card-header>
          <nve-card-content>
            <p nve-text="body relaxed" nve-layout="pad:md" style="text-align: center">Application-defined dragging remains independent in this mode.</p>
          </nve-card-content>
        </nve-card>
      </nve-viewport>
    </div>

    <script type="module">
      const viewport = document.querySelector('#viewport-space-pan-demo');
      const handles = viewport.querySelectorAll('[data-card-drag-handle]');

      handles.forEach(handle => {
        const card = handle.closest('[data-draggable-card]');
        let pointerId;
        let startClientX;
        let startClientY;
        let startLeft;
        let startTop;

        const finishDrag = event => {
          if (event.pointerId !== pointerId) return;
          pointerId = undefined;
          card.removeAttribute('data-dragging');
        };

        handle.addEventListener('pointerdown', event => {
          if (
            (event.pointerType !== 'mouse' && event.pointerType !== 'pen') ||
            event.button !== 0 ||
            event.defaultPrevented
          ) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          pointerId = event.pointerId;
          startClientX = event.clientX;
          startClientY = event.clientY;
          startLeft = Number.parseFloat(card.style.left);
          startTop = Number.parseFloat(card.style.top);
          card.setAttribute('data-dragging', '');
          handle.setPointerCapture(pointerId);
        });

        handle.addEventListener('pointermove', event => {
          if (event.pointerId !== pointerId) return;

          card.style.left = startLeft + (event.clientX - startClientX) / viewport.scale + 'px';
          card.style.top = startTop + (event.clientY - startClientY) / viewport.scale + 'px';
          event.preventDefault();
        });

        handle.addEventListener('pointerup', finishDrag);
        handle.addEventListener('pointercancel', finishDrag);
        handle.addEventListener('lostpointercapture', finishDrag);
      });
    </script>
  `
};

/**
 * @summary Connect an external zoom toolbar and navigator to a viewport with commandfor. Use the range for continuous zoom, the minimap to recenter, and directional buttons to pan.
 */
export const Commands = {
  render: () => html`
    <nve-page>
      <nve-toolbar slot="subheader" container="full" aria-label="Viewport zoom controls">
        <span nve-text="body">Zoom</span>
        <nve-button commandfor="viewport-command-demo" command="--zoom-out" aria-label="Zoom out">−</nve-button>
        <nve-viewport-zoom-range commandfor="viewport-command-demo" aria-label="Viewport zoom" style="flex: 1; min-width: 0"></nve-viewport-zoom-range>
        <nve-button commandfor="viewport-command-demo" command="--zoom-in" aria-label="Zoom in">+</nve-button>
        <nve-icon-button slot="suffix" icon-name="maximize" commandfor="viewport-command-demo" command="--zoom-to-fit" aria-label="Fit content"></nve-icon-button>
      </nve-toolbar>

      <nve-viewport
        id="viewport-command-demo"
        autofit
        fit-inset="24"
        behavior-pan
        behavior-zoom
        min-scale="0.25"
        max-scale="4"
        style="width: 100%; height: 100%; --min-height: 0"
      >
        <nve-viewport-gridlines></nve-viewport-gridlines>

        <svg
          role="img"
          aria-label="Three geometric forms in a spatial field"
          width="900"
          height="600"
          viewBox="0 0 900 600"
          style="position: absolute; left: 0; top: 0"
        >
          <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
          <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
          <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
          <rect x="1" y="1" width="898" height="598" rx="24" fill="none" stroke="var(--nve-ref-border-color-emphasis)" stroke-width="2" stroke-dasharray="32 20" vector-effect="non-scaling-stroke"></rect>
        </svg>
      </nve-viewport>

      <nve-page-panel slot="right-aside" aria-label="Viewport navigation" style="width: 164px">
        <nve-page-panel-content>
          <div nve-layout="column gap:sm">
            <h2 nve-text="heading xs medium">Navigate</h2>
            <nve-viewport-minimap commandfor="viewport-command-demo" style="position: relative; inset: auto; width: 100%; max-width: none">
              <svg slot="preview" width="900" height="600" viewBox="0 0 900 600" style="position: absolute; left: 0; top: 0">
                <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
                <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
                <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
              </svg>
            </nve-viewport-minimap>
            <h2 nve-text="heading xs medium">Pan</h2>
            <div nve-layout="column gap:xs align:horizontal-center">
              <nve-button commandfor="viewport-command-demo" command="--pan-up" aria-label="Pan up">↑</nve-button>
              <div nve-layout="row gap:lg align:horizontal-center">
                <nve-button commandfor="viewport-command-demo" command="--pan-left" aria-label="Pan left">←</nve-button>
                <nve-button commandfor="viewport-command-demo" command="--pan-right" aria-label="Pan right">→</nve-button>
              </div>
              <nve-button commandfor="viewport-command-demo" command="--pan-down" aria-label="Pan down">↓</nve-button>
            </div>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>
    </nve-page>
  `
};

/**
 * @summary Viewport navigation helpers let application logic animate specific content regions into view.
 */
export const ProgrammaticNavigation = {
  render: () => html`
    <div nve-layout="column gap:sm align:horizontal-stretch" style="height: 420px">
      <div nve-layout="row align:center">
        <nve-button-group container="rounded" behavior-select="single" aria-label="Navigate to workflow region">
          <nve-button data-viewport-region="viewport-region-ingest">Ingest</nve-button>
          <nve-button data-viewport-region="viewport-region-train">Train</nve-button>
          <nve-button data-viewport-region="viewport-region-deploy">Deploy</nve-button>
        </nve-button-group>
      </div>

      <nve-viewport id="viewport-reveal-demo" autofit fit-inset="24" style="flex: 1; --min-height: 0">
        <nve-viewport-gridlines step="40"></nve-viewport-gridlines>

        <svg
          aria-hidden="true"
          width="500"
          height="320"
          viewBox="0 0 500 320"
          style="position: absolute; left: 380px; top: 144px"
        >
          <path
            d="M 0 0 C 50 0 50 160 100 160 M 400 160 C 450 160 450 320 500 320"
            fill="none"
            stroke="var(--nve-ref-border-color-emphasis)"
            stroke-width="4"
          ></path>
        </svg>

        <nve-card id="viewport-region-ingest" style="position: absolute; left: 80px; top: 80px; width: 320px">
          <nve-card-header><h2 nve-text="heading sm bold">Ingest</h2></nve-card-header>
          <nve-card-content>
            <p nve-text="body" nve-layout="pad:md" style="text-align: center">Validate and prepare the dataset.</p>
          </nve-card-content>
        </nve-card>
        <nve-card id="viewport-region-train" style="position: absolute; left: 480px; top: 240px; width: 320px">
          <nve-card-header><h2 nve-text="heading sm bold">Train</h2></nve-card-header>
          <nve-card-content>
            <p nve-text="body" nve-layout="pad:md" style="text-align: center">Run and compare model experiments.</p>
          </nve-card-content>
        </nve-card>
        <nve-card id="viewport-region-deploy" style="position: absolute; left: 880px; top: 400px; width: 320px">
          <nve-card-header><h2 nve-text="heading sm bold">Deploy</h2></nve-card-header>
          <nve-card-content>
            <p nve-text="body" nve-layout="pad:md" style="text-align: center">Promote the selected model.</p>
          </nve-card-content>
        </nve-card>
      </nve-viewport>
    </div>

    <script type="module">
      const viewport = document.querySelector('#viewport-reveal-demo');
      const buttons = Array.from(document.querySelectorAll('[data-viewport-region]'));
      const framing = 80;

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const region = viewport.querySelector('#' + button.dataset.viewportRegion);
          viewport.reveal(
            {
              x: region.offsetLeft - framing,
              y: region.offsetTop - framing,
              width: region.offsetWidth + framing * 2,
              height: region.offsetHeight + framing * 2
            },
            { animated: true, duration: 500 }
          );
        });
      });
    </script>
  `
};

/**
 * @summary Optionally configure viewport grid lines to use dots instead of lines.
 */
export const Dots = {
  render: () => html`
    <nve-viewport autofit fit-inset="24" behavior-pan behavior-zoom style="height: 420px">
      <nve-viewport-gridlines pattern="dots"></nve-viewport-gridlines>

      <svg
        role="img"
        aria-label="Three geometric forms in a spatial field"
        width="900"
        height="600"
        viewBox="0 0 900 600"
        style="position: absolute; left: 0; top: 0"
      >
        <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
        <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
        <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        <rect x="1" y="1" width="898" height="598" rx="24" fill="none" stroke="var(--nve-ref-border-color-emphasis)" stroke-width="2" stroke-dasharray="32 20" vector-effect="non-scaling-stroke"></rect>
      </svg>
    </nve-viewport>
  `
};

/**
 * @summary Use crosses as spatial reference points to help users judge positions while keeping the content between them unobstructed.
 */
export const Crosses = {
  render: () => html`
    <nve-viewport autofit fit-inset="24" behavior-pan behavior-zoom style="height: 420px">
      <nve-viewport-gridlines pattern="crosses"></nve-viewport-gridlines>

      <svg
        role="img"
        aria-label="Three geometric forms in a spatial field"
        width="900"
        height="600"
        viewBox="0 0 900 600"
        style="position: absolute; left: 0; top: 0"
      >
        <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
        <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
        <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        <rect x="1" y="1" width="898" height="598" rx="24" fill="none" stroke="var(--nve-ref-border-color-emphasis)" stroke-width="2" stroke-dasharray="32 20" vector-effect="non-scaling-stroke"></rect>
      </svg>
    </nve-viewport>
  `
};

/**
 * @summary Place custom content in the background slot to provide a spatial reference without affecting content fitting.
 */
export const Background = {
  render: () => html`
    <nve-viewport autofit fit-inset="24" behavior-pan behavior-zoom style="height: 420px">
      <svg
        slot="background"
        aria-hidden="true"
        width="20480"
        height="20480"
        viewBox="-10240 -10240 20480 20480"
        style="position: absolute; left: -10240px; top: -10240px"
      >
        <defs>
          <pattern id="viewport-background-triangles" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 0 0 H 200 V 200 M 0 0 L 200 200 M 0 200 L 200 0" fill="none" stroke="var(--nve-ref-border-color-muted)" stroke-width="1.5" vector-effect="non-scaling-stroke"></path>
          </pattern>
        </defs>
        <rect x="-10240" y="-10240" width="20480" height="20480" fill="url(#viewport-background-triangles)"></rect>
      </svg>

      <svg
        role="img"
        aria-label="Three geometric forms in a spatial field"
        width="900"
        height="600"
        viewBox="0 0 900 600"
        style="position: absolute; left: 0; top: 0"
      >
        <circle cx="200" cy="400" r="100" fill="var(--nve-ref-color-green-jade-600)"></circle>
        <rect x="350" y="100" width="200" height="200" rx="50" fill="var(--nve-ref-color-blue-cobalt-600)"></rect>
        <path d="M 700 290 L 810 400 L 700 510 L 590 400 Z" fill="var(--nve-ref-color-purple-lavender-600)"></path>
        <rect x="1" y="1" width="898" height="598" rx="24" fill="none" stroke="var(--nve-ref-border-color-emphasis)" stroke-width="2" stroke-dasharray="32 20" vector-effect="non-scaling-stroke"></rect>
      </svg>
    </nve-viewport>
  `
};
