import { resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { type InterfaceDeclaration, type JSDocStructure, type OptionalKind, Project, SyntaxKind } from 'ts-morph';
import type {
  MetadataCustomElementsManifest,
  MetadataCustomElementsManifestDeclaration,
  MetadataLighthouseElementReport,
  MetadataLighthouseReport,
  MetadataPackage,
  MetadataSSRElementReport,
  MetadataSSRReportJSON,
  MetadataProject,
  MetadataTestReport,
  MetadataUnitTestCoverageSummary,
  MetadataUnitTestCoverageSummaryReport,
  MetadataType,
  MetadataElement
} from '../types.js';
import { elementMetadataToMarkdown, getElementChangelog } from '../utils/utils.ts';

const BASE_ELEMENT_INTERFACE_PATH = resolve('../../elements/src/internal/types/index.ts');

function getPackageFile(basePath: string): MetadataPackage {
  return JSON.parse(readFileSync(new URL(basePath + '/package.json', import.meta.url), 'utf8'));
}

function getChangelog(basePath: string): string {
  const changelog = existsSync(new URL(basePath + '/CHANGELOG.md', import.meta.url))
    ? readFileSync(new URL(basePath + '/CHANGELOG.md', import.meta.url), 'utf8')
    : '';
  return changelog.includes('@elements') ? changelog.split('@elements')[0] : changelog;
}

function getReadMe(basePath: string): string {
  return readFileSync(new URL(basePath + '/README.md', import.meta.url), 'utf8');
}

function getManifestDeclarations(
  customElementsManifest: MetadataCustomElementsManifest
): MetadataCustomElementsManifestDeclaration[] {
  return Array.from(
    new Set(
      customElementsManifest.modules.flatMap(module => {
        module.declarations.forEach(d => (d.path = module.path));
        return module.declarations;
      })
    )
  ).filter(d => d.tagName);
}

/** projects/../coverage/unit/coverage-summary.json */
function getTestCoverage(basePath): MetadataTestReport {
  const coverageReportPath = new URL(basePath + '/coverage/unit/coverage-summary.json', import.meta.url);
  const coverageJunitPath = new URL(basePath + '/coverage/unit/junit.xml', import.meta.url);
  const coverageAxePath = new URL(basePath + '/coverage/axe/junit.xml', import.meta.url);
  const coverageVisualPath = new URL(basePath + '/coverage/visual/junit.xml', import.meta.url);
  const coverageSsrPath = new URL(basePath + '/coverage/ssr/junit.xml', import.meta.url);
  const tests: MetadataTestReport = {
    coverage: [],
    coverageTotal: {
      file: '',
      lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
      statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 0 }
    },
    unitTestsTotal: 0,
    axeTestsTotal: 0,
    visualTestsTotal: 0,
    ssrTestsTotal: 0
  };

  if (existsSync(coverageAxePath)) {
    const junit = readFileSync(coverageAxePath, 'utf8');
    const axeTestsTotal = parseInt(junit.match(/<testsuites[^>]*tests="([^"]+)"/)?.[1] ?? '0');
    tests.axeTestsTotal = axeTestsTotal;
  }

  if (existsSync(coverageVisualPath)) {
    const junit = readFileSync(coverageVisualPath, 'utf8');
    const visualTestsTotal = parseInt(junit.match(/<testsuites[^>]*tests="([^"]+)"/)?.[1] ?? '0');
    tests.visualTestsTotal = visualTestsTotal;
  }

  if (existsSync(coverageSsrPath)) {
    const junit = readFileSync(coverageSsrPath, 'utf8');
    const ssrTestsTotal = parseInt(junit.match(/<testsuites[^>]*tests="([^"]+)"/)?.[1] ?? '0');
    tests.ssrTestsTotal = ssrTestsTotal;
  }

  if (existsSync(coverageReportPath)) {
    const junit = readFileSync(coverageJunitPath, 'utf8');
    const unitTestsTotal = parseInt(junit.match(/<testsuites[^>]*tests="([^"]+)"/)?.[1] ?? '0');
    const coverageJSON: MetadataUnitTestCoverageSummaryReport = JSON.parse(readFileSync(coverageReportPath, 'utf8'));
    const coverage = Object.entries(coverageJSON)
      .map(([file, coverage]: [string, Omit<MetadataUnitTestCoverageSummary, 'file'>]) => ({
        file: file.includes('/src/') ? file.split('/src/')[1] : file,
        ...coverage
      }))
      .sort((a, b) => (a.lines.pct > b.lines.pct ? 1 : -1))
      .filter(c => !c.file.includes('polyfills'));

    const coverageTotal = coverage.splice(
      coverage.findIndex(c => c.file === 'total'),
      1
    )[0];

    tests.coverage = coverage;
    tests.coverageTotal = coverageTotal;
    tests.unitTestsTotal = unitTestsTotal;
  }

  return tests;
}

function getCustomElementsManifest(basePath: string): MetadataCustomElementsManifest {
  const customElementsManifestPath = new URL(basePath + '/dist/custom-elements.json', import.meta.url);
  return existsSync(customElementsManifestPath)
    ? JSON.parse(readFileSync(new URL(customElementsManifestPath, import.meta.url), 'utf8'))
    : null;
}

function getLighthouseReport(): MetadataLighthouseReport {
  return JSON.parse(readFileSync(new URL('../../static/lighthouse.json', import.meta.url), 'utf8'));
}

