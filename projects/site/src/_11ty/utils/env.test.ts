import { afterEach, describe, expect, it, vi } from 'vitest';

async function importEnv() {
  vi.resetModules();

  return import('./env.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('env', () => {
  it('should fall back when required url env vars are empty', async () => {
    vi.stubEnv('ELEMENTS_PAGES_BASE_URL', '');
    vi.stubEnv('ELEMENTS_REPO_BASE_URL', '');
    vi.stubEnv('ELEMENTS_SITE_URL', '');

    const env = await importEnv();

    expect(env.ELEMENTS_PAGES_BASE_URL).toBe('https://nvidia.github.io/elements');
    expect(env.ELEMENTS_REPO_BASE_URL).toBe('https://github.com/NVIDIA/elements');
    expect(env.ELEMENTS_SITE_URL).toBe('https://nvidia.github.io');
  });

  it('should fall back when required url env vars are whitespace', async () => {
    vi.stubEnv('ELEMENTS_PAGES_BASE_URL', '   ');
    vi.stubEnv('ELEMENTS_REPO_BASE_URL', '   ');
    vi.stubEnv('ELEMENTS_SITE_URL', '   ');

    const env = await importEnv();

    expect(env.ELEMENTS_PAGES_BASE_URL).toBe('https://nvidia.github.io/elements');
    expect(env.ELEMENTS_REPO_BASE_URL).toBe('https://github.com/NVIDIA/elements');
    expect(env.ELEMENTS_SITE_URL).toBe('https://nvidia.github.io');
  });

  it('should trim configured url env vars', async () => {
    vi.stubEnv('ELEMENTS_PAGES_BASE_URL', ' https://docs.example.com/elements ');
    vi.stubEnv('ELEMENTS_REPO_BASE_URL', ' https://github.example.com/NVIDIA/elements ');
    vi.stubEnv('ELEMENTS_SITE_URL', ' https://docs.example.com ');
    vi.stubEnv('ELEMENTS_PLAYGROUND_BASE_URL', ' https://playground.example.com ');

    const env = await importEnv();

    expect(env.ELEMENTS_PAGES_BASE_URL).toBe('https://docs.example.com/elements');
    expect(env.ELEMENTS_REPO_BASE_URL).toBe('https://github.example.com/NVIDIA/elements');
    expect(env.ELEMENTS_SITE_URL).toBe('https://docs.example.com');
    expect(env.ELEMENTS_PLAYGROUND_BASE_URL).toBe('https://playground.example.com');
  });

  it('should keep optional env vars empty when empty', async () => {
    vi.stubEnv('ELEMENTS_PLAYGROUND_BASE_URL', '');
    vi.stubEnv('ELEMENTS_REGISTRY_URL', '');
    vi.stubEnv('ELEMENTS_ASSETS_CDN_BASE_URL', '');
    vi.stubEnv('ELEMENTS_ESM_CDN_BASE_URL', '');
    vi.stubEnv('ELEMENTS_CDN_BASE_URL', '');

    const env = await importEnv();

    expect(env.ELEMENTS_PLAYGROUND_BASE_URL).toBe('');
    expect(env.ELEMENTS_REGISTRY_URL).toBe('');
    expect(env.ELEMENTS_ASSETS_CDN_BASE_URL).toBe('');
    expect(env.ELEMENTS_ESM_CDN_BASE_URL).toBe('');
    expect(env.ELEMENTS_CDN_BASE_URL).toBe('');
  });
});
