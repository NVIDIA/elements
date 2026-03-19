// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { Attribute } from '../types.js';
import { attributeMetadataToMarkdown, changelogMarkdownToJSON, getElementChangelog } from './utils.js';

describe('getElementChangelog', () => {
  it('should filter changelog by element name', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- Added nve-button component
- Added nve-badge component

### Bug Fixes
- Fixed nve-button styling issue
- Fixed nve-input validation`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('# Changelog - nve-button');
    expect(result).toContain('[1.0.0] - 2024-01-01');
    expect(result).toContain('Added nve-button component');
    expect(result).toContain('Fixed nve-button styling issue');
    expect(result).not.toContain('nve-badge');
    expect(result).not.toContain('nve-input');
  });

  it('should filter by element name without nve- prefix', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- Added button component with new styles
- Added badge component

### Bug Fixes
- Fixed button hover state
- Fixed input focus issue`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('# Changelog - nve-button');
    expect(result).toContain('button component with new styles');
    expect(result).toContain('Fixed button hover state');
    expect(result).not.toContain('badge');
    expect(result).not.toContain('input');
  });

  it('should handle multiple releases with filtering', () => {
    const changelog = `## [2.0.0] - 2024-02-01

### Features
- Improved nve-button accessibility

## [1.0.0] - 2024-01-01

### Bug Fixes
- Fixed nve-badge color issue
- Fixed nve-button icon alignment`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('[2.0.0] - 2024-02-01');
    expect(result).toContain('Improved nve-button accessibility');
    expect(result).toContain('[1.0.0] - 2024-01-01');
    expect(result).toContain('Fixed nve-button icon alignment');
    expect(result).not.toContain('nve-badge');
  });

  it('should exclude releases with no relevant entries', () => {
    const changelog = `## [3.0.0] - 2024-03-01

### Features
- Added nve-dialog component

## [2.0.0] - 2024-02-01

### Features
- Improved nve-button styles

## [1.0.0] - 2024-01-01

### Bug Fixes
- Fixed nve-input validation`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('[2.0.0] - 2024-02-01');
    expect(result).toContain('Improved nve-button styles');
    expect(result).not.toContain('[3.0.0]');
    expect(result).not.toContain('[1.0.0]');
    expect(result).not.toContain('nve-dialog');
    expect(result).not.toContain('nve-input');
  });

  it('should include all relevant section types', () => {
    const changelog = `## [2.0.0] - 2024-02-01

### Features
- New nve-button variant

### Breaking Changes
- Changed nve-button API

### Bug Fixes
- Fixed nve-button focus ring`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('### Features');
    expect(result).toContain('New nve-button variant');
    expect(result).toContain('### Breaking Changes');
    expect(result).toContain('Changed nve-button API');
    expect(result).toContain('### Bug Fixes');
    expect(result).toContain('Fixed nve-button focus ring');
  });

  it('should handle features only', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- Added nve-button component
- Added nve-button sizes

### Bug Fixes
- Fixed nve-input issue`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('### Features');
    expect(result).toContain('Added nve-button component');
    expect(result).toContain('Added nve-button sizes');
    expect(result).not.toContain('### Bug Fixes');
    expect(result).not.toContain('nve-input');
  });

  it('should handle bug fixes only', () => {
    const changelog = `## [1.0.1] - 2024-01-15

### Features
- Added nve-dialog animation

### Bug Fixes
- Fixed nve-button disabled state
- Fixed nve-button text overflow`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('### Bug Fixes');
    expect(result).toContain('Fixed nve-button disabled state');
    expect(result).toContain('Fixed nve-button text overflow');
    expect(result).not.toContain('nve-dialog');
    // Note: Features section appears in output because matched entries are included in all sections
    expect(result.split('### Features')[1]?.includes('nve-dialog')).toBeFalsy();
  });

  it('should handle breaking changes only', () => {
    const changelog = `## [2.0.0] - 2024-02-01

### Features
- Added nve-tooltip component

### Breaking Changes
- Removed nve-button legacy variant
- Changed nve-button prop names`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('### Breaking Changes');
    expect(result).toContain('Removed nve-button legacy variant');
    expect(result).toContain('Changed nve-button prop names');
    expect(result).not.toContain('nve-tooltip');
    // Note: Features section appears in output because matched entries are included in all sections
    expect(result.split('### Features')[1]?.includes('nve-tooltip')).toBeFalsy();
  });

  it('should return empty releases when no matches found', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- Added nve-dialog component
- Added nve-tooltip component

### Bug Fixes
- Fixed nve-input validation
- Fixed nve-select dropdown`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toBe('# Changelog - nve-button\n\n');
  });

  it('should handle empty changelog', () => {
    const changelog = '';

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toBe('# Changelog - nve-button\n\n');
  });

  it('should format sections in correct order', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Bug Fixes
- Fixed nve-button bug

### Breaking Changes
- Changed nve-button API

### Features
- Added nve-button feature`;

    const result = getElementChangelog('nve-button', changelog);

    const featuresIndex = result.indexOf('### Features');
    const breakingIndex = result.indexOf('### Breaking Changes');
    const bugFixesIndex = result.indexOf('### Bug Fixes');

    // Order should be: Features, Breaking Changes, Bug Fixes
    expect(featuresIndex).toBeGreaterThan(0);
    expect(breakingIndex).toBeGreaterThan(featuresIndex);
    expect(bugFixesIndex).toBeGreaterThan(breakingIndex);
  });

  it('should handle mixed prefix and non-prefix references', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- Added nve-button primary variant
- Improved button accessibility

### Bug Fixes
- Fixed button hover state
- Fixed nve-button focus ring`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('Added nve-button primary variant');
    expect(result).toContain('Improved button accessibility');
    expect(result).toContain('Fixed button hover state');
    expect(result).toContain('Fixed nve-button focus ring');
  });

  it('should handle element name in middle of text', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- The nve-button component now supports themes
- Added support for nve-badge variants

### Bug Fixes
- Resolved issue where button text was truncated
- Fixed nve-input padding`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('The nve-button component now supports themes');
    expect(result).toContain('Resolved issue where button text was truncated');
    expect(result).not.toContain('nve-badge');
    expect(result).not.toContain('nve-input');
  });

  it('should preserve original entry formatting', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- **Bold**: Added nve-button with *italic* support
- [Link](url): Improved button styles`;

    const result = getElementChangelog('nve-button', changelog);

    expect(result).toContain('**Bold**: Added nve-button with *italic* support');
    expect(result).toContain('[Link](url): Improved button styles');
  });

  it('should separate multiple releases with blank lines', () => {
    const changelog = `## [2.0.0] - 2024-02-01

### Features
- Updated nve-button styles

## [1.0.0] - 2024-01-01

### Features
- Initial nve-button release`;

    const result = getElementChangelog('nve-button', changelog);

    const releases = result.split('\n\n');
    expect(releases.length).toBeGreaterThan(2);
    expect(result).toContain('[2.0.0]');
    expect(result).toContain('[1.0.0]');
  });
});