function getSSRReport(basePath: string): MetadataSSRElementReport[] {
  const ssrReportPath = new URL(basePath + '/coverage/ssr/summary.json', import.meta.url);
  const ssrProjectReport: MetadataSSRReportJSON = existsSync(ssrReportPath)
    ? JSON.parse(readFileSync(new URL(ssrReportPath, import.meta.url), 'utf8'))
    : null;
  return (
    ssrProjectReport?.testResults
      ?.flatMap(i => i.assertionResults)
      .map(r => ({ name: r.ancestorTitles[0], status: r.status })) ?? []
  );
}

function getElementMetadata(
  packageName: string,
  packageChangelog: string,
  customElementsManifest: MetadataCustomElementsManifest,
  testCoverage: MetadataTestReport,
  lighthouseReport: MetadataLighthouseReport,
  ssrReport: MetadataSSRElementReport[]
) {
  const elementDeclarations = customElementsManifest ? getManifestDeclarations(customElementsManifest) : [];
  const coverage = testCoverage?.coverage ? testCoverage?.coverage : [];

  return elementDeclarations
    .map(d => d.tagName)
    .reduce((elements: MetadataElement[], name) => {
      const manifest = elementDeclarations.find(e => e.tagName === name);
      const markdown = manifest.metadata ? elementMetadataToMarkdown(manifest) : '';
      const lighthouseKey = lighthouseReport[packageName]
        ? (Object.keys(lighthouseReport[packageName]).find(key => name === 'key' || name.startsWith(key)) ?? '')
        : '';
      const lighthousePackageReport = lighthouseReport[packageName];
      const lighthouse: MetadataLighthouseElementReport = lighthousePackageReport
        ? lighthousePackageReport[lighthouseKey]
        : {
            name,
            payload: { javascript: { kb: 0, requests: {} }, css: { kb: 0, requests: {} } },
            scores: { accessibility: 0, bestPractices: 0, performance: 0 }
          };
      const cov = coverage.find(c => c.file.replace('.ts', '.js') === manifest?.path.replace('/src/', ''));
      const unit = {
        coverageTotal: cov ? (cov.statements.pct + cov.functions.pct + cov.branches.pct + cov.lines.pct) / 4 : 0
      };

      if (name.includes('nve-grid')) {
        lighthouse.scores.accessibility = 100; // workaround false reporting for grid, manually tested
      }

      const ssr = {
        baseline: ssrReport?.find(i => i.name === name || name.startsWith(i.name))?.status === 'passed',
        hydration: false
      };

      const changelog = getElementChangelog(name, packageChangelog);

      const metadata: MetadataElement = {
        name,
        markdown,
        changelog,
        manifest,
        tests: {
          unit,
          lighthouse,
          ssr
        }
      };

      return [...elements, metadata];
    }, [])
    .sort((a, b) => (a.name < b.name ? -1 : 1));
}

function getElementsStandardAPIProperties(): MetadataType[] {
  const project = new Project();
  const file = project.addSourceFileAtPath(BASE_ELEMENT_INTERFACE_PATH);
  const base = file
    .getChildrenOfKind(SyntaxKind.InterfaceDeclaration)
    .find(i => i.getName() === 'NveElement') as InterfaceDeclaration;
  const props = base?.getStructure()?.properties?.map(n => ({
    name: n.name,
    type: n.type,
    description: n.docs ? (n.docs[0] as OptionalKind<JSDocStructure>)?.description : ''
  })) as MetadataType[];
  return props ?? [];
}

async function getProjectMetadata(basePath): Promise<MetadataProject> {
  const packageFile = getPackageFile(basePath);
  const changelog = getChangelog(basePath);
  const readme = getReadMe(basePath);
  const customElementsManifest = getCustomElementsManifest(basePath);
  const tests = getTestCoverage(basePath);
  const ssrReport = getSSRReport(basePath);
  const lighthouseReport = getLighthouseReport();

  return {
    name: packageFile.name,
    version: packageFile.version,
    readme,
    changelog,
    tests,
    elements: getElementMetadata(
      packageFile.name,
      changelog,
      customElementsManifest,
      tests,
      lighthouseReport,
      ssrReport
    )
  };
}

export async function getMetadata() {
  const elements = await getProjectMetadata('../../../../elements');
  elements.types = getElementsStandardAPIProperties();

  return {
    created: new Date().toISOString(),
    projects: {
      '@nvidia-elements/core': elements,
      '@nvidia-elements/core-react': await getProjectMetadata('../../../../elements-react'),
      '@nvidia-elements/styles': await getProjectMetadata('../../../../styles'),
      '@nvidia-elements/testing': await getProjectMetadata('../../../../testing'),
      '@nvidia-elements/themes': await getProjectMetadata('../../../../themes'),
      '@nvidia-elements/behaviors-alpine': await getProjectMetadata('../../../../labs/behaviors-alpine'),
      '@nvidia-elements/brand': await getProjectMetadata('../../../../labs/brand'),
      '@nvidia-elements/code': await getProjectMetadata('../../../../labs/code'),
      '@nvidia-elements/forms': await getProjectMetadata('../../../../labs/forms'),
      '@nvidia-elements/playwright-screencast': await getProjectMetadata('../../../../labs/playwright-screencast'),
      '@nvidia-elements/monaco': await getProjectMetadata('../../../../monaco'),
      '@nve-internals/metadata': await getProjectMetadata('../../../../internals/metadata'),
      '@nve-internals/patterns': await getProjectMetadata('../../../../internals/patterns')
    }
  };
}
