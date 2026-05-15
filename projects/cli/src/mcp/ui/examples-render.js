// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

class ElementsExamplePreview extends HTMLElement {
  constructor() {
    super();
    this.state = { template: '', errorMessage: '', validationMessages: [] };
  }

  get template() {
    return this.state.template;
  }

  set template(value) {
    this.state.template = typeof value === 'string' ? value : '';
    this.state.errorMessage = '';
    this.state.validationMessages = [];
    this.#render();
  }

  set errorMessage(value) {
    this.state.errorMessage = typeof value === 'string' ? value : 'Failed to load example.';
    this.state.validationMessages = [];
    this.#render();
  }

  set validationMessages(value) {
    this.state.validationMessages = Array.isArray(value) ? value : [];
    this.state.errorMessage = '';
    this.#render();
  }

  #render() {
    this.replaceChildren();
    if (this.state.errorMessage) {
      this.append(this.#createMessage(this.state.errorMessage));
      return;
    }
    if (this.state.validationMessages.length) {
      this.append(this.#createValidationMessages(this.state.validationMessages));
      return;
    }
    const fragment = document
      .createRange()
      .createContextualFragment(this.state.template || '<pre>Example not found.</pre>');
    this.append(fragment);
  }

  #createMessage(message) {
    const paragraph = document.createElement('pre');
    paragraph.textContent = message;
    return paragraph;
  }

  #createValidationMessages(messages) {
    const pre = document.createElement('pre');
    pre.textContent = messages
      .map(message => {
        const location = message.line && message.column ? ' (' + message.line + ':' + message.column + ')' : '';
        return message.severity + ': ' + message.message + location;
      })
      .join('\n');
    return pre;
  }
}

customElements.define('nve-mcp-examples-render', ElementsExamplePreview);

const client = new Client({ name: 'Elements Example Preview', version: '1.0.0' });

const preview = document.createElement('nve-mcp-examples-render');
let pendingId = null;
let pendingTemplate = null;

function setPendingExample({ arguments: args } = {}) {
  pendingId = null;
  pendingTemplate = null;
  if (args && typeof args.template === 'string') {
    pendingTemplate = args.template;
  } else if (args && typeof args.id === 'string') {
    pendingId = args.id;
  }
}

function getStructuredResult(payload) {
  const content = getStructuredContent(payload);
  return content && content.result !== undefined ? content.result : content;
}

function getStructuredContent(payload) {
  if (!payload) return undefined;
  if (payload.structuredContent) return payload.structuredContent;
  if (payload.result && payload.result.structuredContent) return payload.result.structuredContent;
  if (payload.result !== undefined) return payload.result;
  return undefined;
}

function getToolErrorMessage(payload) {
  const content = getStructuredContent(payload);
  return content && content.status === 'error' && typeof content.message === 'string' ? content.message : '';
}

function getExampleTemplate(payload) {
  const example = getStructuredResult(payload);
  return example && typeof example.template === 'string' ? example.template : '';
}

function getRenderResult(payload) {
  const result = getStructuredResult(payload);
  if (!result || typeof result.template !== 'string' || !Array.isArray(result.lintMessages)) return undefined;
  return result;
}

async function renderPendingExample(params) {
  const renderResult = getRenderResult(params);
  if (renderResult) {
    if (renderResult.lintMessages.length) {
      preview.validationMessages = renderResult.lintMessages;
      return;
    }
    preview.template = renderResult.template;
    return;
  }
  const errorMessage = getToolErrorMessage(params);
  if (errorMessage) {
    preview.errorMessage = errorMessage;
    return;
  }
  if (typeof pendingTemplate === 'string') {
    preview.errorMessage = 'Failed to validate template.';
    return;
  }
  if (!pendingId) return;
  try {
    const res = await client.callServerTool({
      name: 'examples_get',
      arguments: { id: pendingId, format: 'json' }
    });
    const exampleErrorMessage = getToolErrorMessage(res);
    if (exampleErrorMessage) {
      preview.errorMessage = exampleErrorMessage;
      return;
    }
    preview.template = getExampleTemplate(res);
  } catch (err) {
    preview.errorMessage = 'Failed to load example: ' + (err && err.message ? err.message : 'unknown error');
  }
}

client.ontoolinput = params => {
  setPendingExample(params);
};

client.ontoolresult = params => {
  void renderPendingExample(params);
};

client.connect();
document.body.replaceChildren(preview);
