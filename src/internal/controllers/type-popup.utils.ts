import { css } from 'lit';
import { arrow, autoUpdate, computePosition, ComputePositionReturn, flip, Middleware, offset } from '@floating-ui/dom';
import { parseTokenNumber } from '../utils/dom.js';

if (!(window as any).process) {
  (window as any).process = { env: { NODE_ENV: 'production' } }; // floating-ui
}

export type PopupType = 'auto' | 'manual' | 'hint'; // https://open-ui.org/components/popup.research.explainer#api-shape
export type PopupAlign = 'start' | 'end';
export type PopupSides = 'top' | 'bottom' | 'left' | 'right';
export type PopupPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type Placement = PopupPosition | `${PopupSides}-${PopupAlign}`;

export interface PopupConfig {
  position: PopupPosition,
  alignment?: PopupAlign,
  popup: HTMLElement,
  anchor: HTMLElement,
  arrow?: HTMLElement,
  offset?: number,
  arrowOffset?: number,
  arrowPadding?: number,
  strategy?: 'fixed' | 'absolute'
}

export const popupBaseStyles = css`
:host {
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

.popup,
dialog {
  background: none;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: fixed;
  width: fit-content;
  white-space: nowrap;
  z-index: 9999;
  border: 0;
  margin: 0;
  padding: 0;
  opacity: 0;
  user-select: text;
}

.popup[hidden],
dialog[hidden] {
  display: flex !important;
  pointer-events: none !important;
}

.popup:not([hidden]),
dialog:not([hidden]) {
  opacity: 1;
}
`;

export function getPopupCustomCSSProperites(element: HTMLElement) {
  const styles = getComputedStyle(element);
  return {
    offset: parseTokenNumber(styles.getPropertyValue('--mlv-sys-layer-popup-offset')),
    arrowOffset: parseTokenNumber(styles.getPropertyValue('--mlv-sys-layer-popup-arrow-offset')),
    arrowPadding: parseTokenNumber(styles.getPropertyValue('--mlv-sys-layer-popup-arrow-padding'))
  };
}

export function setPopupStyles(config: PopupConfig, position: { x: number, y: number }) {
  const positionStyle = config.anchor === document.body ? 'fixed' : 'absolute';
  Object.assign(config.popup.style, { position: positionStyle, left: `${position.x}px`, top: `${position.y}px` });
}

export function setArrowStyles(config: PopupConfig, position: ComputePositionReturn) {
  if (config.arrow && config.position !== 'center') {
    const side = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[position.placement.split('-')[0]];
    Object.assign(config.arrow.style, {
      left: position.middlewareData.arrow.x !== null ? `${position.middlewareData.arrow.x}px` : '',
      top: position.middlewareData.arrow.y !== null ? `${position.middlewareData.arrow.y}px` : '',
      [side]: `${-(config.arrow?.getBoundingClientRect()?.width / 2) + config.arrowOffset}px`
    });
  }
}

export function popupRenderUpdate(config: PopupConfig, fn: () => void) {
  autoUpdate(config.anchor, config.popup, () => fn());
}

export function computePopupPosition(config: PopupConfig) {
  const middleware = [
    getOffsetMiddleware(config),
    config.arrow ? arrow({ element: config.arrow, padding: config.arrowPadding }) : null,
    flip()
  ].filter(i => !!i);
  const placement = `${config.position}${config.alignment === 'start' || config.alignment === 'end' ? `-${config.alignment}` : ''}` as `${PopupSides}-${PopupAlign}`;
  return computePosition(config.anchor, config.popup, { placement: config.position !== 'center' ? placement : undefined, middleware, strategy: config.strategy });
}

function getOffsetMiddleware(config: PopupConfig): Middleware {
  return offset(({ rects }) => {
    if (config.position === 'center') {
      return -rects.reference.height / 2 - rects.floating.height / 2;
    } else if (config.anchor === document.body) {
      const crossAxis = { start: config.offset, end: -config.offset, undefined: 0, center: 0 };
      return { mainAxis: config.position === 'top' || config.position === 'bottom' ? -rects.floating.height - config.offset : -rects.floating.width - config.offset, crossAxis: crossAxis[config.alignment] };
    } else {
      const arrowWidth = config.arrow?.getBoundingClientRect()?.width;
      return { mainAxis: arrowWidth ? (arrowWidth / 2) + config.offset : config.offset };
    }
  });
}
