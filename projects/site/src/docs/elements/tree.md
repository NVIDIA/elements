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

## Standard

{% story 'nve-tree', 'Default' %}

## Border

{% api 'nve-tree', 'property', 'border' %}

{% story 'nve-tree', 'Border' %}

## Selectable

{% api 'nve-tree-node', 'property', 'selectable' %}

{% story 'nve-tree', 'Selectable' %}

## Selectable Multi

{% api 'nve-tree-node', 'property', 'selectable' %}

{% story 'nve-tree', 'SelectableMultiple' %}

## Links

{% story 'nve-tree', 'Links' %}

## Highlight

{% api 'nve-tree-node', 'property', 'highlighted' %}

{% story 'nve-tree', 'Highlight' %}

## Async

If data is dynamically loaded for a node use a `progress-ring` to show loading progress.

{% story 'nve-tree', 'Async' %}

## Vertical Nav

{% story 'nve-tree', 'VerticalNav', '{ "inline": false, "height": "500px" }' %}

## Node Content

{% story 'nve-tree', 'NodeContent' %}

## Dynamic Tree

Using the `open` and `close` events, trees can conditionally render node based on if the node is expanded.

{% story 'nve-tree', 'DynamicTree' %}

Example in lit-html:

```html
<nve-tree-node .expandable="${node.nodes.length}" .expanded="${node.expanded}" @open="${e => this.#open(e, node)}" @close="${e => this.#close(e, node)}">
  ${node.label} node
  ${node.expanded ? node.nodes.map(n => html`${this.#getNodeList(n)}`) : nothing}
</nve-tree-node>
```

## Overflow

If the tree expands past its container, use overflow on the parent to enable scrolling.

{% story 'nve-tree', 'Overflow' %}

<script type="module" src="/_internal/stories/tree/dynamic-tree.js"></script>
