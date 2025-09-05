const jsonValue = `{
  "name": "my-app",
  "version": "1.0.0"
}`;

const invalidJsonValue = `{
  "name": "my-app",
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

export function template() {
  return /* html */ `
  <div nve-layout="column gap:md">
    <nve-monaco-input language="json" schema='${jsonSchema}' value='${jsonValue}'></nve-monaco-input>

    <nve-monaco-input language="json" schema='${jsonSchema}' value='${jsonValue}' disabled></nve-monaco-input>

    <nve-monaco-input language="json" schema='${jsonSchema}' value='${jsonValue}' line-numbers="on" folding minimap></nve-monaco-input>

    <nve-control style="width: 100%;">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <nve-monaco-input nve-control language="json" schema='${jsonSchema}' value='${jsonValue}'></nve-monaco-input>
      <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
    </nve-control>

    <nve-control style="width: 100%;">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <nve-monaco-input nve-control language="json" schema='${jsonSchema}' value='${invalidJsonValue}'></nve-monaco-input>
      <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
    </nve-control>
  </div>
  `;
}
