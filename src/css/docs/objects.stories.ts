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
        background: var(--mlv-sys-layer-canvas-background);
      }

      .layer-demo h2,
      .layer-demo ul {
        margin: 0 0 12px 0;
        font-weight: normal;
      }

      .canvas {
        background: var(--mlv-sys-layer-canvas-background);
        color: var(--mlv-sys-layer-canvas-color);
        padding: var(--mlv-ref-size-600);
      }

      .container {
        background: var(--mlv-sys-layer-container-background);
        color: var(--mlv-sys-layer-container-color);
        padding: var(--mlv-ref-size-500);
        box-shadow: var(--mlv-ref-shadow-100);
        border-radius: var(--mlv-ref-border-radius-lg);
        width: 400px;
        height: 300px;
      }

      .overlay {
        background: var(--mlv-sys-layer-overlay-background);
        color: var(--mlv-sys-layer-overlay-color);
        padding: var(--mlv-ref-size-600);
        box-shadow: var(--mlv-ref-shadow-200);
        border-radius: var(--mlv-ref-border-radius-lg);
        width: 400px;
        height: 300px;
      }

      .backdrop {
        background: var(--mlv-sys-layer-backdrop-background);
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

      .popup {
        background: var(--mlv-sys-layer-popup-background);
        color: var(--mlv-sys-layer-popup-color);
        padding: var(--mlv-ref-size-400);
        box-shadow: var(--mlv-ref-shadow-300);
        border-radius: var(--mlv-ref-border-radius-md);
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
      <div class="popup">
        <h2>popup</h2>
        <ul>
          <li>tooltips</li>
          <li>toasts</li>
        </ul>
      </div>
    </section>
  `
}