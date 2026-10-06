import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseFragment } from 'parse5';
import { examplesToJSON } from './examples.js';

const textarea =
  '<textarea aria-label="Message">\n\n  first line\n\n    indented line\n\n# heading\n- list\n```typescript\n  const answer = 42;\n```\n**bold** &amp; &lt;tag&gt; &#10;\n<!--lit-part authored--> =""\n\n</textarea>';

test('preserves authored textarea contents in generated and cached metadata while formatting surrounding markup and ordinary examples', async () => {
  const directory = await mkdtemp(path.join(process.cwd(), '.examples-test-'));
  try {
    await mkdir(path.join(directory, 'src'));
    const id = path.join(directory, 'src/textarea.examples.ts');
    await writeFile(
      id,
      `import { html } from 'lit';\nconst Default = html\`<div data-kind = "ordinary"><span>ordinary</span>${textarea.replaceAll('`', '\\`')}<textarea name="blank">\n\n</textarea><textarea name="inline">  inline&amp;lt;\n\n</textarea></div>\`;\nconst Ordinary = html\`<div data-kind = "ordinary"><span>ordinary</span></div>\`;\nexport default { component: 'nve-textarea', Default };`
    );
    const plugin = examplesToJSON({ name: '@nvidia-elements/test' });
    for (let attempt = 0; attempt < 2; attempt++) {
      assert.ok(await plugin.transform('', id));
      const json = JSON.parse(await readFile(path.join(directory, 'dist/textarea.examples.json'), 'utf8'));
      const generatedValue = json.items[0].template.match(/<textarea[^>]*>([\s\S]*?)<\/textarea\s*>/i)?.[1];
      assert.equal(generatedValue, textarea.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/i)?.[1]);
      assert.match(json.items[0].template, /<div data-kind="ordinary">/);
      assert.match(json.items[1].template, /<div data-kind="ordinary">/);
      const div = parseFragment(json.items[0].template).childNodes[0];
      const textareaNodes = div.childNodes.filter(node => node.tagName === 'textarea');
      assert.deepEqual(
        textareaNodes.slice(1).map(node => node.childNodes[0]?.value ?? ''),
        ['\n', '  inline&lt;\n\n']
      );
      const textareaNode = textareaNodes[0];
      assert.equal(
        textareaNode.childNodes[0].value,
        '\n  first line\n\n    indented line\n\n# heading\n- list\n```typescript\n  const answer = 42;\n```\n**bold** & <tag> \n\n<!--lit-part authored--> =""\n\n'
      );
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('preserves template source and adjacent textarea values while formatting their tags and surrounding markup', async () => {
  const directory = await mkdtemp(path.join(process.cwd(), '.examples-test-'));
  const template =
    '<template id = "source"><span data-value="">\n\n  &amp; <!-- split layout --> authored code\n\n</span><textarea>\n\n</textarea></template>';
  const input = `<div data-kind = "ordinary"><!-- prettier-ignore --><span>ignored</span>${textarea}${template}<textarea name = "last">  last\n\n</textarea></div>`;
  try {
    await mkdir(path.join(directory, 'src'));
    const id = path.join(directory, 'src/template.examples.ts');
    await writeFile(
      id,
      `import { html } from 'lit';\nconst Default = html\`${input.replaceAll('`', '\\`')}\`;\nexport default { component: 'nve-codeblock', Default };`
    );
    assert.ok(await examplesToJSON({ name: '@nvidia-elements/test' }).transform('', id));
    const json = JSON.parse(await readFile(path.join(directory, 'dist/template.examples.json'), 'utf8'));
    assert.equal(
      json.items[0].template.match(/<template[^>]*>([\s\S]*?)<\/template\s*>/i)?.[1],
      template.match(/<template[^>]*>([\s\S]*?)<\/template>/i)?.[1]
    );
    assert.match(json.items[0].template, /<div data-kind="ordinary">/);
    assert.match(json.items[0].template, /<template id="source"\s*>/);
    assert.match(json.items[0].template, /<textarea name="last"\s*>/);
    assert.deepEqual(
      [...json.items[0].template.matchAll(/<textarea[^>]*>([\s\S]*?)<\/textarea\s*>/gi)].map(match => match[1]),
      [...input.matchAll(/<textarea[^>]*>([\s\S]*?)<\/textarea\s*>/gi)].map(match => match[1])
    );
    assert.equal((json.items[0].template.match(/<!-- prettier-ignore -->/g) ?? []).length, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('generates portable HTML without renderer markers, including in template contents, while retaining ordinary comments and empty attributes', async () => {
  const directory = await mkdtemp(path.join(process.cwd(), '.examples-test-'));
  try {
    await mkdir(path.join(directory, 'src'));
    const id = path.join(directory, 'src/list.examples.ts');
    await writeFile(
      id,
      [
        "import { html } from 'lit';",
        'const Default = html`<div data-label="">${[1, 2].map(value => html`<span data-number=${value}>${value}</span>`)}</div><template><template><!--lit-part cached--><!--lit-node 1--><span><!-- split layout -->nested source</span><!--/lit-part--></template></template>`;',
        "export default { component: 'nve-list', Default };"
      ].join('\n')
    );
    assert.ok(await examplesToJSON({ name: '@nvidia-elements/test' }).transform('', id));
    const json = JSON.parse(await readFile(path.join(directory, 'dist/list.examples.json'), 'utf8'));
    const generated = json.items[0].template;
    assert.doesNotMatch(generated, /<!--\/?lit-(?:part|node)/);
    assert.match(generated, /data-label=""/);
    assert.match(generated, /<span data-number="1">1<\/span>/);
    assert.match(generated, /<span data-number="2">2<\/span>/);
    assert.match(generated, /<span><!-- split layout -->nested source<\/span>/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
