import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { isTemplateResult } from 'lit/directive-helpers.js';
import { parseFragment } from 'parse5';

/** Serializes fixture markup without constructing components or hydrating them in Node. */
export async function serializeRenderContent(content) {
  if (typeof content === 'string') return content;
  if (!isTemplateResult(content)) throw new Error('Render fixture content must be a string or Lit html template');
  validateMarkup(content);
  return stripLitMarkers(await collectResult(render(content, { elementRenderers: [] })));
}

function validateMarkup(template) {
  let marker = '__nve_render_binding__';
  while (template.strings.some(part => part.includes(marker))) marker += '_';
  function visit(node) {
    for (const attribute of node.attrs ?? []) {
      if (/^[.@]/.test(attribute.name) && attribute.value.includes(marker)) {
        throw new Error(
          `Render fixture ${attribute.name} binding cannot run in the browser; use attributes or prepare(page)`
        );
      }
    }
    if (node.tagName === 'script' && node.childNodes?.some(child => child.value?.includes(marker))) {
      throw new Error('Render fixture script bindings are unsupported; pass configuration through data attributes');
    }
    for (const child of node.childNodes ?? []) visit(child);
    if (node.content) visit(node.content);
  }
  visit(parseFragment(template.strings.join(marker)));
  function validateValue(value) {
    if (isTemplateResult(value)) validateMarkup(value);
    else if (Array.isArray(value)) value.forEach(validateValue);
  }
  template.values.forEach(validateValue);
}

export function stripLitMarkers(contents) {
  // Remove Lit SSR bookkeeping comments from standalone HTML.
  const markers = [];
  function visit(node) {
    if (node.nodeName === '#comment' && /^(?:\/?lit-part(?:\s|$)|lit-node\s)/.test(node.data)) {
      markers.push(node.sourceCodeLocation);
    }
    for (const child of node.childNodes ?? []) visit(child);
    if (node.tagName === 'template') visit(node.content);
  }
  visit(parseFragment(contents, { sourceCodeLocationInfo: true }));

  let cleaned = contents;
  for (const marker of markers.sort((a, b) => b.startOffset - a.startOffset)) {
    cleaned = cleaned.slice(0, marker.startOffset) + cleaned.slice(marker.endOffset);
  }
  return cleaned;
}
