// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SceneCamera, sceneCameraController } from '../../camera/camera.js';
import {
  GestureController,
  KeyNavigationSpatialController,
  type Gesture,
  type GestureCapabilities,
  type SpatialKeyCommand,
  type SpatialKeyHandling
} from '@nvidia-elements/core/internal';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { resolveCameraState, type CameraContribution, type CameraField } from './state.js';
import { getFrameWorldMatrix, getNamedSceneFrame, isFrameChainValid } from '../frame/state.js';
import {
  applyOrbitDrag,
  applyOrbitKey,
  applyOrbitWheel,
  applyOrbitZoom,
  copyCameraState,
  copyOrbitCameraState,
  createCameraViewProjection,
  DEFAULT_CAMERA_STATE,
  DEFAULT_ORBIT_CAMERA_STATE,
  orbitCameraStateToCameraState,
  pinchDistance,
  quaternionFromBasis,
  type CameraChangeSource,
  type CameraPose,
  type CameraState,
  type CameraTarget,
  type OrbitCameraState,
  type SceneCameraChangeDetail
} from '../math/camera.js';
import { transformPointMat4 } from '../math/mat4.js';
import { multiplyQuaternions } from '../math/quaternion.js';

type CameraBehaviorContribution = NonNullable<ReturnType<typeof sceneCameraController.getContribution>>;

interface ResolvedCameraBehavior {
  readonly behavior: SceneCamera;
  readonly contribution: CameraBehaviorContribution;
}

type CameraHost = HTMLElement & ReactiveControllerHost;

export class CameraRuntime implements ReactiveController {
  #behaviors: readonly ResolvedCameraBehavior[] = [];
  #behaviorSignature = '';
  #canvas?: HTMLCanvasElement;
  #contributions: readonly CameraBehaviorContribution[] = [];
  readonly #host: CameraHost;
  #pendingChange?: { readonly source: CameraChangeSource; readonly state: CameraState };
  readonly #requestRender: () => void;
  #orbitState = copyOrbitCameraState(DEFAULT_ORBIT_CAMERA_STATE);
  #state = copyCameraState(DEFAULT_CAMERA_STATE);
  readonly #gestureController: GestureController<number>;

