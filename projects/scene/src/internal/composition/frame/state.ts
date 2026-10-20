// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { bindFrameConstraints, hasFrameConstraintFailure } from './constraints.js';
import { resolveFrameName } from './registry.js';
import { captureJointConnections, reportJointConnections } from '../joint/connections.js';
import { composePreciseMat4, identityPreciseMat4, multiplyPreciseMat4 } from '../../math/mat4.js';
import { normalizeQuaternion } from '../../math/quaternion.js';
import type { Mat4, PreciseMat4, ScenePose, Vec3 } from '../../math/types.js';
import { notifyOwningScene } from '../scene/notifications.js';
import { FRAME_UNRESOLVED } from '../../diagnostics/errors.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';
import { findParentCycles } from '../../algorithms/parent-graph.js';
import { ParentEvaluation } from '../../structures/parent-evaluation.js';

interface FrameState {
  constraintValid: boolean;
  localMatrix: PreciseMat4;
  pose: ScenePose | null;
  valid: boolean;
}

export const FRAME_SELECTOR = 'nve-scene-frame, nve-scene-joint, nve-scene-model, nve-scene-body';

const frameStates = new WeakMap<HTMLElement, FrameState>();

/** Memoizes DOM ancestry for one synchronous render snapshot. Create a new instance after edits. */
export class FrameEvaluation {
  #matrices?: ParentEvaluation<HTMLElement, PreciseMat4 | null>;
  #validity?: ParentEvaluation<HTMLElement, boolean>;
  #visibility?: ParentEvaluation<HTMLElement, boolean>;
  #domVisibility?: ParentEvaluation<HTMLElement, boolean>;
  #parents?: ReadonlyMap<HTMLElement, HTMLElement | null>;
  #initialized = false;
  #scene: HTMLElement | null = null;

  constructor(scene?: HTMLElement) {
    if (scene) this.#initialize(scene);
  }

  /** Returns a shared world matrix, or null for an invalid chain. Treat returned matrices as read-only. */
  getWorldMatrix(element: HTMLElement): PreciseMat4 | null {
    this.#initializeFor(element);
    this.#matrices ??= new ParentEvaluation({
      getParent: ancestor => this.#getParent(ancestor),
      rootValue: identityPreciseMat4(),
      invalidValue: null,
      reduce: (ancestor, parent) => this.#compose(ancestor, parent)
    });
    return this.#matrices.get(element);
  }

  isValid(element: HTMLElement): boolean {
    this.#initializeFor(element);
    this.#validity ??= new ParentEvaluation({
      getParent: ancestor => this.#getParent(ancestor),
      rootValue: true,
      invalidValue: false,
      reduce: (ancestor, valid) => valid && (ancestor.localName === 'nve-scene' || localFrameIsValid(ancestor))
    });
    return this.#validity.get(element);
  }

  /** Includes hidden DOM ancestors even when a reference replaces the transform parent. */
  isVisible(element: HTMLElement): boolean {
    this.#initializeFor(element);
    if (!this.#parents) return element.closest('[hidden]') === null;
    this.#visibility ??= new ParentEvaluation({
      getParent: ancestor => this.#getParent(ancestor),
      rootValue: true,
      invalidValue: false,
      reduce: (ancestor, visible) => visible && (ancestor.localName === 'nve-scene' || this.#isDomVisible(ancestor))
    });
    return this.#visibility.get(element);
  }

  #isDomVisible(element: HTMLElement): boolean {
    this.#domVisibility ??= new ParentEvaluation({
      getParent: ancestor => ancestor.parentElement ?? undefined,
      rootValue: true,
      invalidValue: false,
      reduce: (ancestor, visible) => visible && !ancestor.hasAttribute('hidden')
    });
    return this.#domVisibility.get(element);
  }

  #initializeFor(element: HTMLElement): void {
    if (!this.#initialized) this.#initialize(element.closest<HTMLElement>('nve-scene'));
  }

  #initialize(scene: HTMLElement | null): void {
    this.#scene = scene;
    this.#parents = scene ? sceneReferences.get(scene)?.parents : undefined;
    this.#initialized = true;
  }

  #getParent(element: HTMLElement): HTMLElement | null | undefined {
    if (element.localName === 'nve-scene') return undefined;
    const parent = this.#parents ? resolvedFrameParent(element, this.#parents, this.#scene) : element.parentElement;
    if (parent === false) return null;
    return parent?.localName === 'nve-scene' ? undefined : (parent ?? undefined);
  }

  #compose(element: HTMLElement, parent: PreciseMat4 | null): PreciseMat4 | null {
    if (!parent) return null;
    const state = frameStates.get(element);
    if (state) {
      if (!state.valid || !state.constraintValid) return null;
      return state.pose ? multiplyPreciseMat4(parent, state.localMatrix) : parent;
    }
    const name = element.localName;
    if (isFrameTag(name)) return null;
    return parent;
  }
}

