---
{
  title: 'Input Group',
  layout: 'docs.11ty.js',
  tag: 'nve-input-group'
}
---

## Installation

```typescript
import '@nvidia-elements/core/input/define.js';
```

```html
<nve-input-group>
  <label>domain</label>
  <nve-select style="width: 130px">
    <select aria-label="protocol">
      <option>https://</option>
      <option>http://</option>
    </select>
  </nve-select>
  <nve-input>
    <input placeholder="example" type="url" aria-label="host" />
    <nve-button container="flat" readonly="">.com</nve-button>
  </nve-input>
  <nve-control-message>host: 123456</nve-control-message>
</nve-input-group>
```

## Standard

{% story 'nve-input-group', 'InputGroup' %}

## Range Group

{% story 'nve-input-group', 'FilterGroupRange' %}
