import { beforeEach, describe, expect, it } from 'vitest';
import { PlaygroundService } from './playground.service.js';
import type { MetadataMethod } from '../utils/metadata.js';

describe('PlaygroundService', () => {
  let playgroundService: PlaygroundService;

  beforeEach(() => {
    playgroundService = new PlaygroundService();
  });

  it('should provide getValidatedHTMLTemplate', async () => {
    const template = await playgroundService.getValidatedHTMLTemplate({
      html: '<div nve-invalid="test"><nve-button>hello there</nve-button>'
    });
    expect(template).toBe('<div><nve-button>hello there</nve-button></div>');
    expect((playgroundService.getValidatedHTMLTemplate as MetadataMethod<string>).metadata.name).toBe(
      'elements_getValidatedHTMLTemplate'
    );
    expect((playgroundService.getValidatedHTMLTemplate as MetadataMethod<string>).metadata.description).toBe(
      'Create validated and sanitized HTML string/template for a Elements example or playground.'
    );
    expect((playgroundService.getValidatedHTMLTemplate as MetadataMethod<string>).metadata.params.html).toBeDefined();
  });

  it('should provide getPlaygroundURL', async () => {
    const url = await playgroundService.getPlaygroundURL({ html: '<nve-button></nve-button>' });
    expect(url.includes('?version=1&layout=vertical-split&file=index.html&files=')).toBe(true);
    expect((playgroundService.getPlaygroundURL as MetadataMethod<string>).metadata.name).toBe(
      'elements_getPlaygroundURL'
    );
    expect((playgroundService.getPlaygroundURL as MetadataMethod<string>).metadata.description).toBe(
      'Create a playground url / link from a html string'
    );
    expect((playgroundService.getPlaygroundURL as MetadataMethod<string>).metadata.params.html).toBeDefined();
  });

  it('should provide getReactPlaygroundURL', async () => {
    const url = await playgroundService.getReactPlaygroundURL({ html: '<nve-button></nve-button>' });
    expect(url.includes('?version=1&layout=vertical-split&name=react&file=index.tsx&files=')).toBe(true);
    expect((playgroundService.getReactPlaygroundURL as MetadataMethod<string>).metadata.name).toBe(
      'elements_getReactPlaygroundURL'
    );
    expect((playgroundService.getReactPlaygroundURL as MetadataMethod<string>).metadata.description).toBe(
      'Create a React 19 based playground url / link from a html string'
    );
    expect((playgroundService.getReactPlaygroundURL as MetadataMethod<string>).metadata.params.html).toBeDefined();
  });

  it('should provide getPreactPlaygroundURL', async () => {
    const url = await playgroundService.getPreactPlaygroundURL({ html: '<nve-button></nve-button>' });
    expect(url.includes('?version=1&layout=vertical-split&name=preact&file=index.tsx&files=')).toBe(true);
    expect((playgroundService.getPreactPlaygroundURL as MetadataMethod<string>).metadata.name).toBe(
      'elements_getPreactPlaygroundURL'
    );
    expect((playgroundService.getPreactPlaygroundURL as MetadataMethod<string>).metadata.description).toBe(
      'Create a Preact based playground url / link from a html string'
    );
    expect((playgroundService.getPreactPlaygroundURL as MetadataMethod<string>).metadata.params.html).toBeDefined();
  });

  it('should provide getAngularPlaygroundURL', async () => {
    const url = await playgroundService.getAngularPlaygroundURL({ html: '<nve-button></nve-button>' });
    expect(url.includes('?version=1&layout=vertical-split&name=angular&file=index.ts&files=')).toBe(true);
    expect((playgroundService.getAngularPlaygroundURL as MetadataMethod<string>).metadata.name).toBe(
      'elements_getAngularPlaygroundURL'
    );
    expect((playgroundService.getAngularPlaygroundURL as MetadataMethod<string>).metadata.description).toBe(
      'Create a Angular based playground url / link from a html string'
    );
    expect((playgroundService.getAngularPlaygroundURL as MetadataMethod<string>).metadata.params.html).toBeDefined();
  });

  it('should provide getLitPlaygroundURL', async () => {
    const url = await playgroundService.getLitPlaygroundURL({ html: '<nve-button></nve-button>' });
    expect(url.includes('?version=1&layout=vertical-split&name=lit&file=index.ts&files=')).toBe(true);
    expect((playgroundService.getLitPlaygroundURL as MetadataMethod<string>).metadata.name).toBe(
      'elements_getLitPlaygroundURL'
    );
    expect((playgroundService.getLitPlaygroundURL as MetadataMethod<string>).metadata.description).toBe(
      'Create a Lit based playground url / link from a html string'
    );
    expect((playgroundService.getLitPlaygroundURL as MetadataMethod<string>).metadata.params.html).toBeDefined();
  });
});
