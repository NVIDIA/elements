import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { create, ts } from '@custom-elements-manifest/analyzer';
import { generateJsxTypes } from 'custom-element-jsx-integration';
import { generateVuejsTypes } from 'custom-element-vuejs-integration';
import { Project } from 'ts-morph';
import { getCustomDataOutputs } from './cem.js';
import cemConfig, {
  addUniqueMember,
  attributeTypesPlugin,
  createMixinApiEntry,
  createStandaloneTypesManifest,
  elementMetadataToMarkdown,
  getAttributeFacingTypeText,
  getDocumentedTypeValues,
  isEntrypointExported,
  omitVueBooleanAttributeAliases,
  projectFrameworkPropertyBindings,
  publicPropertiesPlugin,
  rewriteTypesText,
  shouldProjectMixinAttribute,
  shouldUseStandardDescription,
  typesMatch
} from './cem.config.mjs';

const packageDirectory = '/package';

function createManifest(tagNames = []) {
  return {
    modules: [
      {
        declarations: tagNames.map(tagName => ({ tagName }))
      }
    ]
  };
}

function createPackageJson(customData) {
  return {
    name: '@nvidia-elements/example',
    contributes: customData === undefined ? {} : { html: { customData } }
  };
}

test('uses the declared Custom Data output path', () => {
  assert.deepEqual(
    getCustomDataOutputs(
      createPackageJson(['./dist/editor/custom-data.json']),
      createManifest(['nve-example']),
      packageDirectory
    ),
    [
      {
        outdir: '/package/dist/editor',
        htmlFileName: 'custom-data.json'
      }
    ]
  );
});

test('requires a Custom Data contribution when the manifest declares tags', () => {
  assert.throws(
    () => getCustomDataOutputs(createPackageJson(), createManifest(['nve-example']), packageDirectory),
    /Custom Elements Manifest declares tags/
  );
});

test('rejects an empty Custom Data contribution', () => {
  assert.throws(
    () => getCustomDataOutputs(createPackageJson([]), createManifest(['nve-example']), packageDirectory),
    /must be a non-empty array/
  );
});

test('does not generate Custom Data when the manifest has no tags', () => {
  assert.deepEqual(
    getCustomDataOutputs(createPackageJson(['./dist/data.html.json']), createManifest(), packageDirectory),
    []
  );
});

test('does not generate Custom Data for sparse manifests', () => {
  for (const manifest of [{}, { modules: [{}] }]) {
    assert.deepEqual(
      getCustomDataOutputs(createPackageJson(['./dist/data.html.json']), manifest, packageDirectory),
      []
    );
  }
});

test('matches namespaced component entrypoints to package exports', () => {
  const packageJson = {
    name: '@nvidia-elements/media',
    exports: {
      './pause-button': './dist/pause-button/index.js'
    }
  };

  assert.equal(isEntrypointExported('\\@nvidia-elements/media/pause-button', packageJson), true);
  assert.equal(isEntrypointExported('\\\\@nvidia-elements/media/pause-button', packageJson), true);
  assert.equal(isEntrypointExported('@nvidia-elements/media/mute-button', packageJson), false);
});

test('rejects traversal and absolute Custom Data paths before checking manifest tags', () => {
  for (const manifest of [createManifest(), createManifest(['nve-example'])]) {
    for (const customDataPath of ['../dist/data.html.json', '/package/dist/data.html.json']) {
      assert.throws(
        () => getCustomDataOutputs(createPackageJson([customDataPath]), manifest, packageDirectory),
        /must be package-relative/
      );
    }
  }
});

test('rejects malformed Custom Data contributions', () => {
  assert.throws(
    () => getCustomDataOutputs(createPackageJson(['./dist/data.html.json', 1]), createManifest(), packageDirectory),
    /must be a non-empty array/
  );
});

test('matches equivalent standard property types', () => {
  assert.equal(
    typesMatch({ type: { text: `"horizontal" | "vertical" | undefined` } }, { type: `'vertical'\n| 'horizontal'` }),
    true
  );
});

