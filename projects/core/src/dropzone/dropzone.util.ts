// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { formatFileSize } from '@nvidia-elements/core/internal';
import type { Dropzone } from './dropzone';
import type { ValidatorResult } from '@nvidia-elements/forms';

export function getFileTypeSpecifiers(acceptTypes: string) {
  const types = acceptTypes.split(',').map((value: string) => {
    let type = value.trim();
    if (type.startsWith('.')) {
      type = type.slice(1);
    }
    if (type.endsWith('/*')) {
      type = type.split('/')[0]!;
    }
    if (type.includes('/')) {
      type = type.split('/')[1]!;
    }
    if (type.includes('+')) {
      type = type.split('+')[0]!;
    }
    return type;
  });
  return types;
}

export function fileSizeValidator(value: unknown, element: unknown): ValidatorResult {
  const dropzone = element as Dropzone;
  const files = value as File[];

  if (!files || !Array.isArray(files) || files.length === 0) {
    return { validity: { valid: true } };
  }

  const invalid = files.filter(file => file.size > dropzone.maxFileSize).length > 0;

  if (invalid) {
    return {
      validity: { rangeOverflow: true, valid: false },
      message: `Some files exceed the maximum size of ${formatFileSize(dropzone.maxFileSize)}`
    };
  }
  return { validity: { valid: true } };
}

export function fileTypeValidator(value: unknown, element: unknown): ValidatorResult {
  const dropzone = element as Dropzone;
  const files = value as File[];

  if (!files || !Array.isArray(files) || files.length === 0) {
    return { validity: { valid: true } };
  }

  const acceptedTypes = getFileTypeSpecifiers(dropzone.accept);

  const invalidFiles = files.filter(file => {
    return !acceptedTypes.some((acceptedType: string) => {
      return file.type.includes(acceptedType);
    });
  });

  if (invalidFiles.length > 0) {
    return { validity: { typeMismatch: true, valid: false }, message: `Some files are not of accepted types` };
  }
  return { validity: { valid: true } };
}
