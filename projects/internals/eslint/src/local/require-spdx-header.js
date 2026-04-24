const COPYRIGHT_HOLDER = 'NVIDIA CORPORATION & AFFILIATES. All rights reserved.';
const LICENSE = 'Apache-2.0';
const YEAR_PATTERN = /\b(\d{4})\b/;

function patternsFor(filename) {
  const isCss = filename.endsWith('.css');
  const open = isCss ? '/\\* ' : '// ';
  const close = isCss ? ' \\*/' : '';
  const wrongOpen = isCss ? '// ' : '/\\* ';
  const wrongClose = isCss ? '' : ' \\*/';
  const prefix = isCss ? '/* ' : '// ';
  const suffix = isCss ? ' */' : '';
  return {
    prefix,
    suffix,
    expectedCopyright: new RegExp(
      `^${open}SPDX-FileCopyrightText: Copyright \\(c\\) (\\d{4}) NVIDIA CORPORATION & AFFILIATES\\. All rights reserved\\.${close}\\s*$`
    ),
    expectedIdentifier: new RegExp(`^${open}SPDX-License-Identifier: Apache-2\\.0${close}\\s*$`),
    wrongStyleCopyright: new RegExp(
      `^${wrongOpen}SPDX-FileCopyrightText: Copyright \\(c\\) \\d{4} NVIDIA CORPORATION & AFFILIATES\\. All rights reserved\\.${wrongClose}\\s*$`
    ),
    wrongStyleIdentifier: new RegExp(`^${wrongOpen}SPDX-License-Identifier: Apache-2\\.0${wrongClose}\\s*$`)
  };
}

function analyzeLine(line, patterns) {
  if (line.includes('SPDX-FileCopyrightText:')) {
    return {
      kind: 'copyright',
      exact: patterns.expectedCopyright.test(line),
      wrongStyle: patterns.wrongStyleCopyright.test(line)
    };
  }
  if (line.includes('SPDX-License-Identifier:')) {
    return {
      kind: 'identifier',
      exact: patterns.expectedIdentifier.test(line),
      wrongStyle: patterns.wrongStyleIdentifier.test(line)
    };
  }
  return { kind: 'other' };
}

function selectMessage(line0Info, line1Info) {
  const line0IsCopyright = line0Info.kind === 'copyright' && line0Info.exact;
  const line1IsIdentifier = line1Info.kind === 'identifier' && line1Info.exact;
  if (line0IsCopyright && line1IsIdentifier) return null;

  const anyWrongStyle =
    (line0Info.kind !== 'other' && line0Info.wrongStyle) || (line1Info.kind !== 'other' && line1Info.wrongStyle);
  if (anyWrongStyle) return 'wrong-comment-style';

  const hasCopyright = line0Info.kind === 'copyright' || line1Info.kind === 'copyright';
  const hasIdentifier = line0Info.kind === 'identifier' || line1Info.kind === 'identifier';

  if (line0Info.kind === 'copyright' && !line0Info.exact) return 'invalid-copyright';
  if (line1Info.kind === 'copyright' && !line1Info.exact) return 'invalid-copyright';
  if (line0Info.kind === 'identifier' && !line0Info.exact) return 'invalid-identifier';
  if (line1Info.kind === 'identifier' && !line1Info.exact) return 'invalid-identifier';

  if (hasCopyright && !hasIdentifier) return 'missing-identifier';
  if (hasIdentifier && !hasCopyright) return 'missing-copyright';

  return 'missing-header';
}

function findHeaderStart(lines) {
  let start = 0;
  if (lines[0]?.startsWith('#!')) {
    start = 1;
    if (lines[start]?.trim() === '') start++;
  }
  return start;
}

function buildFixer(sourceCode, patterns, existingYear, headerStart) {
  const lines = sourceCode.lines;
  let headerEnd = headerStart;
  while (headerEnd < lines.length && lines[headerEnd].includes('SPDX-')) {
    headerEnd++;
  }

  const text = sourceCode.getText();
  let replaceStart = 0;
  for (let i = 0; i < headerStart; i++) {
    const nl = text.indexOf('\n', replaceStart);
    replaceStart = nl === -1 ? text.length : nl + 1;
  }
  let replaceEnd = replaceStart;
  for (let i = headerStart; i < headerEnd; i++) {
    const nl = text.indexOf('\n', replaceEnd);
    replaceEnd = nl === -1 ? text.length : nl + 1;
  }

  const year = existingYear ?? new Date().getFullYear().toString();
  const copyrightLine = `${patterns.prefix}SPDX-FileCopyrightText: Copyright (c) ${year} ${COPYRIGHT_HOLDER}${patterns.suffix}`;
  const identifierLine = `${patterns.prefix}SPDX-License-Identifier: ${LICENSE}${patterns.suffix}`;
  let replacement = `${copyrightLine}\n${identifierLine}\n`;

  const nextLine = lines[headerEnd];
  if (nextLine !== undefined && nextLine.trim() !== '') {
    replacement += '\n';
  }
  if (headerStart > 0 && lines[headerStart - 1]?.trim() !== '') {
    replacement = `\n${replacement}`;
  }

  return fixer => fixer.replaceTextRange([replaceStart, replaceEnd], replacement);
}

function extractYear(lines) {
  for (const line of lines) {
    if (line.includes('SPDX-FileCopyrightText:')) {
      const match = line.match(YEAR_PATTERN);
      if (match) return match[1];
    }
  }
  return null;
}

function check(context) {
  const sourceCode = context.sourceCode;
  const lines = sourceCode.lines ?? [];
  const headerStart = findHeaderStart(lines);
  const line0 = lines[headerStart] ?? '';
  const line1 = lines[headerStart + 1] ?? '';
  const patterns = patternsFor(context.filename);

  const line0Info = analyzeLine(line0, patterns);
  const line1Info = analyzeLine(line1, patterns);
  const messageId = selectMessage(line0Info, line1Info);
  if (messageId === null) return;

  const existingYear = extractYear(lines);
  const reportLine = headerStart + 1;

  context.report({
    loc: {
      start: { line: reportLine, column: 0 },
      end: { line: reportLine, column: Math.max(1, line0.length) }
    },
    messageId,
    fix: buildFixer(sourceCode, patterns, existingYear, headerStart)
  });
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    name: 'require-spdx-header',
    docs: {
      description: 'Require the standard SPDX copyright and license header at the top of source files.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    fixable: 'code',
    messages: {
      'missing-header': 'File must start with the SPDX copyright and license header. Run `eslint --fix` to insert it.',
      'missing-copyright': 'File is missing the `SPDX-FileCopyrightText` header line.',
      'missing-identifier': 'File is missing the `SPDX-License-Identifier` header line.',
      'invalid-copyright': `\`SPDX-FileCopyrightText\` line must read \`Copyright (c) YYYY ${COPYRIGHT_HOLDER}\`.`,
      'invalid-identifier': `\`SPDX-License-Identifier\` line must read \`${LICENSE}\`.`,
      'wrong-comment-style':
        'SPDX header uses the wrong comment syntax for this file type. TypeScript files use `//`, CSS files use `/* … */`.'
    }
  },
  create(context) {
    const handler = () => check(context);
    return {
      Program: handler,
      StyleSheet: handler
    };
  }
};