test('preserves default when it is a declared type value', () => {
  assert.equal(typesMatch({ type: { text: `'compact'` } }, { type: `'default' | 'compact'` }), false);
  assert.equal(typesMatch({ type: { text: `"default" | "compact"` } }, { type: `'default' | 'compact'` }), true);
});

test('preserves empty strings when they are declared type values', () => {
  assert.equal(typesMatch({ type: { text: `'fixed' | 'sticky'` } }, { type: `'fixed' | 'sticky' | ''` }), false);
});

test('preserves optionality when rewriting type aliases', () => {
  const entry = { type: { text: 'Size | undefined' } };

  rewriteTypesText(entry, new Map([['Size', [`'sm'`, `'md'`]]]));

  assert.equal(entry.type.text, `'sm' | 'md' | undefined`);
  assert.deepEqual(entry.type._sourceAliases, ['Size']);
});

test('rewrites aliases within Extract types while preserving union order', () => {
  const entry = { type: { text: "Extract<Container, Size | 'full'> | undefined" } };

  rewriteTypesText(entry, new Map([['Size', [`'sm'`, `'md'`]]]));

  assert.equal(entry.type.text, `'sm' | 'md' | 'full' | undefined`);
  assert.deepEqual(entry.type._sourceAliases, ['Size']);
});

test('removes a terminal Extract delimiter without an outer union', () => {
  const entry = { type: { text: "Extract<Prominence, 'emphasis'>" } };

  rewriteTypesText(entry);

  assert.equal(entry.type.text, `'emphasis'`);
});

test('preserves declared default literals when rewriting type aliases', () => {
  const entry = { type: { text: 'Scale | undefined' } };

  rewriteTypesText(entry, new Map([['Scale', [`'default'`, `'compact'`]]]));

  assert.equal(entry.type.text, `'default' | 'compact' | undefined`);
});

test('documents declared default literals without documenting optionality', () => {
  assert.deepEqual(getDocumentedTypeValues(`'default' | 'compact' | '' | undefined`), ['default', 'compact']);
});

test('adds inherited descriptions to existing projected members', () => {
  const existingMember = { kind: 'field', name: 'value', type: { text: 'number' } };
  const declaration = { members: [existingMember] };

  addUniqueMember(declaration, {
    kind: 'field',
    name: 'value',
    type: { text: 'T' },
    description: 'The current form control value.'
  });

  assert.equal(declaration.members.length, 1);
  assert.equal(existingMember.description, 'The current form control value.');
  assert.equal(existingMember.type.text, 'number');
});

test('projects form control method signatures', () => {
  const project = new Project({ compilerOptions: { strictNullChecks: true }, skipAddingFilesFromTsConfig: true });
  const source = project.addSourceFileAtPath(
    fileURLToPath(new URL('../../../../forms/src/mixins/control.ts', import.meta.url))
  );
  const mixin = source.getInterfaceOrThrow('FormControlMixinInstance');
  const declaration = { tagName: 'nve-example', metadata: { entrypoint: '@nvidia-elements/example' }, members: [] };

  for (const name of ['setCustomValidity', 'checkValidity']) {
    const property = mixin
      .getType()
      .getProperties()
      .find(property => property.getName() === name);
    assert.ok(property);
    const entry = createMixinApiEntry(property, mixin, 'FormControlMixin');
    assert.ok(entry);
    addUniqueMember(declaration, entry.member);
  }

  assert.deepEqual(declaration.members[0].parameters, [{ name: 'message', type: { text: 'string' } }]);
  assert.deepEqual(declaration.members[0].return, { type: { text: 'void' } });
  assert.deepEqual(declaration.members[1].parameters, []);
  assert.deepEqual(declaration.members[1].return, { type: { text: 'boolean' } });

  const markdown = elementMetadataToMarkdown(declaration);
  assert.match(markdown, /setCustomValidity\(message: string\): void/);
  assert.match(markdown, /checkValidity\(\): boolean/);
});

