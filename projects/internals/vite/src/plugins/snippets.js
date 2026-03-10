import path from 'path';
import { glob } from 'glob';
import { promises as fs } from 'fs';
import { parseFragment, serialize } from 'parse5';

const resolve = rel => path.join(process.cwd(), rel);

export function snippets() {
  return {
    name: 'snippets',
    apply: 'build',
    async buildEnd() {
      if (process.env.VITE_INITIAL_BUILD) {
        const snippetsJson = {};
        const getAttribute = (el, name) => el.attrs.find(attr => attr.name === name)?.value ?? '';
        const unIndent = input =>
          input
            .replace(/^\n/, '')
            .replace(/^( {2})/gm, '')
            .replace(/=""/gi, ''); // Also removes =""

        glob(resolve('**/*.snippets.html'))
          .then(async files => {
            const filesArray = await Promise.all(files.map(fileName => fs.readFile(fileName)));
            filesArray.forEach((fileData, i) => {
              const fileName = files[i].split('/').pop();
              const htmlString = fileData.toString();
              const htmlDoc = parseFragment(htmlString);
              for (const childNode of htmlDoc.childNodes) {
                if (
                  'tagName' in childNode &&
                  childNode.tagName === 'template' &&
                  getAttribute(childNode, 'name') &&
                  getAttribute(childNode, 'prefix')
                ) {
                  snippetsJson[getAttribute(childNode, 'name')] = {
                    srcFile: fileName,
                    prefix: getAttribute(childNode, 'prefix').split(' '),
                    type: getAttribute(childNode, 'type') || null,
                    description: getAttribute(childNode, 'description') || null,
                    body: unIndent(serialize(childNode.content))
                  };
                } else if ('tagName' in childNode && childNode.tagName !== 'template') {
                  throw new Error(
                    `Error: <${childNode.tagName}> is an invalid parent tag. All HTML snippets must be wrapped in a <template> tag.`
                  );
                } else if (
                  'tagName' in childNode &&
                  childNode.tagName === 'template' &&
                  !getAttribute(childNode, 'name')
                ) {
                  throw new Error(`Error: HTML snippets must contain a name attribute set on its <template> tag.`);
                } else if (
                  'tagName' in childNode &&
                  childNode.tagName === 'template' &&
                  !getAttribute(childNode, 'prefix')
                ) {
                  throw new Error(`Error: HTML snippets must contain a prefix attribute set on its <template> tag.`);
                }
              }
            });
            await fs.writeFile(resolve('./dist/data.snippets.json'), JSON.stringify(snippetsJson, null, 2));
          })
          .catch(err => console.error(err));
      }
    }
  };
}
