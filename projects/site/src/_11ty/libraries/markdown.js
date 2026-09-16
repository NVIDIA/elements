import markdownIt from 'markdown-it';
import markdownItLink from 'markdown-it-link-attributes';

const LANGUAGE_NAMES = {
  bash: 'Shell',
  css: 'CSS',
  go: 'Go',
  html: 'HTML',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  markdown: 'Markdown',
  md: 'Markdown',
  python: 'Python',
  shell: 'Shell',
  sh: 'Shell',
  toml: 'TOML',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  typescript: 'TypeScript',
  xml: 'XML',
  yaml: 'YAML',
  yml: 'YAML',
  zsh: 'Shell'
};

const markdown = markdownIt({
  html: true,
  breaks: false,
  linkify: true,
  highlight: function (str, lang) {
    const structuredData = getCodeStructuredData(str, lang);
    const codeblockLanguage = markdown.utils.escapeHtml(lang === 'javascript' ? 'typescript' : lang); // alias javascript to typescript
    return /* html */ `
    <div class="markdown-codeblock">
      <script type="application/ld+json">${jsonLdEncode(structuredData)}</script>
      <nve-codeblock language="${codeblockLanguage}"><pre aria-hidden="true"><code>${markdown.utils.escapeHtml(str).trim()}</code></pre></nve-codeblock>
      <nve-copy-button class="markdown-copy-button" role="button" aria-label="copy" behavior-copy container="flat"></nve-copy-button>
    </div>
    <script type="module">
      document.querySelectorAll('.markdown-copy-button').forEach(button => {
        const codeblock = button.previousElementSibling;
        button.value = codeblock.querySelector('pre code').textContent.trim();
      });
    </script>`;
  }
});

function getCodeStructuredData(code, language) {
  const languageName = language ? (LANGUAGE_NAMES[language.toLowerCase()] ?? language) : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    ...(languageName
      ? {
          programmingLanguage: {
            '@type': 'ComputerLanguage',
            name: languageName
          }
        }
      : {}),
    codeSampleType: 'code snippet',
    encodingFormat: 'text/plain',
    text: code
  };
}

function jsonLdEncode(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

markdown.renderer.rules.fence = function (tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const info = token.info ? markdown.utils.unescapeAll(token.info).trim() : '';
  let langName = '';
  let highlighted;

  if (info) {
    langName = info.split(/\s+/g)[0];
  }

  if (options.highlight) {
    highlighted = options.highlight(token.content, langName) || markdown.utils.escapeHtml(token.content);
  } else {
    highlighted = markdown.utils.escapeHtml(token.content);
  }

  return highlighted + '\n';
};

const formats = {
  h1: 'display emphasis semibold',
  h2: 'heading xl emphasis',
  h3: 'heading lg emphasis',
  h4: 'heading',
  h5: 'heading sm',
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

  return slf.renderToken(tokens, idx, options, env, slf);
}

markdown.renderer.rules.heading_open = renderer;
markdown.renderer.rules.link_open = renderer;
markdown.renderer.rules.paragraph_open = renderer;
markdown.renderer.rules.bullet_list_open = renderer;
markdown.renderer.rules.ordered_list_open = renderer;
// markdown.renderer.rules.code_inline = renderer; /* TODO: fix code inline renderer */

markdown.use(markdownItLink, {
  matcher(href) {
    return href.match(/^https?:\/\//) && !href.includes('www.w3.org/2000/svg');
  },
  attrs: {
    target: '_blank',
    rel: 'noopener'
  }
});

export default markdown;