test('narrows inferred string members to inherited finite unions', () => {
  const existingMember = { kind: 'field', name: 'type', type: { text: 'string' }, default: "'button'" };
  const declaration = { members: [existingMember] };

  addUniqueMember(declaration, {
    kind: 'field',
    name: 'type',
    type: { text: "'button' | 'submit' | 'reset'" },
    description: 'Defines button behavior.'
  });

  assert.equal(existingMember.type.text, "'button' | 'submit' | 'reset'");
  assert.equal(existingMember.default, "'button'");
});

test('uses ID strings for element-reference attributes', () => {
  assert.equal(getAttributeFacingTypeText('string | HTMLElement'), 'string');
  assert.equal(getAttributeFacingTypeText('HTMLFormElement | null | string'), 'string');
  assert.equal(getAttributeFacingTypeText('HTMLElement | null'), 'string');
  assert.equal(getAttributeFacingTypeText('File[]', 'File[]'), 'File[]');
});

test('normalizes linked element-reference attribute types', () => {
  const declaration = {
    tagName: 'nve-example',
    members: [{ kind: 'field', name: 'anchor', type: { text: 'string | HTMLElement' } }],
    attributes: [{ name: 'anchor', fieldName: 'anchor', type: { text: 'string | HTMLElement' } }]
  };

  attributeTypesPlugin().packageLinkPhase({
    customElementsManifest: { modules: [{ declarations: [declaration] }] }
  });

  assert.equal(declaration.attributes[0].type.text, 'string');
});

test('preserves explicit attribute types and descriptions over Lit property inference', () => {
  const declaration = {
    name: 'Example',
    attributes: [
      {
        name: 'step-sizes',
        type: { text: 'number[]' },
        description: 'Page-size options available in the selector.'
      }
    ]
  };
  const sourceFile = {};
  const node = {
    kind: 1,
    name: { getText: () => declaration.name },
    getSourceFile: () => sourceFile,
    jsDoc: [
      {
        tags: [
          {
            tagName: { getText: () => 'attribute' },
            getText: () =>
              '@attribute {string} step-sizes - A JSON-serialized array of page-size options available in the selector.'
          }
        ]
      }
    ]
  };

  attributeTypesPlugin().analyzePhase({
    ts: { SyntaxKind: { ClassDeclaration: 1 } },
    node,
    moduleDoc: { declarations: [declaration] }
  });

  assert.deepEqual(declaration.attributes[0], {
    name: 'step-sizes',
    type: { text: 'string' },
    description: 'A JSON-serialized array of page-size options available in the selector.'
  });
});

test('projects the complete property and attribute relationship matrix for frameworks', () => {
  const declaration = {
    members: [
      { kind: 'field', name: 'propertyOnly', type: { text: 'number' } },
      {
        kind: 'field',
        name: 'sameNameSameType',
        attribute: 'sameNameSameType',
        type: { text: 'string' },
        description: 'Property description.'
      },
      {
        kind: 'field',
        name: 'sameNameDifferentType',
        attribute: 'sameNameDifferentType',
        type: { text: '{ value: string }' },
        description: 'Property description.'
      },
      {
        kind: 'field',
        name: 'differentNameSameType',
        attribute: 'different-name-same-type',
        type: { text: 'boolean' }
      },
      {
        kind: 'field',
        name: 'differentNameDifferentType',
        attribute: 'different-name-different-type',
        type: { text: 'string | HTMLElement' }
      }
    ],
    attributes: [
      { name: 'attribute-only', type: { text: 'string' } },
      {
        name: 'sameNameSameType',
        fieldName: 'sameNameSameType',
        type: { text: 'string' },
        description: 'Attribute description.'
      },
      {
        name: 'sameNameDifferentType',
        type: { text: 'string' },
        description: 'Attribute description.'
      },
      {
        name: 'different-name-same-type',
        fieldName: 'differentNameSameType',
        type: { text: 'boolean' }
      },
      {
        name: 'different-name-different-type',
        fieldName: 'differentNameDifferentType',
        type: { text: 'string' }
      }
    ]
  };

  projectFrameworkPropertyBindings(declaration);

  assert.deepEqual(
    declaration.members.map(({ name, attribute, description }) => ({ name, attribute, description })),
    [
      { name: 'propertyOnly', attribute: undefined, description: undefined },
      { name: 'sameNameSameType', attribute: undefined, description: 'Property description.' },
      { name: 'sameNameDifferentType', attribute: undefined, description: 'Property description.' },
      { name: 'differentNameSameType', attribute: undefined, description: undefined },
      { name: 'differentNameDifferentType', attribute: undefined, description: undefined }
    ]
  );
  assert.deepEqual(
    declaration.attributes.map(attribute => attribute.name),
    ['attribute-only', 'different-name-same-type', 'different-name-different-type']
  );
});

