---
{
  title: 'Button Group',
  layout: 'docs.11ty.js',
  tag: 'nve-button-group'
}
---

## Installation

```typescript
import '@nvidia-elements/core/button-group/define.js';
```

```html
<nve-button-group>
  <nve-icon-button pressed icon-name="split-vertical"></nve-icon-button>
  <nve-icon-button icon-name="split-horizontal"></nve-icon-button>
  <nve-icon-button icon-name="split-none"></nve-icon-button>
</nve-button-group>

<nve-button-group behavior-select="single">
  <nve-button pressed>10%</nve-button>
  <nve-button>15%</nve-button>
  <nve-button>20%</nve-button>
</nve-button-group>
```

## Standard

{% story 'nve-button-group', 'Default' %}

## Split

{% api 'nve-button-group', 'property', 'interaction' %}

{% story 'nve-button-group', 'ActionSplit' %}

### Split Rounded

{% story 'nve-button-group', 'ActionSplitRounded' %}

## Container

{% api 'nve-button-group', 'property', 'container' %}

### Standard

{% story 'nve-button-group', 'Default' %}

### Flat

{% api 'nve-button-group', 'property', 'container' %}

{% story 'nve-button-group', 'Flat' %}

### Rounded

{% api 'nve-button-group', 'property', 'container' %}

{% story 'nve-button-group', 'Rounded' %}

### Rounded Icon

{% story 'nve-button-group', 'RoundedIcon' %}

## Selection

{% api 'nve-button-group', 'property', 'behaviorSelect' %}

### Single Select

{% story 'nve-button-group', 'SingleSelect' %}

### Multi Select

{% story 'nve-button-group', 'MultiSelect' %}

### Disabled

{% story 'nve-button-group', 'Disabled' %}

## Orientation

{% api 'nve-button-group', 'property', 'orientation' %}

{% story 'nve-button-group', 'OrientationVertical' %}
