// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DOCS_URL } from './strings.js';

export const DOCS_LOG_URL = `${DOCS_URL}docs/api-design/logs/`;

export function getExcessiveInstanceLimitWarning(count: number, localName: string) {
  return `Excessive rendering of ${count} ${localName} were detected in DOM. Recycle/reuse elements when possible to improve application performance. ${DOCS_LOG_URL}#excessive-instance-limit`;
}

export function getMultiplePageWarning(count: number) {
  return `Detected ${count} nve-page elements. Use one nve-page as the application shell. ${DOCS_LOG_URL}#page-shell-count`;
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
