import path from 'path';
import fs from 'fs';
import { Project, SyntaxKind } from 'ts-morph';
import { customElementJsxPlugin } from 'custom-element-jsx-integration';
import { customElementVuejsPlugin } from 'custom-element-vuejs-integration';

const resolve = rel => path.resolve(process.cwd(), rel);
const pkg = JSON.parse(fs.readFileSync(resolve('./package.json'), 'utf-8'));
const runtimeEnvironment = {};
const baseInterface = getBaseInterface();

/** todo: this should be more generalized and not coupled specifically to the elements core package */
function getBaseInterface() {
  const baseInterfacePath = resolve('src/internal/types/index.ts');

  if (fs.existsSync(baseInterfacePath)) {
    const project = new Project();
    const file = project.addSourceFileAtPath(baseInterfacePath);
    const base = file.getChildrenOfKind(SyntaxKind.InterfaceDeclaration).find(i => i.getName() === 'NveElement');
    return base ? base.getStructure().properties.reduce((p, n) => ({ ...p, [n.name]: n }), {}) : {};
  } else {
    return {};
  }
}

function metadataPlugin() {
  return {
    // https://github.com/webcomponents/custom-elements-manifest/issues/42
    name: 'metadata',
    analyzePhase({ ts, node, moduleDoc }) {
      const metadata = [
        'responsive',
        'themes',
        'vqa',
        'aria',
        'stable',
        'performance',
        'package',
        'since',
        'axe',
        'entrypoint',
        'example'
      ];

      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const classDeclaration = moduleDoc.declarations.find(
            declaration => declaration.name === node.name?.getText()
          );

          node.jsDoc?.forEach(jsDoc => {
            jsDoc.tags?.forEach(tag => {
              const tagName = tag.tagName?.getText();

              if (tagName === 'description') {
                classDeclaration.description = tag.comment?.trim() ?? '';
              }

              if (metadata.find(m => m === tagName)) {
                let value = tag.comment;
                if (value === 'true') {
                  value = true;
                }

                if (value === 'false') {
                  value = false;
                }

                classDeclaration.metadata = { ...classDeclaration.metadata, [tagName]: value };
              }
            });
          });

          if (classDeclaration.metadata && classDeclaration.tagName) {
            classDeclaration.metadata = {
              unitTests: true,
              apiReview: true,
              performance: true,
              stable: true,
              vqa: true,
              responsive: true,
              themes: true,
              aria: false,
              entrypoint: '',
              example: '',
              package: JSON.stringify(pkg.exports).includes(classDeclaration.tagName.split('-')[1]),
              ...classDeclaration.metadata
            };

            classDeclaration.metadata.entrypoint = classDeclaration.metadata.entrypoint.replace('\\', '');
            classDeclaration.metadata.status = getElementStability(classDeclaration.metadata);
            classDeclaration.metadata.behavior = getBehaviorCategory(classDeclaration);
            classDeclaration.metadata.aria = getSpecUrl(classDeclaration);
            classDeclaration.metadata.example = getExample(classDeclaration, moduleDoc.path);
          }

          if (classDeclaration.tagName) {
            const disallowed = [
              {
                name: 'nve-layout',
                deprecated: true,
                description: 'not supported on custom element tags',
                type: {
                  text: 'string',
                  values: [
                    {
                      value: 'string',
                      description: ''
                    }
                  ]
                }
              },
              {
                name: 'nve-text',
                deprecated: true,
                description: 'not supported on custom element tags',
                type: {
                  text: 'string',
                  values: [
                    {
                      value: 'string',
                      description: ''
                    }
                  ]
                }
              }
            ];

            classDeclaration.attributes = [...(classDeclaration.attributes ?? []), ...disallowed];
            classDeclaration.members = [
              ...(classDeclaration.members ?? []),
              ...disallowed.map(i => ({ ...i, attribute: i.name, kind: 'field' }))
            ];
          }
          break;
      }
    }
  };
}

function getExample(classDeclaration, path) {
  if (classDeclaration.metadata.example?.length) {
    return classDeclaration.metadata.example;
  } else {
    const examplePath = path.replace('src', 'dist').replace('.ts', '.examples.json');

    if (fs.existsSync(examplePath)) {
      const exampleJSON = JSON.parse(fs.readFileSync(examplePath, 'utf-8'));
      const example = exampleJSON.items[0]?.template?.trim();
      return example ? example : '';
    }
  }
  return '';
}

