import { MetadataService } from './metadata.service.js';
import {
  createAngularPlaygroundURL,
  createLitPlaygroundURL,
  createPlaygroundURL,
  createPreactPlaygroundURL,
  createReactPlaygroundURL
} from '../utils/playground.js';
import { metadata } from '../utils/metadata.js';
import { validateTemplate } from '../utils/validate.js';

const data = await MetadataService.getMetadata();

export class PlaygroundService {
  @metadata({
    description: 'Create validated and sanitized HTML string/template for a Elements example or playground.',
    params: {
      html: {
        type: 'string',
        description: 'HTML to be validated, sanitized and formatted.'
      }
    }
  })
  async getValidatedHTMLTemplate({ html }: { html: string }) {
    return validateTemplate(html, data);
  }

  @metadata({
    description: 'Create a playground url / link from a html string',
    params: {
      html: {
        type: 'string',
        description:
          'HTML to be embedded in a playground page. Do not include "<html>", "<body>" and "<nve-page>" tags or custom CSS.'
      }
    }
  })
  async getPlaygroundURL({ html }: { html: string }) {
    return createPlaygroundURL(html, data);
  }

  @metadata({
    description: 'Create a React 19 based playground url / link from a html string',
    params: {
      html: {
        type: 'string',
        description:
          'HTML to be embedded in a React 19 playground page. Do not include "<html>", "<body>" and "<nve-page>" tags or custom CSS.'
      }
    }
  })
  async getReactPlaygroundURL({ html }: { html: string }) {
    return createReactPlaygroundURL(html, data);
  }

  @metadata({
    description: 'Create a Preact based playground url / link from a html string',
    params: {
      html: {
        type: 'string',
        description:
          'HTML to be embedded in a Preact playground page. Do not include "<html>", "<body>" and "<nve-page>" tags or custom CSS.'
      }
    }
  })
  async getPreactPlaygroundURL({ html }: { html: string }) {
    return createPreactPlaygroundURL(html, data);
  }

  @metadata({
    description: 'Create a Angular based playground url / link from a html string',
    params: {
      html: {
        type: 'string',
        description:
          'HTML to be embedded in a Angular playground page. Do not include "<html>", "<body>" and "<nve-page>" tags or custom CSS.'
      }
    }
  })
  async getAngularPlaygroundURL({ html }: { html: string }) {
    return createAngularPlaygroundURL(html, data);
  }

  @metadata({
    description: 'Create a Lit based playground url / link from a html string',
    params: {
      html: {
        type: 'string',
        description:
          'HTML to be embedded in a Lit playground page. Do not include "<html>", "<body>" and "<nve-page>" tags or custom CSS.'
      }
    }
  })
  async getLitPlaygroundURL({ html }: { html: string }) {
    return createLitPlaygroundURL(html, data);
  }
}
