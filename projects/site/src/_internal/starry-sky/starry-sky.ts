// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, css } from 'lit';
import type { PropertyValues } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';

@customElement('nvd-starry-sky')
export class StarrySky extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100%;
      overflow: hidden;
      inset: 0;
      z-index: 1;
    }

    .starry-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      width: 100%;
      height: 100%;
      background: linear-gradient(
    180deg,
    color-mix(in oklch, black 40%, var(--nve-sys-layer-container-background)),
    color-mix(in oklch, black 60%, var(--nve-sys-layer-canvas-background))
  );
    }

    .starry-background::before {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      width: 120vw;
      height: 120vh;
 background: radial-gradient(
    circle at top,
    color-mix(in oklch, rgba(50, 50, 60, 0.3), var(--nve-sys-layer-container-background) 30%),
    transparent 70%
  );      transform: translateX(-50%);
      pointer-events: none;
    }

    svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .star {
      fill: white;
      opacity: 50%;
    }

    @keyframes flickerAnimation {
      0%   { opacity:1; }
      50%  { opacity:0; }
      100% { opacity:1; }
    }
  `;

  #intersectionObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.#createStars();
        } else {
          this.shadowRoot?.querySelectorAll('svg')?.forEach(svg => svg.remove());
        }
      });
    },
    { threshold: 0.1 }
  );

  firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    this.#intersectionObserver.observe(this);
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#intersectionObserver.disconnect();
  }

  #createStars() {
    for (let s = 0; s < 3; s++) {
      const svg = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      for (let i = 0; i < 200; i++) {
        const cx = `${Math.random() * 100}%`;
        const cy = `${Math.random() * 100}%`;
        const r: number = (Math.random() + 0.5) * 1.2;

        const circle = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'star');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r.toString());
        circle.style.opacity = `${0.5 + Math.random() * 0.5}`;
        // only 50% of the stars will twinkle
        if (Math.round(Math.random())) {
          circle.style.animation = `flickerAnimation ${1 + Math.random() * 10}s infinite ease-in-out ${Math.random() * 5}s`;
        }

        svg.appendChild(circle);
      }

      this.shadowRoot?.querySelector('.starry-background')?.appendChild(svg);
    }
  }

  render() {
    return html`<div class="starry-background"></div>`;
  }
}
