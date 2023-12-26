import glob from 'glob';
import { Project, SyntaxKind } from 'ts-morph';
import * as prettier from 'prettier';

const files = [...glob.sync('./src/**/*.stories.ts'), ...glob.sync('./docs/patterns/*.stories.ts')];

export const stories = (await Promise.all(files.map(async (file) => await getStories(file)))).filter((story) => story.element);

async function getStories(filePath) {
  const project = new Project();
  const file = project.addSourceFileAtPath(filePath);
  const stories = file.getChildrenOfKind(SyntaxKind.VariableStatement);
  const element = file
    .getChildrenOfKind(SyntaxKind.ExportAssignment)[0]
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .find((el) => el.getText() === 'component')
    ?.getNextSiblings()[1]
    ?.getText()
    ?.replace(/'/g, '');

  const formattedStories = stories.map(async (story) => {
    const id = story.getDescendantsOfKind(SyntaxKind.Identifier)[0].getText();
    const file = story.getSourceFile().getBaseName();
    let template = story
      .getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression)[0]
      ?.getDescendants()[1]
      ?.getText()
      ?.replace(/`/g, '')
      .trim();

    if (template) {
      if (template.includes('mlv-theme')) {
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

    return { id, file, template };
  });

  return {
    element,
    stories: await Promise.all(formattedStories)
  };
}
