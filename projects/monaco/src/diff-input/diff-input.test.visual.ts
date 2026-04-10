// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const originalJsonValue = `{
  "name": "my-original-app",
  "version": "0.0.0"
}`;

const jsonValue = `{
  "name": "my-modified-app",
  "version": "1.0.0"
}`;

const invalidJsonValue = `{
  "name": "my-modified-app",
  "version": "1.0.0",
  "description": 42
}`;

const jsonSchema = `{
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Project name" },
    "version": { "type": "string", "pattern": "^\\\\d+\\\\.\\\\d+\\\\.\\\\d+$", "description": "Semantic version number" },
    "description": { "type": "string", "description": "Project description" }
  },
  "required": ["name", "version"]
}`;

export function readyCheck(evaluate: (fn: () => boolean) => Promise<boolean>) {
  return evaluate(() => document.querySelectorAll('nve-monaco-diff-input:state(ready)').length === 10);
}

export function template() {
  return /* html */ `
  <div nve-layout="column gap:md" style="width: 1280px; height: 1252px;">
    <nve-monaco-diff-input language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}'></nve-monaco-diff-input>

    <nve-monaco-diff-input language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}' disabled></nve-monaco-diff-input>

    <nve-monaco-diff-input language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}' line-numbers="on" side-by-side></nve-monaco-diff-input>

    <nve-control style="width: 100%;">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <nve-monaco-diff-input nve-control language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}' line-numbers="on" side-by-side></nve-monaco-diff-input>
      <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
    </nve-control>

    <nve-control style="width: 100%;">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <nve-monaco-diff-input nve-control language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${invalidJsonValue}' line-numbers="on" side-by-side></nve-monaco-diff-input>
      <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
    </nve-control>
  </div>

  <div nve-layout="column gap:md" style="width: 640px; height: 1252px;">
    <nve-monaco-diff-input language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}'></nve-monaco-diff-input>

    <nve-monaco-diff-input language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}' disabled></nve-monaco-diff-input>

    <nve-monaco-diff-input language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}' line-numbers="on" side-by-side></nve-monaco-diff-input>

    <nve-control style="width: 100%;">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <nve-monaco-diff-input nve-control language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}' line-numbers="on" side-by-side></nve-monaco-diff-input>
      <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
    </nve-control>

    <nve-control style="width: 100%;">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <nve-monaco-diff-input nve-control language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${invalidJsonValue}' line-numbers="on" side-by-side></nve-monaco-diff-input>
      <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
    </nve-control>
  </div>
  `;
}
