// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @summary A project is a collection of metadata about a published package/project.
 */
export interface Project {
  name: string;
  version: string;
  description: string;
  readme: string;
  changelog: string;
}

/**
 * @summary A projects exported interface/types.
 */
export interface ProjectTypes {
  name: string;
  type: string;
  description: string;
}

/**
 * @summary A project element is a collection of metadata about a custom element in a project.
 */
export interface Element {
  name: string;
  changelog?: string;
  manifest?: CustomElementManifest;
  markdown?: string;
  package?: string;
  version?: string;
}

/**
 * @summary Elements in HTML have attributes; these are extra values that configure the elements or adjust their behavior to meet the criteria the users want.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes
 */
export interface Attribute {
  name: string;
  description: string;
  example: string;
  markdown: string;
  values: {
    name: string;
    description?: string;
  }[];
}

/**
 * @summary A token is a named value for a CSS theme.
 * @see https://www.designtokens.org/
 */
export interface Token {
  name: string;
  value: string;
  description: string;
}

/**
 * @summary Category that describes the example. Used for filtering and sorting as well as MCP search capabilities.
 */
export type ExampleTag = 'priority' | 'performance' | 'pattern' | 'anti-pattern' | 'test-case';

/**
 * @summary An example is a template that can show an API, specific use case, or pattern.
 */
export interface Example {
  id: string;
  name: string;
  template: string;
  summary: string;
  description: string;
  composition: boolean;
  tags: ExampleTag[];
  deprecated?: boolean;
  entrypoint?: string;
  element?: string;
}

/**
 * @summary A node/npm package.json file contains metadata about a package.
 * @see https://docs.npmjs.com/cli/v11/configuring-npm/package-json
 */
export interface Package {
  name: string;
  version: string;
  description: string;
  homepage: string;
  repository: {
    type: string;
    url: string;
  };
  type: string;
  files: string[];
  sideEffects: string[];
  exports: {
    default: string;
    types: string;
    import: string;
  };
  dependencies: {
    [key: string]: string;
  };
  devDependencies: {
    [key: string]: string;
  };
}

/**
 * @summary A Custom Elements Manifest is a JSON file that describes the custom elements in a project. (custom-elements.json)
 * @see https://github.com/webcomponents/custom-elements-manifest
 */
export interface CustomElementsManifest {
  modules: {
    kind: string;
    path: string;
    declarations: CustomElementManifest[];
    exports: {
      kind: string;
      name: string;
      declaration: {
        name: string;
        module: string;
      };
    }[];
  }[];
}

/**
 * @summary A Custom Elements Manifest declaration is a description of a custom element.
 * @see https://github.com/webcomponents/custom-elements-manifest
 */
export interface CustomElementManifest {
  tagName: string;
  customElement: boolean;
  kind: string;
  path: string;
  name: string;
  description: string;
  deprecated: string;
  cssParts: {
    name: string;
    description: string;
  }[];
  cssProperties: {
    name: string;
    description: string;
  }[];
  slots: {
    name: string;
    description: string;
  }[];
  members: {
    deprecated: boolean;
    kind: string;
    name: string;
    description: string;
    attribute: string;
    default: string;
    reflects: boolean;
    type: {
      text: string;
      description?: string;
      descriptionText?: string;
      values?: {
        name: string;
        description?: string;
      }[];
    };
  }[];
  attributes: {
    name: string;
    deprecated: boolean;
    type: {
      text: string;
      description?: string;
      values?: {
        value: string;
        description?: string;
      }[];
    };
    default: string;
    description: string;
    fieldName: string;
  }[];
  events: {
    name: string;
    description: string;
  }[];
  commands: {
    name: string;
    description: string;
  }[];
  superclass: {
    name: string;
    package: string;
  };
  metadata: {
    unitTests: boolean;
    apiReview: boolean;
    performance: boolean;
    stable: boolean;
    vqa: boolean;
    responsive: boolean;
    themes: boolean;
    aria: string;
    entrypoint: string;
    package: boolean;
    since: string;
    status: ElementStatus;
    behavior: ElementBehavior;
    example: string;
    markdown: string;
  };
}

/**
 * @summary Category that describes the stability of the element based on development progress.
 */
export type ElementStatus = 'unknown' | 'pre-release' | 'beta' | 'stable';

/**
 * @summary The behavior of an element is a category that describes how the element operates in the UI based on Web API specifications.
 */
export type ElementBehavior =
  | 'button'
  | 'popover'
  | 'feedback'
  | 'navigation'
  | 'list'
  | 'container'
  | 'form'
  | 'content';

/**
 * @summary Test summary of all test results for a project.
 */
export interface ProjectTestSummary {
  coverage: CoverageSummary;
  unit: TestSummary;
  axe: TestSummary;
  visual: TestSummary;
  ssr: TestSummary;
  lighthouse: LighthouseSummary;
}

