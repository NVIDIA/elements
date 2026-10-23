// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FRAME_NAME, FRAME_NAME_DUPLICATE, MODEL_NAME } from '../../diagnostics/errors.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';
import { setFrameConstraint } from './constraints.js';

interface Registry {
  readonly scopes: ReadonlyMap<HTMLElement, ReadonlyMap<string, HTMLElement | null>>;
  readonly jointScopes: ReadonlyMap<HTMLElement, ReadonlyMap<string, HTMLElement | null>>;
  readonly elements: readonly HTMLElement[];
  readonly anonymous: readonly HTMLElement[];
  readonly addressed: Set<HTMLElement>;
}
const registries = new WeakMap<HTMLElement, Registry>();

export function getElementName(element: HTMLElement): string {
  const name: unknown = Reflect.get(element, 'name');
  return (typeof name === 'string' ? name : (element.getAttribute('name') ?? '')).trim();
}

/** The model itself belongs to its parent scope; its members belong to the model. */
export function getNameScope(element: HTMLElement, scene: HTMLElement): HTMLElement {
  const model = element.parentElement?.closest<HTMLElement>('nve-scene-model');
  return model?.closest('nve-scene') === scene ? model : scene;
}

export function updateFrameRegistry(
  scene: HTMLElement,
  elements: readonly HTMLElement[],
  referrers: readonly HTMLElement[]
): void {
  const previous = registries.get(scene);
  const scopes = collectScopes(
    scene,
    elements.filter(element => element.localName !== 'nve-scene-joint')
  );
  const jointScopes = collectScopes(
    scene,
    elements.filter(element => element.localName === 'nve-scene-joint')
  );
  const anonymous = elements.filter(element => element.localName === 'nve-scene-model' && !getElementName(element));
  const registry: Registry = { scopes, jointScopes, elements, anonymous, addressed: new Set() };
  registries.set(scene, registry);
  updateRegistryNames(scene, registry, previous);
  updateAnonymousNames(scene, registry, referrers);
}

function updateRegistryNames(scene: HTMLElement, registry: Registry, previous?: Registry): void {
  const members = new Set(registry.elements);
  for (const element of previous?.elements ?? []) {
    if (!members.has(element)) updateNameDiagnostics(element, false, false);
  }
  for (const element of registry.elements) {
    const name = getElementName(element);
    const scopes = element.localName === 'nve-scene-joint' ? registry.jointScopes : registry.scopes;
    const duplicate = scopes.get(getNameScope(element, scene))?.get(name) === null;
    updateNameDiagnostics(element, name.includes('/'), Boolean(name && duplicate));
  }
}

function updateAnonymousNames(scene: HTMLElement, registry: Registry, referrers: readonly HTMLElement[]): void {
  for (const referrer of referrers) {
    for (const property of ['frame', 'mimic']) {
      const reference: unknown = Reflect.get(referrer, property);
      if (typeof reference !== 'string' || !reference.includes('/')) continue;
      const resolve = property === 'mimic' ? resolveJointName : resolveFrameName;
      resolve(scene, reference, referrer);
    }
  }
  for (const model of registry.elements.filter(element => element.localName === 'nve-scene-model')) {
    const active = registry.addressed.has(model);
    setFrameConstraint(model, MODEL_NAME, !active);
    diagnosticReporterService.update({
      element: model,
      code: MODEL_NAME,
      active,
      severity: 'error',
      message: 'A model addressed by a qualified reference must have a name.'
    });
  }
}

function collectScopes(
  scene: HTMLElement,
  elements: readonly HTMLElement[]
): Map<HTMLElement, Map<string, HTMLElement | null>> {
  const scopes = new Map<HTMLElement, Map<string, HTMLElement | null>>([[scene, new Map()]]);
  for (const element of elements) {
    if (element.localName === 'nve-scene-model') scopes.set(element, new Map());
  }
  for (const element of elements) {
    const name = getElementName(element);
    if (!name || name.includes('/')) continue;
    const scope = getNameScope(element, scene);
    let names = scopes.get(scope);
    if (!names) {
      names = new Map();
      scopes.set(scope, names);
    }
    names.set(name, names.has(name) ? null : element);
  }
  return scopes;
}

