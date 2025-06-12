import { MetadataService } from './metadata.service.js';
import {
  getAvailableElementsAPIs,
  getCoverageSummaries,
  getLatestPublishedVersions,
  searchChangelogs,
  searchElementsAPIsMarkdown
} from '../utils/utils.js';
import { metadata } from '../utils/metadata.js';

const data = await MetadataService.getMetadata();

export class PackageService {
  @metadata({ description: 'Get the latest published versions of elements / @nve packages' })
  /* istanbul ignore next -- @preserve */
  async getVersions() {
    return JSON.stringify(await getLatestPublishedVersions(data), null, 2);
  }

  @metadata({ description: 'Get the code/test coverage details for the @nve packages' })
  async getTestCoverage() {
    return JSON.stringify(await getCoverageSummaries(data), null, 2);
  }

  @metadata({
    description: 'Get the changelog details for the @nve packages',
    params: {
      query: {
        type: 'string',
        description: 'User query requesting for changelog details about specific @nve packages'
      }
    }
  })
  async getReleaseChangelog({ query }: { query: string }) {
    return JSON.stringify(await searchChangelogs(query, data), null, 2);
  }

  @metadata({
    description: 'Get API information for specific elements APIs and components',
    params: {
      query: {
        type: 'string',
        description: 'User query requesting for information about how to use nve-* APIs'
      }
    }
  })
  async getAPIContext({ query }: { query: string }) {
    return JSON.stringify(searchElementsAPIsMarkdown(query, data), null, 2);
  }

  @metadata({
    description: 'Get list of available elements APIs and components.'
  })
  async getAvailableAPIs() {
    const apis = getAvailableElementsAPIs(data);
    apis.forEach(api => (api.usage = 'verify APIs via elements_get_api_context'));
    return JSON.stringify(apis, null, 2);
  }
}
