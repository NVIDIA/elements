import pkg from './package.json' assert { type: 'json' };

export default {
  plugins: [
    {
      // https://github.com/webcomponents/custom-elements-manifest/issues/42
      name: 'metadata',
      analyzePhase({ ts, node, moduleDoc }) {
        const metadata = ['figma', 'storybook', 'responsive', 'themes', 'zeroheight', 'vqa', 'aria', 'stable', 'performance', 'package'];

        switch (node.kind) {
          case ts.SyntaxKind.ClassDeclaration:
            node.jsDoc?.forEach(jsDoc => {
              const classDeclaration = moduleDoc.declarations.find(declaration => declaration.name === node.name?.getText());
              jsDoc.tags?.forEach(tag => {
                if (metadata.find(m => m === tag.tagName?.getText())) {
                  let value = tag.comment;
                  if (value === 'true') {
                    value = true;
                  }

                  if (value === 'false') {
                    value = false;
                  }

                  classDeclaration.metadata = { ...classDeclaration.metadata, [tag.tagName?.getText()]: value };
                }
              });

              if (classDeclaration.metadata && classDeclaration.tagName) {
                classDeclaration.metadata = {
                  unitTests: true,
                  apiReview: true,
                  performance: true,
                  stable: true,
                  vqa: true,
                  responsive: true,
                  themes: true,
                  aria: false,
                  package: JSON.stringify(pkg.exports).includes(classDeclaration.tagName.split('-')[1]),
                  ...classDeclaration.metadata,
                };
              }
            });
            break;
        }
      }
    }
  ]
}