function localFrameIsValid(element: HTMLElement): boolean {
  const state = frameStates.get(element);
  return state
    ? state.valid && state.constraintValid
    : !isFrameTag(element.localName) && !hasFrameConstraintFailure(element);
}

function isFrameTag(name: string): boolean {
  return (
    name === 'nve-scene-frame' || name === 'nve-scene-joint' || name === 'nve-scene-model' || name === 'nve-scene-body'
  );
}

export function registerFrameState(frame: HTMLElement): void {
  const state: FrameState = { constraintValid: true, localMatrix: identityPreciseMat4(), pose: null, valid: true };
  frameStates.set(frame, state);
  bindFrameConstraints(frame, state);
}

export function isFrameStateRegistered(frame: HTMLElement): boolean {
  return frameStates.has(frame);
}

export function notifyFrameStateChange(frame: HTMLElement): void {
  getFrameState(frame);
  notifyOwningScene(frame, 'composition');
}

export function setFrameTransform(frame: HTMLElement, transform: ScenePose): void {
  const state = getFrameState(frame);
  const normalized = normalizeFrameTransform(transform);
  state.pose = normalized;
  state.localMatrix = composePreciseMat4(normalized.position, normalized.orientation);
  state.valid = true;
  notifyOwningScene(frame);
}

export function clearFrameTransform(frame: HTMLElement): void {
  const state = getFrameState(frame);
  if (state.pose !== null || !state.valid) {
    state.pose = null;
    state.localMatrix = identityPreciseMat4();
    state.valid = true;
    notifyOwningScene(frame);
  }
}

export function invalidateFrameTransform(frame: HTMLElement): void {
  const state = getFrameState(frame);
  if (!state.valid) return;
  state.valid = false;
  notifyOwningScene(frame);
}

export function getFramePose(frame: HTMLElement): ScenePose {
  const state = getFrameState(frame);
  if (!state.valid) throw new DOMException('The frame has an invalid pose.', 'InvalidStateError');
  return cloneFrameTransform(state.pose ?? { orientation: [0, 0, 0, 1], position: [0, 0, 0] });
}

/** Returns false when a frame in the owning-scene chain lacks state or has an invalid transform. */
export function isFrameChainValid(element: HTMLElement): boolean {
  return new FrameEvaluation().isValid(element);
}

/** Visibility follows both the authored DOM and resolved transform parents. */
export function isFrameChainVisible(element: HTMLElement): boolean {
  return new FrameEvaluation().isVisible(element);
}

function resolvedFrameParent(
  element: HTMLElement,
  parents: ReadonlyMap<HTMLElement, HTMLElement | null>,
  scene: HTMLElement | null
): HTMLElement | null | false {
  if (!parents.has(element)) return element.parentElement;
  const parent = parents.get(element);
  return parent && parent.closest('nve-scene') === scene ? parent : false;
}

export function getFrameWorldMatrix(frame: HTMLElement): Mat4 {
  return new Float32Array(getFrameWorldMatrixPrecise(frame));
}

/** Resolves the world matrix without truncating translations to GPU precision. */
export function getFrameWorldMatrixPrecise(frame: HTMLElement): PreciseMat4 {
  const matrix = new FrameEvaluation().getWorldMatrix(frame);
  if (!matrix) {
    throw new DOMException('The frame or one of its ancestors has an invalid transform.', 'InvalidStateError');
  }
  return matrix;
}

export function getNamedSceneFrame(
  scene: HTMLElement,
  name: string,
  context: HTMLElement = scene
): HTMLElement | undefined {
  const frame = getNamedFrameElement(scene, name, context);
  return frame && isFrameChainValid(frame) ? frame : undefined;
}

/** Returns a registry target even while its transform is invalid, for dependency subscriptions. */
export function getNamedFrameElement(
  scene: HTMLElement,
  name: string,
  context: HTMLElement = scene
): HTMLElement | undefined {
  const target = resolveFrameName(scene, name, context);
  return target &&
    target.localName !== 'nve-scene-joint' &&
    target.closest('nve-scene') === scene &&
    isFrameStateRegistered(target)
    ? target
    : undefined;
}

function normalizeFrameTransform(value: ScenePose): ScenePose {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError('Frame transform must be an object.');
  }
  if (Reflect.has(value, 'stamp')) {
    throw new TypeError('Frame transforms do not accept timestamps.');
  }
  const position = Reflect.get(value, 'position');
  const orientation = Reflect.get(value, 'orientation');
  assertNumberTuple(position, 3, 'Position');
  assertNumberTuple(orientation, 4, 'Orientation');
  return {
    position: [...position] as Vec3,
    orientation: normalizeQuaternion(orientation)
  };
}

function assertNumberTuple(value: unknown, length: number, label: string): asserts value is number[] {
  if (!Array.isArray(value) || value.length !== length || value.some(item => typeof item !== 'number')) {
    throw new TypeError(`${label} must contain exactly ${length} numbers.`);
  }
  if (value.some(item => !Number.isFinite(item))) {
    throw new RangeError(`${label} components must be finite.`);
  }
}