  constructor(options: {
    readonly host: CameraHost;
    readonly requestRender: () => void;
    readonly shouldIgnoreInput: (event: Event) => boolean;
  }) {
    this.#host = options.host;
    this.#requestRender = options.requestRender;
    new KeyNavigationSpatialController(options.host);
    this.#gestureController = new GestureController(options.host, {
      createPinchContext: () => this.#orbitState.offset.distance,
      getCapabilities: () => this.#getGestureCapabilities(),
      prepare: () => this.resolve(),
      shouldIgnore: options.shouldIgnoreInput
    });
    options.host.addController(this);
  }

  hostConnected(): void {
    this.#host.addEventListener('nve-gesture', this.#handleGestureEvent as EventListener);
    this.#host.addEventListener('nve-key', this.#handleSpatialKeyEvent as EventListener);
  }

  hostDisconnected(): void {
    this.#host.removeEventListener('nve-gesture', this.#handleGestureEvent as EventListener);
    this.#host.removeEventListener('nve-key', this.#handleSpatialKeyEvent as EventListener);
  }

  get state(): CameraState {
    return copyCameraState(this.#state);
  }

  bindCanvas(canvas: HTMLCanvasElement): void {
    this.#canvas = canvas;
    this.#gestureController.target = canvas;
  }

  unbindCanvas(): void {
    this.#gestureController.target = undefined;
    this.#canvas = undefined;
  }

  trackChanges(): boolean {
    const signature = getSceneCameras(this.#host)
      .map(behavior => {
        const contribution = sceneCameraController.getContribution(behavior);
        return contribution
          ? `${contribution.kind}:${contribution.fields.join(',')}:${JSON.stringify(contribution)}`
          : '';
      })
      .join('|');
    if (signature === this.#behaviorSignature) return false;
    this.#behaviorSignature = signature;
    return true;
  }

  resolve(): void {
    const contributions = this.#resolveBehaviorContributions();
    this.#behaviors = contributions;
    this.#contributions = contributions.map(entry => entry.contribution);
    this.#orbitState = resolveCameraState({
      prior: this.#orbitState,
      contributions: contributions
        .filter(entry => entry.contribution.kind !== 'pose')
        .map(entry => this.#toCameraContribution(entry))
    });
    const pose = contributions.find(
      (
        entry
      ): entry is ResolvedCameraBehavior & {
        contribution: Extract<CameraBehaviorContribution, { kind: 'pose' }>;
      } => entry.contribution.kind === 'pose'
    );
    if (pose) {
      this.#state = this.#resolvePoseCameraState(pose.contribution);
    } else if (contributions.length > 0 || !this.#hasEnabledPoseBehavior()) {
      this.#state = orbitCameraStateToCameraState(this.#orbitState);
    }
  }

  viewProjection(): Float32Array {
    const rect = this.#host.getBoundingClientRect();
    return createCameraViewProjection(this.#state, Math.max(rect.width, 1) / Math.max(rect.height, 1));
  }

  dispatchPendingChange(): void {
    const pending = this.#pendingChange;
    this.#pendingChange = undefined;
    if (!pending) return;
    this.#host.dispatchEvent(
      new CustomEvent<SceneCameraChangeDetail>('nve-scene-camerachange', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: { cameraState: copyCameraState(pending.state), source: pending.source }
      })
    );
  }

  #resolveBehaviorContributions(): ResolvedCameraBehavior[] {
    const behaviors = getSceneCameras(this.#host);
    const configured = behaviors
      .map(behavior => ({ behavior, contribution: sceneCameraController.getContribution(behavior) }))
      .filter(
        (entry): entry is { behavior: SceneCamera; contribution: CameraBehaviorContribution } =>
          entry.contribution !== null
      );
    for (const entry of configured) {
      const resolved = this.#isCameraFrameResolved(entry.contribution);
      sceneCameraController.setFrameResolved(entry.behavior, resolved);
    }
    const resolvable = configured.filter(entry => sceneCameraController.isResolvable(entry.behavior));
    const conflicted = getConflictedCameraBehaviors(resolvable);
    const active = this.#assignOrbitTargetFields(resolvable.filter(entry => !conflicted.has(entry.behavior)));
    for (const behavior of behaviors) sceneCameraController.setConflict(behavior, conflicted.has(behavior));
    return active;
  }

  #toCameraContribution(entry: ResolvedCameraBehavior): CameraContribution {
    const { contribution } = entry;
    if (contribution.kind === 'orbit') return this.#toOrbitCameraContribution(contribution);
    if (contribution.kind === 'top') return this.#toTopCameraContribution(contribution);
    if (contribution.kind === 'follow') return this.#toFollowCameraContribution(contribution);
    throw new TypeError('Pose contributions resolve directly to canonical camera state.');
  }

  #toOrbitCameraContribution(contribution: Extract<CameraBehaviorContribution, { kind: 'orbit' }>): CameraContribution {
    const target = this.#getOrbitTargetPatch(contribution);
    return {
      fields: contribution.fields,
      patch: {
        ...(target ? { target } : {}),
        offset: { distance: contribution.distance, phi: contribution.phi, theta: contribution.theta },
        projection: contribution.projection
      }
    };
  }

  #toTopCameraContribution(contribution: Extract<CameraBehaviorContribution, { kind: 'top' }>): CameraContribution {
    return {
      fields: contribution.fields,
      patch: {
        target: contribution.target,
        offset: { distance: contribution.height, phi: 0, theta: 0 },
        projection: contribution.projection
      }
    };
  }

  #toFollowCameraContribution(
    contribution: Extract<CameraBehaviorContribution, { kind: 'follow' }>
  ): CameraContribution {
    const frame = this.#resolveFollowFrame(contribution.frame);
    if (!frame) return { fields: contribution.fields, patch: {} };
    const matrix = getFrameWorldMatrix(frame);
    return {
      fields: contribution.fields,
      patch: {
        target: {
          position: [matrix[12] ?? 0, matrix[13] ?? 0, matrix[14] ?? 0],
          ...(contribution.mode === 'pose' ? { heading: Math.atan2(matrix[1] ?? 0, matrix[0] ?? 1) } : {})
        }
      }
    };
  }

  #resolvePoseCameraState(contribution: Extract<CameraBehaviorContribution, { kind: 'pose' }>): CameraState {
    const pose = contribution.frame ? this.#composeFramePose(contribution.frame, contribution.pose) : contribution.pose;
    return { pose, projection: { ...contribution.projection } };
  }

  // eslint-disable-next-line complexity -- Fixed matrix fallbacks make frame composition total.
  #composeFramePose(frameName: string, localPose: CameraPose): CameraPose {
    const frame = this.#resolveFollowFrame(frameName);
    if (!frame) throw new DOMException('The camera frame is unresolved.', 'InvalidStateError');
    const matrix = getFrameWorldMatrix(frame);
    return {
      position: transformPointMat4(matrix, localPose.position),
      orientation: multiplyQuaternions(
        quaternionFromBasis(
          [matrix[0] ?? 1, matrix[1] ?? 0, matrix[2] ?? 0],
          [matrix[4] ?? 0, matrix[5] ?? 1, matrix[6] ?? 0],
          [matrix[8] ?? 0, matrix[9] ?? 0, matrix[10] ?? 1]
        ),
        localPose.orientation
      )
    };
  }

  #isCameraFrameResolved(contribution: CameraBehaviorContribution): boolean {
    if (contribution.kind === 'follow') return this.#resolveFollowFrame(contribution.frame) !== undefined;
    if (contribution.kind === 'pose' && contribution.frame) {
      return this.#resolveFollowFrame(contribution.frame) !== undefined;
    }
    return true;
  }

  #resolveFollowFrame(name: string): HTMLElement | undefined {
    const frame = getNamedSceneFrame(this.#host, name);
    return frame && isFrameChainValid(frame) ? frame : undefined;
  }

  #hasEnabledPoseBehavior(): boolean {
    return getSceneCameras(this.#host).some(camera => camera.behavior === 'pose' && !camera.disabled);
  }

  #assignOrbitTargetFields(contributions: readonly ResolvedCameraBehavior[]): ResolvedCameraBehavior[] {
    const owned = new Set(
      contributions.filter(entry => entry.contribution.kind !== 'orbit').flatMap(entry => entry.contribution.fields)
    );
    return contributions.map(entry =>
      entry.contribution.kind === 'orbit'
        ? {
            behavior: entry.behavior,
            contribution: {
              ...entry.contribution,
              fields: [
                ...entry.contribution.fields,
                ...(!owned.has('target.position') ? (['target.position'] as const) : []),
                ...(!owned.has('target.heading') ? (['target.heading'] as const) : [])
              ]
            }
          }
        : entry
    );
  }

  #getOrbitTargetPatch(
    contribution: Extract<CameraBehaviorContribution, { kind: 'orbit' }>
  ): Partial<CameraTarget> | undefined {
    const position = contribution.fields.includes('target.position') ? contribution.target.position : undefined;
    const heading = contribution.fields.includes('target.heading') ? contribution.target.heading : undefined;
    return position || heading !== undefined
      ? { ...(position ? { position } : {}), ...(heading !== undefined ? { heading } : {}) }
      : undefined;
  }

  #getInteractiveOrbit(): Extract<CameraBehaviorContribution, { kind: 'orbit' }> | undefined {
    if (this.#getInteractiveTop()) return undefined;
    return this.#contributions.find(
      (contribution): contribution is Extract<CameraBehaviorContribution, { kind: 'orbit' }> =>
        contribution.kind === 'orbit'
    );
  }

  #getInteractiveTop(): Extract<CameraBehaviorContribution, { kind: 'top' }> | undefined {
    return this.#contributions.find(
      (contribution): contribution is Extract<CameraBehaviorContribution, { kind: 'top' }> =>
        contribution.kind === 'top'
    );
  }

  #hasTargetOwner(): boolean {
    return this.#contributions.some(
      contribution => contribution.kind === 'follow' && contribution.fields.includes('target.position')
    );
  }

  #getGestureCapabilities(): GestureCapabilities {
    const orbit = this.#getInteractiveOrbit();
    const interactive = Boolean(orbit || this.#getInteractiveTop());
    return { drag: Boolean(orbit), pan: interactive, pinch: Boolean(orbit), wheel: Boolean(orbit) };
  }

  #handleGestureEvent = (event: CustomEvent<Gesture<number>>): void => {
    this.#handleGesture(event.detail);
  };

  #handleGesture(gesture: Gesture<number>): void {
    switch (gesture.kind) {
      case 'drag':
        this.#handleDrag(gesture);
        break;
      case 'pan':
        this.#handlePan(gesture);
        break;
      case 'pinch':
        this.#handlePinch(gesture);
        break;
      case 'wheel':
        this.#handleWheel(gesture);
        break;
      default: {
        const exhaustive: never = gesture;
        throw new Error(`Unhandled camera gesture: ${String(exhaustive)}`);
      }
    }
  }

  #handleDrag(gesture: Extract<Gesture<number>, { kind: 'drag' }>): void {
    const orbit = this.#getInteractiveOrbit();
    if (!orbit) return;
    this.#setUserState(
      applyOrbitDrag(this.#orbitState, gesture.movementX, gesture.movementY, orbit.minDistance, orbit.maxDistance),
      pointerCameraSource(gesture.event)
    );
  }

  #handlePan(gesture: Extract<Gesture<number>, { kind: 'pan' }>): void {
    const top = this.#getInteractiveTop();
    if (top || !this.#hasTargetOwner()) {
      const next = gesture.event.shiftKey
        ? this.#moveVerticallyByPixels(gesture.movementY, top)
        : this.#panByPixels(
            top ? gesture.movementX : -gesture.movementX,
            top ? gesture.movementY : -gesture.movementY,
            top
          );
      this.#setUserState(next, pointerCameraSource(gesture.event));
    }
  }

  #handlePinch(gesture: Extract<Gesture<number>, { kind: 'pinch' }>): void {
    const orbit = this.#getInteractiveOrbit();
    if (!orbit) return;
    this.#setUserState(
      applyOrbitZoom(
        this.#orbitState,
        pinchDistance(gesture.context, gesture.scale),
        orbit.minDistance,
        orbit.maxDistance
      ),
      'touch'
    );
  }

  #handleWheel(gesture: Extract<Gesture<number>, { kind: 'wheel' }>): void {
    const orbit = this.#getInteractiveOrbit();
    if (!orbit) return;
    this.#setUserState(
      applyOrbitWheel(this.#orbitState, gesture.deltaPixels, orbit.minDistance, orbit.maxDistance),
      'wheel'
    );
  }

  #handleSpatialKeyEvent = (event: CustomEvent<SpatialKeyCommand>): void => {
    if (this.#handleSpatialKey(event.detail) === 'handled') event.detail.event.preventDefault();
  };

  #handleSpatialKey(command: SpatialKeyCommand): SpatialKeyHandling {
    this.resolve();
    const top = this.#getInteractiveTop();
    const orbit = this.#getInteractiveOrbit();
    if (!top && !orbit) return 'ignored';
    const next =
      command.kind === 'direction'
        ? this.#getDirectionalKeyState(command, top)
        : orbit
          ? applyOrbitKey(this.#orbitState, command.key, orbit.minDistance, orbit.maxDistance)
          : null;
    if (!next) return 'ignored';
    this.#setUserState(next, 'keyboard');
    return 'handled';
  }

  #getDirectionalKeyState(
    command: Extract<SpatialKeyCommand, { kind: 'direction' }>,
    top: Extract<CameraBehaviorContribution, { kind: 'top' }> | undefined
  ): OrbitCameraState | null {
    if (command.ctrlKey && command.shiftKey && command.vertical !== 0) {
      return this.#hasTargetOwner() ? null : this.#moveVerticallyByPixels(command.vertical * 20, top);
    }
    if (command.shiftKey) {
      return this.#hasTargetOwner() ? null : this.#panByPixels(command.horizontal * 20, -command.vertical * 20, top);
    }
    if (top) return this.#panByPixels(command.horizontal * 20, command.vertical * 20, top);
    const orbit = this.#getInteractiveOrbit();
    return orbit ? applyOrbitKey(this.#orbitState, command.key, orbit.minDistance, orbit.maxDistance) : null;
  }

  #panByPixels(
    rightPixels: number,
    forwardPixels: number,
    top: Extract<CameraBehaviorContribution, { kind: 'top' }> | undefined
  ): OrbitCameraState {
    const next = copyOrbitCameraState(this.#orbitState);
    const scale = this.#worldUnitsPerPixel(next, top);
    const azimuth = next.target.heading + next.offset.theta;
    const right: [number, number] = [-Math.sin(azimuth), Math.cos(azimuth)];
    const forward: [number, number] = [Math.cos(azimuth), Math.sin(azimuth)];
    next.target.position[0] += (right[0] * rightPixels + forward[0] * forwardPixels) * scale;
    next.target.position[1] += (right[1] * rightPixels + forward[1] * forwardPixels) * scale;
    return next;
  }

  #moveVerticallyByPixels(
    upPixels: number,
    top: Extract<CameraBehaviorContribution, { kind: 'top' }> | undefined
  ): OrbitCameraState {
    const next = copyOrbitCameraState(this.#orbitState);
    next.target.position[2] += upPixels * this.#worldUnitsPerPixel(next, top);
    return next;
  }

  #worldUnitsPerPixel(
    state: OrbitCameraState,
    top: Extract<CameraBehaviorContribution, { kind: 'top' }> | undefined
  ): number {
    const height = Math.max(this.#canvas?.getBoundingClientRect().height ?? 0, 1);
    return top
      ? (state.projection.mode === 'ortho' ? state.projection.frustumHeight : top.height) / height
      : (2 *
          state.offset.distance *
          Math.tan(state.projection.mode === 'perspective' ? state.projection.fovy / 2 : 0.5)) /
          height;
  }

  #setUserState(state: OrbitCameraState, source: CameraChangeSource): void {
    this.#syncUserStateToBehaviors(state);
    this.#orbitState = copyOrbitCameraState(state);
    this.#state = orbitCameraStateToCameraState(state);
    this.#pendingChange = { source, state: copyCameraState(this.#state) };
    this.#requestRender();
  }

  #syncUserStateToBehaviors(state: OrbitCameraState): void {
    for (const { behavior, contribution } of this.#behaviors) {
      if (contribution.kind === 'orbit') {
        behavior.distance = state.offset.distance;
        behavior.phi = state.offset.phi;
        behavior.theta = state.offset.theta;
        behavior.projection = state.projection.mode;
        if (state.projection.mode === 'perspective') behavior.fovy = state.projection.fovy;
        else behavior.frustumHeight = state.projection.frustumHeight;
        this.#syncUserTarget(behavior, contribution.fields, state.target);
      } else if (contribution.kind === 'top') {
        behavior.height = state.projection.mode === 'ortho' ? state.projection.frustumHeight : state.offset.distance;
        this.#syncUserTarget(behavior, contribution.fields, state.target);
      }
    }
  }

  #syncUserTarget(behavior: SceneCamera, fields: readonly CameraField[], target: CameraTarget): void {
    if (fields.includes('target.position')) behavior.target = [...target.position];
    if (fields.includes('target.heading')) behavior.heading = target.heading;
  }
}

function getConflictedCameraBehaviors(
  entries: readonly { behavior: SceneCamera; contribution: CameraBehaviorContribution }[]
): Set<SceneCamera> {
  const owners = new Map<CameraField, SceneCamera[]>();
  for (const entry of entries) {
    for (const field of entry.contribution.fields) owners.set(field, [...(owners.get(field) ?? []), entry.behavior]);
  }
  const conflicted = new Set<SceneCamera>();
  for (const elements of owners.values()) {
    if (elements.length > 1) elements.forEach(element => conflicted.add(element));
  }
  const poseEntries = entries.filter(entry => entry.contribution.kind === 'pose');
  if (poseEntries.length > 0 && entries.length > 1) {
    entries.forEach(entry => conflicted.add(entry.behavior));
  }
  return conflicted;
}

function getSceneCameras(scene: HTMLElement): SceneCamera[] {
  return [...scene.querySelectorAll('nve-scene-camera')].filter(
    (element): element is SceneCamera => element instanceof SceneCamera && element.closest('nve-scene') === scene
  );
}

function pointerCameraSource(event: PointerEvent): Extract<CameraChangeSource, 'pointer' | 'touch'> {
  return event.pointerType === 'touch' ? 'touch' : 'pointer';
}
