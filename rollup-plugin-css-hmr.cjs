/* eslint-disable curly */
const path = require('path');

/**
 * Triggers a page reload when a matching CSS filename is changed
 * @param {Function} ext an extension to hot reload if its matching css changes
 */
module.exports = function CssHmr(ext) {
  const matchFn = (id) => path.basename(id)?.indexOf(ext) > -1;

  return {
    name: 'css-hmr',
    handleHotUpdate({ file, modules, server }) {
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      if (ext === '.css') {
        server.ws.send({ type: 'custom', event: name, data: {} });
      }
    },
    transform(src, id) {
      if (!matchFn(id)) return;

      const ext = path.extname(id);
      const name = path.basename(id, ext);
      return {
        code:
          src +
          `\n\n
          // -----
          //  HMR
          // -----
          if(import.meta.hot) {
            import.meta.hot.on('${name}', () => {
              import.meta.hot.invalidate();
            })
          }
        `,
        map: null,
        enforce: 'post',
      };
    },
  };
};