function getElementStability(metadata) {
  let status = 'unknown';
  const preRelease = metadata.apiReview;
  const beta = metadata.unitTests && metadata.apiReview && metadata.vqa && metadata.package;
  const stable = metadata.stable && metadata.performance && metadata.aria?.length;

  if (preRelease) {
    status = 'pre-release';
  }

  if (preRelease && beta) {
    status = 'beta';
  }

  if (preRelease && beta && stable) {
    status = 'stable';
  }

  return status;
}

function getBehaviorCategory(classDeclaration) {
  const ariaSpecs = {
    navigation: [
      'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
      'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/',
      'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/',
      'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/',
      'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/',
      'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/',
      'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav'
    ],
    list: ['https://www.w3.org/WAI/ARIA/apg/patterns/grid/', 'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/'],
    feedback: ['https://www.w3.org/WAI/ARIA/apg/patterns/alert/'],
    container: [
      'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/',
      'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/group_role'
    ]
  };

  if (classDeclaration.superclass?.name === 'BaseButton' || classDeclaration.superclass?.name === 'Button') {
    return 'button';
  }

  if (JSON.stringify(classDeclaration.members).includes('TypeNativePopoverController')) {
    return 'popover';
  }

  if (ariaSpecs.feedback.find(i => i === classDeclaration.metadata.aria)) {
    return 'feedback';
  }

  if (ariaSpecs.navigation.find(i => i === classDeclaration.metadata.aria)) {
    return 'navigation';
  }

  if (ariaSpecs.list.find(i => i === classDeclaration.metadata.aria)) {
    return 'list';
  }

  if (ariaSpecs.container.find(i => i === classDeclaration.metadata.aria) || classDeclaration.name.startsWith('Card')) {
    return 'container';
  }

  if (
    classDeclaration.mixins?.find(i => i.name === 'FormControlMixin') ||
    classDeclaration.superclass?.name === 'Control' ||
    classDeclaration.superclass?.name === 'ControlGroup' ||
    classDeclaration.name.startsWith('Control') ||
    classDeclaration.members?.some(m => m.name === 'formAssociated')
  ) {
    return 'form';
  }

  return classDeclaration.metadata.category ?? 'content';
}

function getSpecUrl(classDeclaration) {
  if (classDeclaration.metadata.aria) {
    return classDeclaration.metadata.aria;
  }

  if (getBehaviorCategory(classDeclaration) === 'button') {
    return 'https://www.w3.org/WAI/ARIA/apg/patterns/button/';
  }

  if (getBehaviorCategory(classDeclaration) === 'form') {
    return 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals';
  }

  if (getBehaviorCategory(classDeclaration) === 'popover') {
    return 'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/popover';
  }

  return '#';
}

function commandPlugin() {
  return {
    name: 'command',
    analyzePhase({ ts, node, moduleDoc }) {
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const classDeclaration = moduleDoc.declarations.find(
            declaration => declaration.name === node.name?.getText()
          );

          const commands = [];
          node.jsDoc?.forEach(jsDoc => {
            jsDoc.tags?.forEach(tag => {
              if (tag.tagName?.getText() === 'command') {
                const comment = tag.comment?.trim();
                if (comment) {
                  const parts = comment.split(/\s+-\s+/);
                  const name = parts[0].trim();
                  const description = parts[1]?.trim() ?? '';
                  commands.push({ name, description });
                }
              }
            });
          });

          if (commands.length) {
            classDeclaration.commands = commands;
          }
          break;
      }
    }
  };
}

function basePathPlugin() {
  return {
    name: 'base',
    packageLinkPhase({ customElementsManifest }) {
      const base = resolve(process.cwd(), 'src');
      customElementsManifest.modules = JSON.parse(
        JSON.stringify(customElementsManifest.modules).replaceAll(`"/${base}`, '"').replaceAll(`"${base}`, '"')
      );
    }
  };
}

