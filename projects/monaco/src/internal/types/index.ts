/**
 * Severity levels for problems, mirroring Monaco's MarkerSeverity enum.
 */
export const ProblemSeverity = {
  Hint: 1,
  Info: 2,
  Warning: 4,
  Error: 8
} as const;

/**
 * Severity level values for problems, mirroring Monaco's MarkerSeverity enum values.
 */
export type ProblemSeverityValue = (typeof ProblemSeverity)[keyof typeof ProblemSeverity];

/**
 * A JSON-serializable interface for describing problems, compatible with Monaco's IMarker interface.
 */
export interface Problem {
  owner: string;
  resource: string | { toString(): string };
  severity: ProblemSeverityValue;
  message: string;
  source?: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}
