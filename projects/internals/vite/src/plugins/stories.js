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
            storiesVariableStatement.map(async story => {
              const id = story.getDescendantsOfKind(SyntaxKind.VariableDeclaration)[0].getName();
              let template =
                story
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
                  console.warn(`Element ${element} story ${id} is not stateless.`);
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
                story
                  .getJsDocs()
                  .flatMap(doc => doc.getTags())
                  .filter(tag => tag.getTagName() === 'description')
                  .map(tag => tag.getCommentText())[0] ?? '';

              return {
                id,
                template,
                description
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
        console.error(`Error processing story file ${id}:`, error);
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