function extensionPlugin() {
  return {
    name: 'extensions',
    packageLinkPhase({ customElementsManifest }) {
      customElementsManifest.modules = JSON.parse(
        JSON.stringify(customElementsManifest.modules).replace(/\.ts"/g, '.js"')
      );
    }
  };
}

function orderPlugin() {
  return {
    name: 'order',
    packageLinkPhase({ customElementsManifest }) {
      customElementsManifest.modules.sort((a, b) => (a.path < b.path ? -1 : 1));
    }
  };
}

function deprecatedPlugin() {
  return {
    name: 'deprecated',
    packageLinkPhase({ customElementsManifest }) {
      // remove deprecated slots
      customElementsManifest.modules
        .flatMap(module => module.declarations)
        .forEach(declaration => {
          if (declaration.slots) {
            declaration.slots = declaration.slots.filter(slot => !slot.description?.includes('deprecated'));
          }
        });
    }
  };
}

function jsxTypesPlugin() {
  return customElementJsxPlugin({
    outdir: resolve('dist'),
    fileName: 'custom-elements-jsx.d.ts',
    globalEvents: `
      onClick?: (event: MouseEvent) => void;
      onKeyDown?: (event: KeyboardEvent) => void;
      onKeyUp?: (event: KeyboardEvent) => void;
      onKeyPressed?: (event: KeyboardEvent) => void;
      onFocus?: (event: FocusEvent) => void;
      onBlur?: (event: FocusEvent) => void;
      onMouseEnter?: (event: MouseEvent) => void;
      onMouseLeave?: (event: FocusEvent) => void;
      onMouseMove?: (event: FocusEvent) => void;
      onPointerDown?: (event: PointerEvent) => void;
      onPointerUp?: (event: PointerEvent) => void;
      onPointerMove?: (event: PointerEvent) => void;
    `
  });
}

function vueTypesPlugin() {
  return customElementVuejsPlugin({
    outdir: resolve('dist'),
    fileName: 'custom-elements-vue.d.ts'
  });
}

function cssPropsPlugin() {
  const standardCSSProps = new Set([
    'color',
    'background',
    'padding',
    'border',
    'border-bottom',
    'border-color',
    'border-radius',
    'border-top',
    'border-left',
    'border-right',
    'border-width',
    'font-family',
    'font-size',
    'font-weight',
    'line-height',
    'overflow',
    'justify-content',
    'align-items',
    'transition',
    'white-space',
    'animation-duration',
    'cursor',
    'gap',
    'text-wrap',
    'text-align',
    'text-transform',
    'line-height',
    'text-decoration',
    'width',
    'height',
    'min-width',
    'max-width',
    'min-height',
    'max-height',
    'accent-color',
    'animation-duration',
    'box-shadow',
    'opacity',
    'top',
    'bottom',
    'left',
    'right'
  ]);

  return {
    name: 'cssprops',
    packageLinkPhase({ customElementsManifest }) {
      customElementsManifest.modules
        ?.flatMap(module => module.declarations)
        ?.flatMap(declaration => declaration.cssProperties ?? [])
        ?.forEach(cssProperty => {
          cssProperty.description = cssProperty.description ?? '';
          const name = cssProperty.name
            .replace('--label-', '')
            .replace('--control-', '')
            .replace('--icon-', '')
            .replace('--track-', '')
            .replace('--thumb-', '')
            .replace('--anchor-', '')
            .replace('--arrow-', '')
            .replace('--', '');
          if (standardCSSProps.has(name)) {
            cssProperty.description =
              `${cssProperty.description} [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/${name})`.trim();
          }
        });
    }
  };
}

function elementMetadataToMarkdownPlugin() {
  return {
    name: 'element-metadata-to-markdown',
    packageLinkPhase({ customElementsManifest }) {
      customElementsManifest.modules.forEach(module => {
        module.declarations
          .filter(declaration => declaration.tagName)
          .forEach(declaration => {
            if (!declaration.metadata) {
              declaration.metadata = {};
            }
            declaration.metadata.markdown = elementMetadataToMarkdown(declaration);
          });
      });
    }
  };
}

/** Deduplicate members by name, preferring entries that have a description (handles TS method overloads). */
function deduplicateByName(members) {
  const seen = new Map();
  for (const member of members) {
    const existing = seen.get(member.name);
    if (!existing || (!existing.description && member.description)) {
      seen.set(member.name, member);
    }
  }
  return [...seen.values()];
}

function elementMetadataToMarkdown(manifest) {
  if (manifest.tagName) {
    const slots = manifest.slots?.filter(i => !i.description?.includes('deprecated')) ?? [];
    const members = deduplicateByName(manifest.members?.filter(i => !i.deprecated) ?? []);
    return `
## ${manifest.tagName}
${manifest.description ? `\n${manifest.description}\n` : ''}${manifest.metadata.example ? `\n### Example\n\n\`\`\`html\n${manifest.metadata.example}\n\`\`\`\n` : ''}
### Import

\`\`\`javascript
import '${manifest.metadata.entrypoint}/define.js';
\`\`\`

${
  slots.length
    ? `### Slots\n
| name | value | description |
| ---- | ----- | ----------- |
${slots.map(i => `| ${i.name || '(default)'} | \`string\` | ${formatDescription(i.description)} |`).join('\n')}\n`
    : ''
}

${
  members.length
    ? `### Properties / Attributes\n
| property (attribute) | value | description |
| -------------------- | ----- | ----------- |
${members
  .map(i => {
    let type = i.type?.text ? `\`${i.type?.text.replace(/\|/g, '\\|')}\`` : '';

    if (manifest.tagName.startsWith('nve-icon') && i.name === 'name') {
      const values = i.type?.values
        ?.slice(0, 20)
        .map(v => `\`${v.value}\``)
        .join(' \\| ');
      type = `${values} ... (use \`icons_list\` tool for full list)`;
    }

    return `| ${i.name}${i.attribute && i.attribute !== i.name ? ` (${i.attribute})` : ''} | ${type} | ${formatDescription(i.description)} |`;
  })
  .join('\n')}\n`
    : ''
}

${
  manifest.events?.length
    ? `### Events\n
| name | value | description |
| ---- | ----- | ----------- |
${manifest.events.map(i => `| ${i.name} | \`CustomEvent\` | ${formatDescription(i.description)} |`).join('\n')}\n`
    : ''
}

${
  manifest.commands?.length
    ? `### Invoker Commands\n
| name | value | description |
| ---- | ----- | ----------- |
${manifest.commands.map(i => `| ${i.name} | \`CommandEvent\` | ${formatDescription(i.description)} |`).join('\n')}\n`
    : ''
}

${
  manifest.cssProperties?.length
    ? `### CSS Properties\n
| name | value | description |
| ---- | ----- | ----------- |
${manifest.cssProperties.map(i => `| ${i.name} | \`string\` | ${formatDescription(i.description)} |`).join('\n')}`
    : ''
}`
      .trim()
      .replace(/(?:\r\n|\r|\n){2,}/g, '\n\n');
  }
}

/**
 * rewrites exported string literal type aliases to their compiled type values and adds value descriptions to the entries.
 */
function rewriteExportedStringLiteralTypeAliasesPlugin() {
  // Leverage the TypeScript compiler to evaluate exported string literal (union) types to their compiled type values.
  // Note: https://ts-ast-viewer.com/ is helpful for understanding the TypeScript AST and type checker return values.
  function quoteWrap(string) {
    return `'${string}'`;
  }

  const stringLiteralsByTypeAlias = new Map();
  const valueDescriptionsByTypeAlias = new Map();

  /**
   * Parse JSDoc comment to extract value descriptions.
   * Expected format: - `value` Description text or - `value` - Description text
   * Also supports numeric values: - `3000` Description text
   * Example:
   *   - `emphasis` Indicates the interaction is intended to be used for emphasis
   *   - `emphasis` - Indicates the interaction is intended to be used for emphasis
   *   - `destructive` Indicates the interaction is intended to be used for destructive actions
   *   - `3000` Brief success or confirmation messages
   */
  function parseValueDescriptions(jsDocComment) {
    if (!jsDocComment) return {};

    const descriptions = {};
    // Match patterns like: - `value` Description text or - `value` - Description text
    // Also matches numeric values with or without backticks: - `3000` or - 3000
    const valueDescPattern = /^\s*-\s*[`']?([^`'\s]+)[`']?\s*-?\s*(.+)$/gm;
    let match;

    while ((match = valueDescPattern.exec(jsDocComment)) !== null) {
      const [, valueName, description] = match;
      // Only capture if there's a meaningful description (not just a dash or empty)
      if (description && description.trim() !== '-') {
        descriptions[valueName] = description.trim();
      }
    }

    return descriptions;
  }

  /**
   * Extract JSDoc comment text from a node
   */
  function getJsDocText(node) {
    if (!node.jsDoc || node.jsDoc.length === 0) return '';

    return node.jsDoc.map(doc => doc.comment || '').join('\n');
  }

  function rewriteTypesText(entry) {
    const text = entry.type?.text;
    if (!text) {
      return;
    }

    if (text.startsWith('Extract')) {
      entry.type.text = text.replace('Extract<', '').replace('> | ', ' | ').split(',')[1].trim();
    }

    let types = text.split('|').map(value => value.trim());

    const rewrittenTypes = new Set();
    let performRewrite = false;
    const sourceAliases = [];
    for (const type of types) {
      const stringLiterals = stringLiteralsByTypeAlias.get(type);
      if (stringLiterals !== undefined) {
        performRewrite = true;
        sourceAliases.push(type);
        for (const stringLiteral of stringLiterals) {
          // NOTE: This has() check is necessary to retain TypeScript's first-declaration-wins ordering.
          if (!rewrittenTypes.has(stringLiteral)) {
            rewrittenTypes.add(stringLiteral);
          }
        }
      } else {
        rewrittenTypes.add(type);
      }
    }
    if (performRewrite) {
      entry.type.text = Array.from(rewrittenTypes).join(' | ');
    }

    entry.type._sourceAliases = sourceAliases;

    entry.type.text = entry.type.text
      .split(' | ')
      .map(value => (value === 'undefined' || value === '' ? '"default"' : value))
      .join(' | ');
  }

  /**
   * Remove value descriptions from a description string
   * Removes lines like: - `value` Description text or - `value` - Description text
   */
  function removeValueDescriptionsFromText(description) {
    if (!description) {
      return description;
    }

    // Remove lines that match the value description pattern (with or without dash after value)
    const valueDescPattern = /^\s*-\s*[`']([^`']+)[`']\s*-?\s*.+$/gm;
    let cleaned = description.replace(valueDescPattern, '');

    // Clean up extra newlines and whitespace
    cleaned = cleaned
      .split('\n')
      .filter(line => line.trim()) // Remove empty lines
      .join('\n')
      .trim();

    return cleaned;
  }

  /**
   * Add value descriptions to a member or attribute entry
   */
  function addValueDescriptions(entry) {
    if (!entry.type?.text) {
      return;
    }

    const types = entry.type.text.split('|').map(t => t.trim().replace(/^['"]|['"]$/g, ''));
    let hasAnyDescriptions = false;

    // Check if this is a string literal union (contains quoted strings)
    const isStringLiteralUnion = /['"]/.test(entry.type.text);

    // Initialize values array if it doesn't exist
    if (!entry.type.values) {
      entry.type.values = [];
    }

    // Special handling for boolean types - extract true/false descriptions from the entry's own description
    if (entry.type.text === 'boolean' && entry.description) {
      const booleanDescriptions = parseValueDescriptions(entry.description);
      if (Object.keys(booleanDescriptions).length > 0) {
        hasAnyDescriptions = true;
      }
      ['true', 'false'].forEach(value => {
        entry.type.values.push({
          value: value,
          description: booleanDescriptions[value] || ''
        });
      });
    } else if (entry.type.text === 'number' && entry.description) {
      // Special handling for number types - extract numeric value descriptions from the entry's own description
      const numericDescriptions = parseValueDescriptions(entry.description);

      // Filter to only numeric values
      const numericValues = Object.entries(numericDescriptions)
        .filter(([key]) => /^-?\d+(\.\d+)?$/.test(key))
        .sort(([a], [b]) => parseFloat(a) - parseFloat(b)); // Sort numerically

      if (numericValues.length > 0) {
        hasAnyDescriptions = true;
      }

      // Add generic "number" value first
      entry.type.values.push({
        value: 'number',
        description: ''
      });

      // Add specific numeric values with descriptions
      numericValues.forEach(([value, description]) => {
        entry.type.values.push({
          value: parseFloat(value),
          description: description
        });
      });
    } else if (isStringLiteralUnion) {
      const sourceAliases = entry.type._sourceAliases || [];

      for (const [typeAlias, valueDescriptions] of valueDescriptionsByTypeAlias.entries()) {
        if (sourceAliases.includes(typeAlias) && Object.keys(valueDescriptions).length > 0) {
          hasAnyDescriptions = true;

          // Add descriptions for values that match this type alias
          types
            .filter(type => !type.includes('undefined') && type !== 'default' && type !== '')
            .forEach(type => {
              const cleanType = type.replace(/^['"]|['"]$/g, '');

              // Only add if we have a description for this value and it's not already in the array
              if (valueDescriptions[cleanType] && !entry.type.values.some(v => v.value === cleanType)) {
                entry.type.values.push({
                  value: cleanType,
                  description: valueDescriptions[cleanType]
                });
              }
            });
        }
      }

      // For inline string literal unions (not from type aliases), parse descriptions from the entry's own description
      if (entry.description) {
        const inlineDescriptions = parseValueDescriptions(entry.description);
        if (Object.keys(inlineDescriptions).length > 0) {
          hasAnyDescriptions = true;
          types
            .filter(type => !type.includes('undefined') && type !== 'default' && type !== '')
            .forEach(type => {
              const cleanType = type.replace(/^['"]|['"]$/g, '');
              if (inlineDescriptions[cleanType] && !entry.type.values.some(v => v.value === cleanType)) {
                entry.type.values.push({
                  value: cleanType,
                  description: inlineDescriptions[cleanType]
                });
              }
            });
        }
      }

      // Add all remaining values (with or without descriptions)
      types
        .filter(type => !type.includes('undefined') && type !== 'default' && type !== '')
        .forEach(type => {
          const cleanType = type.replace(/^['"]|['"]$/g, '');
          if (!entry.type.values.some(v => v.value === cleanType)) {
            entry.type.values.push({
              value: cleanType,
              description: ''
            });
          }
        });
    } else {
      // For all other types (string, number, HTMLElement, etc.), add a single value
      types
        .filter(type => type !== '' && type !== 'undefined')
        .forEach(type => {
          entry.type.values.push({
            value: type,
            description: ''
          });
        });
    }

    // Only modify description if we found actual descriptions
    if (hasAnyDescriptions && entry.description) {
      entry.descriptionText = removeValueDescriptionsFromText(entry.description);
      const itemsWithDescriptions = entry.type.values.filter(v => v.description);
      if (itemsWithDescriptions.length > 0) {
        entry.description = `${entry.descriptionText}\n${itemsWithDescriptions.map(v => `- \`${v.value}\` ${v.description}`).join('\n\n')}`;
      }
    }
  }

  return {
    name: 'rewrite-exported-string-literal-type-aliases',
    analyzePhase({ ts, node }) {
      switch (node.kind) {
        case ts.SyntaxKind.TypeAliasDeclaration:
          if (node.modifiers?.[0]?.kind === ts.SyntaxKind.ExportKeyword) {
            // Evaluate types that look like this:
            //   export type Inverse = 'inverse';
            if (
              node.type.kind === ts.SyntaxKind.LiteralType &&
              node.type.literal.kind === ts.SyntaxKind.StringLiteral
            ) {
              const typeAlias = node.name.escapedText;
              const { value } = runtimeEnvironment.typeChecker.getTypeAtLocation(node);
              const stringLiterals = [quoteWrap(value)];
              stringLiteralsByTypeAlias.set(typeAlias, stringLiterals);
            }
            // Evaluate types that look like this:
            //   export type Interaction = 'emphasize' | 'destructive';
            //   export type FlatInteraction = 'flat' | `${'flat'}-${interaction}`;
            //   export type LineNumbersType = 'on' | 'off' | 'relative' | 'interval' | LineNumberFormatter;
            if (node.type.kind === ts.SyntaxKind.UnionType) {
              const typeAlias = node.name.escapedText;
              const stringLiterals = node.type.types.map(typeNode => {
                const type = runtimeEnvironment.typeChecker.getTypeAtLocation(typeNode);
                return type.value !== undefined ? quoteWrap(type.value) : typeNode.getText();
              });
              stringLiteralsByTypeAlias.set(typeAlias, stringLiterals);

              // Extract value descriptions from JSDoc comments
              const jsDocText = getJsDocText(node);
              if (jsDocText) {
                const valueDescriptions = parseValueDescriptions(jsDocText);
                if (Object.keys(valueDescriptions).length > 0) {
                  valueDescriptionsByTypeAlias.set(typeAlias, valueDescriptions);
                }
              }
            }

            // Evaluate types that look like this:
            // const ICON_IMPORTS = { 'user': 'svg...', 'bell': 'svg...' };
            // export type IconName = keyof typeof ICON_IMPORTS;
            // checking for IconName to optimize performance
            if (node.name.escapedText === 'IconName' && node.type.kind === ts.SyntaxKind.TypeOperator) {
              const typeAlias = node.name.escapedText;
              const typeOperator = node.type;

              // Check if it's a keyof typeof expression
              if (
                typeOperator.operator === ts.SyntaxKind.KeyOfKeyword &&
                typeOperator.type.kind === ts.SyntaxKind.TypeQuery
              ) {
                const typeQuery = typeOperator.type;
                const exprName = typeQuery.exprName.escapedText;

                // Find the const declaration for this object
                const sourceFile = node.getSourceFile();
                let constDeclaration = null;

                // Walk through the AST to find the const declaration
                function findConstDeclaration(node) {
                  if (node.kind === ts.SyntaxKind.VariableStatement) {
                    const declList = node.declarationList;
                    if (declList && declList.declarations) {
                      const found = declList.declarations.find(
                        decl =>
                          decl.name.escapedText === exprName &&
                          decl.initializer?.kind === ts.SyntaxKind.ObjectLiteralExpression
                      );
                      if (found) {
                        return node;
                      }
                    }
                  }

                  // Recursively search child nodes
                  ts.forEachChild(node, child => {
                    if (!constDeclaration) {
                      const result = findConstDeclaration(child);
                      if (result) {
                        constDeclaration = result;
                      }
                    }
                  });

                  return constDeclaration;
                }

                findConstDeclaration(sourceFile);

                if (constDeclaration) {
                  const declList = constDeclaration.declarationList;
                  const objectDecl = declList.declarations.find(decl => decl.name.escapedText === exprName);

                  if (objectDecl?.initializer?.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                    const objectLiteral = objectDecl.initializer;
                    const stringLiterals = objectLiteral.properties
                      .filter(prop => prop.kind === ts.SyntaxKind.PropertyAssignment)
                      .map(prop => {
                        if (prop.name.kind === ts.SyntaxKind.StringLiteral) {
                          return quoteWrap(prop.name.text);
                        } else if (prop.name.kind === ts.SyntaxKind.Identifier) {
                          return quoteWrap(prop.name.escapedText);
                        }
                        return null;
                      })
                      .filter(Boolean);

                    if (stringLiterals.length > 0) {
                      stringLiteralsByTypeAlias.set(typeAlias, stringLiterals);
                    }
                  }
                }
              }
            }

            // remove any @deprecated types
            if (
              (node.type.kind === ts.SyntaxKind.LiteralType &&
                node.type.literal.kind === ts.SyntaxKind.StringLiteral) ||
              node.type.kind === ts.SyntaxKind.UnionType ||
              node.type.kind === ts.SyntaxKind.TypeOperator
            ) {
              const deprecated = node.jsDoc
                ?.flatMap(doc => doc.tags?.find(tag => tag.tagName.escapedText === 'deprecated'))
                ?.filter(i => i !== undefined);
              if (deprecated?.length) {
                stringLiteralsByTypeAlias.set(node.name.escapedText, '');
              }
            }
          }
          break;
        case ts.SyntaxKind.TypeReference:
          if (node.typeName.escapedText === 'Extract') {
            const { types } = runtimeEnvironment.typeChecker.getTypeAtLocation(node);
            if (types?.every(type => type.value !== undefined)) {
              const stringLiterals = types.map(type => quoteWrap(type.value));
              stringLiteralsByTypeAlias.set(node.getFullText(), stringLiterals);
            }
          }
          break;
      }
    },
    packageLinkPhase({ customElementsManifest }) {
      for (const module of customElementsManifest.modules) {
        for (const declaration of module.declarations) {
          switch (declaration.kind) {
            case 'class':
              for (const member of declaration.members ?? []) {
                // name is excluded due to icon overloading it for svg icon name
                if (
                  member.name !== 'name' &&
                  member.name !== 'direction' &&
                  baseInterface[member.name] &&
                  baseInterface[member.name].docs.length
                ) {
                  member.description = baseInterface[member.name].docs[0]?.description;
                }
                rewriteTypesText(member);
                addValueDescriptions(member);
              }

              for (const attribute of declaration.attributes ?? []) {
                if (baseInterface[attribute.name] && baseInterface[attribute.name].docs.length) {
                  attribute.description = baseInterface[attribute.name].docs[0]?.description;
                }
                rewriteTypesText(attribute);
                addValueDescriptions(attribute);
              }
              break;
            case 'function':
              for (const parameter of declaration.parameters ?? []) {
                rewriteTypesText(parameter);
              }
              break;
          }
        }
      }
    }
  };
}

/** filter subset of all default members to exclude private and non documented APIs/properties */
function publicPropertiesPlugin() {
  return {
    name: 'public-properties-plugin',
    packageLinkPhase({ customElementsManifest }) {
      for (const module of customElementsManifest.modules) {
        for (const declaration of module.declarations) {
          if (declaration.tagName) {
            declaration.members =
              declaration.members?.filter(
                m =>
                  (m.kind === 'field' || m.kind === 'method') &&
                  !m.name.startsWith('_') &&
                  !m.name.startsWith('#') &&
                  !m.readonly &&
                  !m.static &&
                  m.privacy !== 'private'
              ) ?? [];
          }
        }
      }
    }
  };
}

/** ensures elements inherit parent super class metadata */
function superClassMetadataPlugin() {
  return {
    name: 'super-class-metadata-plugin',
    analyzePhase({ ts, node, moduleDoc }) {
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const classDeclaration = moduleDoc.declarations.find(
            declaration => declaration.name === node.name?.getText()
          );

          if (classDeclaration.tagName) {
            const superclassManifest = moduleDoc.declarations.find(
              e => e.name === classDeclaration.superclass?.name
            ) ?? { metadata: {} };
            classDeclaration.metadata = { ...superclassManifest.metadata, ...classDeclaration.metadata };
          }
          break;
      }
    }
  };
}

function formatDescription(description) {
  if (description == null || description === '') return '';
  return removeMdnLinks(description).replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|');
}

function removeMdnLinks(description) {
  return description
    .replaceAll('https://developer.mozilla.org/en-US/docs/Web/Accessibility/', 'https://mdn.dev/')
    .replaceAll('https://developer.mozilla.org/en-US/docs/Web/API/', 'https://mdn.dev/')
    .replaceAll('https://developer.mozilla.org/en-US/docs/Web/', 'https://mdn.dev/');
}

export default {
  globs: [resolve('./src')],
  exclude: [
    resolve('src/**/*.css'),
    resolve('src/**/*.examples.ts'),
    resolve('src/**/*.test.ts'),
    resolve('src/**/*.test.axe.ts'),
    resolve('src/**/*.test.ssr.ts'),
    resolve('src/**/*.test.lighthouse.ts'),
    resolve('src/**/*.test.visual.ts')
  ],
  litelement: true,
  plugins: [
    basePathPlugin(),
    extensionPlugin(),
    orderPlugin(),
    metadataPlugin(),
    commandPlugin(),
    rewriteExportedStringLiteralTypeAliasesPlugin(),
    publicPropertiesPlugin(),
    superClassMetadataPlugin(),
    deprecatedPlugin(),
    jsxTypesPlugin(),
    vueTypesPlugin(),
    cssPropsPlugin(),
    elementMetadataToMarkdownPlugin()
  ],
  overrideModuleCreation: ({ ts, globs }) => {
    const configFile = ts.findConfigFile(process.cwd(), ts.sys.fileExists, resolve('tsconfig.json'));
    const { config } = ts.readConfigFile(configFile, ts.sys.readFile);
    const { options } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd());
    const program = ts.createProgram(globs, options);
    runtimeEnvironment.typeChecker = program.getTypeChecker();
    return program.getSourceFiles().filter(sf => globs.find(glob => sf.fileName.includes(glob)));
  }
};