test('generates JSX and Vue bindings from property and attribute relationships', () => {
  const outputDirectory = mkdtempSync(join(tmpdir(), 'cem-framework-types-'));
  const manifest = {
    modules: [
      {
        declarations: [
          {
            kind: 'class',
            customElement: true,
            name: 'Pagination',
            tagName: 'nve-pagination',
            members: [
              {
                kind: 'field',
                name: 'stepSizes',
                attribute: 'step-sizes',
                type: { text: 'number[]' },
                description: 'Page-size options available in the selector.'
              }
            ],
            attributes: [
              {
                name: 'step-sizes',
                fieldName: 'stepSizes',
                type: { text: 'string' },
                description: 'A JSON-serialized array of page-size options available in the selector.'
              }
            ]
          },
          {
            kind: 'class',
            customElement: true,
            name: 'PreferencesInput',
            tagName: 'nve-preferences-input',
            members: [
              {
                kind: 'field',
                name: 'value',
                attribute: 'value',
                type: { text: '{ theme?: string }' },
                description: 'Contains the current preferences.'
              }
            ],
            attributes: [
              {
                name: 'value',
                type: { text: 'string' },
                description: 'A JSON-serialized preferences object.'
              }
            ]
          },
          {
            kind: 'class',
            customElement: true,
            name: 'Dropdown',
            tagName: 'nve-dropdown',
            members: [
              {
                kind: 'field',
                name: 'anchor',
                attribute: 'anchor',
                type: { text: 'string | HTMLElement' },
                description: 'Sets the positioning anchor.'
              }
            ],
            attributes: [
              {
                name: 'anchor',
                fieldName: 'anchor',
                type: { text: 'string' },
                description: 'Sets the positioning anchor ID.'
              }
            ]
          },
          {
            kind: 'class',
            customElement: true,
            name: 'Accordion',
            tagName: 'nve-accordion',
            members: [
              {
                kind: 'field',
                name: 'nodes',
                readonly: true,
                type: { text: 'TreeNode[]' },
                description: 'Returns the slotted child tree nodes.'
              },
              {
                kind: 'field',
                name: 'behaviorExpand',
                attribute: 'behavior-expand',
                type: { text: 'boolean' },
                description: 'Enables stateful expansion behavior.'
              }
            ],
            attributes: [
              {
                name: 'behavior-expand',
                fieldName: 'behaviorExpand',
                type: { text: 'boolean' },
                description: 'Enables stateful expansion behavior.'
              },
              {
                name: 'boolean-attribute-only',
                type: { text: 'boolean' },
                description: 'An attribute-only Boolean API.'
              }
            ]
          }
        ]
      }
    ]
  };

  const jsxManifest = createStandaloneTypesManifest(manifest);
  const vueManifest = structuredClone(jsxManifest);

  vueManifest.modules[0].declarations.forEach(declaration => {
    omitVueBooleanAttributeAliases(declaration);
  });

  assert.ok(manifest.modules[0].declarations[3].members.some(member => member.name === 'nodes'));
  assert.ok(jsxManifest.modules[0].declarations[3].members.every(member => member.name !== 'nodes'));

  try {
    generateJsxTypes(jsxManifest, {
      outdir: outputDirectory,
      fileName: 'jsx.d.ts',
      typesSrc: 'standaloneType',
      hideLogs: true
    });
    generateVuejsTypes(vueManifest, {
      outdir: outputDirectory,
      fileName: 'vue.d.ts',
      typesSrc: 'standaloneType',
      hideLogs: true
    });

    for (const fileName of ['jsx.d.ts', 'vue.d.ts']) {
      const output = readFileSync(join(outputDirectory, fileName), 'utf8');
      assert.match(output, /stepSizes\?: number\[\];/);
      assert.match(output, /"step-sizes"\?: string;/);
      assert.match(output, /\/\*\* Contains the current preferences\. \*\/\s+value\?: \{ theme\?: string \};/);
      assert.doesNotMatch(output, /A JSON-serialized preferences object/);
      assert.match(output, /anchor\?: string \| HTMLElement;/);
      assert.doesNotMatch(output, /anchor\?: string;/);
      assert.match(output, /behaviorExpand\?: boolean;/);
      assert.match(output, /"boolean-attribute-only"\?: boolean;/);
      assert.doesNotMatch(output, /nodes\?: TreeNode\[\];/);
    }

    assert.match(readFileSync(join(outputDirectory, 'jsx.d.ts'), 'utf8'), /"behavior-expand"\?: boolean;/);
    assert.doesNotMatch(readFileSync(join(outputDirectory, 'vue.d.ts'), 'utf8'), /"behavior-expand"\?: boolean;/);
  } finally {
    rmSync(outputDirectory, { recursive: true, force: true });
  }
});

