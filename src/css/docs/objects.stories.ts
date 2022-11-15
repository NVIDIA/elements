import { html } from 'lit';

export default {
  title: 'Foundations/Tokens/Examples'
};

export const layers = {
  render: () => html`
    <style>
      .layer-demo {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 48px;
        padding: 24px;
        background: var(--nve-sys-layer-canvas-background);
      }

      .layer-demo h2,
      .layer-demo ul {
        margin: 0 0 12px 0;
        font-weight: normal;
      }

      .canvas {
        background: var(--nve-sys-layer-canvas-background);
        color: var(--nve-sys-layer-canvas-color);
        padding: var(--nve-ref-size-600);
      }

      .container {
        background: var(--nve-sys-layer-container-background);
        color: var(--nve-sys-layer-container-color);
        padding: var(--nve-ref-size-500);
        box-shadow: var(--nve-ref-shadow-100);
        border-radius: var(--nve-ref-border-radius-lg);
        width: 400px;
        height: 300px;
      }

      .overlay {
        background: var(--nve-sys-layer-overlay-background);
        color: var(--nve-sys-layer-overlay-color);
        padding: var(--nve-ref-size-600);
        box-shadow: var(--nve-ref-shadow-200);
        border-radius: var(--nve-ref-border-radius-lg);
        width: 400px;
        height: 300px;
      }

      .backdrop {
        background: var(--nve-sys-layer-backdrop-background);
        padding: 24px;
        width: 400px;
        height: 300px;
        display: flex;
        place-content: center;
        place-items: center;
      }

      .backdrop .overlay {
        width: 300px;
        height: 200px;
      }

      .popover {
        background: var(--nve-sys-layer-popover-background);
        color: var(--nve-sys-layer-popover-color);
        padding: var(--nve-ref-size-400);
        box-shadow: var(--nve-ref-shadow-300);
        border-radius: var(--nve-ref-border-radius-md);
        width: 400px;
        height: 130px;
      }
    </style>

    <section class="layer-demo">
      <div class="canvas">
        <h2>canvas</h2>
        <ul>
          <li>document</li>
          <li>body</li>
        </ul>
      </div>
      <div class="container">
        <h2>container</h2>
        <ul>
          <li>cards</li>
          <li>steppers</li>
          <li>tabs</li>
        </ul>
      </div>
      <div class="backdrop">
        <div class="overlay">
          <h2>overlay/backdrop</h2>
          <ul>
            <li>modals</li>
            <li>drawers</li>
            <li>dropdown menus</li>
          </ul>
        </div>
      </div>
      <div class="popover">
        <h2>popover</h2>
        <ul>
          <li>tooltips</li>
          <li>toasts</li>
        </ul>
      </div>
    </section>
  `
}