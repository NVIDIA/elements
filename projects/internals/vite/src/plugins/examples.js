import { html } from 'lit';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { createHash } from 'crypto';
import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import * as prettier from 'prettier';
import { parseFragment } from 'parse5';

const project = new Project();
const cache = new Map();

/**
 * Outputs *.examples.ts files to *.examples.json metadata format
 */
export function examplesToJSON(packageFile) {
  return {
    name: 'examples',
    async transform(_code, id) {
      if (!id.endsWith('.examples.ts')) {
        return null;
      }

      // have to read the file from disk instead of `code` from vite due to esbuild stripping out comments
      // https://github.com/evanw/esbuild/issues/516
      const source = await readFile(id, 'utf-8');
      const hash = createHash('md5').update(source).digest('hex');
      const cached = cache.get(id);

      if (cached?.hash === hash) {
        await writeOutput(id, cached.json);
        return { code: `export default ''`, map: null };
      }

      try {
        const file = id.split('src/')[1]?.replace('.ts', '.json');
        const entrypoint = `${packageFile.name}/${file}`;
        const tempFile = project.createSourceFile('temp.ts', source, { overwrite: true });
        const examplesVariableStatement = tempFile.getChildrenOfKind(SyntaxKind.VariableStatement);
        const element = tempFile
          .getChildrenOfKind(SyntaxKind.ExportAssignment)[0]
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .find(el => el.getText() === 'component')
          ?.getNextSiblings()[1]
          ?.getText()
          ?.replace(/"/g, '')
          ?.replace(/'/g, '');

        const items = (
          await Promise.all(
            examplesVariableStatement.map(async example => {
              const name = example.getDescendantsOfKind(SyntaxKind.VariableDeclaration)[0].getName();
              let template =
                example
                  .getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression)[0]
                  ?.getDescendants()[1]
                  ?.getText()
                  ?.trim() ?? '';

              if (template) {
                template = template.substring(1, template.length - 1);

                try {
                  template = await renderTemplate(template);
                } catch (e) {
                  console.warn(`Element ${element} example "${name}" is not stateless.`);
                }

                template = await formatTemplate(template);
              }

              const jsTags = example.getJsDocs().flatMap(doc => doc.getTags());
              const summary =
                jsTags
                  .find(t => t.getTagName() === 'summary')
                  ?.getCommentText()
                  ?.replace(/\n/g, ' ') ?? '';
              const description =
                jsTags
                  .find(t => t.getTagName() === 'description')
                  ?.getCommentText()
                  ?.replace(/\n/g, ' ') ?? '';
              const deprecated = jsTags.some(t => t.getTagName() === 'deprecated') || undefined;
              const composition = templateIsComposition(template);
              const tags = jsTags
                .filter(t => t.getTagName() === 'tags')
                .flatMap(t =>
                  t
                    .getCommentText()
                    .split(' ')
                    .map(s => s.trim())
                )
                .filter(Boolean);

              const exampleId = generateExampleId(entrypoint, name);

              return {
                id: exampleId,
                name,
                template,
                summary,
                description,
                deprecated,
                composition,
                tags
              };
            })
          )
        ).filter(s => s.template);

        const json = {
          element,
          entrypoint,
          items
        };

        cache.set(id, { hash, json });
        await writeOutput(id, json);

        return {
          code: `export default ''`,
          map: null
        };
      } catch (error) {
        console.error(`Error processing example file ${id}:`, error);
        return null;
      }
    }
  };
}

async function writeOutput(id, json) {
  const srcPath = path.relative(process.cwd(), id);
  const distPath = path.join(srcPath.replace('.ts', '.json').replace('src', 'dist'));
  await mkdir(path.dirname(distPath), { recursive: true });
  await writeFile(distPath, JSON.stringify(json, null, 2));
}

function templateIsComposition(template) {
  const tags = template?.match(/<nve-[\w-]+/g);
  if (!tags) return false;

  const unique = [...new Set(tags)].map(t => t.slice(1));
  unique.sort((a, b) => a.length - b.length);

  const roots = [];
  for (const tag of unique) {
    if (!roots.some(root => tag.startsWith(root + '-'))) {
      roots.push(tag);
    }
  }

  return roots.length > 2;
}

function generateExampleId(entrypoint, name) {
  const exampleName = name.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').replace(/([a-z\d])([A-Z])/g, '$1-$2');
  const idParts = entrypoint.split('/');
  const fileName = idParts[idParts.length - 1].replace('.examples.json', '');
  const formattedFileName = idParts[idParts.length - 2] === fileName ? '' : `-${fileName}`;
  const entrypointName = idParts.slice(1, idParts.length - 1).join('-');
  let id = `${entrypointName}${formattedFileName.replace('-index', '')}-${exampleName}`.toLowerCase();

  if (id.startsWith('patterns-templates')) {
    id = id.replace('patterns-templates', 'template');
  }

  if (id.startsWith('patterns')) {
    id = id.replace('patterns', 'pattern');
  }

  if (id.startsWith('core')) {
    id = id.replace('core-', '');
  }

  return id.replace(/-default$/, '');
}

async function renderTemplate(template) {
  const data = eval(`html\`${template}\``); // treat parsed source string as a template literal
  const result = render(data);
  const contents = await collectResult(result);
  return cleanRenderResult(contents);
}

function cleanRenderResult(contents) {
  // Remove Lit SSR bookkeeping comments; examples are consumed as HTML snapshots.
  const markers = [];
  function visit(node) {
    if (node.nodeName === '#comment' && /^(?:\/?lit-part(?:\s|$)|lit-node\s)/.test(node.data)) {
      markers.push(node.sourceCodeLocation);
    }
    for (const child of node.childNodes ?? []) visit(child);
    if (node.tagName === 'template') visit(node.content);
  }
  visit(parseFragment(contents, { sourceCodeLocationInfo: true }));

  let cleaned = contents;
  for (const marker of markers.sort((a, b) => b.startOffset - a.startOffset)) {
    cleaned = cleaned.slice(0, marker.startOffset) + cleaned.slice(marker.endOffset);
  }
  return cleaned;
}

async function formatTemplate(template) {
  const verbatimContents = findVerbatimContentRanges(template).map(({ tag, start, end }) => ({
    tag,
    content: template.slice(start, end)
  }));
  let formatted;
  try {
    formatted = await prettier.format(template, {
      parser: 'html',
      singleAttributePerLine: false,
      printWidth: 220
    });
  } catch {
    return template;
  }
  return restoreVerbatimContents(formatted, verbatimContents);
}

// NOTE: Verbatim content retains authored formatting where reformatting would otherwise alter displayed output.
function findVerbatimContentRanges(template) {
  const ranges = [];
  function visit(node) {
    if (node.tagName === 'template' || node.tagName === 'textarea') {
      const location = node.sourceCodeLocation;
      if (location?.startTag && location?.endTag) {
        const start = location.startTag.endOffset;
        const end = location.endTag.startOffset;
        ranges.push({ tag: node.tagName, start, end });
      }
      return;
    }
    for (const child of node.childNodes ?? []) visit(child);
  }
  if (/<(template|textarea)[\s>]/i.test(template)) {
    visit(parseFragment(template, { sourceCodeLocationInfo: true }));
  }

  return ranges.sort((a, b) => a.start - b.start);
}

function restoreVerbatimContents(formatted, verbatimContents) {
  const ranges = findVerbatimContentRanges(formatted);
  if (
    ranges.length !== verbatimContents.length ||
    ranges.some((range, index) => range.tag !== verbatimContents[index].tag)
  ) {
    throw new Error('Formatting unexpectedly changed the sequence of verbatim content.');
  }

  // NOTE: Replace ranges in reverse order so each edit only shifts previously processed content.
  for (let index = ranges.length - 1; index >= 0; index--) {
    const { start, end } = ranges[index];
    formatted = formatted.slice(0, start) + verbatimContents[index].content + formatted.slice(end);
  }
  return formatted;
}