test('omits non-serializable inherited attributes', () => {
  const valueAttribute = { name: 'value', fieldName: 'value' };

  assert.equal(shouldProjectMixinAttribute({ tagName: 'nve-dropzone' }, valueAttribute), false);
  assert.equal(shouldProjectMixinAttribute({ tagName: 'nve-preferences-input' }, valueAttribute), true);
});

test('rejects standard property types with different values', () => {
  assert.equal(
    typesMatch(
      { type: { text: `'fixed' | 'sticky' | ''` } },
      { type: `'top-start'\n| 'top-end'\n| 'bottom-start'\n| 'bottom-end'` }
    ),
    false
  );
});

test('excludes semantically overloaded properties from standard descriptions', () => {
  assert.equal(shouldUseStandardDescription({ tagName: 'nve-copy-button' }, { name: 'value' }), false);
  assert.equal(shouldUseStandardDescription({ tagName: 'nve-preferences-input' }, { name: 'value' }), false);
  assert.equal(
    shouldUseStandardDescription(
      { tagName: 'nve-button' },
      { name: 'readonly', fieldName: 'readOnly', inheritedFrom: { name: 'ButtonFormControlMixin' } }
    ),
    false
  );
  assert.equal(
    shouldUseStandardDescription(
      { tagName: 'nve-input' },
      { name: 'readonly', fieldName: 'readOnly', inheritedFrom: { name: 'FormControlMixin' } }
    ),
    true
  );
  assert.equal(
    shouldUseStandardDescription(
      { tagName: 'nve-button' },
      { name: 'value', inheritedFrom: { name: 'ButtonFormControlMixin' } }
    ),
    true
  );
});

test('renders distinct property and attribute types in generated Markdown', () => {
  const markdown = elementMetadataToMarkdown({
    tagName: 'nve-example',
    metadata: { entrypoint: '@nvidia-elements/example' },
    members: [
      {
        kind: 'field',
        name: 'form',
        attribute: 'form',
        type: { text: 'string | HTMLFormElement | null' },
        description: 'Associates the button with a form.'
      }
    ],
    attributes: [{ name: 'form', fieldName: 'form', type: { text: 'string' } }]
  });

  assert.ok(
    markdown.includes(
      '| form | property: `string \\| HTMLFormElement \\| null`; attribute: `string` | Associates the button with a form. |'
    )
  );
});

