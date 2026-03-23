import { html } from 'lit';
import { beforeEach, describe, expect, it, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Sparkline } from '@nvidia-elements/core/sparkline';
import '@nvidia-elements/core/sparkline/define.js';

describe(Sparkline.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Sparkline;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-sparkline aria-label="sparkline" .data=${[2, 4, 3, 8, 6]}></nve-sparkline>
    `);
    element = fixture.querySelector(Sparkline.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('defines the element and sets img semantics', () => {
    expect(customElements.get(Sparkline.metadata.tag)).toBeDefined();
    expect(element._internals.role).toBe('img');
  });

  describe('data input', () => {
    it('updates rendered geometry when data are set via attribute', async () => {
      const initialPath = element.shadowRoot.querySelector<SVGPathElement>('.line')?.getAttribute('d');

      element.setAttribute('data', '[1, 2, 3, 4]');
      await elementIsStable(element);

      const updatedPath = element.shadowRoot.querySelector<SVGPathElement>('.line')?.getAttribute('d');
      expect(updatedPath).toBeTruthy();
      expect(updatedPath).not.toBe(initialPath);
    });

    it('updates rendered geometry when data are set via property', async () => {
      const initialPath = element.shadowRoot.querySelector<SVGPathElement>('.line')?.getAttribute('d');

      element.data = [1, 2, 3, 4];
      await elementIsStable(element);

      const updatedPath = element.shadowRoot.querySelector<SVGPathElement>('.line')?.getAttribute('d');
      expect(updatedPath).toBeTruthy();
      expect(updatedPath).not.toBe(initialPath);
    });
  });

  describe('mark rendering', () => {
    it('renders line mark as line-only', async () => {
      element.mark = 'line';
      await elementIsStable(element);

      expect(element.shadowRoot.querySelector('.line')).toBeTruthy();
      expect(element.shadowRoot.querySelector('.area')).toBe(null);
      expect(element.shadowRoot.querySelector('.column')).toBe(null);
    });

    it('renders area mark with line and filled area', async () => {
      element.mark = 'area';
      await elementIsStable(element);

      const area = element.shadowRoot.querySelector<SVGPathElement>('.area');
      expect(area).toBeTruthy();
      expect(area?.getAttribute('d')).toContain('Z');
      expect(element.shadowRoot.querySelector('.line')).toBeTruthy();
      expect(element.shadowRoot.querySelector('linearGradient')).toBe(null);
    });

    it('renders gradient mark with gradient definition and url fill', async () => {
      element.mark = 'gradient';
      await elementIsStable(element);

      const gradient = element.shadowRoot.querySelector<SVGLinearGradientElement>('linearGradient');
      const area = element.shadowRoot.querySelector<SVGPathElement>('.area');

      expect(gradient).toBeTruthy();
      expect(gradient?.getAttribute('gradientUnits')).toBe('userSpaceOnUse');
      expect(gradient?.querySelectorAll('stop').length).toBe(2);
      expect(area?.getAttribute('style')).toContain('url(#');
    });

    it('renders column mark using rect columns', async () => {
      element.mark = 'column';
      element.data = [6, 8, 4, 9];
      await elementIsStable(element);

      expect(element.shadowRoot.querySelectorAll('rect.column').length).toBe(4);
      expect(element.shadowRoot.querySelector('.line')).toBe(null);
      expect(element.shadowRoot.querySelector('.area')).toBe(null);
    });

    it('renders winloss mark using win/loss/draw rects', async () => {
      element.mark = 'winloss';
      element.data = [1, 0, -1, 2];
      await elementIsStable(element);

      expect(element.shadowRoot.querySelectorAll('rect.win').length).toBe(2);
      expect(element.shadowRoot.querySelectorAll('rect.draw').length).toBe(1);
      expect(element.shadowRoot.querySelectorAll('rect.loss').length).toBe(1);
      expect(element.shadowRoot.querySelector('.zero-line')).toBeTruthy();
    });

    it('sets preserveAspectRatio to xMidYMid meet for all marks', async () => {
      const marks: Array<Sparkline['mark']> = ['line', 'area', 'gradient', 'column', 'winloss'];

      for (const mark of marks) {
        element.mark = mark;
        await elementIsStable(element);
        expect(element.shadowRoot.querySelector('svg')?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
      }
    });
  });

  describe('interpolation', () => {
    it('renders step interpolation commands', async () => {
      element.mark = 'line';
      element.interpolation = 'step';
      await elementIsStable(element);

      const d = element.shadowRoot.querySelector<SVGPathElement>('.line')?.getAttribute('d') ?? '';
      expect(d).toContain('H');
      expect(d).toContain('V');
    });

    it('renders smooth interpolation commands', async () => {
      element.mark = 'line';
      element.interpolation = 'smooth';
      await elementIsStable(element);

      const d = element.shadowRoot.querySelector<SVGPathElement>('.line')?.getAttribute('d') ?? '';
      expect(d).toContain('C');
    });

    it('updates interpolation behavior when interpolation attribute changes', async () => {
      element.setAttribute('mark', 'line');
      element.setAttribute('interpolation', 'step');
      await elementIsStable(element);

      const stepPath = element.shadowRoot.querySelector<SVGPathElement>('.line')?.getAttribute('d') ?? '';
      expect(stepPath).toContain('H');
      expect(stepPath).toContain('V');

      element.setAttribute('interpolation', 'smooth');
      await elementIsStable(element);

      const smoothPath = element.shadowRoot.querySelector<SVGPathElement>('.line')?.getAttribute('d') ?? '';
      expect(smoothPath).toContain('C');
    });

    it('falls back to linear interpolation for invalid interpolation attribute values', async () => {
      element.setAttribute('mark', 'line');
      element.setAttribute('interpolation', 'invalid-interpolation');
      await elementIsStable(element);

      const path = element.shadowRoot.querySelector<SVGPathElement>('.line')?.getAttribute('d') ?? '';
      expect(path).toContain('L');
      expect(path.includes('H') || path.includes('V') || path.includes('C')).toBe(false);
    });
  });

  describe('domain behavior', () => {
    it('renders zero-line for line marks only when domain crosses zero', async () => {
      element.mark = 'line';
      element.data = [10, 20, 15];
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('.zero-line')).toBe(null);

      element.data = [-3, 2, 5];
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('.zero-line')).toBeTruthy();
    });

    it('renders a zero-line when explicit line min/max cross zero', async () => {
      element.mark = 'line';
      element.data = [10, 20, 15];
      element.min = -10;
      element.max = 30;
      await elementIsStable(element);

      expect(element.shadowRoot.querySelector('.zero-line')).toBeTruthy();
    });

    it('renders a zero-line when min/max attributes cross zero', async () => {
      element.setAttribute('mark', 'line');
      element.setAttribute('data', '[10, 20, 15]');
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('.zero-line')).toBe(null);

      element.setAttribute('min', '-10');
      element.setAttribute('max', '30');
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('.zero-line')).toBeTruthy();
    });

    it('includes zero for column marks and only shows zero-line when crossing', async () => {
      element.mark = 'column';
      element.data = [10, 20, 15];
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('.zero-line')).toBe(null);

      element.data = [-5, 10, -2];
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('.zero-line')).toBeTruthy();
    });

    it('ignores min/max overrides for winloss baseline position', async () => {
      element.mark = 'winloss';
      element.data = [5, -3, 2, -1, 4];
      element.min = -100;
      element.max = 100;
      await elementIsStable(element);

      const zeroLine = element.shadowRoot.querySelector<SVGLineElement>('.zero-line');
      expect(zeroLine?.getAttribute('y1')).toBe('50.00');
      expect(zeroLine?.getAttribute('y2')).toBe('50.00');
    });
  });

  describe('accents', () => {
    it('does not render accents by default', () => {
      expect(element.shadowRoot.querySelectorAll('.accent').length).toBe(0);
    });

    it('renders and deduplicates accent strategies', async () => {
      element.data = [5];
      element.setAttribute('denote-first', '');
      element.setAttribute('denote-last', '');
      element.setAttribute('denote-min', '');
      element.setAttribute('denote-max', '');
      await elementIsStable(element);

      expect(element.shadowRoot.querySelectorAll('.accent').length).toBe(1);
    });

    it('renders multiple accents for extrema when values repeat', async () => {
      element.data = [5, 1, 3, 1, 8, 8];
      element.denoteMin = true;
      element.denoteMax = true;
      await elementIsStable(element);

      expect(element.shadowRoot.querySelectorAll('.accent').length).toBe(4);
    });

    it('does not render accents for non-line-family marks', async () => {
      element.data = [1, 2, 3, 4];
      element.mark = 'column';
      element.setAttribute('denote-first', '');
      element.setAttribute('denote-last', '');
      element.setAttribute('denote-min', '');
      element.setAttribute('denote-max', '');
      await elementIsStable(element);

      expect(element.shadowRoot.querySelectorAll('.accent').length).toBe(0);
    });
  });

  describe('interval length and aspect ratio', () => {
    it('updates viewBox width for line marks by interval length', async () => {
      element.mark = 'line';
      element.data = [1, 2, 3, 4, 5];

      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 240 100');

      element.intervalLength = 0.9;
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 360 100');
    });

    it('updates line viewBox width when interval-length attribute changes', async () => {
      element.setAttribute('mark', 'line');
      element.setAttribute('data', '[1, 2, 3, 4, 5]');
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 240 100');

      element.setAttribute('interval-length', '0.9');
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 360 100');
    });

    it('does not update viewBox width for column marks by interval length', async () => {
      element.mark = 'column';
      element.data = [1, 2, 3, 4, 5];

      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 300 100');

      element.intervalLength = 0.9;
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 300 100');
    });

    it('updates host aspect ratio custom property', async () => {
      element.mark = 'line';
      element.data = [1, 2, 3, 4, 5];
      await elementIsStable(element);

      const initialRatio = parseFloat(element.style.getPropertyValue('--_aspect-ratio'));
      expect(initialRatio).toBeGreaterThan(0);

      element.intervalLength = 1;
      await elementIsStable(element);

      const updatedRatio = parseFloat(element.style.getPropertyValue('--_aspect-ratio'));
      expect(updatedRatio).toBeGreaterThan(initialRatio);
    });

    it('falls back to aspect ratio 1 when chart width is zero', async () => {
      element.mark = 'column';
      element.data = [];
      await elementIsStable(element);

      expect(element.style.getPropertyValue('--_aspect-ratio')).toBe('1.0000');
    });
  });

  describe('edge cases', () => {
    it('does not render a chart when data are empty or invalid', async () => {
      element.data = [];
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('svg')).toBe(null);

      element.data = [Number.NaN];
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('svg')).toBe(null);
    });

    it('does not render a column chart when data are empty', async () => {
      element.mark = 'column';
      element.data = [];
      await elementIsStable(element);

      expect(element.shadowRoot.querySelector('svg')).toBe(null);
    });

    it('does not render a winloss chart when data are empty', async () => {
      element.mark = 'winloss';
      element.data = [];
      await elementIsStable(element);

      expect(element.shadowRoot.querySelector('svg')).toBe(null);
    });

    it('renders no chart for invalid mark attribute values', async () => {
      element.setAttribute('mark', 'invalid-mark');
      await elementIsStable(element);

      expect(element.shadowRoot.querySelector('svg')).toBe(null);
    });
  });
});
