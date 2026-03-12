import { css, html, LitElement, nothing } from 'lit';
import { FormControlMixin } from '@nvidia-elements/forms/mixin';
import '@nvidia-elements/core/color/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/range/define.js';
import './visualization.examples.js';

export default {
  title: 'Labs/Forms/Examples'
};

/**
 * @summary Animated canvas visualization driven by form controls for color, shape, scale, and particle count.
 * @tags test-case
 */
export const CanvasParticles = {
  render: () => html`
<section nve-layout="row gap:lg pad:lg align:center">
  <form nve-layout="column gap:lg pad:lg">
    <nve-color>
      <label>Color</label>
      <input type="color" name="color" value="#26ab40" />
    </nve-color>
    <nve-radio-group>
      <label>Shape</label>
      <nve-radio>
        <label>Circle</label>
        <input type="radio" name="shape" value="circle" checked/>
      </nve-radio>
      <nve-radio>
        <label>Square</label>
        <input type="radio" name="shape" value="square" />
      </nve-radio>
    </nve-radio-group>
    <nve-range>
      <label>Scale</label>
      <input type="range" name="scale" value="20" min="5" max="100" />
    </nve-range>
    <nve-range>
      <label>Particle Count</label>
      <input type="range" name="particleCount" value="100" min="1" max="10000" />
    </nve-range>
  </form>
  <nve-divider orientation="vertical"></nve-divider>
  <ui-entity-draw name="draw" value='{"color": "#26ab40", "shape": "circle", "scale": 20, "particleCount": 100}'></ui-entity-draw>
</section>
<script type="module">
  const form = document.querySelector('form');
  const draw = document.querySelector('ui-entity-draw');
  form.addEventListener('input', (e) => {
    draw.value = {
      color: form.elements.color.value,
      shape: form.elements.shape.value,
      scale: form.elements.scale.valueAsNumber,
      particleCount: form.elements.particleCount.valueAsNumber
    }
  });
</script>
`
};

const styles = css`
:host {
  display: block;
}

form {
  background: var(--nve-sys-layer-container-background);
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.1);
}

label {
  display: flex;
  align-items: center;
  line-height: 1;
  gap: 0.5rem;
}

input {
  margin: 4px 0;
}

pre {
  background: color-mix(in oklab, var(--nve-sys-layer-container-background) 100%, var(--nve-sys-text-muted-color) 7%);
  padding: 12px;
  margin: 0;
}
`;

export interface DrawValue {
  color: string;
  shape: 'circle' | 'square';
  scale: number;
  particleCount: number;
}

export class Draw extends FormControlMixin<typeof LitElement, DrawValue>(LitElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-entity-draw',
    valueSchema: {
      type: 'object' as const,
      properties: {
        color: {
          type: 'string' as const,
          format: 'color'
        },
        shape: {
          type: 'enum' as const,
          enum: ['circle', 'square']
        },
        scale: {
          type: 'number' as const,
          minimum: 1,
          maximum: 100
        },
        particleCount: {
          type: 'number' as const,
          minimum: 1,
          maximum: 10000
        }
      },
      required: ['color', 'shape', 'scale', 'particleCount']
    }
  };

  static styles = [
    styles,
    css`canvas {border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);}`
  ];

  #shapes: Array<{ x: number; y: number; rotation: number }> = [];
  #canvas?: HTMLCanvasElement;
  #animationFrame?: number;

  render() {
    return this.value
      ? html`
      <form>
        <canvas name="canvas" width="400" height="400"></canvas>
        <pre>${JSON.stringify(this.value, null, 2)}</pre>
      </form>
    `
      : nothing;
  }

  constructor() {
    super();
    this.updateValue({ color: '#000000', shape: 'circle', scale: 50, particleCount: 20 });
  }

  firstUpdated() {
    this.#canvas = this.renderRoot.querySelector('canvas') ?? undefined;
    this.#startAnimation();
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (this.value && this.value.particleCount !== this.#shapes.length) {
      this.#shapes = new Array(this.value.particleCount).fill(0).map(() => {
        return { x: Math.random() * 400, y: Math.random() * 400, rotation: Math.random() * Math.PI * 2 };
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#animationFrame) {
      cancelAnimationFrame(this.#animationFrame);
    }
  }

  #startAnimation() {
    const animate = () => {
      if (this.value) {
        this.#render(this.value);
      }
      this.#animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  #render(value: DrawValue) {
    const ctx = this.#canvas!.getContext('2d')!;
    ctx.clearRect(0, 0, this.#canvas!.width, this.#canvas!.height);

    const size = value.scale / 2.5;
    this.#shapes.forEach((shape, i) => {
      shape.y += Math.sin((Date.now() + i * 500) / 1000) * 0.5;
      shape.x += Math.cos((Date.now() + i * 500) / 1000) * 0.5;
      shape.rotation += 0.01;
      shape.x = (shape.x + this.#canvas!.width) % this.#canvas!.width;
      shape.y = (shape.y + this.#canvas!.height) % this.#canvas!.height;

      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);
      ctx.fillStyle = value.color;

      if (value.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-size / 2, -size / 2, size, size);
      }

      ctx.restore();
    });
  }
}

customElements.get('ui-entity-draw') || customElements.define('ui-entity-draw', Draw);
