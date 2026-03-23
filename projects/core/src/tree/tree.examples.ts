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

/**
 * @summary Basic tree component with expandable nodes, providing hierarchical data display and navigation for structured content organization.
 */
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

/**
 * @summary Tree with border styling for enhanced visual separation and container definition, improving content structure perception.
 */
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

/**
 * @summary Single-selection tree for choosing one item from hierarchical options, enabling focused navigation and content selection.
 */
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

/**
 * @summary Multi-selection tree for choosing many items from hierarchical options, enabling bulk operations and comprehensive content management.
 */
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

/**
 * @summary Interactive selection handling using the select event, with callbacks for node selection changes.
 * @tags test-case
 */
export const SelectEvent = {
  render: () => html`
    <div nve-layout="column gap:md">
      <div nve-layout="row gap:md">
        <nve-tree id="select-event-tree" selectable="single" behavior-expand behavior-select border>
          <nve-tree-node expanded>
            Documents
            <nve-tree-node>Annual Report.pdf</nve-tree-node>
            <nve-tree-node>Budget.xlsx</nve-tree-node>
            <nve-tree-node expanded>
              Projects
              <nve-tree-node>Project Alpha</nve-tree-node>
              <nve-tree-node>Project Beta</nve-tree-node>
              <nve-tree-node>Project Gamma</nve-tree-node>
            </nve-tree-node>
          </nve-tree-node>
          <nve-tree-node>
            Images
            <nve-tree-node>photo-001.jpg</nve-tree-node>
            <nve-tree-node>photo-002.jpg</nve-tree-node>
            <nve-tree-node>screenshot.png</nve-tree-node>
          </nve-tree-node>
        </nve-tree>
        <div nve-layout="column gap:sm">
          <p nve-text="body sm"><strong>Selected:</strong> <span id="selected-node">None</span></p>
          <p nve-text="body sm"><strong>History:</strong></p>
          <ul id="selection-history" nve-text="body sm">
            <li>No selections yet</li>
          </ul>
        </div>
      </div>
    </div>
    <script type="module">
      const tree = document.querySelector('#select-event-tree');
      const selectedDisplay = document.querySelector('#selected-node');
      const historyList = document.querySelector('#selection-history');
      const history = [];
      tree.addEventListener('select', (e) => {
        const node = e.detail;
        const nodeText = node.textContent?.trim().split('\\n')[0] ?? 'Unknown';
        selectedDisplay.textContent = nodeText;
        history.push(nodeText);
        if (history.length > 5) history.shift();
        historyList.innerHTML = history.map(item => '<li>' + item + '</li>').join('');
      });
    </script>
  `
};

/**
 * @summary Tree with highlighted nodes for emphasizing specific items, providing visual focus and search result signal in hierarchical data.
 */
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

/**
 * @summary Tree with navigation links for hierarchical menu systems, enabling structured site navigation and content discovery.
 */
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

/**
 * @summary Tree with loading states for asynchronous data, including progress indicators and dynamic content loading in hierarchical structures.
 */
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

/**
 * @summary Tree with rich node content including forms, controls, and interactive elements, enabling complex data management within hierarchical structures.
 */
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

/**
 * @summary Dynamic tree with programmatic node creation and management, for scalable hierarchical data handling with large datasets.
 * @tags test-case
 */
export const DynamicTree = {
  render: () => html`<test-dynamic-tree></test-dynamic-tree>`
};

/* eslint-disable @nvidia-elements/lint/no-missing-popover-trigger */

/**
 * @summary Tree integrated in vertical navigation drawer, providing structured sidebar navigation for application layouts and content organization.
 */
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

/**
 * @summary Tree with scrollable container for handling deep hierarchies and large datasets, ensuring optimal space usage and navigation.
 * @tags test-case
 */
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

/**
 * @summary Tree with bulk node creation for performance testing, verifying efficient handling of large numbers of nodes and dynamic expansion.
 * @tags test-case performance
 */
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
 * @summary Examples of invalid tree usage patterns for testing and documentation purposes, showing what not to do when implementing trees.
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
    <p nve-text="body">total nodes: 10,000</p>
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

customElements.get('test-dynamic-tree') || customElements.define('test-dynamic-tree', TestDynamicTree);