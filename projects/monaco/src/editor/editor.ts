// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';

import { BaseMonacoEditor } from '../internal/base/editor.js';

/**
 * @element nve-monaco-editor
 * @description A low-level Monaco Editor wrapper that provides direct access to an editor instance and API.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/monaco/editor
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
 * @stable false
 */
export class MonacoEditor extends BaseMonacoEditor<monaco.editor.IStandaloneCodeEditor> {
  static readonly metadata = {
    tag: 'nve-monaco-editor',
    version: '0.0.0'
  };

  protected _createEditor(container: HTMLElement, monaco: Monaco): monaco.editor.IStandaloneCodeEditor {
    return monaco.editor.create(container, {
      automaticLayout: true,
      fontLigatures: '' // Workaround: https://github.com/microsoft/monaco-editor/issues/3217
    });
  }

  render() {
    return html`
      <div internal-host>
        <div id="color-scheme-probe"></div>
        <div id="editor"></div>
      </div>
    `;
  }
}
