import { execSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';
import { VERSION } from './index.js';

describe('index', () => {
  const output = execSync('node dist/index.js').toString();

  it('should have a version', () => {
    expect(VERSION).toBe('0.0.0');
  });

  it('should have command formatting outlined', () => {
    expect(output).toContain('nve <cmd> [args]');
  });

  it('should provide api.list', () => {
    expect(output).toContain('nve api.list [format]');
  });

  it('should provide api.search', () => {
    expect(output).toContain('nve api.search <query> [format]');
  });

  it('should provide packages.changelogs.list', () => {
    expect(output).toContain('nve packages.changelogs.list [format]');
  });

  it('should provide packages.changelogs.search', () => {
    expect(output).toContain('nve packages.changelogs.search <name> [format]');
  });

  it('should provide packages.versions.list', () => {
    expect(output).toContain('nve packages.versions.list');
  });

  it('should provide examples.list', () => {
    expect(output).toContain('nve examples.list [format]');
  });

  it('should provide examples.search', () => {
    expect(output).toContain('nve examples.search <query> [format]');
  });

  it('should provide playground.validate', () => {
    expect(output).toContain('nve playground.validate <template>');
  });

  it('should provide playground.create', () => {
    expect(output).toContain('nve playground.create <template> [type] [name] [author] [start]');
  });

  it('should provide project.create', () => {
    expect(output).toContain('nve project.create <type> [cwd] [start]');
  });

  it('should provide project.update', () => {
    expect(output).toContain('nve project.update [cwd]');
  });

  it('should provide project.validate', () => {
    expect(output).toContain('nve project.validate <type> [cwd]');
  });

  it('should provide tokens.list', () => {
    expect(output).toContain('nve tokens.list [format]');
  });
});
