import { css } from 'lit';
import { arrow, autoUpdate, computePosition, ComputePositionReturn, flip, Middleware, offset } from '@floating-ui/dom';
import { parseTokenNumber } from '../utils/dom.js';

if (!(window as any).process) {
  (window as any).process = { env: { NODE_ENV: 'production' } }; // floating-ui
}

/**
 * https://open-ui.org/components/popup.research.explainer#api-shape
 * auto - light dismiss, focus on open, return to trigger
 * manual - no light dismiss, no auto focus
 * hint - no light dismiss, no auto focus, open/close on hover/focus
 */
export type PopoverType = 'auto' | 'manual' | 'hint';
export type PopoverAlign = 'start' | 'end' | 'center';
export type PopoverSides = 'top' | 'bottom' | 'left' | 'right';
export type PopoverPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type Placement = PopoverPosition | `${PopoverSides}-${PopoverAlign}`;

export interface PopoverConfig {
  position: PopoverPosition,
  alignment?: PopoverAlign,
  popover: HTMLElement,
  anchor: HTMLElement,
  arrow?: HTMLElement,
  offset?: number,
  arrowOffset?: number,
  arrowPadding?: number,
  strategy?: 'fixed' | 'absolute'
}

export const popoverBaseStyles = css`
:host {
  --width: max-content;
  contain: initial;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

:host([hidden]) {
  display: block !important;
  pointer-events: none !important;
}

.popover,
dialog {
  width: var(--width);
  background: none;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: fixed;
  white-space: nowrap;
  z-index: 9999;
  border: 0;
  margin: 0;
  padding: 0;
  opacity: 0;
  user-select: text;
}

:host(:not([hidden])) .popover,
:host(:not([hidden])) dialog {
  opacity: 1;
}
`;

export function getPopoverCustomCSSProperites(element: HTMLElement) {
  const styles = getComputedStyle(element);
  return {
    offset: parseTokenNumber(styles.getPropertyValue('--mlv-sys-layer-popover-offset')),
    arrowOffset: parseTokenNumber(styles.getPropertyValue('--mlv-sys-layer-popover-arrow-offset')),
    arrowPadding: parseTokenNumber(styles.getPropertyValue('--mlv-sys-layer-popover-arrow-padding'))
  };
}

export function setPopoverStyles(config: PopoverConfig, position: { x: number, y: number }) {
  const positionStyle = config.anchor === document.body ? 'fixed' : 'absolute';
  Object.assign(config.popover.style, { position: positionStyle, left: `${position.x}px`, top: `${position.y}px` });
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
    config.anchor !== document.body ? flip() : null
  ].filter(i => !!i);
  const placement = `${config.position}${config.alignment === 'start' || config.alignment === 'end' ? `-${config.alignment}` : ''}` as `${PopoverSides}-${Exclude<PopoverAlign, 'center'>}`;
  return computePosition(config.anchor, config.popover, { placement: config.position !== 'center' ? placement : undefined, middleware, strategy: config.strategy });
}

function getOffsetMiddleware(config: PopoverConfig): Middleware {
  return offset(({ rects }) => {
    if (config.position === 'center') {
      const height = config.anchor === document.body ? document.documentElement.clientHeight : rects.reference.height;
      return -rects.reference.height + ((height / 2) - (rects.floating.height / 2));
    } else if (config.anchor === document.body) {
      const crossAxis = { start: config.offset, end: -config.offset, undefined: 0, center: 0 };
      return { mainAxis: config.position === 'top' || config.position === 'bottom' ? -rects.floating.height - config.offset : -rects.floating.width - config.offset, crossAxis: crossAxis[config.alignment] };
    } else {
      const arrowWidth = config.arrow?.getBoundingClientRect()?.width;
      return { mainAxis: arrowWidth ? (arrowWidth / 2) + config.offset : config.offset };
    }
  });
}
