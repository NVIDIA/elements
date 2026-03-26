/**
 * Replaces {{ENV_VAR}} tokens in rendered HTML with values from siteData.
 * This enables markdown files to reference build-time env vars for URLs.
 */
export function envReplaceTransform(content) {
  const data = this.data?.siteData;
  if (!data) return content;

  return content
    .replace(/\{\{ELEMENTS_PAGES_BASE_URL\}\}/g, data.ELEMENTS_PAGES_BASE_URL ?? '')
    .replace(/\{\{ELEMENTS_REPO_BASE_URL\}\}/g, data.ELEMENTS_REPO_BASE_URL ?? '')
    .replace(/\{\{ELEMENTS_PLAYGROUND_BASE_URL\}\}/g, data.ELEMENTS_PLAYGROUND_BASE_URL ?? '')
    .replace(/\{\{ELEMENTS_REGISTRY_URL\}\}/g, data.ELEMENTS_REGISTRY_URL ?? '');
}
