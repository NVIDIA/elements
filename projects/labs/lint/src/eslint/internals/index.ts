import { ESLint } from 'eslint';
import { elementsHtmlConfig } from '../configs/html.js';

/** @private Internal APIs, not supported for external use */

export interface TemplateLintMessage {
  id: string;
  severity: 'warn' | 'error';
  message: string;
  suggestions: {
    desc: string;
    fix: {
      range: [number, number];
      text: string;
    };
    messageId?: string | undefined;
  }[];
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

export async function lintPlaygroundTemplate(code: string): Promise<TemplateLintMessage[]> {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: elementsHtmlConfig.languageOptions,
      plugins: elementsHtmlConfig.plugins,
      rules: {
        ...elementsHtmlConfig.rules,
        // additional restrictions/rules as models rarely use these APIs correctly
        // '@nvidia-elements/lint/no-unexpected-style-customization': ['error']
        '@nvidia-elements/lint/no-unexpected-global-attribute-value': ['error', { 'nve-layout': ['@', '|', '&', 'xx'] }],
        '@nvidia-elements/lint/no-missing-slotted-elements': ['error', { 'nve-card': { required: ['nve-card-content'] } }]
      }
    }
  });

  const results = await eslint.lintText(code);
  return results
    .flatMap(result => result.messages)
    .map(message => {
      return {
        id: message.messageId,
        severity: message.severity === 2 ? 'error' : 'warn',
        message: message.message,
        suggestions:
          message.suggestions?.map(suggestion => ({
            desc: suggestion.desc,
            fix: {
              range: suggestion.fix.range,
              text: suggestion.fix.text
            },
            messageId: suggestion.messageId
          })) ?? [],
        line: message.line,
        column: message.column,
        endLine: message.endLine,
        endColumn: message.endColumn
      };
    });
}
