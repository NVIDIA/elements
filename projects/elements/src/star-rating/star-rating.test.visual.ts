import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('star-rating visual', () => {
  test('star-rating should match visual baseline', async () => {
    const report = await visualRunner.render('star-rating', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('star-rating should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('star-rating.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
 <script type="module">
   import '@nvidia-elements/core/star-rating/define.js';
   document.documentElement.setAttribute('nve-theme', '${theme}');
 </script>


 <nve-star-rating>
   <label>•︎•︎•︎•︎•︎•︎</label>
   <input id="range" type="range" max="5" value="3" min="0" />
   <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
 </nve-star-rating>


 <nve-star-rating>
   <label>•︎•︎•︎•︎•︎•︎</label>
   <input type="range" max="5" value="3" min="0" disabled />
   <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
 </nve-star-rating>


 <nve-star-rating>
   <label>•︎•︎•︎•︎•︎•︎</label>
   <input type="range" max="1" value="0" min="0" />
 </nve-star-rating>
 `;
}
