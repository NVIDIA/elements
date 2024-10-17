import { LogService } from '../services/log.service.js';
import { getIdMatchNotFoundWarning } from '../utils/audit.js';
import { generateId, getFlatDOMTree } from '../utils/dom.js';

export function associateAnchor(host: HTMLElement, anchor: HTMLElement) {
  if (!(anchor.style as any).anchorName) {
    const id = anchor.id && !anchor.id.includes(':') ? anchor.id : generateId();
    (anchor.style as any).anchorName = `--${id}`;
  }

  (host.style as any).positionAnchor = (anchor.style as any).anchorName;
}

export function getHostTrigger(element: HTMLElement, trigger: HTMLElement | string) {
  if (typeof trigger === 'string') {
    return (
      (getFlatDOMTree(element.parentNode as HTMLElement)
        .filter(el => el?.id !== '')
        .find(el => el.id === trigger) as HTMLButtonElement) ?? globalThis.document.body
    );
  } else {
    return trigger as HTMLButtonElement;
  }
}

export function getHostAnchor(host: HTMLElement & { anchor?: HTMLElement | string; _activeTrigger?: HTMLElement }) {
  const anchor = host.anchor ?? host._activeTrigger;

  if (typeof anchor === 'string' && anchor?.length) {
    const match = getFlatDOMTree(host.parentNode as HTMLElement)
      .filter(el => el?.id !== '')
      .find(el => el.id === anchor);

    if (!match) {
      LogService.warn(getIdMatchNotFoundWarning(anchor));
    }

    return match ?? globalThis.document.body;
  } else if (anchor && anchor !== globalThis.document.body) {
    return anchor as HTMLElement;
  } else {
    return globalThis.document.body;
  }
}
