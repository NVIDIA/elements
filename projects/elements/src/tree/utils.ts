interface SelectableNode {
  selected: boolean;
  indeterminate: boolean;
  nodes: { selected: boolean; indeterminate: boolean }[];
}

export function updateNodeSelection(node: SelectableNode) {
  const nodes = node.nodes;

  if (nodes.length) {
    if (nodes.every(node => node.selected)) {
      node.selected = true;
      node.indeterminate = false;
    } else if (nodes.some(node => node.selected)) {
      node.indeterminate = true;
    } else if (nodes.every(node => !node.selected)) {
      node.selected = false;
      node.indeterminate = false;
    }
  }

  nodes.forEach(n => updateNodeSelection(n as SelectableNode));
}
