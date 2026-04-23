// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';

import '@nvidia-elements/core/tree/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/progress-ring/define.js';

@customElement('test-dynamic-tree')
export class TestDynamicTree extends LitElement {
  @state() nodes = createTree();

  render() {
    return html`
    <p nve-text="body">total nodes: 10,000</p>
    <nve-tree border expandable>
      ${this.nodes.map(node => this.#getNodeList(node))}
    </nve-tree>`;
  }

  #getNodeList(node) {
    return html`<nve-tree-node .expandable=${node.nodes.length} .expanded=${node.expanded} @open=${e => this.#open(e, node)} @close=${e => this.#close(e, node)}>
      ${node.label} node
      ${node.expanded ? node.nodes.map(n => html`${this.#getNodeList(n)}`) : nothing}
    </nve-tree-node>`;
  }

  #open(e, node) {
    e.stopPropagation();
    node.expanded = true;
    this.nodes = [...this.nodes];
    this.requestUpdate();
  }

  #close(e, node) {
    e.stopPropagation();
    node.expanded = false;
    this.nodes = [...this.nodes];
    this.requestUpdate();
  }
}

/** generates a tree with 10 nodes with 4 layers */
function createTree() {
  return createNodeList(10).map(i => {
    i.nodes = createNodeList(10);
    i.nodes.forEach(j => {
      j.nodes = createNodeList(10);
      j.nodes.forEach(k => {
        k.nodes = createNodeList(10);
      });
    });
    return i;
  });
}

function createNodeList(nodes: number) {
  return new Array(nodes).fill('').map((_, i) => ({ label: `${i}`, expanded: false, nodes: [] }));
}
