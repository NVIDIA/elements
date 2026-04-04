// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';

import { MonacoEditor } from '../editor/editor.js';

import { BaseMonacoInput } from '../internal/base/input.js';

/**
 * @element nve-monaco-input
 * @description An input control for editing JSON, YAML and code with syntax highlighting and validation.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/monaco/input
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
 * @stable false
 */
export class MonacoInput extends BaseMonacoInput<MonacoEditor, monaco.editor.IStandaloneCodeEditor> {
  static readonly metadata = {
    tag: 'nve-monaco-input',
    version: '0.0.0',
    valueSchema: {
      type: 'string' as const
    }
  };

  static elementDefinitions = {
    [MonacoEditor.metadata.tag]: MonacoEditor
  };

  protected get _editor(): MonacoEditor {
    return this.shadowRoot!.querySelector<MonacoEditor>(MonacoEditor.metadata.tag)!;
  }

  protected _createEditor(_monaco: Monaco): monaco.editor.IStandaloneCodeEditor {
    return this.shadowRoot!.querySelector<MonacoEditor>(MonacoEditor.metadata.tag)!.editor!;
  }

  /* eslint-disable local/required-css-parts */
  render() {
    return html`
      <div internal-host>
        <nve-monaco-editor></nve-monaco-editor>
      </div>
    `;
  }
}