function cloneFrameTransform(transform: ScenePose): ScenePose {
  return {
    position: [...transform.position],
    orientation: [...transform.orientation]
  };
}

function getFrameState(frame: HTMLElement): FrameState {
  const state = frameStates.get(frame);
  if (!state) {
    throw new TypeError('Element is not a registered scene frame.');
  }
  return state;
}

const frameReferences = new WeakMap<HTMLElement, string | null>();
interface SceneFrameReferences {
  readonly parents: ReadonlyMap<HTMLElement, HTMLElement | null>;
  readonly authoredParents: ReadonlyMap<HTMLElement, HTMLElement | null>;
  readonly references: ReadonlyMap<HTMLElement, string>;
}
const sceneReferences = new WeakMap<HTMLElement, SceneFrameReferences>();

export function getFrameReference(element: HTMLElement): string | null {
  if (frameReferences.has(element)) return frameReferences.get(element) ?? null;
  return typeof element.getAttribute === 'function' ? element.getAttribute('frame') : null;
}

export function setFrameReference(element: HTMLElement, value: string | null): void {
  if (value !== null && typeof value !== 'string') throw new TypeError('Frame reference must be a name or null.');
  frameReferences.set(element, value);
  notifyOwningScene(element, 'composition');
}

export function hasSceneFrameReferences(scene: HTMLElement): boolean {
  return sceneReferences.has(scene);
}

/** Captures parent relationships and checks cycles only when the registry topology changes. */
export function resolveSceneFrameReferences(
  scene: HTMLElement,
  frames: readonly HTMLElement[],
  layers: readonly HTMLElement[]
): void {
  const elements = [...new Set([...frames, ...layers])];
  const references = captureReferences(elements);
  const connections = captureJointConnections(scene, frames.filter(isFrameStateRegistered));
  const previous = sceneReferences.get(scene);
  if (references.size === 0 && connections.parents.size === 0) {
    sceneReferences.delete(scene);
    updateReferenceErrors(previous?.references, references);
    return;
  }
  const authoredParents = captureReferenceParents(scene, elements, references);
  for (const [element, parent] of connections.parents) authoredParents.set(element, parent);
  const parents =
    sameParents(authoredParents, previous?.authoredParents) && previous
      ? previous.parents
      : checkedReferenceParents(authoredParents);
  sceneReferences.set(scene, { parents, authoredParents, references });
  reportJointConnections(connections, parents);
  updateReferenceErrors(previous?.references, references);
}

function captureReferences(elements: readonly HTMLElement[]): Map<HTMLElement, string> {
  const references = new Map<HTMLElement, string>();
  for (const element of elements) {
    const name = getFrameReference(element)?.trim();
    if (name) references.set(element, name);
  }
  return references;
}

function captureReferenceParents(
  scene: HTMLElement,
  elements: readonly HTMLElement[],
  references: ReadonlyMap<HTMLElement, string>
): Map<HTMLElement, HTMLElement | null> {
  const parents = new Map<HTMLElement, HTMLElement | null>();
  for (const element of elements) {
    const reference = references.get(element);
    parents.set(
      element,
      reference ? (getNamedFrameElement(scene, reference, element) ?? null) : nearestFrameParent(element, scene)
    );
  }
  return parents;
}

function updateReferenceErrors(
  previous: ReadonlyMap<HTMLElement, string> | undefined,
  references: ReadonlyMap<HTMLElement, string>
): void {
  for (const element of previous?.keys() ?? []) {
    if (!references.has(element)) updateReferenceError(element, false);
  }
  const evaluation = new FrameEvaluation();
  for (const element of references.keys()) updateReferenceError(element, !evaluation.isValid(element));
}

function nearestFrameParent(element: HTMLElement, scene: HTMLElement): HTMLElement {
  const parent = element.parentElement?.closest<HTMLElement>('nve-scene-frame, nve-scene-model, nve-scene-body');
  return parent?.closest('nve-scene') === scene ? parent : scene;
}

function sameParents(
  next: ReadonlyMap<HTMLElement, HTMLElement | null>,
  previous?: ReadonlyMap<HTMLElement, HTMLElement | null>
): boolean {
  return (
    previous !== undefined &&
    next.size === previous.size &&
    [...next].every(([element, parent]) => previous.get(element) === parent)
  );
}

function checkedReferenceParents(
  authored: ReadonlyMap<HTMLElement, HTMLElement | null>
): ReadonlyMap<HTMLElement, HTMLElement | null> {
  const parents = new Map(authored);
  for (const cycle of findParentCycles(authored)) {
    for (const element of cycle) parents.set(element, null);
  }
  return parents;
}

function updateReferenceError(element: HTMLElement, active: boolean): void {
  diagnosticReporterService.update({
    active,
    code: FRAME_UNRESOLVED,
    element,
    message: 'The frame reference must resolve to one uniquely named valid frame in this scene without a cycle.',
    severity: 'error'
  });
}
