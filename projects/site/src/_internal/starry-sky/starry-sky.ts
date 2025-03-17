import { LitElement, html, css } from 'lit';
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
      background: linear-gradient(to bottom, #000000, #08080f 50%, #101016 80%, #141419);
    }

    .starry-background::before {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      width: 120vw;
      height: 120vh;
      background: radial-gradient(circle at top, rgba(50, 50, 60, 0.3), transparent 70%);
      transform: translateX(-50%);
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
      opacity: 0;
    }
  `;

  firstUpdated() {
    this.createStars();
  }

  createStars() {
    const container = this.shadowRoot?.querySelector('.starry-background');
    if (!container) return;

    for (let s = 0; s < 3; s++) {
      const svg = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      for (let i = 0; i < 200; i++) {
        const cx = Math.random() * 100 + '%';
        const cy = Math.random() * 100 + '%';
        const r: number = (Math.random() + 0.5) * 1.2;

        const circle = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'star');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r.toString());

        svg.appendChild(circle);
        this.animateTwinkle(circle);
      }

      container.appendChild(svg);
    }
  }

  animateTwinkle(star: SVGCircleElement) {
    const twinkle = () => {
      const duration: number = 1 + Math.random() * 2;
      const delay: number = Math.random() * 1;
      const targetOpacity: number = 0.5 + Math.random() * 0.5;

      star.style.transition = `opacity ${duration}s ease-in-out ${delay}s`;
      star.style.opacity = targetOpacity.toString();

      setTimeout(() => {
        star.style.opacity = '0';
        setTimeout(twinkle, duration * 1000);
      }, duration * 1000);
    };

    twinkle();
  }

  render() {
    return html`<div class="starry-background"></div>`;
  }
}
