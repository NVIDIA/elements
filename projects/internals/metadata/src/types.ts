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
  tests: MetadataTestReport;
  types?: MetadataType[];
  elements: MetadataElement[];
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
  tests: {
    unit: {
      coverageTotal: number;
    };
    lighthouse: MetadataLighthouseElementReport;
    ssr: {
      baseline: boolean;
      hydration: boolean;
    };
  };
}

export interface MetadataToken {
  name: string;
  value: string;
  description: string;
}

export interface MetadataExample {
  id: string;
  template: string;
  description: string;
  tags: string[];
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

export interface MetadataTestCoverage {
  unitTestsTotal: number;
  axeTestsTotal: number;
  visualTestsTotal: number;
  ssrTestsTotal: number;
  coverageTotal: number;
  coverage: {
    file: string;
    lines: {
      pct: number;
    };
    functions: {
      pct: number;
    };
    branches: {
      pct: number;
    };
  }[];
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
  cssProperties: {
    name: string;
    description: string;
  }[];
  slots: {
    name: string;
    description: string;
  }[];
  members: {
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

export interface MetadataUnitTestCoverageSummary {
  file: string;
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

export interface MetadataUnitTestCoverageSummaryReport {
  total: MetadataUnitTestCoverageSummary;
  [key: string]: MetadataUnitTestCoverageSummary;
}

export interface MetadataTestReport {
  coverage: MetadataUnitTestCoverageSummary[];
  coverageTotal: MetadataUnitTestCoverageSummary;
  unitTestsTotal: number;
  axeTestsTotal: number;
  visualTestsTotal: number;
  ssrTestsTotal: number;
}

export interface MetadataLighthouseElementReport {
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
}

export interface MetadataLighthouseReport {
  [key: string]: {
    [key: string]: MetadataLighthouseElementReport | null;
  };
}

export interface MetadataSSRReportJSON {
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numPendingTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  numTodoTests: number;
  snapshot: {
    added: number;
    failure: boolean;
    filesAdded: number;
    filesRemoved: number;
    filesRemovedList: string[];
    filesUnmatched: number;
    filesUpdated: number;
    matched: number;
    total: number;
    unchecked: number;
    uncheckedKeysByFile: string[];
    unmatched: number;
    updated: number;
    didUpdate: boolean;
  };
  startTime: number;
  success: boolean;
  testResults: {
    assertionResults: {
      ancestorTitles: string[];
      fullName: string;
      status: 'passed' | 'failed';
      title: string;
      duration: number;
      failureMessages: string[];
      meta: Record<string, unknown>;
    }[];
    startTime: number;
    endTime: number;
    status: 'passed' | 'failed';
    message: string;
    name: string;
  }[];
}

export interface MetadataSSRElementReport {
  name: string;
  status: 'passed' | 'failed';
}
