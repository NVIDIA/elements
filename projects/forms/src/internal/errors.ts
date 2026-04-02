// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export class FormControlError extends Error {
  constructor(formControlName: string, message: string) {
    super(`(${formControlName}): ${message}`);
    this.name = 'FormControlError';
  }
}
