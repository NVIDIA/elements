import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('typography visual', () => {
  test('text type should match visual baseline', async () => {
    const report = await visualRunner.render(
      'text-type',
      /* html */ `
      <div nve-layout="column gap:sm" style="height: 150px; width: 200px">
        <p nve-text="display">•︎•︎•︎•︎</p>
        <p nve-text="heading">•︎•︎•︎•︎</p>
        <p nve-text="body">•︎•︎•︎•︎</p>
        <p nve-text="label">•︎•︎•︎•︎</p>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  // disabled due to flakeyness in CI
  // test('text size should match visual baseline', async () => {
  //   const report = await visualRunner.render(
  //     'text-size',
  //     /* html */ `
  //     <div nve-layout="column gap:sm" style="height: 500px; width: 200px">
  //       <p nve-text="display xl">•︎•︎•︎•︎</p>
  //       <p nve-text="display lg">•︎•︎•︎•︎</p>
  //       <p nve-text="display">•︎•︎•︎•︎</p>
  //       <p nve-text="display sm">•︎•︎•︎•︎</p>
  //       <p nve-text="heading xl">•︎•︎•︎•︎</p>
  //       <p nve-text="heading lg">•︎•︎•︎•︎</p>
  //       <p nve-text="heading">•︎•︎•︎•︎</p>
  //       <p nve-text="heading sm">•︎•︎•︎•︎</p>
  //       <p nve-text="body xl">•︎•︎•︎•︎</p>
  //       <p nve-text="body lg">•︎•︎•︎•︎</p>
  //       <p nve-text="body">•︎•︎•︎•︎</p>
  //       <p nve-text="body sm">•︎•︎•︎•︎</p>
  //       <p nve-text="label xl">•︎•︎•︎•︎</p>
  //       <p nve-text="label lg">•︎•︎•︎•︎</p>
  //       <p nve-text="label">•︎•︎•︎•︎</p>
  //       <p nve-text="label sm">•︎•︎•︎•︎</p>
  //     </div>
  //   `
  //   );

  //   expect(report.maxDiffPercentage).toBeLessThan(1.5);
  // });

  test('text color should match visual baseline', async () => {
    const report = await visualRunner.render(
      'text-color',
      /* html */ `
      <div nve-layout="column gap:sm" style="height: 150px; width: 150px">
        <p nve-text="body">•︎•︎•︎•︎</p>
        <p nve-text="body emphasis">•︎•︎•︎•︎</p>
        <p nve-text="body muted">•︎•︎•︎•︎</p>
        <div nve-theme="root dark" nve-layout="column gap:lg">
          <p nve-text="body white">•︎•︎•︎•︎</p>
        </div>
        <div nve-theme="root light" nve-layout="column gap:lg">
          <p nve-text="body black">•︎•︎•︎•︎</p>
        </div>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('text weight should match visual baseline', async () => {
    const report = await visualRunner.render(
      'text-weight',
      /* html */ `
      <div nve-layout="column gap:sm" style="height: 150px; width: 150px">
        <p nve-text="body bold">•︎•︎•︎•︎</p>
        <p nve-text="body semibold">•︎•︎•︎•︎</p>
        <p nve-text="body medium">•︎•︎•︎•︎</p>
        <p nve-text="body">•︎•︎•︎•︎</p>
        <p nve-text="body light">•︎•︎•︎•︎</p>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test.skip('text transforms should match visual baseline', async () => {
    const report = await visualRunner.render(
      'text-transforms',
      /* html */ `
      <div nve-layout="column gap:sm" style="height: 150px; width: 200px">
        <p nve-text="body uppercase">uppercase</p>
        <p nve-text="body lowercase">LOWERCASE</p>
        <p nve-text="body capitalize">capitalize</p>
        <p nve-text="body truncate" style="width: 350px;">dignissimos ducimus qui blanditiis praesentium</p>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('text links should match visual baseline', async () => {
    const report = await visualRunner.render(
      'text-links',
      /* html */ `
      <div nve-layout="column gap:sm" style="height: 150px; width: 200px">
        <a nve-text="body link" href="#">•︎•︎•︎•︎</a>
        <a nve-text="body link hover" href="#">•︎•︎•︎•︎</a>
        <a nve-text="body link visited" href="#">•︎•︎•︎•︎</a>
      </div>
    `
    );

    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});