test('escapes type backslashes before Markdown table separators', () => {
  const markdown = elementMetadataToMarkdown({
    tagName: 'nve-example',
    metadata: { entrypoint: '@nvidia-elements/example' },
    members: [
      {
        kind: 'field',
        name: 'pattern',
        attribute: 'pattern',
        type: { text: "'\\\\d+' | RegExp" },
        description: 'Defines a pattern.'
      }
    ],
    attributes: [{ name: 'pattern', fieldName: 'pattern', type: { text: "'\\\\w+' | string" } }]
  });

  assert.ok(
    markdown.includes(
      "| pattern | property: `'\\\\\\\\d+' \\| RegExp`; attribute: `'\\\\\\\\w+' \\| string` | Defines a pattern. |"
    )
  );
});

test('includes only public members in generated Markdown', () => {
  const markdown = elementMetadataToMarkdown({
    tagName: 'nve-example',
    metadata: { entrypoint: '@nvidia-elements/example' },
    members: [
      { kind: 'field', name: 'implicitPublic', type: { text: 'string' } },
      { kind: 'field', name: 'explicitPublic', privacy: 'public', type: { text: 'string' } },
      { kind: 'field', name: 'protectedField', privacy: 'protected', type: { text: 'string' } },
      { kind: 'method', name: 'protectedMethod', privacy: 'protected', type: { text: '() => void' } },
      { kind: 'field', name: 'privateField', privacy: 'private', type: { text: 'string' } }
    ]
  });

  assert.match(markdown, /implicitPublic/);
  assert.match(markdown, /explicitPublic/);
  assert.doesNotMatch(markdown, /protectedField/);
  assert.doesNotMatch(markdown, /protectedMethod/);
  assert.doesNotMatch(markdown, /privateField/);
});

test('removes attributes linked to non-public members', () => {
  const declaration = {
    tagName: 'nve-example',
    members: [
      { kind: 'field', name: 'implicitPublic' },
      { kind: 'field', name: 'explicitPublic', privacy: 'public' },
      { kind: 'field', name: 'protectedField', privacy: 'protected' },
      { kind: 'field', name: 'privateField', privacy: 'private' }
    ],
    attributes: [
      { name: 'implicit-public', fieldName: 'implicitPublic' },
      { name: 'explicit-public', fieldName: 'explicitPublic' },
      { name: 'protected-field', fieldName: 'protectedField' },
      { name: 'private-field', fieldName: 'privateField' },
      { name: 'orphan-attribute', fieldName: 'orphanAttribute' }
    ]
  };

  publicPropertiesPlugin().packageLinkPhase({
    customElementsManifest: { modules: [{ declarations: [declaration] }] }
  });

  assert.deepEqual(
    declaration.members.map(member => member.name),
    ['implicitPublic', 'explicitPublic']
  );
  assert.deepEqual(
    declaration.attributes.map(attribute => attribute.name),
    ['implicit-public', 'explicit-public', 'orphan-attribute']
  );
});

test('preserves documented readonly members', () => {
  const declaration = {
    tagName: 'nve-example',
    members: [
      { kind: 'field', name: 'documentedField', readonly: true, description: 'Returns the current state.' },
      { kind: 'method', name: 'documentedMethod', readonly: true, description: 'Returns the current state.' },
      { kind: 'field', name: 'undocumentedField', readonly: true },
      { kind: 'field', name: 'emptyDescription', readonly: true, description: '  ' },
      { kind: 'field', name: 'protectedField', privacy: 'protected', readonly: true, description: 'Internal state.' },
      { kind: 'field', name: '_internalField', readonly: true, description: 'Internal state.' },
      { kind: 'field', name: 'staticField', static: true, readonly: true, description: 'Static state.' }
    ],
    attributes: [
      { name: 'documented-field', fieldName: 'documentedField' },
      { name: 'undocumented-field', fieldName: 'undocumentedField' }
    ]
  };

  publicPropertiesPlugin().packageLinkPhase({
    customElementsManifest: { modules: [{ declarations: [declaration] }] }
  });

  assert.deepEqual(
    declaration.members.map(member => member.name),
    ['documentedField', 'documentedMethod']
  );
  assert.deepEqual(
    declaration.attributes.map(attribute => attribute.name),
    ['documented-field']
  );
});

