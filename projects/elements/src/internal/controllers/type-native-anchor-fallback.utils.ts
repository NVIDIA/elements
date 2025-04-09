/* istanbul ignore file -- @preserve */
// ignoring as this is a temporary polyfill until CSS Anchor Positioning is stable in Firefox and Safari
import type { ComputePositionReturn, Middleware } from '@floating-ui/dom';
import { arrow, autoUpdate, computePosition, flip, offset, platform } from '@floating-ui/dom';
import { offsetParent } from 'composed-offset-position';
import { parseTokenNumber } from '../utils/dom.js';
import type { PopoverAlign, PopoverPosition, PopoverSides } from '../types/index.js';

if (!globalThis.process) {
  // floating-ui
  (globalThis.process as any) = { env: { NODE_ENV: 'production' } }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface PopoverConfig {
  position: PopoverPosition;
  popover: HTMLElement;
  alignment?: PopoverAlign;
  anchor: HTMLElement;
  arrow?: HTMLElement;
  offset?: number;
  arrowOffset?: number;
  arrowPadding?: number;
  strategy?: 'fixed' | 'absolute';
}

export async function setAnchorPositionFallback(host: HTMLElement, popoverConfig: PopoverConfig) {
  if (!host.hidden) {
    const styles = getComputedStyle(host);
    const config = {
      ...popoverConfig,
      offset: parseTokenNumber(styles.getPropertyValue('--nve-sys-layer-popover-offset')),
      arrowOffset: parseTokenNumber(styles.getPropertyValue('--nve-sys-layer-popover-arrow-offset')),
      arrowPadding: parseTokenNumber(styles.getPropertyValue('--nve-sys-layer-popover-arrow-padding'))
    };

    config.arrow?.removeAttribute('style');
    await new Promise(r => requestAnimationFrame(r));

    if (host && config.position) {
      const position = await computePopoverPosition(config);
      setPopoverStyles(config, position);
      setArrowStyles(config, position);
    }
  }
}

export function setPopoverStyles(config: PopoverConfig, position: Partial<ComputePositionReturn>) {
  config.popover.style.setProperty('position', config.strategy);
  config.popover.style.setProperty('inset', `${position.y}px auto auto ${position.x}px`, 'important');
}

export function setArrowStyles(config: PopoverConfig, position: ComputePositionReturn) {
  if (config.arrow && config.position !== 'center') {
    const side = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[position.placement.split('-')[0]];
    Object.assign(config.arrow.style, {
      left: position.middlewareData.arrow.x !== null ? `${position.middlewareData.arrow.x}px` : '',
      top: position.middlewareData.arrow.y !== null ? `${position.middlewareData.arrow.y}px` : '',
      [side]: `${-(config.arrow?.getBoundingClientRect()?.width / 2) + config.arrowOffset}px`
    });
  }
}

export function popoverRenderUpdate(config: PopoverConfig, fn: () => void) {
  return autoUpdate(config.anchor, config.popover, () => fn());
}

export function computePopoverPosition(config: PopoverConfig) {
  const middleware = [
    getOffsetMiddleware(config),
    config.arrow ? arrow({ element: config.arrow, padding: config.arrowPadding }) : null,
    config.anchor !== globalThis.document.body ? flip() : null
  ].filter(i => !!i);
  const placement =
    `${config.position}${config.alignment === 'start' || config.alignment === 'end' ? `-${config.alignment}` : ''}` as `${PopoverSides}-${Exclude<PopoverAlign, 'center'>}`;
  return computePosition(config.anchor, config.popover, {
    placement: config.position !== 'center' ? placement : undefined,
    middleware,
    strategy: 'fixed',
    platform: {
      ...platform,
      // https://floating-ui.com/docs/platform#shadow-dom-fix
      getOffsetParent: (element: HTMLElement) => platform.getOffsetParent(element, offsetParent)
    }
  });
}

function getOffsetMiddleware(config: PopoverConfig): Middleware {
  return offset(({ rects }) => {
    if (config.position === 'center') {
      const height =
        config.anchor === globalThis.document.body
          ? globalThis.document.documentElement.clientHeight
          : rects.reference.height;
      return -rects.reference.height + (height / 2 - rects.floating.height / 2);
    } else if (config.anchor === globalThis.document.body) {
      const crossAxis = { start: config.offset, end: -config.offset, undefined: 0, center: 0 };
      return {
        mainAxis:
          config.position === 'top' || config.position === 'bottom'
            ? -rects.floating.height - config.offset
            : -rects.floating.width - config.offset,
        crossAxis: crossAxis[config.alignment]
      };
    } else {
      const arrowWidth = config.arrow?.getBoundingClientRect()?.width;
      return { mainAxis: arrowWidth ? arrowWidth / 2 + config.offset : config.offset };
    }
  });
}
