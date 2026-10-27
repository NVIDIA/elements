// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

let docsURL = '';
/* @ts-expect-error -- VITE_BUNDLE_CONFIG is only defined at build time */
if (!import.meta.env.VITE_BUNDLE_CONFIG) {
  docsURL = 'https://nvidia.github.io/elements/';
}
export const DOCS_LOG_URL = `${docsURL}docs/api-design/logs/`;

export function getDuplicatePackageVersionWarning(localName: string, version: string) {
  return `@nve: ${localName} version ${version} already defined, check for duplicate package versions. ${DOCS_LOG_URL}#duplicate-package-version`;
}

export function getDuplicatePackageGlobalVersionWarning() {
  return `@nve: Multiple versions loaded. ${DOCS_LOG_URL}#duplicate-package-version`;
}
