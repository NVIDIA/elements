class Client {
  #nextId = 0;
  #handlers = new Map();
  #lastReportedWidth = -1;
  #lastReportedHeight = -1;
  #expectedParentOrigin;

  constructor(info) {
    this.name = info.name;
    this.version = info.version;
  }

  connect() {
    window.addEventListener('message', e => {
      const expectedOrigin = this.#getExpectedParentOrigin();
      if (!expectedOrigin || e.origin !== expectedOrigin || e.source !== window.parent) return;
      const m = e.data;
      if (!m || m.jsonrpc !== '2.0') return;
      if (m.id !== undefined && this.#handlers.has(m.id)) {
        const { resolve, reject } = this.#handlers.get(m.id);
        this.#handlers.delete(m.id);
        if (m.error) reject(new Error(m.error.message || 'rpc error'));
        else resolve(m.result);
        return;
      }
      if (m.method === 'ui/notifications/tool-input' && this.ontoolinput) this.ontoolinput(m.params || {});
      if (m.method === 'ui/notifications/tool-result' && this.ontoolresult) this.ontoolresult(m.params || {});
    });
    this.#send({
      jsonrpc: '2.0',
      id: ++this.#nextId,
      method: 'ui/initialize',
      params: { name: this.name, version: this.version }
    });
    this.#send({ jsonrpc: '2.0', method: 'ui/notifications/initialized' });

    this.#observePreferredTheme();
    setTimeout(async () => {
      await awaitElementUpgrades();
      this.#observeUiSize();
    }, 0);
  }

  callServerTool(args) {
    return new Promise((resolve, reject) => {
      const id = ++this.#nextId;
      this.#handlers.set(id, { resolve, reject });
      this.#send({ jsonrpc: '2.0', id, method: 'tools/call', params: args });
    });
  }

  #send(msg) {
    const expectedOrigin = this.#getExpectedParentOrigin();
    if (!expectedOrigin) return;
    window.parent.postMessage(msg, expectedOrigin);
  }

  #getExpectedParentOrigin() {
    if (this.#expectedParentOrigin !== undefined) return this.#expectedParentOrigin;
    const origin = window.location.ancestorOrigins?.[0] || (document.referrer ? new URL(document.referrer).origin : '');
    this.#expectedParentOrigin = this.#isAllowedParentOrigin(origin) ? origin : '';
    return this.#expectedParentOrigin;
  }

  #isAllowedParentOrigin(origin) {
    return typeof origin === 'string' && origin !== '' && origin !== 'null';
  }

  #observePreferredTheme() {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = matches => {
      document.documentElement.setAttribute('nve-theme', matches ? 'dark' : 'light');
    };
    apply(darkQuery.matches);
    darkQuery.addEventListener('change', e => apply(e.matches));
    return darkQuery;
  }

  #observeUiSize() {
    const sizeObserver = new ResizeObserver(() => this.#reportUiSize());
    sizeObserver.observe(document.body);
    this.#reportUiSize();
    return sizeObserver;
  }

  #reportUiSize() {
    const SIZE_CHANGE_THRESHOLD = 1;
    const width = Math.ceil(document.body.scrollWidth);
    const measuredHeight = Math.ceil(document.body.scrollHeight);
    const resolvedMinHeight = hasNvePage() ? 580 : 200;
    const height = Math.max(resolvedMinHeight, measuredHeight);

    const widthDelta = Math.abs(width - this.#lastReportedWidth);
    const heightDelta = Math.abs(height - this.#lastReportedHeight);
    if (widthDelta <= SIZE_CHANGE_THRESHOLD && heightDelta <= SIZE_CHANGE_THRESHOLD) return;

    this.#lastReportedWidth = width;
    this.#lastReportedHeight = height;
    this.#send({ jsonrpc: '2.0', method: 'ui/notifications/size-changed', params: { width, height } });
  }
}

function hasNvePage(root = document.body) {
  if (root.querySelector('nve-page')) return true;
  return Array.from(root.querySelectorAll('*')).some(el => el.shadowRoot && hasNvePage(el.shadowRoot));
}

async function awaitElementUpgrades(root = document.body) {
  const tags = new Set();
  root.querySelectorAll('*').forEach(el => {
    const tag = el.tagName.toLowerCase();
    if (tag.includes('-')) tags.add(tag);
  });
  await Promise.all(Array.from(tags).map(tag => customElements.whenDefined(tag).catch(() => {})));
}
