import { describe, expect, it } from 'vitest';

import * as monaco from '@nvidia-elements/monaco';

import type { Problem } from '../types/index.js';

import {
  toHoveredLineDecorations,
  toProblemsFormat,
  toSelectedLineDecorations,
  toSeverityIcon,
  toSeverityLabel
} from './problems-format.js';
import type { SeverityLabel } from './problems-format.js';

const createMockProblem = (overrides: Partial<Problem> = {}): Problem => ({
  owner: 'test-owner',
  resource: 'file:///test/path/file.ts',
  severity: 8, // Error
  message: 'Test error message',
  source: 'test',
  code: '1234',
  startLineNumber: 1,
  startColumn: 1,
  endLineNumber: 1,
  endColumn: 10,
  ...overrides
});

describe('problems-format', () => {
  describe('toSeverityLabel', () => {
    it('should convert severity number to severity label', () => {
      expect(toSeverityLabel(1)).toBe('hint');
      expect(toSeverityLabel(2)).toBe('info');
      expect(toSeverityLabel(4)).toBe('warning');
      expect(toSeverityLabel(8)).toBe('error');
    });
    it('should throw if supplied an invalid severity number', () => {
      expect(() => toSeverityLabel(9)).toThrow('Unknown severity: 9');
    });
  });

  describe('toSeverityIcon', () => {
    it('should convert severity label to corresponding codicon icon', () => {
      expect(toSeverityIcon('hint')).toBe('codicon-info');
      expect(toSeverityIcon('info')).toBe('codicon-info');
      expect(toSeverityIcon('warning')).toBe('codicon-warning');
      expect(toSeverityIcon('error')).toBe('codicon-error');
    });
    it('should throw if supplied an invalid severity label', () => {
      expect(() => toSeverityIcon('unknown' as SeverityLabel)).toThrow('Unknown severity label: unknown');
    });
  });

  describe('toProblemsFormat', () => {
    it('should convert empty problems array to empty text', () => {
      const result = toProblemsFormat(monaco, []);

      expect(result.text).toBe('');
      expect(result.decorations.length).toEqual(0);
      expect(result.getProblemByLine(1)).toBeUndefined();
    });

    it('should convert single problem to problems format', () => {
      const problems = [createMockProblem()];
      const result = toProblemsFormat(monaco, problems);

      // prettier-ignore
      expect(result.text).toBe(`\
file.ts /test/path/file.ts 1
  error Test error message test(1234) [Ln 1, Col 1]`
      );
      expect(result.decorations.length).toEqual(9);
    });

    it('should group problems by file URI', () => {
      const problems = [
        createMockProblem({ resource: 'file:///test/path/file1.ts', message: 'Error 1' }),
        createMockProblem({ resource: 'file:///test/path/file2.ts', message: 'Error 2' }),
        createMockProblem({ resource: 'file:///test/path/file1.ts', message: 'Error 3' })
      ];

      const result = toProblemsFormat(monaco, problems);

      // prettier-ignore
      expect(result.text).toBe(`\
file1.ts /test/path/file1.ts 2
  error Error 1 test(1234) [Ln 1, Col 1]
  error Error 3 test(1234) [Ln 1, Col 1]
file2.ts /test/path/file2.ts 1
  error Error 2 test(1234) [Ln 1, Col 1]`
      );
      expect(result.decorations.length).toEqual(23);
    });

    it('should sort problems by severity, line number, and column', () => {
      const problems = [
        createMockProblem({ severity: 2, startLineNumber: 10, startColumn: 5 }), // Info
        createMockProblem({ severity: 8, startLineNumber: 1, startColumn: 1 }), // Error
        createMockProblem({ severity: 4, startLineNumber: 5, startColumn: 3 }), // Warning
        createMockProblem({ severity: 8, startLineNumber: 1, startColumn: 2 }) // Error, same line, different column
      ];

      const result = toProblemsFormat(monaco, problems);

      // prettier-ignore
      expect(result.text).toBe(`\
file.ts /test/path/file.ts 4
  error Test error message test(1234) [Ln 1, Col 1]
  error Test error message test(1234) [Ln 1, Col 2]
  warning Test error message test(1234) [Ln 5, Col 3]
  info Test error message test(1234) [Ln 10, Col 5]`
      );
      expect(result.decorations.length).toEqual(24);
    });

    it('should sort file URIs alphabetically', () => {
      const problems = [
        createMockProblem({ resource: 'file:///test/path/zeta.ts' }),
        createMockProblem({ resource: 'file:///test/path/alpha.ts' }),
        createMockProblem({ resource: 'file:///test/path/beta.ts' })
      ];

      const result = toProblemsFormat(monaco, problems);

      // prettier-ignore
      expect(result.text).toBe(`\
alpha.ts /test/path/alpha.ts 1
  error Test error message test(1234) [Ln 1, Col 1]
beta.ts /test/path/beta.ts 1
  error Test error message test(1234) [Ln 1, Col 1]
zeta.ts /test/path/zeta.ts 1
  error Test error message test(1234) [Ln 1, Col 1]`
      );
      expect(result.decorations.length).toEqual(27);
    });

    it('should handle problems with different severity levels', () => {
      const problems = [
        createMockProblem({ severity: 1, message: 'Hint message' }), // Hint
        createMockProblem({ severity: 2, message: 'Info message' }), // Info
        createMockProblem({ severity: 4, message: 'Warning message' }), // Warning
        createMockProblem({ severity: 8, message: 'Error message' }) // Error
      ];

      const result = toProblemsFormat(monaco, problems);

      // prettier-ignore
      expect(result.text).toBe(`\
file.ts /test/path/file.ts 4
  error Error message test(1234) [Ln 1, Col 1]
  warning Warning message test(1234) [Ln 1, Col 1]
  info Info message test(1234) [Ln 1, Col 1]
  hint Hint message test(1234) [Ln 1, Col 1]`
      );
      expect(result.decorations.length).toEqual(24);
    });

    it('should handle problems with code value and target', () => {
      const problems = [createMockProblem({ code: { value: '1234', target: 'test' } })];
      const result = toProblemsFormat(monaco, problems);
      // prettier-ignore
      expect(result.text).toBe(`\
file.ts /test/path/file.ts 1
  error Test error message test(1234) [Ln 1, Col 1]`
              );
      expect(result.decorations.length).toEqual(9);
    });

    it('should handle problems without source', () => {
      const problems = [createMockProblem({ source: undefined })];
      const result = toProblemsFormat(monaco, problems);

      // prettier-ignore
      expect(result.text).toBe(`\
file.ts /test/path/file.ts 1
  error Test error message (1234) [Ln 1, Col 1]`
      );
      expect(result.decorations.length).toEqual(9);
    });

    it('should handle problems with neither source nor code', () => {
      const problems = [createMockProblem({ source: undefined, code: undefined })];
      const result = toProblemsFormat(monaco, problems);

      // prettier-ignore
      expect(result.text).toBe(`\
file.ts /test/path/file.ts 1
  error Test error message [Ln 1, Col 1]`
      );
      expect(result.decorations.length).toEqual(8);
    });

    it('should handle file paths with special characters', () => {
      const problems = [
        createMockProblem({ resource: 'file:///test/path/file with spaces.ts' }),
        createMockProblem({ resource: 'file:///test/path/file-with-dashes.ts' }),
        createMockProblem({ resource: 'file:///test/path/file_with_underscores.ts' })
      ];

      const result = toProblemsFormat(monaco, problems);

      // prettier-ignore
      expect(result.text).toBe(`\
file with spaces.ts /test/path/file with spaces.ts 1
  error Test error message test(1234) [Ln 1, Col 1]
file-with-dashes.ts /test/path/file-with-dashes.ts 1
  error Test error message test(1234) [Ln 1, Col 1]
file_with_underscores.ts /test/path/file_with_underscores.ts 1
  error Test error message test(1234) [Ln 1, Col 1]`
      );
      expect(result.decorations.length).toEqual(27);
    });

    it('should throw if supplied an invalid severity number', () => {
      const problems = [{ ...createMockProblem(), severity: 9 }];
      expect(() => toProblemsFormat(monaco, problems as Problem[])).toThrow('Unknown severity: 9');
    });

    it('should return decorations for the supplied problems', () => {
      const problems = [
        createMockProblem({
          resource: 'file:///test/path/file1.ts',
          severity: 1,
          message: 'Hint message',
          startLineNumber: 10,
          startColumn: 5
        }),
        createMockProblem({
          resource: 'file:///test/path/file2.ts',
          severity: 2,
          message: 'Info message',
          startLineNumber: 1,
          startColumn: 1
        }),
        createMockProblem({
          resource: 'file:///test/path/file1.ts',
          severity: 4,
          message: 'Warning message',
          startLineNumber: 5,
          startColumn: 3
        })
      ];
      const result = toProblemsFormat(monaco, problems);
      // prettier-ignore
      expect(result.text).toEqual(`\
file1.ts /test/path/file1.ts 2
  warning Warning message test(1234) [Ln 5, Col 3]
  hint Hint message test(1234) [Ln 10, Col 5]
file2.ts /test/path/file2.ts 1
  info Info message test(1234) [Ln 1, Col 1]`);
      expect(result.decorations).toEqual([
        {
          range: expect.objectContaining({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
          }),
          options: {
            isWholeLine: true,
            className: 'problems-decoration problems-line'
          }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 9
          }),
          options: { inlineClassName: 'problems-decoration problem-file' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 1,
            startColumn: 10,
            endLineNumber: 1,
            endColumn: 29
          }),
          options: { inlineClassName: 'problems-decoration problem-path' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 1,
            startColumn: 30,
            endLineNumber: 1,
            endColumn: 31
          }),
          options: { inlineClassName: 'problems-decoration problem-count' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 2,
            startColumn: 1,
            endLineNumber: 2,
            endColumn: 1
          }),
          options: {
            isWholeLine: true,
            className: 'problems-decoration problems-line'
          }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 2,
            startColumn: 3,
            endLineNumber: 2,
            endColumn: 10
          }),
          options: {
            beforeContentClassName: 'problems-decoration codicon codicon-warning',
            inlineClassName: 'problems-decoration severity-label'
          }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 2,
            startColumn: 11,
            endLineNumber: 2,
            endColumn: 26
          }),
          options: { inlineClassName: 'problems-decoration problem-message' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 2,
            startColumn: 27,
            endLineNumber: 2,
            endColumn: 37
          }),
          options: { inlineClassName: 'problems-decoration problem-source-code' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 2,
            startColumn: 38,
            endLineNumber: 2,
            endColumn: 51
          }),
          options: { inlineClassName: 'problems-decoration problem-position' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 3,
            startColumn: 1,
            endLineNumber: 3,
            endColumn: 1
          }),
          options: {
            isWholeLine: true,
            className: 'problems-decoration problems-line'
          }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 3,
            startColumn: 3,
            endLineNumber: 3,
            endColumn: 7
          }),
          options: {
            beforeContentClassName: 'problems-decoration codicon codicon-info',
            inlineClassName: 'problems-decoration severity-label'
          }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 3,
            startColumn: 8,
            endLineNumber: 3,
            endColumn: 20
          }),
          options: { inlineClassName: 'problems-decoration problem-message' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 3,
            startColumn: 21,
            endLineNumber: 3,
            endColumn: 31
          }),
          options: { inlineClassName: 'problems-decoration problem-source-code' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 3,
            startColumn: 32,
            endLineNumber: 3,
            endColumn: 46
          }),
          options: { inlineClassName: 'problems-decoration problem-position' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 4,
            startColumn: 1,
            endLineNumber: 4,
            endColumn: 1
          }),
          options: {
            isWholeLine: true,
            className: 'problems-decoration problems-line'
          }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 4,
            startColumn: 1,
            endLineNumber: 4,
            endColumn: 9
          }),
          options: { inlineClassName: 'problems-decoration problem-file' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 4,
            startColumn: 10,
            endLineNumber: 4,
            endColumn: 29
          }),
          options: { inlineClassName: 'problems-decoration problem-path' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 4,
            startColumn: 30,
            endLineNumber: 4,
            endColumn: 31
          }),
          options: { inlineClassName: 'problems-decoration problem-count' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 5,
            startColumn: 1,
            endLineNumber: 5,
            endColumn: 1
          }),
          options: {
            isWholeLine: true,
            className: 'problems-decoration problems-line'
          }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 5,
            startColumn: 3,
            endLineNumber: 5,
            endColumn: 7
          }),
          options: {
            beforeContentClassName: 'problems-decoration codicon codicon-info',
            inlineClassName: 'problems-decoration severity-label'
          }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 5,
            startColumn: 8,
            endLineNumber: 5,
            endColumn: 20
          }),
          options: { inlineClassName: 'problems-decoration problem-message' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 5,
            startColumn: 21,
            endLineNumber: 5,
            endColumn: 31
          }),
          options: { inlineClassName: 'problems-decoration problem-source-code' }
        },
        {
          range: expect.objectContaining({
            startLineNumber: 5,
            startColumn: 32,
            endLineNumber: 5,
            endColumn: 45
          }),
          options: { inlineClassName: 'problems-decoration problem-position' }
        }
      ]);
    });

    it('should provide getProblemByLine function that returns correct problems', () => {
      const problems = [
        createMockProblem({
          resource: 'file:///test/path/file1.ts',
          severity: 1,
          message: 'Hint message',
          startLineNumber: 10,
          startColumn: 5
        }),
        createMockProblem({
          resource: 'file:///test/path/file2.ts',
          severity: 2,
          message: 'Info message',
          startLineNumber: 1,
          startColumn: 1
        }),
        createMockProblem({
          resource: 'file:///test/path/file1.ts',
          severity: 4,
          message: 'Warning message',
          startLineNumber: 5,
          startColumn: 3
        })
      ];

      const result = toProblemsFormat(monaco, problems);

      expect(result.getProblemByLine(1)).toBe(undefined); // File line
      expect(result.getProblemByLine(2)).toBe(problems[2]); // Problem line
      expect(result.getProblemByLine(3)).toBe(problems[0]); // Problem line
      expect(result.getProblemByLine(4)).toBe(undefined); // File line
      expect(result.getProblemByLine(5)).toBe(problems[1]); // Problem line
      expect(result.getProblemByLine(6)).toBeUndefined(); // Non-existent line
    });
  });

  describe('toSelectedLineDecorations', () => {
    it('should return decoration for selected line', () => {
      const decorations = toSelectedLineDecorations(monaco, 5);

      expect(decorations).toEqual([
        {
          range: expect.objectContaining({
            startLineNumber: 5,
            startColumn: 1,
            endLineNumber: 5,
            endColumn: 1
          }),
          options: {
            isWholeLine: true,
            className: 'problems-decoration problems-line-selected'
          }
        }
      ]);
    });

    it('should return empty array when line number is undefined', () => {
      const decorations = toSelectedLineDecorations(monaco, undefined);

      expect(decorations).toEqual([]);
    });
  });

  describe('toHoveredLineDecorations', () => {
    it('should return decoration for hovered line', () => {
      const decorations = toHoveredLineDecorations(monaco, 10);

      expect(decorations).toEqual([
        {
          range: expect.objectContaining({
            startLineNumber: 10,
            startColumn: 1,
            endLineNumber: 10,
            endColumn: 1
          }),
          options: {
            isWholeLine: true,
            className: 'problems-decoration problems-line-hovered'
          }
        }
      ]);
    });

    it('should return empty array when line number is undefined', () => {
      const decorations = toHoveredLineDecorations(monaco, undefined);

      expect(decorations).toEqual([]);
    });
  });
});