/** Resolves lexical names first, then walks explicitly qualified model scopes. Duplicates shadow outer names. */
export function resolveFrameName(
  scene: HTMLElement,
  name: string,
  context: HTMLElement = scene
): HTMLElement | undefined {
  return resolveName(scene, { name, context, kind: 'frame' });
}

/** Reads one local frame name; null distinguishes an ambiguous name from a missing name. */
export function getScopedFrameName(
  scene: HTMLElement,
  name: string,
  context: HTMLElement
): HTMLElement | null | undefined {
  return registries.get(scene)?.scopes.get(getNameScope(context, scene))?.get(name);
}

export function resolveJointName(
  scene: HTMLElement,
  name: string,
  context: HTMLElement = scene
): HTMLElement | undefined {
  return resolveName(scene, { name, context, kind: 'joint' });
}

function resolveName(
  scene: HTMLElement,
  query: { name: string; context: HTMLElement; kind: 'frame' | 'joint' }
): HTMLElement | undefined {
  const { name, context, kind } = query;
  const registry = registries.get(scene);
  if (!registry) return undefined;
  const [first, ...rest] = name
    .trim()
    .split('/')
    .map(segment => segment.trim());
  if (!first || rest.some(segment => !segment)) return unresolvedQualified(registry, { path: rest, kind }, context);
  const scopes = kind === 'joint' && !rest.length ? registry.jointScopes : registry.scopes;
  const initial = lookupLexicalName(scopes, scene, { first, context });
  if (initial !== undefined) return descendScopes(registry, initial, { path: rest, kind });
  return rest.length ? unresolvedQualified(registry, { path: rest, kind }, context) : undefined;
}

function lookupLexicalName(
  scopes: Registry['scopes'],
  scene: HTMLElement,
  input: { first: string; context: HTMLElement }
): HTMLElement | null | undefined {
  let scope = input.context === scene ? scene : getNameScope(input.context, scene);
  while (true) {
    const names = scopes.get(scope);
    if (names?.has(input.first)) return names.get(input.first);
    if (scope === scene) return undefined;
    scope = getNameScope(scope, scene);
  }
}

function descendScopes(
  registry: Registry,
  initial: HTMLElement | null | undefined,
  query: { path: readonly string[]; kind: 'frame' | 'joint' }
): HTMLElement | undefined {
  const { path, kind } = query;
  let target = initial;
  for (const [index, segment] of path.entries()) {
    if (!target || target.localName !== 'nve-scene-model') return undefined;
    const scopes = kind === 'joint' && index === path.length - 1 ? registry.jointScopes : registry.scopes;
    target = scopes.get(target)?.get(segment);
  }
  return target ?? undefined;
}

function unresolvedQualified(
  registry: Registry,
  query: { path: readonly string[]; kind: 'frame' | 'joint' },
  context: HTMLElement
): undefined {
  const { path, kind } = query;
  if (!path.length) return undefined;
  const candidates = registry.anonymous.filter(
    model => !model.contains(context) && descendScopes(registry, model, { path, kind })
  );
  if (candidates.length !== 1) return undefined;
  const model = candidates[0]!;
  registry.addressed.add(model);
  setFrameConstraint(model, MODEL_NAME, false);
  diagnosticReporterService.update({
    element: model,
    code: MODEL_NAME,
    active: true,
    severity: 'error',
    message: 'A model addressed by a qualified reference must have a name.'
  });
  return undefined;
}

/** Bare-name validity also applies before a scene or GPU registry exists. */
export function validateFrameName(element: HTMLElement): void {
  updateBareNameDiagnostic(element, getElementName(element).includes('/'));
}

function updateNameDiagnostics(element: HTMLElement, invalid: boolean, duplicate: boolean): void {
  updateBareNameDiagnostic(element, invalid);
  diagnosticReporterService.update({
    element,
    code: FRAME_NAME_DUPLICATE,
    active: duplicate,
    severity: 'warning',
    message: `More than one scene element in this scope uses the name "${getElementName(element)}".`
  });
}

function updateBareNameDiagnostic(element: HTMLElement, invalid: boolean): void {
  setFrameConstraint(element, FRAME_NAME, !invalid);
  diagnosticReporterService.update({
    element,
    code: FRAME_NAME,
    active: invalid,
    severity: 'error',
    message: 'Bare scene names must not contain the scope separator /.'
  });
}
