import { elementIsStable } from '../index.js';
import { waitForAnimationFrames } from '../frames.js';

export { waitForAnimationFrames } from '../frames.js';

export interface PopoverObservation {
  id: string;
  popover: string | null;
  open: boolean;
  rects: number;
  display: string;
}

/** Reads native state, computed display, and layout boxes. Call outside the measured window. */
export function observePopover(element: HTMLElement): PopoverObservation {
  return {
    id: element.id,
    popover: element.getAttribute('popover'),
    open: element.matches(':popover-open'),
    rects: element.getClientRects().length,
    display: getComputedStyle(element).display
  };
}

/** Alternates width writes and intentional geometry reads in one task; returns the sum of observed widths. */
export function resizeWithGeometryReads(
  element: HTMLElement,
  { widths, iterations }: { widths: readonly [number, number]; iterations: number }
): number {
  if (!Number.isInteger(iterations) || iterations <= 0) throw new Error('Resize iterations must be a positive integer');
  if (widths.some(width => !Number.isFinite(width) || width <= 0) || widths[0] === widths[1])
    throw new Error('Resize widths must be finite, positive, and distinct');
  let checksum = 0;
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const width = iteration % 2 === 0 ? widths[0] : widths[1];
    element.style.width = `${width}px`;
    checksum += element.getBoundingClientRect().width;
  }
  return checksum;
}

interface WaitOptions {
  timeoutMs?: number;
  label?: string;
}

/** Installs a listener immediately and removes it on success or timeout. */
export function waitForEvent(
  target: EventTarget,
  type: string,
  { timeoutMs = 2000, label = type }: WaitOptions = {}
): Promise<Event> {
  validateTimeout(timeoutMs);
  return new Promise((resolve, reject) => {
    const listener = (event: Event) => {
      cleanup();
      resolve(event);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`${label}: ${type} timed out after ${timeoutMs} ms`));
    }, timeoutMs);
    function cleanup() {
      clearTimeout(timer);
      target.removeEventListener(type, listener);
    }
    target.addEventListener(type, listener, { once: true });
  });
}

/** Awaits Lit, transition creation, and animations present at that boundary; returns the observed animation count. */
export async function waitForLitAnimations(
  element: HTMLElement & { updateComplete?: Promise<boolean> },
  { timeoutMs = 2000, label = element.id || element.localName }: WaitOptions = {}
): Promise<number> {
  validateTimeout(timeoutMs);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        await elementIsStable(element);
        await waitForAnimationFrames(1);
        getComputedStyle(element).getPropertyValue('display');
        const animations = element.getAnimations();
        await Promise.all(
          animations.map(animation =>
            animation.finished.catch((error: unknown) => {
              if (!(error instanceof DOMException && error.name === 'AbortError')) throw error;
            })
          )
        );
        await waitForAnimationFrames(1);
        return animations.length;
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label}: animation settling timed out after ${timeoutMs} ms`)),
          timeoutMs
        );
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function validateTimeout(timeoutMs: number) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Timeout must be finite and positive');
}
