import { html } from 'lit';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { createHash } from 'crypto';
import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import * as prettier from 'prettier';

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

                if (!template.includes('<template>')) {
                  try {
                    template = await prettier.format(template.replace(/\n\n/g, '\n'), {
                      parser: 'html',
                      singleAttributePerLine: false,
                      printWidth: 120
                    });
                  } catch {}
                }
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
  return `${entrypointName}${formattedFileName}_${exampleName}`.toLowerCase();
}

async function renderTemplate(template) {
  const data = eval(`html\`${template}\``); // treat parsed source string as a template literal
  const result = render(data);
  const contents = await collectResult(result);
  return contents.replaceAll(/<!--[^>]*lit[^>]*-->/g, '').replaceAll('=""', '');
}
