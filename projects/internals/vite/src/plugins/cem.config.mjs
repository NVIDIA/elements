import path from 'path';
import fs from 'fs';
import { Project, SyntaxKind } from 'ts-morph';
import { customElementJsxPlugin } from 'custom-element-jsx-integration';

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
        'figma',
        'storybook',
        'responsive',
        'themes',
        'zeroheight',
        'vqa',
        'aria',
        'stable',
        'performance',
        'package',
        'description',
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
              if (metadata.find(m => m === tag.tagName?.getText())) {
                let value = tag.comment;
                if (value === 'true') {
                  value = true;
                }

                if (value === 'false') {
                  value = false;
                }

                classDeclaration.metadata = { ...classDeclaration.metadata, [tag.tagName?.getText()]: value };
                classDeclaration.description = classDeclaration.metadata.description;
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
          break;
      }
    }
  };
}

function getExample(classDeclaration, path) {
  if (classDeclaration.metadata.example?.length) {
    return classDeclaration.metadata.example;
  } else {
    const storyPath = path.replace('src', 'dist').replace('.ts', '.stories.json');
    if (fs.existsSync(storyPath)) {
      const storyJSON = JSON.parse(fs.readFileSync(storyPath, 'utf-8'));
      const example = storyJSON.stories[0]?.template?.trim();
      return example ? example : '';
    }
  }
  return '';
}

function getElementStability(metadata) {
  let status = 'unknown';
  const preRelease = metadata.apiReview && metadata.storybook?.length;
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
            console.log(declaration.slots);
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

function rewriteExportedStringLiteralTypeAliasesPlugin() {
  // Leverage the TypeScript compiler to evaluate exported string literal (union) types to their compiled type values.
  // Note: https://ts-ast-viewer.com/ is helpful for understanding the TypeScript AST and type checker return values.
  function quoteWrap(string) {
    return `'${string}'`;
  }

  const stringLiteralsByTypeAlias = new Map();

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
    for (const type of types) {
      const stringLiterals = stringLiteralsByTypeAlias.get(type);
      if (stringLiterals !== undefined) {
        performRewrite = true;
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

    entry.type.text = entry.type.text
      .split(' | ')
      .map(value => (value === 'undefined' || value === '' ? 'default' : value))
      .join(' | ');
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
            }

            // remove any @deprecated types
            if (
              (node.type.kind === ts.SyntaxKind.LiteralType &&
                node.type.literal.kind === ts.SyntaxKind.StringLiteral) ||
              node.type.kind === ts.SyntaxKind.UnionType
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
                rewriteTypesText(member);
              }
              for (const attribute of declaration.attributes ?? []) {
                rewriteTypesText(attribute);
              }

              declaration.attributes?.forEach(attr => {
                if (baseInterface[attr.name] && baseInterface[attr.name].docs.length) {
                  attr.description = baseInterface[attr.name].docs[0]?.description;
                }
              });
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
            declaration.members = declaration.members.filter(
              m =>
                (m.kind === 'field' || m.kind === 'method') &&
                !m.name.startsWith('_') &&
                !m.name.startsWith('#') &&
                !m.readonly &&
                !m.static &&
                m.privacy !== 'private'
            );
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

export default {
  globs: [resolve('./src')],
  exclude: [
    resolve('src/**/*.css'),
    resolve('src/**/*.stories.ts'),
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
    rewriteExportedStringLiteralTypeAliasesPlugin(),
    publicPropertiesPlugin(),
    superClassMetadataPlugin(),
    deprecatedPlugin(),
    jsxTypesPlugin()
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
