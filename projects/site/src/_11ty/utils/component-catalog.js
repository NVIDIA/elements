// @ts-check

/**
 * @typedef {{inputPath?: string, url: string, data: {tag?: string, title: string}}} ComponentDoc
 */

/**
 * @param {(Pick<import('@internals/metadata').Element, 'name' | 'package' | 'version'> & {manifest?: {description?: string, deprecated?: string | boolean}})[]} elements
 * @param {ComponentDoc[]} componentDocs
 */
export function getComponentCatalog(elements, componentDocs) {
  const paths = [
    '/docs/elements/',
    '/docs/foundations/',
    '/docs/code/',
    '/docs/markdown/',
    '/docs/media/',
    '/docs/monaco/',
    '/docs/viewport/'
  ];
  const docsByTag = new Map(
    componentDocs
      .filter(doc => doc.data?.tag && paths.some(path => doc.inputPath?.includes(path)))
      .map(doc => [doc.data.tag, doc])
  );
  /** @type {Map<string, {description: string, href: string, packageName?: string, tag: string, title: string, version?: string}>} */
  const components = new Map();

  for (const element of elements) {
    const doc = docsByTag.get(element.name);
    if (!doc || element.manifest?.deprecated) continue;

    components.set(element.name, {
      description: element.manifest?.description?.trim() ?? `Documentation for ${doc.data.title}.`,
      href: doc.url,
      packageName: element.package,
      tag: element.name,
      title: doc.data.title,
      version: element.version
    });
  }

  return [...components.values()].sort((a, b) => a.title.localeCompare(b.title));
}
