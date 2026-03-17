/**
 * Rolldown workaround: when preserveModules is enabled, JSON files imported via
 * dynamic import() with import attributes are converted to .js modules in the output,
 * but Rolldown does not rewrite the import paths from .json to .js.
 *
 * This plugin fixes the mismatch by rewriting dynamic import paths in generated chunks.
 */
export function jsonDynamicImports() {
  return {
    name: 'fix-json-dynamic-imports',
    renderChunk(code) {
      if (!code.includes('.json')) {
        return null;
      }

      return code.replace(/import\("([^"]+)\.json"[^)]*\)/g, 'import("$1.js")');
    }
  };
}
