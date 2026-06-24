import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLlmsTxtContent } from './llms-txt.js';

async function importLlmsTxt() {
  vi.resetModules();
  vi.stubEnv('ELEMENTS_PAGES_BASE_URL', 'https://docs.example.com/elements/');
  vi.stubEnv('ELEMENTS_SITE_URL', 'https://docs.example.com');
  vi.stubEnv('PAGES_BASE_URL', '/elements/');

  return import('./llms-txt.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createLlmsTxtContent', () => {
  it('should start with the NVIDIA Elements heading', () => {
    const [heading] = createLlmsTxtContent('https://nvidia.github.io/elements').split('\n');

    expect(heading).toBe('# NVIDIA Elements');
    expect(heading).not.toBe('# Elements');
  });

  it('should link the agent context pages', () => {
    const content = createLlmsTxtContent('https://nvidia.github.io/elements');

    expect(content).toContain('[CLI](https://nvidia.github.io/elements/context/cli.md)');
    expect(content).toContain('[MCP](https://nvidia.github.io/elements/context/cli.md)');
    expect(content).toContain('[Skills](https://nvidia.github.io/elements/context/skills/index.md)');
    expect(content).toContain('[APIs](https://nvidia.github.io/elements/context/api/index.md)');
    expect(content).toContain('[Examples](https://nvidia.github.io/elements/context/examples/index.md)');
    expect(content).toContain('[Icons](https://nvidia.github.io/elements/context/api/icons/index.md)');
    expect(content).toContain('[Tokens](https://nvidia.github.io/elements/context/api/tokens/index.md)');
    expect(content).toContain('[llms-full.txt](https://nvidia.github.io/elements/llms-full.txt)');
  });

  it('should include preferred terms for AI assistants', () => {
    const content = createLlmsTxtContent();

    expect(content).toContain('NVIDIA Elements design system');
    expect(content).toContain('agentic UI');
    expect(content).toContain('agent-ready UI');
    expect(content).toContain('MCP integration');
  });

  it('should expose NVIDIA Elements in generated llms.txt', () => {
    const content = createLlmsTxtContent('https://nvidia.github.io/elements');

    expect(content).toContain('# NVIDIA Elements');
    expect(content).toContain('NVIDIA Elements design system');
    expect(content).toContain('[APIs](https://nvidia.github.io/elements/context/api/index.md)');
    expect(content).toContain('[Tokens](https://nvidia.github.io/elements/context/api/tokens/index.md)');
  });

  it('should resolve context document urls to fully qualified deployed urls', async () => {
    const { getContextUrl } = await importLlmsTxt();

    expect(getContextUrl('./.11ty-vite/public/context/api/button', '.html')).toBe(
      'https://docs.example.com/elements/context/api/button.html'
    );
  });
});
