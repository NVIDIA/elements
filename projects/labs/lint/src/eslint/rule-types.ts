/**
 * Cast a parser-specific node (HTML or CSS) to a type compatible with ESLint APIs
 * (context.report, fixer.replaceText, sourceCode.getText, etc.).
 *
 * Required because @html-eslint and CSS parsers produce nodes that are
 * structurally like ESTree nodes but do not extend them in the type system.
 * The return type must be `any` to match all ESLint API signatures.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asNode(node: unknown): any {
  return node;
}

/**
 * Cast a parser-specific node to a type compatible with RuleFixer methods
 * (replaceText, insertTextBefore, etc.). Alias for asNode.
 */
export const asFixTarget = asNode;

/** HTML tag node from @html-eslint parser */
export interface HtmlTagNode {
  type: string;
  name: string;
  parent?: HtmlTagNode;
  children?: HtmlTagNode[];
  attributes?: HtmlAttribute[];
  value?: string;
  openStart: { range: [number, number] };
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
  range?: [number, number];
  [key: string]: unknown;
  key?: string;
  kind?: string;
  method?: string;
  shorthand?: boolean;
  computed?: boolean;
}

/** HTML attribute node from @html-eslint parser */
export interface HtmlAttribute {
  type: string;
  key?: { value: string };
  value?: { value: string };
  startWrapper?: { value: string };
  endWrapper?: { value: string };
  range?: [number, number];
  name?: string;
  [key: string]: unknown;
}

/** CSS declaration node from CSS parser */
export interface CssDeclarationNode {
  type: string;
  property: string;
  name?: string;
  prelude?: unknown;
  value: {
    value: string;
    children: CssValueChild[];
  };
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
  range?: [number, number];
  [key: string]: unknown;
}

/** CSS at-rule node from CSS parser */
export interface CssAtRuleNode {
  type: string;
  name: string;
  prelude?: unknown;
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
  range?: [number, number];
  [key: string]: unknown;
}

/** CSS value child node */
export interface CssValueChild {
  type: string;
  name: string;
  value?: string;
  unit?: string;
  children?: CssValueChild[];
  [key: string]: unknown;
}
