import { globSync } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import postcss from 'postcss';
import cssnano from 'cssnano';

const themes = globSync(`dist/*.css`);

themes.forEach(path => {
  const css = readFileSync(path).toString();
  postcss([cssnano])
    .process(css, { from: path, to: path.replace('.css', '.min.css') })
    .then(result => {
      writeFileSync(path, result.css);
    });
});
