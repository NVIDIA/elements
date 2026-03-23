import { DOCS_URL } from './strings.js';

export const DOCS_LOG_URL = `${DOCS_URL}docs/api-design/logs/`;

export function getExcessiveInstanceLimitWarning(count: number, localName: string) {
  return `Excessive rendering of ${count} ${localName} were detected in DOM. Recycle/reuse elements when possible to improve application performance. ${DOCS_LOG_URL}#excessive-instance-limit`;
}

export function getInvalidSlottedChildrenWarning(localName: string, allowed: Array<string>) {
  return `Invalid slotted elements detected in ${localName}. Allowed: ${allowed.join(', ')}. ${DOCS_LOG_URL}#invalid-slotted-children`;
}

export function getInvalidParentWarning(localName: string, allowedParent: string) {
  return `Element ${localName} can only be used as a direct child of ${allowedParent}. ${DOCS_LOG_URL}#invalid-parent`;
}

export function getIdMatchNotFoundWarning(id: string) {
  return `Provided id "${id}" not found in DOM. ${DOCS_LOG_URL}#id-match-not-found`;
}

export function getSSRMismatchWarning(localName: string) {
  return `${localName} rendered on the client with mismatched SSR content. ${DOCS_LOG_URL}#ssr-mismatch`;
}

export function getCrossShadowRootAnchorWarning(localName: string) {
  return `(deprecated) ${localName} provided an anchor outside of its render root. ${DOCS_LOG_URL}#cross-shadow-root-anchor`;
}

export function getDuplicatePackageVersionWarning(localName: string, version: string) {
  return `@nve: Element ${localName} version ${version} already defined, please check for duplicate package versions. ${DOCS_LOG_URL}#duplicate-package-version`;
}

export function getDuplicatePackageGlobalVersionWarning() {
  return `@nve: Multiple versions of Elements loaded, please check for duplicate package versions. ${DOCS_LOG_URL}#duplicate-package-version`;
}

export function getEsmHostedWarning() {
  return '@nve: Using esm.sh is not supported for production use.';
}
