/** generates a list of links for all heading tags in the string content */
export async function anchorGeneratorTransform(content) {
  if (content.includes('<!-- ANCHOR-GENERATOR -->')) {
    const headings = content
      .split('\n')
      .filter(line => (line.includes('<h2') || line.includes('<h3')) && line.includes('mkd') && line.includes('id="'))
      .map(line => {
        const idMatch = line.match(/id="([^"]+)"/);
        const id = idMatch ? idMatch[1] : '';
        const textContent = line.replace(/<[^>]+>/g, '').trim();
        return { id, textContent };
      });

    const sidenav =
      !this.page.url.includes('changelog') && headings.length > 2
        ? /* html */ `
    <ul id="anchor-generator" nve-text="list">${headings.map(h => `<li><a href="${this.page.url.replace('/docs', 'docs')}#${h.id}" nve-text="link truncate">${h.textContent}</a></li>`).join('')}</ul>`
        : '';

    return content.replace('<!-- ANCHOR-GENERATOR -->', sidenav);
  }

  return content;
}
