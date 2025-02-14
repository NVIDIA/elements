import markdownIt from 'markdown-it';

const markdown = markdownIt({
  html: true,
  breaks: true,
  linkify: true,
  // highlight: function (/*str, lang*/) { return ''; }
  highlight: function (str, lang) {
    return /* html */ `<nve-codeblock language="${lang}" style="--padding: var(--nve-ref-space-lg)">${markdown.utils.escapeHtml(str)}</nve-codeblock>`;
  }
});

const formats = {
  h1: 'display',
  h2: 'heading xl',
  h3: 'heading lg',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading sm',
  p: 'body',
  a: 'link'
};

function renderer(tokens, idx, options, env, slf) {
  if (
    tokens[idx].type === 'heading_open' ||
    tokens[idx].type === 'link_open' ||
    tokens[idx].type === 'paragraph_open'
  ) {
    tokens[idx].attrSet('nve-text', `${formats[tokens[idx].tag]} mkd`);
  }

  if (tokens[idx].type === 'bullet_list_open') {
    tokens[idx].attrSet('nve-text', 'list mkd');
    tokens[idx].attrSet('nve-layout', 'column gap:xs');
  }

  return slf.renderToken(tokens, idx, options, env, slf);
}

markdown.renderer.rules.heading_open = renderer;
markdown.renderer.rules.link_open = renderer;
markdown.renderer.rules.paragraph_open = renderer;
markdown.renderer.rules.bullet_list_open = renderer;

export default markdown;
