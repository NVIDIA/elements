import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('column visual', () => {
  test('column should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column',
      /* html */ `
      <section nve-layout="column">
        <div></div>
        <div></div>
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column nested should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-width',
      /* html */ `
      <section style="min-width: 300px; padding: 12px;">
        <section nve-layout="column">
          <div></div>
          <div></div>
          <div></div>
        </section>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column gap should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-gap',
      /* html */ `
      <div nve-layout="row gap:lg">
        <section nve-layout="column gap:xs">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="column gap:sm">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="column gap:md">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="column gap:lg">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="column gap:xl">
          <div></div>
          <div></div>
          <div></div>
        </section>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column vertical alignment should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-align-vertical',
      /* html */ `
      <div nve-layout="row gap:lg">
        <section nve-layout="column align:top" style="min-height: 300px">
          <div></div>
        </section>
        <section nve-layout="column align:vertical-center" style="min-height: 300px">
          <div></div>
        </section>
        <section nve-layout="column align:bottom" style="min-height: 300px">
          <div></div>
        </section>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column horizontal alignment should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-align-horizontal',
      /* html */ `
      <div nve-layout="row gap:lg">
        <section nve-layout="column align:left" style="min-width: 300px">
          <div></div>
        </section>
        <section nve-layout="column align:horizontal-center" style="min-width: 300px">
          <div></div>
        </section>
        <section nve-layout="column align:right" style="min-width: 300px">
          <div></div>
        </section>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column align:center should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-align-center',
      /* html */ `
      <section nve-layout="column align:center" style="min-height: 300px; min-width: 300px">
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column align:space-around should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-align-space-around',
      /* html */ `
      <section nve-layout="column align:space-around" style="min-height: 300px">
        <div></div>
        <div></div>
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column align:space-between should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-align-space-between',
      /* html */ `
      <section nve-layout="column align:space-between" style="min-height: 300px">
        <div></div>
        <div></div>
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column align:space-evenly should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-align-space-evenly',
      /* html */ `
      <section nve-layout="column align:space-evenly" style="min-height: 300px">
        <div></div>
        <div></div>
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column align:horizontal-stretch should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-align-horizontal-stretch',
      /* html */ `
      <section nve-layout="column align:horizontal-stretch" style="min-width: 300px">
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column align:vertical-stretch should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-align-vertical-stretch',
      /* html */ `
      <section nve-layout="column align:vertical-stretch" style="min-height: 300px">
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('column align:stretch should match visual baseline', async () => {
    const report = await visualRunner.render(
      'column-align-stretch',
      /* html */ `
      <section nve-layout="column align:stretch" style="min-height: 300px; min-width: 300px">
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('columns with nested rows should match visual baseline', async () => {
    const report = await visualRunner.render(
      'columns-with-nested-rows',
      /* html */ `
      <section nve-layout="column gap:sm" style="width: 300px; padding: 12px;">
        <section nve-layout="row gap:sm">
          <div></div>
          <div></div>
        </section>
        <section nve-layout="row gap:sm">
          <div></div>
          <div></div>
        </section>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

describe('row visual', () => {
  test('row should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row',
      /* html */ `
      <section nve-layout="row">
        <div></div>
        <div></div>
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row gap should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-gap',
      /* html */ `
      <div nve-layout="row gap:lg">
        <section nve-layout="row gap:xs">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="row gap:sm">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="row gap:md">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="row gap:lg">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="row gap:xl">
          <div></div>
          <div></div>
          <div></div>
        </section>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row vertical alignment should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-align-vertical',
      /* html */ `
      <div nve-layout="row gap:lg">
        <section nve-layout="row align:top" style="min-height: 300px">
          <div></div>
        </section>
        <section nve-layout="row align:vertical-center" style="min-height: 300px">
          <div></div>
        </section>
        <section nve-layout="row align:bottom" style="min-height: 300px">
          <div></div>
        </section>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row horizontal alignment should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-align-horizontal',
      /* html */ `
      <div nve-layout="row gap:lg">
        <section nve-layout="row align:left" style="min-width: 300px">
          <div></div>
        </section>
        <section nve-layout="row align:horizontal-center" style="min-width: 300px">
          <div></div>
        </section>
        <section nve-layout="row align:right" style="min-width: 300px">
          <div></div>
        </section>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row align:center should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-align-center',
      /* html */ `
      <section nve-layout="row align:center" style="min-height: 300px; min-width: 300px">
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row align:space-around should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-align-space-around',
      /* html */ `
      <section nve-layout="row align:space-around" style="min-width: 300px">
        <div></div>
        <div></div>
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row align:space-between should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-align-space-between',
      /* html */ `
      <section nve-layout="row align:space-between" style="min-width: 300px">
        <div></div>
        <div></div>
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row align:space-evenly should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-align-space-evenly',
      /* html */ `
      <section nve-layout="row align:space-evenly" style="min-width: 300px">
        <div></div>
        <div></div>
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row nested align:space-around should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-nested-align-space-around',
      /* html */ `
      <section nve-layout="row align:space-around" style="min-width: 450px">
        <section nve-layout="row gap:md">
          <div></div>
          <div></div>
        </section>
        <section nve-layout="row gap:md">
          <div></div>
          <div></div>
        </section>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row nested align:space-between should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-nested-align-space-between',
      /* html */ `
      <section nve-layout="row align:space-between" style="min-width: 450px">
        <section nve-layout="row gap:md">
          <div></div>
          <div></div>
        </section>
        <section nve-layout="row gap:md">
          <div></div>
          <div></div>
        </section>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row nested align:space-evenly should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-nested-align-space-evenly',
      /* html */ `
      <section nve-layout="row align:space-evenly" style="min-width: 450px">
        <section nve-layout="row gap:md">
          <div></div>
          <div></div>
        </section>
        <section nve-layout="row gap:md">
          <div></div>
          <div></div>
        </section>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row align:horizontal-stretch should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-align-horizontal-stretch',
      /* html */ `
      <section nve-layout="row align:horizontal-stretch" style="min-width: 300px">
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row align:vertical-stretch should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-align-vertical-stretch',
      /* html */ `
      <section nve-layout="row align:vertical-stretch" style="min-width: 300px">
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row align:stretch should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-align-stretch',
      /* html */ `
      <section nve-layout="row align:stretch" style="min-height: 300px; min-width: 300px">
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('row align:wrap should match visual baseline', async () => {
    const report = await visualRunner.render(
      'row-align-wrap',
      /* html */ `
      <section nve-layout="row align:wrap" style="width: 300px">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('rows with nested rows should match visual baseline', async () => {
    const report = await visualRunner.render(
      'rows-with-nested-rows',
      /* html */ `
      <section nve-layout="row gap:sm" style="width: 300px">
        <section nve-layout="row gap:sm">
          <div></div>
          <div></div>
        </section>
        <section nve-layout="row gap:sm">
          <div></div>
          <div></div>
        </section>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('rows with nested columns should match visual baseline', async () => {
    const report = await visualRunner.render(
      'rows-with-nested-columns',
      /* html */ `
      <section nve-layout="row gap:sm" style="width: 300px">
        <section nve-layout="column gap:sm">
          <div></div>
          <div></div>
        </section>
        <section nve-layout="column gap:sm">
          <div></div>
          <div></div>
        </section>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('rows with alignments should not fill available space respecting the parent width and match visual baseline', async () => {
    const report = await visualRunner.render(
      'rows-with-alignment',
      /* html */ `
      <section nve-layout="column gap:md pad:sm align:center" style="width: 280px">
        <section nve-layout="row gap:sm align:left" style="min-width: 200px">
          <div></div>
          <div></div>
        </section>
        <section nve-layout="row gap:sm align:center" style="min-width: 200px">
          <div></div>
          <div></div>
        </section>
        <section nve-layout="row gap:sm align:right" style="min-width: 200px">
          <div></div>
          <div></div>
        </section>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('rows with nested aligned rows should match visual baseline', async () => {
    const report = await visualRunner.render(
      'nested-rows-with-alignment',
      /* html */ `
      <section nve-layout="row gap:md pad:sm align:space-between" style="width: 720px">
        <section nve-layout="row gap:sm align:left" style="min-width: 180px">
          <div></div>
          <div></div>
        </section>
        <section nve-layout="row gap:sm align:center" style="min-width: 180px">
          <div></div>
          <div></div>
        </section>
        <section nve-layout="row gap:sm align:right" style="min-width: 180px">
          <div></div>
          <div></div>
        </section>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('rows should fill available space of the parent width when using "full" and match visual baseline', async () => {
    const report = await visualRunner.render(
      'rows-with-full',
      /* html */ `
      <section nve-layout="column gap:md pad:sm" style="width: 280px">
        <section nve-layout="row gap:sm align:center full">
          <div></div>
          <div></div>
        </section>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

describe('grid visual', () => {
  test('grid should match visual baseline', async () => {
    const report = await visualRunner.render(
      'grid',
      /* html */ `
      <section nve-layout="grid gap:xs">
        ${new Array(12).fill(`<div></div>`).join('\n')}

        <div nve-layout="span:2"></div>
        <div nve-layout="span:2"></div>
        <div nve-layout="span:2"></div>
        <div nve-layout="span:2"></div>
        <div nve-layout="span:2"></div>
        <div nve-layout="span:2"></div>

        <div nve-layout="span:3"></div>
        <div nve-layout="span:3"></div>
        <div nve-layout="span:3"></div>
        <div nve-layout="span:3"></div>

        <div nve-layout="span:4"></div>
        <div nve-layout="span:4"></div>
        <div nve-layout="span:4"></div>

        <div nve-layout="span:5"></div>
        <div nve-layout="span:5"></div>
        <div nve-layout="span:2"></div>

        <div nve-layout="span:6"></div>
        <div nve-layout="span:6"></div>

        <div nve-layout="span:7"></div>
        <div nve-layout="span:5"></div>

        <div nve-layout="span:8"></div>
        <div nve-layout="span:4"></div>

        <div nve-layout="span:9"></div>
        <div nve-layout="span:3"></div>

        <div nve-layout="span:10"></div>
        <div nve-layout="span:2"></div>

        <div nve-layout="span:11"></div>
        <div nve-layout="span:1"></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid span-items should match visual baseline', async () => {
    const report = await visualRunner.render(
      'grid-span-items',
      /* html */ `
      <section nve-layout="grid span-items:2">
        <div></div>
      </section>

      <section nve-layout="grid span-items:3">
        <div></div>
      </section>

      <section nve-layout="grid span-items:4">
        <div></div>
      </section>

      <section nve-layout="grid span-items:5">
        <div></div>
      </section>

      <section nve-layout="grid span-items:6">
        <div></div>
      </section>

      <section nve-layout="grid span-items:7">
        <div></div>
      </section>

      <section nve-layout="grid span-items:8">
        <div></div>
      </section>

      <section nve-layout="grid span-items:9">
        <div></div>
      </section>

      <section nve-layout="grid span-items:10">
        <div></div>
      </section>

      <section nve-layout="grid span-items:11">
        <div></div>
      </section>

      <section nve-layout="grid span-items:12">
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid gap should match visual baseline', async () => {
    const report = await visualRunner.render(
      'grid-gap',
      /* html */ `
      <div nve-layout="grid gap:lg">
        <section nve-layout="grid gap:xs">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="grid gap:sm">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="grid gap:md">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="grid gap:lg">
          <div></div>
          <div></div>
          <div></div>
        </section>

        <section nve-layout="grid gap:xl">
          <div></div>
          <div></div>
          <div></div>
        </section>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid vertical alignment should match visual baseline', async () => {
    const report = await visualRunner.render(
      'grid-align-vertical',
      /* html */ `
      <div nve-layout="column gap:lg">
        <section nve-layout="grid align:top" style="min-height: 300px">
          <div></div>
        </section>

        <section nve-layout="grid align:vertical-center" style="min-height: 300px">
          <div></div>
        </section>

        <section nve-layout="grid align:bottom" style="min-height: 300px">
          <div></div>
        </section>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid horizontal alignment should match visual baseline', async () => {
    const report = await visualRunner.render(
      'grid-align-horizontal',
      /* html */ `
      <div nve-layout="row gap:lg">
        <section nve-layout="grid align:left" style="min-width: 300px">
          <div></div>
        </section>
        <section nve-layout="grid align:horizontal-center" style="min-width: 300px">
          <div></div>
        </section>
        <section nve-layout="grid align:right" style="min-width: 300px">
          <div></div>
        </section>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid align:center should match visual baseline', async () => {
    const report = await visualRunner.render(
      'grid-align-center',
      /* html */ `
      <section nve-layout="grid align:center" style="min-height: 300px; min-width: 300px">
        <div></div>
      </section>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});