test('keeps callable method overloads in the manifest', () => {
  const source = ts.createSourceFile(
    'example.ts',
    `export class Example {
      scrollTo(options?: ScrollToOptions): Promise<void>;
      scrollTo(x: number, y: number): Promise<void>;
      /** Scroll to a position. */
      async scrollTo(...args: [options?: ScrollToOptions] | [x: number, y: number]): Promise<void> {}
      reset(): void {}
    }`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const plugin = cemConfig.plugins.find(plugin => plugin.name === 'overload-methods-plugin');
  assert.ok(plugin);

  const manifest = create({ modules: [source], plugins: [plugin] });
  const declaration = manifest.modules[0].declarations.find(declaration => declaration.name === 'Example');
  const overloads = declaration.members.filter(member => member.name === 'scrollTo');

  assert.deepEqual(
    overloads.map(method => method.parameters.map(parameter => parameter.name)),
    [['options'], ['x', 'y']]
  );
  assert.equal(overloads[0].description, 'Scroll to a position.');
  assert.ok(declaration.members.some(member => member.name === 'reset'));
});

test('renders fields and method overloads in separate Markdown sections', () => {
  const markdown = elementMetadataToMarkdown({
    tagName: 'nve-example',
    metadata: { entrypoint: '@nvidia-elements/example' },
    members: [
      {
        kind: 'field',
        name: 'targetScale',
        readonly: true,
        type: { text: 'number' },
        description: 'The target scale.'
      },
      {
        kind: 'method',
        name: 'scrollTo',
        description: 'Scroll to a position.',
        parameters: [{ name: 'options', optional: true, type: { text: 'ScrollToOptions' } }],
        return: { type: { text: 'Promise<void>' } }
      },
      {
        kind: 'method',
        name: 'scrollTo',
        parameters: [
          { name: 'x', type: { text: 'number' } },
          { name: 'y', type: { text: 'number' } }
        ],
        return: { type: { text: 'Promise<void>' } }
      }
    ]
  });
  const properties = markdown.split('### Properties / Attributes')[1].split('### Methods')[0];
  const methods = markdown.split('### Methods')[1];

  assert.match(properties, /\| targetScale \| `number` \| The target scale\. \|/);
  assert.doesNotMatch(properties, /scrollTo/);
  assert.match(
    methods,
    /\| scrollTo \| `scrollTo\(options\?: ScrollToOptions\): Promise<void>`<br>`scrollTo\(x: number, y: number\): Promise<void>` \| Scroll to a position\. \|/
  );
  assert.equal((methods.match(/\| scrollTo \|/g) ?? []).length, 1);
  assert.doesNotMatch(methods, /targetScale/);
});

test('sorts generated Markdown API rows by name', () => {
  const markdown = elementMetadataToMarkdown({
    tagName: 'nve-example',
    metadata: { entrypoint: '@nvidia-elements/example' },
    members: [
      { kind: 'field', name: 'y' },
      { kind: 'field', name: 'x' },
      { kind: 'method', name: 'zoom' },
      { kind: 'method', name: 'pan' }
    ],
    slots: [{ name: 'suffix' }, { name: 'prefix' }, { name: '' }],
    events: [{ name: 'zoom' }, { name: 'pan' }],
    commands: [{ name: '--zoom-in' }, { name: '--pan-left' }],
    cssProperties: [{ name: '--z-color' }, { name: '--a-color' }]
  });
  const rowNames = title => {
    const section = markdown.split(`### ${title}\n`)[1]?.split('\n### ')[0] ?? '';
    return [...section.matchAll(/^\| ([^|]+) \|/gm)].slice(2).map(match => match[1]);
  };

  assert.deepEqual(rowNames('Properties / Attributes'), ['x', 'y']);
  assert.deepEqual(rowNames('Events'), ['pan', 'zoom']);
  assert.deepEqual(rowNames('Slots'), ['(default)', 'prefix', 'suffix']);
  assert.deepEqual(rowNames('Invoker Commands'), ['--pan-left', '--zoom-in']);
  assert.deepEqual(rowNames('Methods'), ['pan', 'zoom']);
  assert.deepEqual(rowNames('CSS Properties'), ['--a-color', '--z-color']);
});
