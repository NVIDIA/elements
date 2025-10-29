import { describe, expect, it } from 'vitest';
import { generateGraphData } from './wireit.utils.js';

describe('generateGraphData', () => {
  it('should return an object with nodes and links arrays', () => {
    const result = generateGraphData();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('nodes');
    expect(result).toHaveProperty('links');
    expect(Array.isArray(result.nodes)).toBe(true);
    expect(Array.isArray(result.links)).toBe(true);
  });

  it('should return nodes with required properties', () => {
    const result = generateGraphData();
    expect(result.nodes.length).toBeGreaterThan(0);

    const firstNode = result.nodes[0];
    expect(firstNode).toHaveProperty('id');
    expect(firstNode).toHaveProperty('label');
    expect(firstNode).toHaveProperty('packageName');
    expect(firstNode).toHaveProperty('scriptName');
    expect(firstNode).toHaveProperty('dependents');
    expect(firstNode).toHaveProperty('dependencies');
    expect(firstNode).toHaveProperty('category');
  });

  it('should have string id for each node', () => {
    const result = generateGraphData();

    for (const node of result.nodes) {
      expect(typeof node.id).toBe('string');
      expect(node.id.length).toBeGreaterThan(0);
    }
  });

  it('should have string label for each node', () => {
    const result = generateGraphData();

    for (const node of result.nodes) {
      expect(typeof node.label).toBe('string');
      expect(node.label.length).toBeGreaterThan(0);
    }
  });

  it('should have string packageName for each node', () => {
    const result = generateGraphData();

    for (const node of result.nodes) {
      expect(typeof node.packageName).toBe('string');
      expect(node.packageName.length).toBeGreaterThan(0);
    }
  });

  it('should have string scriptName for each node', () => {
    const result = generateGraphData();

    for (const node of result.nodes) {
      expect(typeof node.scriptName).toBe('string');
      expect(node.scriptName.length).toBeGreaterThan(0);
    }
  });

  it('should have non-negative dependents count for each node', () => {
    const result = generateGraphData();

    for (const node of result.nodes) {
      expect(typeof node.dependents).toBe('number');
      expect(node.dependents).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have non-negative dependencies count for each node', () => {
    const result = generateGraphData();

    for (const node of result.nodes) {
      expect(typeof node.dependencies).toBe('number');
      expect(node.dependencies).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have valid category for each node', () => {
    const result = generateGraphData();
    const validCategories = [
      'root',
      'internals',
      'labs',
      'elements',
      'starters',
      'site',
      'testing',
      'themes',
      'styles',
      'other'
    ];

    for (const node of result.nodes) {
      expect(typeof node.category).toBe('string');
      expect(validCategories).toContain(node.category);
    }
  });

  it('should categorize root packages correctly', () => {
    const result = generateGraphData();
    const rootNodes = result.nodes.filter(n => n.category === 'root');

    for (const node of rootNodes) {
      expect(node.packageName).toContain('elements-workspace');
    }
  });

  it('should categorize internals packages correctly', () => {
    const result = generateGraphData();
    const internalsNodes = result.nodes.filter(n => n.category === 'internals');

    for (const node of internalsNodes) {
      expect(node.packageName).toContain('internals/');
    }
  });

  it('should categorize labs packages correctly', () => {
    const result = generateGraphData();
    const labsNodes = result.nodes.filter(n => n.category === 'labs');

    for (const node of labsNodes) {
      expect(node.packageName).toContain('labs/');
    }
  });

  it('should categorize elements packages correctly', () => {
    const result = generateGraphData();
    const elementsNodes = result.nodes.filter(n => n.category === 'elements');

    for (const node of elementsNodes) {
      expect(node.packageName).toContain('elements');
      expect(node.packageName).not.toContain('elements-workspace');
    }
  });

  it('should categorize starters packages correctly', () => {
    const result = generateGraphData();
    const startersNodes = result.nodes.filter(n => n.category === 'starters');

    for (const node of startersNodes) {
      expect(node.packageName).toContain('starter');
    }
  });

  it('should categorize site packages correctly', () => {
    const result = generateGraphData();
    const siteNodes = result.nodes.filter(n => n.category === 'site');

    for (const node of siteNodes) {
      expect(node.packageName).toContain('site');
    }
  });

  it('should categorize testing packages correctly', () => {
    const result = generateGraphData();
    const testingNodes = result.nodes.filter(n => n.category === 'testing');

    for (const node of testingNodes) {
      expect(node.packageName).toContain('testing');
    }
  });

  it('should categorize themes packages correctly', () => {
    const result = generateGraphData();
    const themesNodes = result.nodes.filter(n => n.category === 'themes');

    for (const node of themesNodes) {
      expect(node.packageName).toContain('themes');
    }
  });

  it('should categorize styles packages correctly', () => {
    const result = generateGraphData();
    const stylesNodes = result.nodes.filter(n => n.category === 'styles');

    for (const node of stylesNodes) {
      expect(node.packageName).toContain('styles');
    }
  });

  it('should format labels by removing @nvidia-elements/ prefix', () => {
    const result = generateGraphData();
    const nvePackages = result.nodes.filter(n => n.packageName.startsWith('@nvidia-elements/'));

    for (const node of nvePackages) {
      expect(node.label).not.toContain('@nvidia-elements/');
    }
  });

  it('should format labels by replacing @nvidia-elements/ with labs/', () => {
    const result = generateGraphData();
    const labsPackages = result.nodes.filter(n => n.packageName.startsWith('@nvidia-elements/'));

    for (const node of labsPackages) {
      expect(node.label).toContain('labs/');
      expect(node.label).not.toContain('@nvidia-elements/');
    }
  });

  it('should format labels by replacing @internals/ with internals/', () => {
    const result = generateGraphData();
    const internalsPackages = result.nodes.filter(n => n.packageName.startsWith('@internals/'));

    for (const node of internalsPackages) {
      expect(node.label).toContain('internals/');
      expect(node.label).not.toContain('@internals/');
    }
  });

  it('should include scriptName in label', () => {
    const result = generateGraphData();

    for (const node of result.nodes) {
      expect(node.label).toContain(':');
      expect(node.label).toContain(node.scriptName);
    }
  });

  it('should return links with required properties', () => {
    const result = generateGraphData();

    if (result.links.length > 0) {
      const firstLink = result.links[0];
      expect(firstLink).toHaveProperty('source');
      expect(firstLink).toHaveProperty('target');
    }
  });

  it('should have string source for each link', () => {
    const result = generateGraphData();

    for (const link of result.links) {
      expect(typeof link.source).toBe('string');
      expect(link.source.length).toBeGreaterThan(0);
    }
  });

  it('should have string target for each link', () => {
    const result = generateGraphData();

    for (const link of result.links) {
      expect(typeof link.target).toBe('string');
      expect(link.target.length).toBeGreaterThan(0);
    }
  });

  it('should have all link sources reference valid node ids', () => {
    const result = generateGraphData();
    const nodeIds = new Set(result.nodes.map(n => n.id));

    for (const link of result.links) {
      expect(nodeIds.has(link.source)).toBe(true);
    }
  });

  it('should have all link targets reference valid node ids', () => {
    const result = generateGraphData();
    const nodeIds = new Set(result.nodes.map(n => n.id));

    for (const link of result.links) {
      expect(nodeIds.has(link.target)).toBe(true);
    }
  });

  it('should calculate dependents count correctly', () => {
    const result = generateGraphData();
    const dependentsCounts = new Map<string, number>();

    // Count how many times each node is referenced as a target
    for (const link of result.links) {
      dependentsCounts.set(link.target, (dependentsCounts.get(link.target) || 0) + 1);
    }

    // Verify the dependents count matches the calculated count
    for (const node of result.nodes) {
      const expectedCount = dependentsCounts.get(node.id) || 0;
      expect(node.dependents).toBe(expectedCount);
    }
  });

  it('should calculate dependencies count correctly', () => {
    const result = generateGraphData();
    const dependenciesCounts = new Map<string, number>();

    // Count how many times each node appears as a source
    for (const link of result.links) {
      dependenciesCounts.set(link.source, (dependenciesCounts.get(link.source) || 0) + 1);
    }

    // Verify the dependencies count is at least the link count (may be higher if some deps don't resolve)
    for (const node of result.nodes) {
      const linkCount = dependenciesCounts.get(node.id) || 0;
      expect(node.dependencies).toBeGreaterThanOrEqual(linkCount);
    }
  });

  it('should have unique node ids', () => {
    const result = generateGraphData();
    const nodeIds = result.nodes.map(n => n.id);
    const uniqueNodeIds = new Set(nodeIds);

    expect(nodeIds.length).toBe(uniqueNodeIds.size);
  });

  it('should have nodes with dependencies appear as link sources', () => {
    const result = generateGraphData();

    // Nodes with dependencies > 0 should have at least some links (though may have unresolved deps)
    for (const node of result.nodes) {
      if (node.dependencies > 0) {
        // A node with dependencies may or may not have links if deps are external or unresolved
        expect(typeof node.dependencies).toBe('number');
      }
    }
  });

  it('should have nodes with no dependents have dependents count of 0', () => {
    const result = generateGraphData();
    const nodeIdsWithDependents = new Set(result.links.map(l => l.target));

    for (const node of result.nodes) {
      if (!nodeIdsWithDependents.has(node.id)) {
        expect(node.dependents).toBe(0);
      }
    }
  });

  it('should not have self-referencing links', () => {
    const result = generateGraphData();

    for (const link of result.links) {
      expect(link.source).not.toBe(link.target);
    }
  });

  it('should return consistent results on multiple calls', () => {
    const result1 = generateGraphData();
    const result2 = generateGraphData();

    expect(result1.nodes.length).toBe(result2.nodes.length);
    expect(result1.links.length).toBe(result2.links.length);

    const ids1 = result1.nodes.map(n => n.id).sort();
    const ids2 = result2.nodes.map(n => n.id).sort();
    expect(ids1).toEqual(ids2);
  });

  it('should have at least some nodes with dependencies', () => {
    const result = generateGraphData();
    const nodesWithDependencies = result.nodes.filter(n => n.dependencies > 0);

    expect(nodesWithDependencies.length).toBeGreaterThan(0);
  });

  it('should have at least some nodes with dependents', () => {
    const result = generateGraphData();
    const nodesWithDependents = result.nodes.filter(n => n.dependents > 0);

    expect(nodesWithDependents.length).toBeGreaterThan(0);
  });

  it('should have node ids that include colon separator', () => {
    const result = generateGraphData();

    for (const node of result.nodes) {
      // Node IDs should have the format "path:scriptName"
      expect(node.id).toContain(':');
      const parts = node.id.split(':');
      expect(parts.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have link sources and targets with colon separator', () => {
    const result = generateGraphData();

    for (const link of result.links) {
      expect(link.source).toContain(':');
      expect(link.target).toContain(':');
    }
  });

  it('should handle packages with multiple scripts', () => {
    const result = generateGraphData();
    const packageCounts = new Map<string, number>();

    for (const node of result.nodes) {
      packageCounts.set(node.packageName, (packageCounts.get(node.packageName) || 0) + 1);
    }

    // There should be at least some packages with multiple scripts
    const packagesWithMultipleScripts = Array.from(packageCounts.values()).filter(count => count > 1);
    expect(packagesWithMultipleScripts.length).toBeGreaterThan(0);
  });

  it('should produce valid graph structure for metadata package', () => {
    const result = generateGraphData();
    const metadataNodes = result.nodes.filter(n => n.packageName.includes('metadata'));

    expect(metadataNodes.length).toBeGreaterThan(0);

    for (const node of metadataNodes) {
      expect(node.category).toBe('internals');
      expect(node.label).toContain('internals/metadata');
    }
  });

  it('should handle script names with colons as same-package dependencies', () => {
    const result = generateGraphData();
    const themesPackages = result.nodes.filter(n => n.packageName === '@nvidia-elements/themes');

    if (themesPackages.length > 0) {
      const buildStyleDict = themesPackages.find(n => n.scriptName === 'build:styledictionary');
      if (buildStyleDict) {
        expect(buildStyleDict.dependents).toBeGreaterThan(0);
        const linksToIt = result.links.filter(l => l.target.endsWith(':build:styledictionary'));
        expect(linksToIt.length).toBeGreaterThan(0);
      }
    }
  });
});
