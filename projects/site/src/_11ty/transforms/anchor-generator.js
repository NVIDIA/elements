/**
 * Transform that generates a list of anchor links for all heading tags in the content.
 * Creates a side navigation menu from h2 and h3 tags that have IDs.
 *
 * @param {string} content - The HTML content to process
 * @returns {Promise<string>} The processed content with anchor navigation
 */
export async function anchorGeneratorTransform(content) {
  // Only process content that has the anchor generator marker
  if (content.includes('<!-- ANCHOR-GENERATOR -->')) {
    // Extract all h2 and h3 tags that have IDs and are marked with 'mkd' class
    const headings = content
      .split('\n')
      .filter(line => (line.includes('<h2') || line.includes('<h3')) && line.includes('mkd') && line.includes('id="'))
      .map(line => {
        const idMatch = line.match(/id="([^"]+)"/);
        const id = idMatch ? idMatch[1] : '';
        const textContent = line.replace(/<[^>]+>/g, '').trim();
        return { id, textContent, subHeading: !line.includes('<h2') };
      });

    // Generate the side navigation HTML if there are enough headings
    // Skip for changelog pages and pages with fewer than 3 headings
    const sidenav =
      !this.page.url.includes('integrations') && !this.page.url.includes('changelog') && headings.length > 2
        ? /* html */ `
    <ul id="anchor-generator" nve-text="list nav">${headings
      .map(
        h =>
          `<li>
        <a href="${this.page.url.replace('/docs', 'docs')}#${h.id}" nve-text="link truncate ${h.subHeading ? 'sm' : ''}"
        ${h.subHeading ? 'nve-layout="pad-left:md"' : ''}>
          ${h.textContent}
        </a>
      </li>`
      )
      .join('')}
    </ul>`
        : '';

    // Replace the marker with the generated navigation
    return content.replace('<!-- ANCHOR-GENERATOR -->', sidenav);
  }

  return content;
}