/**
 * @summary A test summary is a summary of the test results for a test suite/type in a project.
 * @see https://vitest.dev/guide/coverage.html
 */
export interface TestSummary {
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numPendingTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  numTodoTests: number;
  startTime: number;
  success: boolean;
  coverageMap?: object;
  testResults: {
    assertionResults: {
      ancestorTitles: string[];
      fullName: string;
      status: 'passed' | 'failed';
      title: string;
      duration: number;
      failureMessages: string[];
      startTime: number;
      endTime: number;
      message: string;
      name: string;
    }[];
  }[];
}

/**
 * @summary A coverage summary is a summary of the coverage results for a project.
 * @see https://vitest.dev/guide/coverage.html
 */
export interface CoverageSummary {
  total: CoverageResult;
  testResults: ({ file: string } & CoverageResult)[];
}

/**
 * @summary A coverage result is a result of the coverage test for a file in a project.
 * @see https://vitest.dev/guide/coverage.html#custom-coverage-reporter
 */
export interface CoverageResult {
  lines: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  statements: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  branches: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  functions: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
}

/**
 * @summary A lighthouse summary is a summary of the lighthouse test results for a project.
 * @see https://github.com/GoogleChrome/lighthouse
 */
export interface LighthouseSummary {
  testResults: {
    name: string;
    payload: {
      javascript: {
        kb: number;
        requests: Record<
          string,
          {
            kb: number;
            name: string;
          }
        >;
      };
      css: {
        kb: number;
        requests: Record<
          string,
          {
            kb: number;
            name: string;
          }
        >;
      };
    };
    scores: {
      performance: number;
      accessibility: number;
      bestPractices: number;
    };
  }[];
}

/**
 * @summary VSCode snippets are templates that make it easier to enter repeating code patterns, such as loops or conditional-statements. (data.snippets.json)
 * @see https://code.visualstudio.com/docs/editing/userdefinedsnippets
 */
export interface VSCodeSnippet {
  name: string;
  srcFile: string;
  prefix: string[];
  type: string;
  description: string;
  body: string;
}

/**
 * @summary VS Code HTML custom data is a format for loading custom data in VS Code's HTML support. (data.html.json)
 * @see https://github.com/microsoft/vscode-custom-data
 */
export interface VSCodeHTMLCustomDataFormat {
  version: 1.1;
  tags?: {
    name: string;
    description?:
      | string
      | {
          name: string;
          url: string;
        };
    attributes?: {
      name: string;
      description?:
        | string
        | {
            name: string;
            url: string;
          };
      valueSet?: string;
      values?: {
        name: string;
        description?:
          | string
          | {
              name: string;
              url: string;
            };
        references?: {
          kind: 'plaintext' | 'markdown';
          value: string;
        }[];
      }[];
      references?: {
        kind: 'plaintext' | 'markdown';
        value: string;
      }[];
    }[];
    references?: {
      kind: 'plaintext' | 'markdown';
      value: string;
    }[];
    browsers?: string[];
    baseline?: {
      status?: 'high' | 'low' | 'false';
      baseline_low_date?: string;
      baseline_high_date?: string;
    };
  }[];
}

export interface WireitGraphNode {
  id: string;
  label: string;
  packageName: string;
  scriptName: string;
  dependents: number;
  dependencies: number;
  category: string;
}

export interface WireitGraphLink {
  source: string;
  target: string;
}

export interface WireitGraph {
  nodes: WireitGraphNode[];
  links: WireitGraphLink[];
}

export interface ArtifactoryInstance {
  instance: string;
  downloads: number;
  lastDownloaded?: string;
}

export interface VersionDownload {
  version: string;
  totalDownloads: number;
  instances: ArtifactoryInstance[];
}

export interface PackageDownload {
  package: string;
  totalDownloads: number;
  instances: {
    name: string;
    totalDownloads: number;
  }[];
  versions: VersionDownload[];
}

export interface ProjectUsage {
  name: string;
  path: string;
  url: string;
  elementsVersion: string;
  projectDependencies: {
    angular?: boolean;
    react?: boolean;
    vue?: boolean;
    nextjs?: boolean;
    svelte?: boolean;
    solid?: boolean;
    preact?: boolean;
    alpinejs?: boolean;
    hybrids?: boolean;
    htmx?: boolean;
    lit?: boolean;
    typescript?: boolean;
  };
  elements: {
    name: string;
    total: number;
  }[];
  imports: {
    name: string;
    total: number;
  }[];
  styles: {
    name: string;
    total: number;
  }[];
  attributes: {
    name: string;
    total: number;
  }[];
  elementReferenceTotal: number;
  attributeReferenceTotal: number;
  importReferenceTotal: number;
  styleReferenceTotal: number;
  referenceTotal: number;
}

export interface Release {
  name: string;
  version: string;
  date: string;
  type: 'fix' | 'feat' | 'breaking' | 'chore';
}
