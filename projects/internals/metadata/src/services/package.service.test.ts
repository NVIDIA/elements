import { beforeEach, describe, expect, it } from 'vitest';
import { PackageService } from './package.service.js';
import type { MetadataMethod } from '../utils/metadata.js';

describe('PackageService', () => {
  let packageService: PackageService;

  beforeEach(() => {
    packageService = new PackageService();
  });

  it('should provide getVersions', async () => {
    expect((packageService.getVersions as MetadataMethod<string>).metadata.name).toBe('elements_getVersions');
    expect((packageService.getVersions as MetadataMethod<string>).metadata.description).toBe(
      'Get the latest published versions of elements / @nve packages'
    );
  });

  it('should provide getTestCoverage', async () => {
    expect((packageService.getTestCoverage as MetadataMethod<string>).metadata.name).toBe('elements_getTestCoverage');
    expect((packageService.getTestCoverage as MetadataMethod<string>).metadata.description).toBe(
      'Get the code/test coverage details for the @nve packages'
    );
    expect((await packageService.getTestCoverage()).includes('branches')).toBe(true);
    expect((await packageService.getTestCoverage()).includes('statements')).toBe(true);
    expect((await packageService.getTestCoverage()).includes('functions')).toBe(true);
    expect((await packageService.getTestCoverage()).includes('lines')).toBe(true);
  });

  it('should provide getReleaseChangelog', async () => {
    expect((packageService.getReleaseChangelog as MetadataMethod<string>).metadata.name).toBe(
      'elements_getReleaseChangelog'
    );
    expect((packageService.getReleaseChangelog as MetadataMethod<string>).metadata.description).toBe(
      'Get the changelog details for the @nve packages'
    );
    expect((packageService.getReleaseChangelog as MetadataMethod<string>).metadata.params).toBeDefined();
    expect((await packageService.getReleaseChangelog({ query: 'button' })).toLowerCase().includes('changelog')).toBe(
      true
    );
  });

  it('should provide getAPIContext', async () => {
    expect((packageService.getAPIContext as MetadataMethod<string>).metadata.name).toBe('elements_getAPIContext');
    expect((packageService.getAPIContext as MetadataMethod<string>).metadata.description).toBe(
      'Get API information for specific elements APIs and components'
    );
    expect((packageService.getAPIContext as MetadataMethod<string>).metadata.params).toBeDefined();
    expect((await packageService.getAPIContext({ query: 'button' })).includes('nve-button')).toBe(true);
  });

  it('should provide getAvailableAPIs', async () => {
    expect((packageService.getAvailableAPIs as MetadataMethod<string>).metadata.name).toBe('elements_getAvailableAPIs');
    expect((packageService.getAvailableAPIs as MetadataMethod<string>).metadata.description).toBe(
      'Get list of available elements APIs and components.'
    );
    expect((await packageService.getAvailableAPIs()).length).toBeGreaterThan(0);
  });
});
