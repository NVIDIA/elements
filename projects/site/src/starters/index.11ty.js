import { BASE_URL } from '../_11ty/layouts/metadata.js';

export const data = {
  layout: false,
  eleventyExcludeFromCollections: true
};

/** File path avoids Vite resolving a trailing-slash directory during build-html. */
const target = `${BASE_URL}docs/integrations/index.html`;

export function render() {
  return /* html */ `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=${target}">
    <script>location.replace(${JSON.stringify(target)});</script>
  </head>
  <body>
    <p nve-text="body">Redirecting to <a href="${target}">Integrations</a>.</p>
  </body>
</html>`;
}
