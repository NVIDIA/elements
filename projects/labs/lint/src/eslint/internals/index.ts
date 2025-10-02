import { ESLint } from 'eslint';
import { elementsHtmlConfig } from '../configs/html.js';

/** @private Internal APIs, not supported for external use */

export interface TemplateLintMessage {
  id: string;
  severity: 'warn' | 'error';
  message: string;
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
        '@nvidia-elements/lint/no-unexpected-style-customization': ['error']
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
        line: message.line,
        column: message.column,
        endLine: message.endLine,
        endColumn: message.endColumn
      };
    });
}
