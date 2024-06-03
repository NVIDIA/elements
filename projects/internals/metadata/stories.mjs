import { globSync } from 'glob';
import { Project, SyntaxKind } from 'ts-morph';
import * as prettier from 'prettier';

export async function getStories(paths) {
  const filePaths = paths.flatMap(p => globSync(p));
  return (await Promise.all(filePaths.map(async p => await getStoriesFromFile(p)))).filter(story => story.element);
}

async function getStoriesFromFile(filePath) {
  const project = new Project();
  const file = project.addSourceFileAtPath(filePath);
  const stories = file.getChildrenOfKind(SyntaxKind.VariableStatement);
  const element = file
    .getChildrenOfKind(SyntaxKind.ExportAssignment)[0]
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .find(el => el.getText() === 'component')
    ?.getNextSiblings()[1]
    ?.getText()
    ?.replace(/'/g, '')
    ?.replace('nve-', 'nve-');

  const formattedStories = stories.map(async story => {
    const id = story.getDescendantsOfKind(SyntaxKind.Identifier)[0].getText();
    const file = story.getSourceFile().getBaseName();
    let template = story
      .getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression)[0]
      ?.getDescendants()[1]
      ?.getText()
      ?.replace(/`/g, '')
      .trim();

    if (template) {
      if (template.includes('nve-theme') || template.includes('nve-theme')) {
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
