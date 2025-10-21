export interface MetadataSummary {
  created: string;
  projects: {
    '@nvidia-elements/core': MetadataProject;
    '@nvidia-elements/core-react': MetadataProject;
    '@nvidia-elements/styles': MetadataProject;
    '@nvidia-elements/testing': MetadataProject;
    '@nvidia-elements/themes': MetadataProject;
    '@nvidia-elements/behaviors-alpine': MetadataProject;
    '@nvidia-elements/brand': MetadataProject;
    '@nvidia-elements/code': MetadataProject;
    '@nvidia-elements/forms': MetadataProject;
    '@nvidia-elements/markdown': MetadataProject;
    '@nvidia-elements/playwright-screencast': MetadataProject;
    '@nvidia-elements/monaco': MetadataProject;
    '@internals/metadata': MetadataProject;
    '@internals/patterns': MetadataProject;
  };
}

export interface MetadataProject {
  name: string;
  version: string;
  description: string;
  readme: string;
  changelog: string;
  types?: MetadataType[];
  elements: MetadataElement[];
  attributes: MetadataAttribute[];
  tokens?: MetadataToken[];
}

export interface MetadataType {
  name: string;
  type: string;
  description: string;
}

export interface MetadataElement {
  name: string;
  changelog?: string;
  manifest?: MetadataCustomElementsManifestDeclaration;
  markdown?: string;
}

export interface MetadataAttribute {
  name: string;
  description: string;
  example: string;
  markdown: string;
  values: {
    name: string;
  }[];
}

export interface MetadataToken {
  name: string;
  value: string;
  description: string;
}

export type MetadataExampleTag = 'priority' | 'performance' | 'pattern' | 'anti-pattern' | 'test-case';

export interface MetadataExample {
  id: string;
  template: string;
  summary: string;
  description: string;
  tags: MetadataExampleTag[];
  deprecated?: boolean;
  entrypoint?: string;
  element?: string;
}

export interface MetadataPackage {
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

export interface MetadataCustomElementsManifest {
  modules: {
    kind: string;
    path: string;
    declarations: MetadataCustomElementsManifestDeclaration[];
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

export interface MetadataCustomElementsManifestDeclaration {
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
    };
  }[];
  attributes: {
    name: string;
    deprecated: boolean;
    type: {
      text: string;
    };
    default: string;
    description: string;
    fieldName: string;
  }[];
  events: {
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
    storybook: string;
    figma: string;
    status: string;
    behavior: string;
    example: string;
  };
}
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
  coverageMap?: {};
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

export interface CoverageSummary {
  total: CoverageResult;
  testResults: ({ file: string } & CoverageResult)[];
}

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

export interface ProjectTestReport {
  coverage: CoverageSummary;
  unit: TestSummary;
  axe: TestSummary;
  visual: TestSummary;
  ssr: TestSummary;
  lighthouse: LighthouseSummary;
}

export interface ProjectTestSummary {
  created: string;
  projects: Record<string, ProjectTestReport>;
}
