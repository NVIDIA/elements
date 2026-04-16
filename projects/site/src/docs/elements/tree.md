---
{
  title: 'Tree View',
  layout: 'docs.11ty.js',
  tag: 'nve-tree',
  associatedElements: ['nve-tree-node']
}
---

## Installation

{% install 'nve-tree' %}

## Border

{% api 'nve-tree', 'property', 'border' %}

{% example '@nvidia-elements/core/tree/tree.examples.json' 'Border' %}

## Selectable

{% api 'nve-tree-node', 'property', 'selectable' %}

{% example '@nvidia-elements/core/tree/tree.examples.json' 'Selectable' %}

## Selectable Multi

{% api 'nve-tree-node', 'property', 'selectable' %}

{% example '@nvidia-elements/core/tree/tree.examples.json' 'SelectableMultiple' %}

## Select Event

{% example '@nvidia-elements/core/tree/tree.examples.json' 'SelectEvent' %}

## Links

{% example '@nvidia-elements/core/tree/tree.examples.json' 'Links' %}

## Highlight

{% api 'nve-tree-node', 'property', 'highlighted' %}

{% example '@nvidia-elements/core/tree/tree.examples.json' 'Highlight' %}

## Async

{% example '@nvidia-elements/core/tree/tree.examples.json' 'Async' %}

## Complex Tree Navigation

{% example '@internals/patterns/navigation.examples.json' 'ComplexTreeNavigation' %}

## Drawer Navigation

{% example '@internals/patterns/navigation.examples.json' 'DrawerNavigation' '{ "inline": false, "height": "500px" }' %}

## Node Content

{% example '@nvidia-elements/core/tree/tree.examples.json' 'NodeContent' %}

## Dynamic Tree

{% example '@nvidia-elements/core/tree/tree.examples.json' 'DynamicTree' %}

Example in lit-html:

```html
<nve-tree-node .expandable="${node.nodes.length}" .expanded="${node.expanded}" @open="${e => this.#open(e, node)}" @close="${e => this.#close(e, node)}">
  ${node.label} node
  ${node.expanded ? node.nodes.map(n => html`${this.#getNodeList(n)}`) : nothing}
</nve-tree-node>
```

## Overflow

{% example '@nvidia-elements/core/tree/tree.examples.json' 'Overflow' %}

<script type="module" src="/_internal/stories/tree/dynamic-tree.js"></script>
