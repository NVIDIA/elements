// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Origin of a reactive camera-property write. */
type CameraAssignmentOrigin = 'attribute' | 'author' | 'runtime';

/** Tracks author intent independently from the element's public property values. */
export class CameraInputTracking<Property extends string> {
  #active = false;
  #explicit = new Set<Property>();
  #origin: CameraAssignmentOrigin = 'author';
  #revision = 0;

  applyAttribute(property: Property, present: boolean, apply: () => void): void {
    this.#withOrigin('attribute', apply);
    if (present) this.#explicit.add(property);
    else this.#explicit.delete(property);
    this.#revision++;
  }

  applyRuntimeWrite(apply: () => void): void {
    this.#withOrigin('runtime', apply);
  }

  isExplicit(property: Property): boolean {
    return this.#explicit.has(property);
  }

  get revision(): number {
    return this.#revision;
  }

  start(): void {
    this.#active = true;
  }

  recordAssignment(property: Property): boolean {
    this.#revision++;
    if (!this.#active || this.#origin !== 'author' || this.#explicit.has(property)) return false;
    this.#explicit.add(property);
    return true;
  }

  #withOrigin(origin: CameraAssignmentOrigin, apply: () => void): void {
    const previous = this.#origin;
    this.#origin = origin;
    try {
      apply();
    } finally {
      this.#origin = previous;
    }
  }
}

const cameraInputs = new WeakMap<object, CameraInputTracking<string>>();

/** Installs private assignment tracking for one camera element. */
export function registerCameraInput(camera: object): void {
  cameraInputs.set(camera, new CameraInputTracking());
  getCameraInput(camera).start();
}

/** Applies an attribute write without treating it as authored property intent. */
export function applyCameraInputAttribute(options: {
  readonly apply: () => void;
  readonly camera: object;
  readonly present: boolean;
  readonly property: string;
}): void {
  getCameraInput(options.camera).applyAttribute(options.property, options.present, options.apply);
}

/** Applies an internal navigation write without changing authored intent. */
export function applyCameraInputRuntimeWrite(camera: object, apply: () => void): void {
  getCameraInput(camera).applyRuntimeWrite(apply);
}

/** Returns whether an author explicitly selected a camera property. */
export function cameraInputIsExplicit(camera: object, property: string): boolean {
  return getCameraInput(camera).isExplicit(property);
}

/** Returns the private revision used to invalidate normalized contributions. */
export function getCameraInputRevision(camera: object): number {
  return getCameraInput(camera).revision;
}

/** Records a public property assignment and returns whether it changed author intent. */
export function recordCameraInputAssignment(camera: object, property: string): boolean {
  return getCameraInput(camera).recordAssignment(property);
}

function getCameraInput(camera: object): CameraInputTracking<string> {
  const input = cameraInputs.get(camera);
  if (!input) throw new TypeError('Camera input tracking has not been registered.');
  return input;
}
