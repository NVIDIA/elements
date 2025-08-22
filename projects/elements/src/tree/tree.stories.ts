import { html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators/state.js';
import '@nvidia-elements/core/tree/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/progress-ring/define.js';

export default {
  title: 'Elements/Tree',
  component: 'nve-tree',
};

export const Default = {
  render: () => html`
    <nve-tree behavior-expand>
      <nve-tree-node expanded>
        node 1
        <nve-tree-node>node 1-1</nve-tree-node>
        <nve-tree-node>node 1-2</nve-tree-node>
        <nve-tree-node>
          node 1-3
          <nve-tree-node>node 1-3-1</nve-tree-node>
          <nve-tree-node>node 1-3-2</nve-tree-node>
          <nve-tree-node>node 1-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 2
        <nve-tree-node>node 2-1</nve-tree-node>
        <nve-tree-node>node 2-2</nve-tree-node>
        <nve-tree-node>node 2-3</nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 3
        <nve-tree-node>node 3-1</nve-tree-node>
        <nve-tree-node>node 3-2</nve-tree-node>
        <nve-tree-node>
          node 3-3
          <nve-tree-node>node 3-3-1</nve-tree-node>
          <nve-tree-node>node 3-3-2</nve-tree-node>
          <nve-tree-node>node 3-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
    </nve-tree>
  `
};

export const Border = {
  render: () => html`
    <nve-tree behavior-expand border>
      <nve-tree-node expanded>
        node 1
        <nve-tree-node>node 1-1</nve-tree-node>
        <nve-tree-node>node 1-2</nve-tree-node>
        <nve-tree-node>
          node 1-3
          <nve-tree-node>node 1-3-1</nve-tree-node>
          <nve-tree-node>node 1-3-2</nve-tree-node>
          <nve-tree-node>node 1-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 2
        <nve-tree-node>node 2-1</nve-tree-node>
        <nve-tree-node>node 2-2</nve-tree-node>
        <nve-tree-node>node 2-3</nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 3
        <nve-tree-node>node 3-1</nve-tree-node>
        <nve-tree-node>node 3-2</nve-tree-node>
        <nve-tree-node>
          node 3-3
          <nve-tree-node>node 3-3-1</nve-tree-node>
          <nve-tree-node>node 3-3-2</nve-tree-node>
          <nve-tree-node>node 3-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
    </nve-tree>
  `
};

export const Selectable = {
  render: () => html`
    <nve-tree selectable="single" behavior-expand behavior-select border>
      <nve-tree-node expanded>
        node 1
        <nve-tree-node selected>node 1-1</nve-tree-node>
        <nve-tree-node>node 1-2</nve-tree-node>
        <nve-tree-node>
          node 1-3
          <nve-tree-node>node 1-3-1</nve-tree-node>
          <nve-tree-node>node 1-3-2</nve-tree-node>
          <nve-tree-node>node 1-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 2
        <nve-tree-node>node 2-1</nve-tree-node>
        <nve-tree-node>node 2-2</nve-tree-node>
        <nve-tree-node>node 2-3</nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 3
        <nve-tree-node>node 3-1</nve-tree-node>
        <nve-tree-node>node 3-2</nve-tree-node>
        <nve-tree-node>
          node 3-3
          <nve-tree-node>node 3-3-1</nve-tree-node>
          <nve-tree-node>node 3-3-2</nve-tree-node>
          <nve-tree-node>node 3-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
    </nve-tree>
  `
};

export const SelectableMultiple = {
  render: () => html`
    <nve-tree selectable="multi" behavior-expand behavior-select border>
      <nve-tree-node expanded>
        node 1
        <nve-tree-node>node 1-1</nve-tree-node>
        <nve-tree-node selected>node 1-2</nve-tree-node>
        <nve-tree-node expanded>
          node 1-3
          <nve-tree-node>node 1-3-1</nve-tree-node>
          <nve-tree-node>node 1-3-2</nve-tree-node>
          <nve-tree-node>node 1-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 2
        <nve-tree-node>node 2-1</nve-tree-node>
        <nve-tree-node>node 2-2</nve-tree-node>
        <nve-tree-node>node 2-3</nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 3
        <nve-tree-node>node 3-1</nve-tree-node>
        <nve-tree-node>node 3-2</nve-tree-node>
        <nve-tree-node>
          node 3-3
          <nve-tree-node>node 3-3-1</nve-tree-node>
          <nve-tree-node>node 3-3-2</nve-tree-node>
          <nve-tree-node>node 3-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
    </nve-tree>
  `
};

export const Highlight = {
  render: () => html`
    <nve-tree behavior-expand border>
      <nve-tree-node expanded>
        node 1
        <nve-tree-node highlighted>node 1-1</nve-tree-node>
        <nve-tree-node>node 1-2</nve-tree-node>
        <nve-tree-node expanded>
          node 1-3
          <nve-tree-node highlighted>node 1-3-1</nve-tree-node>
          <nve-tree-node highlighted>node 1-3-2</nve-tree-node>
          <nve-tree-node>node 1-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 2
        <nve-tree-node>node 2-1</nve-tree-node>
        <nve-tree-node>node 2-2</nve-tree-node>
        <nve-tree-node>node 2-3</nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 3
        <nve-tree-node>node 3-1</nve-tree-node>
        <nve-tree-node>node 3-2</nve-tree-node>
        <nve-tree-node>
          node 3-3
          <nve-tree-node>node 3-3-1</nve-tree-node>
          <nve-tree-node>node 3-3-2</nve-tree-node>
          <nve-tree-node>node 3-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
    </nve-tree>
  `
};

export const Links = {
  render: () => html`
    <nve-tree behavior-expand>
      <nve-tree-node><a href="#">Documentation</a></nve-tree-node>
      <nve-tree-node><a href="#">Support</a></nve-tree-node>
      <nve-tree-node expanded>
        Elements
        <nve-tree-node><a href="#">Alert</a></nve-tree-node>
        <nve-tree-node><a href="#">Badge</a></nve-tree-node>
        <nve-tree-node><a href="#">Dialog</a></nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        Frameworks
        <nve-tree-node><a href="#">Angular</a></nve-tree-node>
        <nve-tree-node><a href="#">React</a></nve-tree-node>
        <nve-tree-node><a href="#">Vue</a></nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        Languages
        <nve-tree-node><a href="#">JavaScript</a></nve-tree-node>
        <nve-tree-node><a href="#">HTML</a></nve-tree-node>
        <nve-tree-node><a href="#">CSS</a></nve-tree-node>
      </nve-tree-node>
    </nve-tree>
  `
};

export const Async = {
  render: () => html`
    <nve-tree border>
      <nve-tree-node expanded>
        node 1
        <nve-tree-node>node 1-1</nve-tree-node>
        <nve-tree-node>node 1-2</nve-tree-node>
        <nve-tree-node expanded>
          node 1-3
          <nve-tree-node>
            <div nve-layout="row gap:xs">
              <nve-progress-ring status="accent" size="xs"></nve-progress-ring> loading
            </div>
          </nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 2
        <nve-tree-node>node 2-1</nve-tree-node>
        <nve-tree-node>node 2-2</nve-tree-node>
        <nve-tree-node>node 2-3</nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 3
        <nve-tree-node>node 3-1</nve-tree-node>
        <nve-tree-node>node 3-2</nve-tree-node>
        <nve-tree-node>
          node 3-3
          <nve-tree-node>node 3-3-1</nve-tree-node>
          <nve-tree-node>node 3-3-2</nve-tree-node>
          <nve-tree-node>node 3-3-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
    </nve-tree>
  `
};

export const NodeContent = {
  render: () => html`
    <nve-tree selectable="multi" border behavior-expand behavior-select>
      <nve-tree-node expanded>
        text content
        <nve-tree-node>
          <a href="#" nve-text="link">node link</a>
        </nve-tree-node>
        <nve-tree-node>
          long form content
          <div slot="content" nve-layout="column gap:sm">
            <a href="#" nve-text="link">This is some longer content in a tree node.</a>
            <a href="#" nve-text="link">This is some longer content in a tree node.</a>
            <a href="#" nve-text="link">This is some longer content in a tree node.</a>
          </div>
        </nve-tree-node>
        <nve-tree-node>
          interactive content
          <div slot="content" nve-layout="column gap:sm">
            <p nve-text="body sm">This is some longer content in a tree node.</p>
            <nve-button>hello there</nve-button>
          </div>
        </nve-tree-node>
        <nve-tree-node>
          input control
          <div slot="content" nve-layout="column gap:sm">
            <nve-input>
              <label>label</label>
              <input type="text" />
            </nve-input>
            <nve-input>
              <label>label</label>
              <input type="text" />
            </nve-input>
          </div>
        </nve-tree-node>
        <nve-tree-node>
          node content checkbox group
          <nve-checkbox-group slot="content">
            <label>label</label>
            <nve-checkbox>
              <label>checkbox 1</label>
              <input type="checkbox" checked />
            </nve-checkbox>

            <nve-checkbox>
              <label>checkbox 2</label>
              <input type="checkbox" />
            </nve-checkbox>

            <nve-checkbox>
              <label>checkbox 3</label>
              <input type="checkbox" />
            </nve-checkbox>
          </nve-checkbox-group>
        </nve-tree-node>
        <nve-tree-node>
          node content radio group
          <nve-radio-group slot="content">
            <label>label</label>
            <nve-radio>
              <label>radio 1</label>
              <input type="radio" checked />
            </nve-radio>

            <nve-radio>
              <label>radio 2</label>
              <input type="radio" />
            </nve-radio>

            <nve-radio>
              <label>radio 3</label>
              <input type="radio" />
            </nve-radio>
          </nve-radio-group>
        </nve-tree-node>
      </nve-tree-node>
    </nve-tree>
  `
};

export const DynamicTree = {
  render: () => html`<test-dynamic-tree></test-dynamic-tree>`
};

export const VerticalNav = {
  render: () => html`
  <nve-drawer inline size="sm" position="left">
    <nve-drawer-header>
      <h3 nve-text="heading">Navigation</h3>
    </nve-drawer-header>
    <nve-drawer-content>
      <nve-tree behavior-expand>
        <nve-tree-node><a href="#">Documentation</a></nve-tree-node>
        <nve-tree-node><a href="#">Support</a></nve-tree-node>
        <nve-tree-node expanded>
          Elements
          <nve-tree-node><a href="#">Alert</a></nve-tree-node>
          <nve-tree-node><a href="#">Badge</a></nve-tree-node>
          <nve-tree-node><a href="#">Dialog</a></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          Frameworks
          <nve-tree-node><a href="#">Angular</a></nve-tree-node>
          <nve-tree-node><a href="#">React</a></nve-tree-node>
          <nve-tree-node><a href="#">Vue</a></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          Languages
          <nve-tree-node><a href="#">JavaScript</a></nve-tree-node>
          <nve-tree-node><a href="#">HTML</a></nve-tree-node>
          <nve-tree-node><a href="#">CSS</a></nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    </nve-drawer-content>
  </nve-drawer>
  `
};

export const Overflow = {
  render: () => html`
    <div style="width: 300px; height: 500px; overflow: auto; outline: 1px solid #ccc; padding: 12px">
      <nve-tree border behavior-expand>
        <nve-tree-node expanded>
          node 1
          <nve-tree-node>node 1-1</nve-tree-node>
          <nve-tree-node>node 1-2</nve-tree-node>
          <nve-tree-node expanded>
            node 1-3
            <nve-tree-node>node 1-3-1</nve-tree-node>
            <nve-tree-node>node 1-3-2</nve-tree-node>
            <nve-tree-node expanded>
              node 1-3-3
              <nve-tree-node>node 1-3-3-1</nve-tree-node>
              <nve-tree-node>node 1-3-3-2</nve-tree-node>
              <nve-tree-node expanded>
                node 1-3-3-3
                <nve-tree-node>node 1-3-3-3-1</nve-tree-node>
                <nve-tree-node>node 1-3-3-3-2</nve-tree-node>
                <nve-tree-node expanded>
                  node 1-3-3-3-3
                  <nve-tree-node>node 1-3-3-3-3-1</nve-tree-node>
                  <nve-tree-node>node 1-3-3-3-3-2</nve-tree-node>
                  <nve-tree-node expanded>
                    node 1-3-3-3-3-3
                    <nve-tree-node>node 1-3-3-3-3-3-1</nve-tree-node>
                    <nve-tree-node>node 1-3-3-3-3-3-2</nve-tree-node>
                    <nve-tree-node expanded>
                      node 1-3-3-3-3-3-3
                      <nve-tree-node>node 1-3-3-3-3-3-3-1</nve-tree-node>
                      <nve-tree-node>node 1-3-3-3-3-3-3-2</nve-tree-node>
                      <nve-tree-node expanded>
                        node 1-3-3-3-3-3-3-3
                        <nve-tree-node>node 1-3-3-3-3-3-3-3-1</nve-tree-node>
                        <nve-tree-node>node 1-3-3-3-3-3-3-3-2</nve-tree-node>
                        <nve-tree-node expanded>
                          node 1-3-3-3-3-3-3-3-3
                          <nve-tree-node>node 1-3-3-3-3-3-3-3-3-1</nve-tree-node>
                          <nve-tree-node>node 1-3-3-3-3-3-3-3-3-2</nve-tree-node>
                          <nve-tree-node>node 1-3-3-3-3-3-3-3-3-3</nve-tree-node>
                        </nve-tree-node>
                      </nve-tree-node>
                    </nve-tree-node>
                  </nve-tree-node>
                </nve-tree-node>
              </nve-tree-node>
            </nve-tree-node>
          </nve-tree-node>
        </nve-tree-node>
        <nve-tree-node expanded>
          node 2
          <nve-tree-node>node 2-1</nve-tree-node>
          <nve-tree-node>node 2-2</nve-tree-node>
          <nve-tree-node>node 2-3</nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    </div>
  `
};

export const BulkCreation = {
  render: () => html`
    <nve-tree>
      <nve-tree-node id="root" expandable>Test</nve-tree-node>
    </nve-tree>
    <script type="module">
    const rootEl = document.querySelector('nve-tree-node#root');

    rootEl.addEventListener('open', () => {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 400; i++) {
        rootEl.expanded = true;
        const childEl = document.createElement('nve-tree-node');
        childEl.innerText = 'Child ' + i;
        fragment.append(childEl);
      }
      rootEl.append(fragment);
    });

    rootEl.addEventListener('close', () => {
      rootEl.expanded = false;
      rootEl.replaceChildren(document.createTextNode('Test'));
    });
  </script>
  `
};

/**
 * @description Examples of invalid tree usage patterns for testing and documentation purposes, showing what not to do when implementing trees.
 * @tags anti-pattern
 */
export const Audit = {
  render: () => html`
    <div>
      <nve-tree-node>node</nve-tree-node>
    </div>
  `
};

export class TestDynamicTree extends LitElement {
  @state() nodes = createTree();

  render() {
    return html`
    <p>total nodes: 10,000</p>
    <nve-tree border expandable>
      ${this.nodes.map(node => this.#getNodeList(node))}
    </nve-tree>`;
  }

  #getNodeList(node) {
    return html`<nve-tree-node .expandable=${node.nodes.length} .expanded=${node.expanded} @open=${e => this.#open(e, node)} @close=${e => this.#close(e, node)}>
      ${node.label} node
      ${node.expanded ? node.nodes.map(n => html`${this.#getNodeList(n)}`) : nothing}
    </nve-tree-node>`
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
      })
    })
    return i;
  });
}

function createNodeList(nodes: number) {
  return new Array(nodes).fill('').map((_, i) => ({ label: `${i}`, expanded: false, nodes: [] }));
}

customElements.get('test-dynamic-tree') ?? customElements.define('test-dynamic-tree', TestDynamicTree);