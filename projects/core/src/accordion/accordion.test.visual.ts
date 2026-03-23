import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('accordion visual', () => {
  test('accordion should match visual baseline', async () => {
    const report = await visualRunner.render('accordion', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('accordion should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('accordion.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

/* eslint-disable @nvidia-elements/lint/no-deprecated-slots */
/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value */

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/accordion/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-accordion-group style="min-width: 768px">
    <nve-accordion>
      <nve-accordion-header>
        <div slot="prefix">•︎•︎•︎</div>
      </nve-accordion-header>
      <nve-accordion-content>•︎•︎•︎</nve-accordion-content>
    </nve-accordion>
    <nve-accordion>
      <nve-accordion-header>
        <div slot="prefix">•︎•︎•︎</div>
      </nve-accordion-header>
      <nve-accordion-content>•︎•︎•︎</nve-accordion-content>
    </nve-accordion>
    <nve-accordion>
      <nve-accordion-header>
        <div slot="prefix">•︎•︎•︎</div>
      </nve-accordion-header>
      <nve-accordion-content>•︎•︎•︎</nve-accordion-content>
    </nve-accordion>
  </nve-accordion-group>

  <nve-accordion-group container="inset" style="min-width: 768px">
    <nve-accordion>
      <nve-accordion-header>
        <div slot="prefix">•︎•︎•︎</div>
      </nve-accordion-header>
      <nve-accordion-content>•︎•︎•︎</nve-accordion-content>
    </nve-accordion>
    <nve-accordion>
      <nve-accordion-header>
        <div slot="prefix">•︎•︎•︎</div>
      </nve-accordion-header>
      <nve-accordion-content>•︎•︎•︎</nve-accordion-content>
    </nve-accordion>
    <nve-accordion>
      <nve-accordion-header>
        <div slot="prefix">•︎•︎•︎</div>
      </nve-accordion-header>
      <nve-accordion-content>•︎•︎•︎</nve-accordion-content>
    </nve-accordion>
  </nve-accordion-group>

  <nve-accordion behavior-expand>
    <nve-accordion-header>
      <div slot="prefix">•︎•︎•︎</div>
      •︎•︎•︎
      <nve-icon-button container="flat" icon-name="add" size="sm" slot="suffix"></nve-icon-button>
      <nve-icon-button container="flat" icon-name="delete" size="sm" slot="suffix"></nve-icon-button>
    </nve-accordion-header>
    <nve-accordion-content>•︎•︎•︎</nve-accordion-content>
  </nve-accordion>

  <hr />

  <nve-accordion>
    <nve-accordion-header>
      <div slot="title">•︎•︎•︎</div>
      <div slot="subtitle">•︎•︎•︎</div>
      <nve-icon-button container="flat" icon-name="add" size="sm" slot="suffix"></nve-icon-button>
      <nve-icon-button container="flat" icon-name="delete" size="sm" slot="suffix"></nve-icon-button>
    </nve-accordion-header>
    <nve-accordion-content>•︎•︎•︎</nve-accordion-content>
  </nve-accordion>
  `;
}