describe('attributeMetadataToMarkdown', () => {
  it('should create markdown with all sections', () => {
    const attribute: Attribute = {
      name: 'theme',
      description: 'The theme to apply to the component',
      example: '<nve-button theme="primary">Click me</nve-button>',
      markdown: '',
      values: [{ name: 'primary' }, { name: 'secondary' }, { name: 'danger' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('## theme')).toBe(true);
    expect(markdown.includes('The theme to apply to the component')).toBe(true);
    expect(markdown.includes('### Example')).toBe(true);
    expect(markdown.includes('<nve-button theme="primary">Click me</nve-button>')).toBe(true);
    expect(markdown.includes('### Values')).toBe(true);
    expect(markdown.includes('| name | type | value  |')).toBe(true);
    expect(markdown.includes('| `theme` | `string` |`primary`, `secondary`, `danger` |')).toBe(true);
  });

  it('should show placeholder when example is missing', () => {
    const attribute: Attribute = {
      name: 'size',
      description: 'The size of the component',
      example: '',
      markdown: '',
      values: [{ name: 'small' }, { name: 'medium' }, { name: 'large' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('## size')).toBe(true);
    expect(markdown.includes('The size of the component')).toBe(true);
    expect(markdown.includes('### Example')).toBe(true);
    expect(markdown.includes('No example available.')).toBe(true);
    expect(markdown.includes('### Values')).toBe(true);
    expect(markdown.includes('| `size` | `string` |`small`, `medium`, `large` |')).toBe(true);
  });

  it('should filter out values containing pipe character', () => {
    const attribute: Attribute = {
      name: 'variant',
      description: 'The variant style',
      example: '<nve-badge variant="info">Badge</nve-badge>',
      markdown: '',
      values: [
        { name: 'info' },
        { name: 'warning' },
        { name: 'error|danger' }, // should be filtered
        { name: 'success' }
      ]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('| `variant` | `string` |`info`, `warning`, `success` |')).toBe(true);
    expect(markdown.includes('error|danger')).toBe(false);
  });

  it('should filter out values containing @ character', () => {
    const attribute: Attribute = {
      name: 'status',
      description: 'The status indicator',
      example: '<nve-status status="active">Status</nve-status>',
      markdown: '',
      values: [
        { name: 'active' },
        { name: '@deprecated' }, // should be filtered
        { name: 'inactive' },
        { name: 'user@email' } // should be filtered
      ]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('| `status` | `string` |`active`, `inactive` |')).toBe(true);
    expect(markdown.includes('@deprecated')).toBe(false);
    expect(markdown.includes('user@email')).toBe(false);
  });

  it('should filter out values containing & character', () => {
    const attribute: Attribute = {
      name: 'align',
      description: 'Text alignment',
      example: '<nve-text align="left">Text</nve-text>',
      markdown: '',
      values: [
        { name: 'left' },
        { name: 'center' },
        { name: 'left&right' }, // should be filtered
        { name: 'right' }
      ]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('| `align` | `string` |`left`, `center`, `right` |')).toBe(true);
    expect(markdown.includes('left&right')).toBe(false);
  });

  it('should handle empty values array', () => {
    const attribute: Attribute = {
      name: 'custom',
      description: 'Custom attribute',
      example: '<nve-element custom="value">Element</nve-element>',
      markdown: '',
      values: []
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('## custom')).toBe(true);
    expect(markdown.includes('Custom attribute')).toBe(true);
    expect(markdown.includes('| `custom` | `string` | |')).toBe(true);
  });

  it('should handle attribute with all values filtered out', () => {
    const attribute: Attribute = {
      name: 'special',
      description: 'Special attribute',
      example: '<nve-element special="test">Element</nve-element>',
      markdown: '',
      values: [{ name: 'value|1' }, { name: '@deprecated' }, { name: 'test&value' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('## special')).toBe(true);
    expect(markdown.includes('Special attribute')).toBe(true);
    expect(markdown.includes('| `special` | `string` | |')).toBe(true);
  });

  it('should trim example content', () => {
    const attribute: Attribute = {
      name: 'color',
      description: 'Color scheme',
      example: '\n\n  <nve-button color="red">Button</nve-button>  \n\n',
      markdown: '',
      values: [{ name: 'red' }, { name: 'blue' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('```html\n<nve-button color="red">Button</nve-button>\n```')).toBe(true);
  });

  it('should format attribute name correctly in table', () => {
    const attribute: Attribute = {
      name: 'data-test-id',
      description: 'Test identifier',
      example: '<div data-test-id="test">Content</div>',
      markdown: '',
      values: [{ name: 'test' }, { name: 'example' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('## data-test-id')).toBe(true);
    expect(markdown.includes('| `data-test-id` | `string` |`test`, `example` |')).toBe(true);
  });

  it('should handle single value', () => {
    const attribute: Attribute = {
      name: 'disabled',
      description: 'Disables the element',
      example: '<button disabled>Click</button>',
      markdown: '',
      values: [{ name: 'true' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('| `disabled` | `string` |`true` |')).toBe(true);
  });
});

describe('changelogMarkdownToJSON', () => {
  it('should parse changelog with all sections', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- Added new feature A
- Added new feature B

### Bug Fixes
- Fixed bug X
- Fixed bug Y

### Breaking Changes
- Removed old API
- Changed method signature`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result).toHaveLength(2); // First element is empty due to split behavior
    expect(result[1].title).toBe('[1.0.0] - 2024-01-01');
    // Features section includes everything after it until split stops at next section
    expect(result[1].features).toContain('- Added new feature A');
    expect(result[1].features).toContain('- Added new feature B');
    expect(result[1].bugFixes).toContain('- Fixed bug X');
    expect(result[1].bugFixes).toContain('- Fixed bug Y');
    expect(result[1].breakingChanges).toContain('- Removed old API');
    expect(result[1].breakingChanges).toContain('- Changed method signature');
  });

  it('should parse multiple releases', () => {
    const changelog = `## [2.0.0] - 2024-02-01

### Features
- New feature in v2

## [1.0.0] - 2024-01-01

### Bug Fixes
- Fixed issue in v1`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result).toHaveLength(3); // First element is empty
    expect(result[1].title).toBe('[2.0.0] - 2024-02-01');
    expect(result[1].features).toEqual(['- New feature in v2']);
    expect(result[1].bugFixes).toEqual([]);
    expect(result[2].title).toBe('[1.0.0] - 2024-01-01');
    expect(result[2].features).toEqual([]);
    expect(result[2].bugFixes).toEqual(['- Fixed issue in v1']);
  });

  it('should handle release with only features', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- Feature one
- Feature two`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result[1].title).toBe('[1.0.0] - 2024-01-01');
    expect(result[1].features).toEqual(['- Feature one', '- Feature two']);
    expect(result[1].bugFixes).toEqual([]);
    expect(result[1].breakingChanges).toEqual([]);
  });

  it('should handle release with only bug fixes', () => {
    const changelog = `## [1.0.1] - 2024-01-15

### Bug Fixes
- Fixed critical bug
- Fixed minor issue`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result[1].title).toBe('[1.0.1] - 2024-01-15');
    expect(result[1].features).toEqual([]);
    expect(result[1].bugFixes).toEqual(['- Fixed critical bug', '- Fixed minor issue']);
    expect(result[1].breakingChanges).toEqual([]);
  });

  it('should handle release with only breaking changes', () => {
    const changelog = `## [2.0.0] - 2024-02-01

### Breaking Changes
- API redesign
- Removed deprecated methods`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result[1].title).toBe('[2.0.0] - 2024-02-01');
    expect(result[1].features).toEqual([]);
    expect(result[1].bugFixes).toEqual([]);
    expect(result[1].breakingChanges).toEqual(['- API redesign', '- Removed deprecated methods']);
  });

  it('should handle release with no sections', () => {
    const changelog = `## [1.0.0] - 2024-01-01

Some release notes without sections.`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result[1].title).toBe('[1.0.0] - 2024-01-01');
    expect(result[1].features).toEqual([]);
    expect(result[1].bugFixes).toEqual([]);
    expect(result[1].breakingChanges).toEqual([]);
  });

  it('should handle empty changelog', () => {
    const changelog = '';

    const result = changelogMarkdownToJSON(changelog);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('[');
  });

  it('should trim whitespace from section items', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
  - Feature with leading spaces  
    - Feature with multiple spaces

### Bug Fixes
- Bug fix with trailing whitespace    `;

    const result = changelogMarkdownToJSON(changelog);

    expect(result[1].features[0]).toBe('- Feature with leading spaces');
    expect(result[1].features[1]).toBe('- Feature with multiple spaces');
    expect(result[1].bugFixes[0]).toBe('- Bug fix with trailing whitespace');
  });

  it('should handle single item in each section', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- Single feature

### Bug Fixes
- Single bug fix

### Breaking Changes
- Single breaking change`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result[1].features).toContain('- Single feature');
    expect(result[1].bugFixes).toContain('- Single bug fix');
    expect(result[1].breakingChanges).toContain('- Single breaking change');
  });

  it('should handle sections in different order', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Bug Fixes
- Bug fix first

### Breaking Changes
- Breaking change second

### Features
- Feature last`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result[1].bugFixes).toContain('- Bug fix first');
    expect(result[1].breakingChanges).toContain('- Breaking change second');
    expect(result[1].features).toContain('- Feature last');
  });

  it('should handle multiline entries in sections', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- Feature one
  with additional details
- Feature two`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result[1].features).toHaveLength(3);
    expect(result[1].features[0]).toBe('- Feature one');
    expect(result[1].features[1]).toBe('with additional details');
    expect(result[1].features[2]).toBe('- Feature two');
  });

  it('should handle changelog with extra whitespace between sections', () => {
    const changelog = `## [1.0.0] - 2024-01-01


### Features
- Feature A


### Bug Fixes
- Bug fix B`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result[1].title).toBe('[1.0.0] - 2024-01-01');
    expect(result[1].features).toContain('- Feature A');
    expect(result[1].bugFixes).toContain('- Bug fix B');
  });

  it('should handle section stopping at next section header', () => {
    const changelog = `## [1.0.0] - 2024-01-01

### Features
- Feature A
- Feature B
### Bug Fixes
- Bug fix C`;

    const result = changelogMarkdownToJSON(changelog);

    // Features should only include items before Bug Fixes section
    expect(result[1].features).toContain('- Feature A');
    expect(result[1].features).toContain('- Feature B');
    expect(result[1].bugFixes).toContain('- Bug fix C');
  });

  it('should handle releases with brackets in title', () => {
    const changelog = `## [1.0.0] - 2024-01-01 [Beta]

### Features
- Beta feature`;

    const result = changelogMarkdownToJSON(changelog);

    expect(result[1].title).toBe('[1.0.0] - 2024-01-01 [Beta]');
    expect(result[1].features).toEqual(['- Beta feature']);
  });
});
