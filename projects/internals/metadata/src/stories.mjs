import { globSync } from 'glob';
import { Project, SyntaxKind } from 'ts-morph';
import * as prettier from 'prettier';

export async function getStories(paths) {
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
