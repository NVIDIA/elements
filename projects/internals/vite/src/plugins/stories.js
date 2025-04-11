import { html } from 'lit';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { Project, SyntaxKind } from 'ts-morph';
import * as prettier from 'prettier';

const resolve = rel => path.join(process.cwd(), rel);

/**
 * Outputs *.stories.ts files to *.stories.json metadata format
 */
export function storiesToJSON() {
  return {
    name: 'stories',
    apply: 'build',
    async buildEnd() {
      if (process.env.VITE_INITIAL_BUILD) {
        const storyFiles = await getStories([resolve('./src/**/*.stories.ts'), resolve('./docs/**/*.stories.ts')]);
        storyFiles.forEach(story => {
          const outPath = path.join(process.cwd(), 'dist', story.path);
          story.path = undefined;
          createDirectoryIfNotExists(outPath);
          fs.writeFileSync(outPath, JSON.stringify(story, null, 2));
        });
      }
    }
  };
}

function createDirectoryIfNotExists(filePath) {
  const directoryPath = path.dirname(filePath);

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

async function getStories(paths) {
  const filePaths = paths.flatMap(p => globSync(p));
  return (await Promise.all(filePaths.map(async p => await getStoriesFromFile(p)))).filter(story => story.element);
}

async function getStoriesFromFile(filePath) {
  const path = filePath.replace(process.cwd(), '').replace('/src/', './').replace('.ts', '.json');
  const project = new Project();
  const file = project.addSourceFileAtPath(filePath);
  const stories = file.getChildrenOfKind(SyntaxKind.VariableStatement);
  const element = file
    .getChildrenOfKind(SyntaxKind.ExportAssignment)[0]
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .find(el => el.getText() === 'component')
    ?.getNextSiblings()[1]
    ?.getText()
    ?.replace(/'/g, '');

  const formattedStories = stories.map(async story => {
    const id = story.getDescendantsOfKind(SyntaxKind.VariableDeclaration)[0].getName();
    const file = story.getSourceFile().getBaseName();
    let template = story
      .getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression)[0]
      ?.getDescendants()[1]
      ?.getText()
      .trim();
    template = template?.substring(1, template?.length - 1);

    if (template) {
      try {
        template = await renderTemplate(template);
      } catch (e) {
        // console.log(e);
      }

      if (template.includes('nve-theme')) {
        const lines = template?.split('\n');
        template = lines.splice(1, lines.length - 2).join('\n');
      }

      try {
        template = await prettier.format(template, {
          parser: 'html',
          singleAttributePerLine: false,
          printWidth: 120
        });
      } catch {}
    }

    const description = story
      .getJsDocs()
      .flatMap(doc => doc.getTags())
      .filter(tag => tag.getTagName() === 'description')
      .map(tag => tag.getCommentText())[0];

    return { id, file, template, description };
  });

  return {
    element,
    path,
    stories: await Promise.all(formattedStories)
  };
}

async function renderTemplate(template) {
  const data = eval(`html\`${template}\``); // treat parsed source string as a template literal
  const result = render(data);
  const contents = await collectResult(result);
  return contents.replaceAll(/<!--[^>]*lit[^>]*-->/g, '').replaceAll('=""', '');
}
