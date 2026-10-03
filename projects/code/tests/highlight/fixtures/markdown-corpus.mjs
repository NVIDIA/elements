// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const markdownLanguages = [
  'bash',
  'css',
  'go',
  'html',
  'javascript',
  'json',
  'markdown',
  'python',
  'shell',
  'toml',
  'tsx',
  'typescript',
  'xml',
  'yaml'
];

export const markdownCases = [
  {
    name: 'Markdown frontmatter and inline syntax',
    language: 'markdown',
    text: '---\ntitle: "GPU"\nenabled: true\n---\n# Heading `code`\n\nPlain **strong** and *emphasis* with [outer [inner]](https://example.test/a(b)c "title").\n![image][asset] and <https://example.test> and <user@example.test>.\n[asset]: /image.png "image title"\nEscaped \\* and `const x = 42` and ~~strike~~.\n\n---\nLater prose'
  },
  {
    name: 'Markdown quotes lists and tables',
    language: 'markdown',
    text: '> quoted `code`\n> - item [label](url)\n>   continuation\n>\n> ```json\n> {"count":42}\n> ```\n\nafter quote\n\n1. numbered item\n   continuation `raw`\n\n- unnumbered item\n  child\n\n| Name | Value |\n| :--- | ---: |\n| [GPU](url) | `42` |\n\nAfter table'
  },
  {
    name: 'Markdown HTML blocks and embedded regions',
    language: 'markdown',
    text: '<script>\nconst value = 42;\n\n// comment\nconst broken = "unfinished\n</script>\n\nafter script\n\n<style>\n.item { color: red; }\n\n/* comment */\n</style>\n\n<pre>\nplain &amp; text\n\n</pre>\n\n<!-- comment\n\ncontinued -->\n\n<div class="card">text</div>\n\nInline <em>text</em> and `raw`.'
  },
  {
    name: 'Markdown fence widths and nested Markdown',
    language: 'markdown',
    text: '````markdown\n## nested heading\n```json\n{"count":42}\n```\n``````\n\n~~~mystery\nconst plain = 42;\n```\n~~~~\n\nafter fences'
  },
  {
    name: 'Markdown supported embedded language set',
    language: 'markdown',
    text: [
      ['bash', 'echo "$USER"'],
      ['css', '.item { color: red; }'],
      ['go', 'func read() int { return 42 }'],
      ['html', '<div class="card">text</div>'],
      ['javascript', 'const value = `x${42}`;'],
      ['json', '{"count":42}'],
      ['python', 'def read():\n    return 42'],
      ['shell', '$ echo "$USER"\noutput'],
      ['toml', 'enabled = true'],
      ['tsx', 'const view = <Widget enabled={true}><span>{42}</span></Widget>;'],
      ['typescript', 'const value: number = 42;'],
      ['xml', '<node key="value" />'],
      ['yaml', 'enabled: true']
    ]
      .map(([language, text]) => `\x60\x60\x60${language}\n${text}\n\x60\x60\x60`)
      .join('\n\n')
  }
];
