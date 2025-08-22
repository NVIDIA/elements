import { html } from 'lit';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import * as prettier from 'prettier';

/**
 * Outputs *.stories.ts files to *.stories.json metadata format
 */
export function storiesToJSON(packageFile) {
  return {
    name: 'stories',
    async transform(_code, id) {
      if (!id.endsWith('.stories.ts')) {
        return null;
      }

      // have to read the file from disk instead of `code` from vite due to esbuild stripping out comments
      // https://github.com/evanw/esbuild/issues/516
      const source = readFileSync(id, 'utf-8');

      try {
        const file = id.split('src/')[1]?.replace('.ts', '.json');
        const entrypoint = `${packageFile.name}/${file}`;
        const project = new Project();
        const tempFile = project.createSourceFile('temp.ts', source);
        const storiesVariableStatement = tempFile.getChildrenOfKind(SyntaxKind.VariableStatement);
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
            storiesVariableStatement.map(async example => {
              const id = example.getDescendantsOfKind(SyntaxKind.VariableDeclaration)[0].getName();
              let template =
                example
                  .getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression)[0]
                  ?.getDescendants()[1]
                  ?.getText()
                  ?.replace(/\n\n/g, '\n')
                  ?.trim() ?? '';

              if (template) {
                template = template.substring(1, template.length - 1);
                try {
                  template = await renderTemplate(template);
                } catch (e) {
                  console.warn(`Element ${element} example "${id}" is not stateless.`);
                }

                try {
                  template = await prettier.format(template, {
                    parser: 'html',
                    singleAttributePerLine: false,
                    printWidth: 120
                  });
                } catch {}
              }

              const description =
                example
                  .getJsDocs()
                  .flatMap(doc => doc.getTags())
                  .filter(tag => tag.getTagName() === 'description')
                  .map(tag => tag.getCommentText())[0] ?? '';

              const deprecated = (
                example
                  .getJsDocs()
                  .flatMap(doc => doc.getTags())
                  .filter(tag => tag.getTagName() === 'deprecated')
                  .map(tag => tag.getCommentText())[0] ?? ''
              ).length
                ? true
                : undefined;

              const tags =
                example
                  .getJsDocs()
                  .flatMap(doc => doc.getTags())
                  .filter(tag => tag.getTagName() === 'tags')
                  .flatMap(tag =>
                    tag
                      .getCommentText()
                      .split(' ')
                      .map(t => t.trim())
                  )
                  .filter(tag => tag.length > 0) ?? [];

              validateDescriptionContext(id, description);
              validateTagsContext(id, tags);

              return {
                id,
                template,
                description,
                deprecated,
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

        // Calculate the output path relative to dist
        const srcPath = path.relative(process.cwd(), id);
        const distPath = path.join(srcPath.replace('.ts', '.json').replace('src', 'dist'));
        createDirectoryIfNotExists(distPath);
        writeFileSync(distPath, JSON.stringify(json, null, 2));

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

function createDirectoryIfNotExists(filePath) {
  const directoryPath = path.dirname(filePath);

  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath, { recursive: true });
  }
}

async function renderTemplate(template) {
  const data = eval(`html\`${template}\``); // treat parsed source string as a template literal
  const result = render(data);
  const contents = await collectResult(result);
  return contents.replaceAll(/<!--[^>]*lit[^>]*-->/g, '').replaceAll('=""', '');
}

/**
 * Descriptions context must be concise to be compatible with externalized tools such as CLIs and MCPs.
 */
function validateDescriptionContext(id, description) {
  const contextMaxLength = 400;
  const plainTextDescription = description
    .replaceAll(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi, '')
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  if (plainTextDescription.length > contextMaxLength) {
    console.error(
      `Description context for "${id}" is too long. (${plainTextDescription.length}/${contextMaxLength} characters)`
    );
    process.exit(1);
  }
}

function validateTagsContext(id, tags) {
  const allowedTags = ['pattern', 'anti-pattern'];
  const invalidTags = tags.filter(tag => !allowedTags.includes(tag));
  if (invalidTags.length > 0) {
    console.error(`Invalid tags for "${id}": ${invalidTags.join(', ')}`);
    process.exit(1);
  }
}
