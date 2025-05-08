import markdownIt from 'markdown-it';

const markdown = markdownIt({
  html: true,
  breaks: false,
  linkify: true,
  highlight: function (str, lang) {
    lang = lang === 'javascript' ? 'typescript' : lang; // alias javascript to typescript
    return /* html */ `<nve-codeblock language="${lang}" style="--padding: var(--nve-ref-space-lg)"><template>${markdown.utils.escapeHtml(str)}</template></nve-codeblock>`;
  }
});

const formats = {
  h1: 'display emphasis',
  h2: 'heading xl',
  h3: 'heading lg',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading sm',
  p: 'body relaxed',
  a: 'link',
  code: 'code'
};

function renderer(tokens, idx, options, env, slf) {
  if (
    tokens[idx].type === 'heading_open' ||
    tokens[idx].type === 'link_open' ||
    tokens[idx].type === 'paragraph_open' ||
    tokens[idx].type === 'code_inline'
  ) {
    tokens[idx].attrSet('nve-text', `${formats[tokens[idx].tag]} mkd`);
  }

  if (tokens[idx].type === 'bullet_list_open' || tokens[idx].type === 'ordered_list_open') {
    tokens[idx].attrSet('nve-text', 'list mkd');
    tokens[idx].attrSet('nve-layout', 'column gap:xs');
  }

  // add heading to search index metadata
  if (tokens[idx].type === 'heading_open') {
    tokens[idx].attrSet('data-pagefind-meta', `${tokens[idx].tag}_${idx}`);
  }

  return slf.renderToken(tokens, idx, options, env, slf);
}

markdown.renderer.rules.heading_open = renderer;
markdown.renderer.rules.link_open = renderer;
markdown.renderer.rules.paragraph_open = renderer;
markdown.renderer.rules.bullet_list_open = renderer;
markdown.renderer.rules.ordered_list_open = renderer;
// markdown.renderer.rules.code_inline = renderer; /* TODO: fix code inline renderer */

export default markdown;
