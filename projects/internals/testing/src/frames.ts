/** Waits for rendering opportunities, without claiming that asynchronous component work has completed. */
export async function waitForAnimationFrames(count = 2): Promise<void> {
  if (!Number.isInteger(count) || count < 0) throw new Error('Animation frame count must be a nonnegative integer');
  for (let frame = 0; frame < count; frame += 1) {
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }
}
