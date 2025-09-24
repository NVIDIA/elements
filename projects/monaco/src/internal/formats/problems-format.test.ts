import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import * as monaco from '@nvidia-elements/monaco';

import type { Problem } from '../types/index.js';

import { EditorDecorator, toProblemsFormat, toSeverityIcon, toSeverityLabel } from './problems-format.js';
import type { SeverityLabel } from './problems-format.js';

const createMockProblem = (overrides: Partial<Problem> = {}): Problem => ({
  owner: 'test-owner',
  resource: 'file:///test/path/file.ts',
  severity: 8, // Error
  message: 'Test error message',
  source: 'test-source',
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
      const result = toProblemsFormat([]);

      expect(result.text).toBe('');
      expect(result.getProblemByLine(1)).toBeUndefined();
    });

    it('should convert single problem to problems format', () => {
      const problems = [createMockProblem()];
      const result = toProblemsFormat(problems);

      // prettier-ignore
      expect(result.text).toBe(`\
"file.ts" "/test/path/file.ts" 1
	error "Test error message" "test-source" [Ln 1, Col 1]`
      );
    });

    it('should group problems by file URI', () => {
      const problems = [
        createMockProblem({ resource: 'file:///test/path/file1.ts', message: 'Error 1' }),
        createMockProblem({ resource: 'file:///test/path/file2.ts', message: 'Error 2' }),
        createMockProblem({ resource: 'file:///test/path/file1.ts', message: 'Error 3' })
      ];

      const result = toProblemsFormat(problems);

      // prettier-ignore
      expect(result.text).toBe(`\
"file1.ts" "/test/path/file1.ts" 2
	error "Error 1" "test-source" [Ln 1, Col 1]
	error "Error 3" "test-source" [Ln 1, Col 1]
"file2.ts" "/test/path/file2.ts" 1
	error "Error 2" "test-source" [Ln 1, Col 1]`
      );
    });

    it('should sort problems by severity, line number, and column', () => {
      const problems = [
        createMockProblem({ severity: 2, startLineNumber: 10, startColumn: 5 }), // Info
        createMockProblem({ severity: 8, startLineNumber: 1, startColumn: 1 }), // Error
        createMockProblem({ severity: 4, startLineNumber: 5, startColumn: 3 }), // Warning
        createMockProblem({ severity: 8, startLineNumber: 1, startColumn: 2 }) // Error, same line, different column
      ];

      const result = toProblemsFormat(problems);

      // prettier-ignore
      expect(result.text).toBe(`\
"file.ts" "/test/path/file.ts" 4
	error "Test error message" "test-source" [Ln 1, Col 1]
	error "Test error message" "test-source" [Ln 1, Col 2]
	warning "Test error message" "test-source" [Ln 5, Col 3]
	info "Test error message" "test-source" [Ln 10, Col 5]`
      );
    });

    it('should sort file URIs alphabetically', () => {
      const problems = [
        createMockProblem({ resource: 'file:///test/path/zeta.ts' }),
        createMockProblem({ resource: 'file:///test/path/alpha.ts' }),
        createMockProblem({ resource: 'file:///test/path/beta.ts' })
      ];

      const result = toProblemsFormat(problems);

      // prettier-ignore
      expect(result.text).toBe(`\
"alpha.ts" "/test/path/alpha.ts" 1
	error "Test error message" "test-source" [Ln 1, Col 1]
"beta.ts" "/test/path/beta.ts" 1
	error "Test error message" "test-source" [Ln 1, Col 1]
"zeta.ts" "/test/path/zeta.ts" 1
	error "Test error message" "test-source" [Ln 1, Col 1]`
      );
    });

    it('should handle problems with different severity levels', () => {
      const problems = [
        createMockProblem({ severity: 1, message: 'Hint message' }), // Hint
        createMockProblem({ severity: 2, message: 'Info message' }), // Info
        createMockProblem({ severity: 4, message: 'Warning message' }), // Warning
        createMockProblem({ severity: 8, message: 'Error message' }) // Error
      ];

      const result = toProblemsFormat(problems);

      // prettier-ignore
      expect(result.text).toBe(`\
"file.ts" "/test/path/file.ts" 4
	error "Error message" "test-source" [Ln 1, Col 1]
	warning "Warning message" "test-source" [Ln 1, Col 1]
	info "Info message" "test-source" [Ln 1, Col 1]
	hint "Hint message" "test-source" [Ln 1, Col 1]`
      );
    });

    it('should handle problems without source', () => {
      const problems = [createMockProblem({ source: undefined })];
      const result = toProblemsFormat(problems);

      // prettier-ignore
      expect(result.text).toBe(`\
"file.ts" "/test/path/file.ts" 1
	error "Test error message" "" [Ln 1, Col 1]`
      );
    });

    it('should escape quotes in problem messages and sources', () => {
      const problems = [
        createMockProblem({
          message: 'Message with "quotes" inside',
          source: 'Source with "quotes" too'
        })
      ];

      const result = toProblemsFormat(problems);

      // prettier-ignore
      expect(result.text).toBe(`\
"file.ts" "/test/path/file.ts" 1
	error "Message with \\"quotes\\" inside" "Source with \\"quotes\\" too" [Ln 1, Col 1]`
      );
    });

    it('should handle file paths with special characters', () => {
      const problems = [
        createMockProblem({ resource: 'file:///test/path/file with spaces.ts' }),
        createMockProblem({ resource: 'file:///test/path/file-with-dashes.ts' }),
        createMockProblem({ resource: 'file:///test/path/file_with_underscores.ts' })
      ];

      const result = toProblemsFormat(problems);

      // prettier-ignore
      expect(result.text).toBe(`\
"file with spaces.ts" "/test/path/file with spaces.ts" 1
	error "Test error message" "test-source" [Ln 1, Col 1]
"file-with-dashes.ts" "/test/path/file-with-dashes.ts" 1
	error "Test error message" "test-source" [Ln 1, Col 1]
"file_with_underscores.ts" "/test/path/file_with_underscores.ts" 1
	error "Test error message" "test-source" [Ln 1, Col 1]`
      );
    });

    it('should escape quotes in file paths and problem messages and sources', () => {
      const problems = [
        createMockProblem({
          resource: 'file:///test/path with "quotes"/file with "quotes".ts',
          message: 'message with "quotes" inside',
          source: 'source with "quotes"'
        })
      ];

      const result = toProblemsFormat(problems);

      // prettier-ignore
      expect(result.text).toBe(`\
"file with \\"quotes\\".ts" "/test/path with \\"quotes\\"/file with \\"quotes\\".ts" 1
	error "message with \\"quotes\\" inside" "source with \\"quotes\\"" [Ln 1, Col 1]`
      );
    });

    it('should throw if supplied an invalid severity number', () => {
      const problems = [{ ...createMockProblem(), severity: 9 }];
      expect(() => toProblemsFormat(problems as Problem[])).toThrow('Unknown severity: 9');
    });

    it('should provide getProblemByLine function that returns correct problems', () => {
      const problems = [
        createMockProblem({ message: 'First problem' }),
        createMockProblem({ message: 'Second problem' })
      ];

      const result = toProblemsFormat(problems);

      expect(result.getProblemByLine(1)).toBe(undefined); // File line
      expect(result.getProblemByLine(2)).toBe(problems[0]); // Problem line
      expect(result.getProblemByLine(3)).toBe(problems[1]); // Problem line
      expect(result.getProblemByLine(4)).toBeUndefined(); // Non-existent line
    });
  });

  describe('EditorDecorator', () => {
    let editor: monaco.editor.IStandaloneCodeEditor;
    let model: monaco.editor.ITextModel;

    let decorator: EditorDecorator;

    let createDecorationsCollectionSpy: Mock<
      (decorations?: monaco.editor.IModelDeltaDecoration[]) => monaco.editor.IEditorDecorationsCollection
    >;

    let lineDecorationsCollectionSetSpy: Mock<
      (decorations: readonly monaco.editor.IModelDeltaDecoration[]) => string[]
    >;
    let selectedLineDecorationsCollectionSetSpy: Mock<
      (decorations: readonly monaco.editor.IModelDeltaDecoration[]) => string[]
    >;
    let hoveredLineDecorationsCollectionSetSpy: Mock<
      (decorations: readonly monaco.editor.IModelDeltaDecoration[]) => string[]
    >;

    beforeEach(async () => {
      editor = monaco.editor.create(document.body, {
        value: '',
        language: 'problems'
      });
      model = editor.getModel();

      createDecorationsCollectionSpy = vi.spyOn(editor, 'createDecorationsCollection');

      decorator = new EditorDecorator(monaco, editor);

      const lineDecorationsCollection: monaco.editor.IEditorDecorationsCollection =
        createDecorationsCollectionSpy.mock.results[0].value;
      const electedLineDecorationsCollection: monaco.editor.IEditorDecorationsCollection =
        createDecorationsCollectionSpy.mock.results[1].value;
      const hoveredLineDecorationsCollection: monaco.editor.IEditorDecorationsCollection =
        createDecorationsCollectionSpy.mock.results[2].value;

      lineDecorationsCollectionSetSpy = vi.spyOn(lineDecorationsCollection, 'set');
      selectedLineDecorationsCollectionSetSpy = vi.spyOn(electedLineDecorationsCollection, 'set');
      hoveredLineDecorationsCollectionSetSpy = vi.spyOn(hoveredLineDecorationsCollection, 'set');
    });

    afterEach(() => {
      lineDecorationsCollectionSetSpy.mockRestore();
      selectedLineDecorationsCollectionSetSpy.mockRestore();
      hoveredLineDecorationsCollectionSetSpy.mockRestore();

      createDecorationsCollectionSpy.mockRestore();

      editor.dispose();
    });

    it('should create decoration collections on construction', () => {
      expect(createDecorationsCollectionSpy).toHaveBeenCalledTimes(3);
    });

    it('should decorate model lines', () => {
      model.setValue(`\
"file.ts" "/test/path/file.ts" 1
	error "Test error message" "test-source" [Ln 1, Col 1]`);

      decorator.decorateLines(model);

      expect(lineDecorationsCollectionSetSpy).toHaveBeenCalledWith([
        {
          options: {
            className: 'problems-decoration problems-line',
            isWholeLine: true
          },
          range: expect.objectContaining({
            endColumn: 1,
            endLineNumber: 1,
            startColumn: 1,
            startLineNumber: 1
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-quote'
          },
          range: expect.objectContaining({
            endColumn: 2,
            endLineNumber: 1,
            startColumn: 1,
            startLineNumber: 1
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-file'
          },
          range: expect.objectContaining({
            endColumn: 9,
            endLineNumber: 1,
            startColumn: 2,
            startLineNumber: 1
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-quote'
          },
          range: expect.objectContaining({
            endColumn: 10,
            endLineNumber: 1,
            startColumn: 9,
            startLineNumber: 1
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-quote'
          },
          range: expect.objectContaining({
            endColumn: 12,
            endLineNumber: 1,
            startColumn: 11,
            startLineNumber: 1
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-path'
          },
          range: expect.objectContaining({
            endColumn: 30,
            endLineNumber: 1,
            startColumn: 12,
            startLineNumber: 1
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-quote'
          },
          range: expect.objectContaining({
            endColumn: 31,
            endLineNumber: 1,
            startColumn: 30,
            startLineNumber: 1
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-count'
          },
          range: expect.objectContaining({
            endColumn: 33,
            endLineNumber: 1,
            startColumn: 32,
            startLineNumber: 1
          })
        },
        {
          options: {
            className: 'problems-decoration problems-line',
            isWholeLine: true
          },
          range: expect.objectContaining({
            endColumn: 1,
            endLineNumber: 2,
            startColumn: 1,
            startLineNumber: 2
          })
        },
        {
          options: {
            beforeContentClassName: 'problems-decoration codicon codicon-error',
            inlineClassName: 'problems-decoration severity-label'
          },
          range: expect.objectContaining({
            endColumn: 7,
            endLineNumber: 2,
            startColumn: 2,
            startLineNumber: 2
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-quote'
          },
          range: expect.objectContaining({
            endColumn: 9,
            endLineNumber: 2,
            startColumn: 8,
            startLineNumber: 2
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-message'
          },
          range: expect.objectContaining({
            endColumn: 27,
            endLineNumber: 2,
            startColumn: 9,
            startLineNumber: 2
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-quote'
          },
          range: expect.objectContaining({
            endColumn: 28,
            endLineNumber: 2,
            startColumn: 27,
            startLineNumber: 2
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-quote'
          },
          range: expect.objectContaining({
            endColumn: 30,
            endLineNumber: 2,
            startColumn: 29,
            startLineNumber: 2
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-code'
          },
          range: expect.objectContaining({
            endColumn: 41,
            endLineNumber: 2,
            startColumn: 30,
            startLineNumber: 2
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-quote'
          },
          range: expect.objectContaining({
            endColumn: 42,
            endLineNumber: 2,
            startColumn: 41,
            startLineNumber: 2
          })
        },
        {
          options: {
            inlineClassName: 'problems-decoration problem-position'
          },
          range: expect.objectContaining({
            endColumn: 56,
            endLineNumber: 2,
            startColumn: 43,
            startLineNumber: 2
          })
        }
      ]);
    });

    it('should throw if provided an invalid file line', () => {
      // prettier-ignore
      model.setValue(`\
invalid file line
	error "Test error message" "test-source" [Ln 1, Col 1]`
      );
      expect(() => decorator.decorateLines(model)).toThrow('Invalid input: "invalid file line"');
    });

    it('should throw if provided an invalid problem line', () => {
      // prettier-ignore
      model.setValue(`\
"file.ts" "/test/path/file.ts" 1
	invalid problem line`
      );

      expect(() => decorator.decorateLines(model)).toThrow('Invalid input: "	invalid problem line"');
    });

    it('should decorate selected line', () => {
      decorator.decorateSelectedLine(5);

      expect(selectedLineDecorationsCollectionSetSpy).toHaveBeenCalledWith([
        {
          options: {
            className: 'problems-decoration problems-line-selected',
            isWholeLine: true
          },
          range: expect.objectContaining({
            endColumn: 1,
            endLineNumber: 5,
            startColumn: 1,
            startLineNumber: 5
          })
        }
      ]);
    });

    it('should clear selected line decorations when line number is undefined', () => {
      decorator.decorateSelectedLine(undefined);

      expect(selectedLineDecorationsCollectionSetSpy).toHaveBeenCalledWith([]);
    });

    it('should decorate hovered line', () => {
      decorator.decorateHoveredLine(10);

      expect(hoveredLineDecorationsCollectionSetSpy).toHaveBeenCalledWith([
        {
          options: {
            className: 'problems-decoration problems-line-hovered',
            isWholeLine: true
          },
          range: expect.objectContaining({
            endColumn: 1,
            endLineNumber: 10,
            startColumn: 1,
            startLineNumber: 10
          })
        }
      ]);
    });

    it('should clear hovered line decorations when line number is undefined', () => {
      decorator.decorateHoveredLine(undefined);

      expect(hoveredLineDecorationsCollectionSetSpy).toHaveBeenCalledWith([]);
    });
  });
});
