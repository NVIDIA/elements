// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getFileTypeSpecifiers, fileSizeValidator, fileTypeValidator } from './dropzone.util';
import type { Dropzone } from './dropzone';

describe('dropzone.util', () => {
  describe('getFileTypeSpecifiers', () => {
    it('should handle MIME types', () => {
      const result = getFileTypeSpecifiers('image/jpeg, image/png');
      expect(result).toEqual(['jpeg', 'png']);
    });

    it('should handle wildcard MIME types', () => {
      const result = getFileTypeSpecifiers('image/*, video/*');
      expect(result).toEqual(['image', 'video']);
    });

    it('should handle MIME types with plus signs', () => {
      const result = getFileTypeSpecifiers('image/svg+xml, application/json+ld');
      expect(result).toEqual(['svg', 'json']);
    });

    it('should handle file extensions with dots', () => {
      const result = getFileTypeSpecifiers('.jpg, .png, .gif');
      expect(result).toEqual(['jpg', 'png', 'gif']);
    });

    it('should handle mixed format types', () => {
      const result = getFileTypeSpecifiers('image/jpeg, .png, video/*, application/pdf');
      expect(result).toEqual(['jpeg', 'png', 'video', 'pdf']);
    });

    it('should trim whitespace', () => {
      const result = getFileTypeSpecifiers('  image/jpeg  ,  image/png  ');
      expect(result).toEqual(['jpeg', 'png']);
    });

    it('should handle single type', () => {
      const result = getFileTypeSpecifiers('image/png');
      expect(result).toEqual(['png']);
    });

    it('should handle empty string', () => {
      const result = getFileTypeSpecifiers('');
      expect(result).toEqual(['']);
    });
  });

  describe('fileSizeValidator', () => {
    const createMockDropzone = (maxFileSize: number): Partial<Dropzone> => ({
      maxFileSize
    });

    it('should return valid for empty array', () => {
      const dropzone = createMockDropzone(1024);
      const result = fileSizeValidator([], dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should return valid for null value', () => {
      const dropzone = createMockDropzone(1024);
      const result = fileSizeValidator(null, dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should return valid for undefined value', () => {
      const dropzone = createMockDropzone(1024);
      const result = fileSizeValidator(undefined, dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should return valid when all files are within size limit', () => {
      const dropzone = createMockDropzone(1024);
      const files = [
        new File(['a'], 'small.txt', { type: 'text/plain' }),
        new File(['b'], 'medium.txt', { type: 'text/plain' })
      ];
      const result = fileSizeValidator(files, dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should return valid when file exactly matches size limit', () => {
      const dropzone = createMockDropzone(10);
      const files = [new File(['x'.repeat(10)], 'file.txt', { type: 'text/plain' })];
      const result = fileSizeValidator(files, dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should return invalid when any file exceeds size limit', () => {
      const dropzone = createMockDropzone(10);
      const files = [
        new File(['a'], 'small.txt', { type: 'text/plain' }),
        new File(['x'.repeat(100)], 'large.txt', { type: 'text/plain' })
      ];
      const result = fileSizeValidator(files, dropzone);
      expect(result.validity.valid).toBe(false);
      expect(result.validity.rangeOverflow).toBe(true);
      expect(result.message).toContain('exceed the maximum size');
    });

    it('should return invalid when file exceeds size limit', () => {
      const dropzone = createMockDropzone(5);
      const files = [new File(['x'.repeat(10)], 'file.txt', { type: 'text/plain' })];
      const result = fileSizeValidator(files, dropzone);
      expect(result.validity.valid).toBe(false);
      expect(result.validity.rangeOverflow).toBe(true);
    });

    it('should format error message with file size', () => {
      const dropzone = createMockDropzone(2 * 1024 * 1024); // 2 MB
      const largeContent = new Array(3 * 1024 * 1024).fill('x').join('');
      const files = [new File([largeContent], 'huge.txt', { type: 'text/plain' })];
      const result = fileSizeValidator(files, dropzone);
      expect(result.validity.valid).toBe(false);
      expect(result.message).toContain('2.00 MB');
    });
  });

  describe('fileTypeValidator', () => {
    const createMockDropzone = (accept: string): Partial<Dropzone> => ({
      accept
    });

    it('should return valid for empty array', () => {
      const dropzone = createMockDropzone('image/jpeg');
      const result = fileTypeValidator([], dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should return valid for null value', () => {
      const dropzone = createMockDropzone('image/jpeg');
      const result = fileTypeValidator(null, dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should return valid for undefined value', () => {
      const dropzone = createMockDropzone('image/jpeg');
      const result = fileTypeValidator(undefined, dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should return valid when all files match accepted types', () => {
      const dropzone = createMockDropzone('image/jpeg, image/png');
      const files = [
        new File(['a'], 'photo.jpg', { type: 'image/jpeg' }),
        new File(['b'], 'graphic.png', { type: 'image/png' })
      ];
      const result = fileTypeValidator(files, dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should validate wildcard MIME types', () => {
      const dropzone = createMockDropzone('image/*');
      const files = [
        new File(['a'], 'photo.jpg', { type: 'image/jpeg' }),
        new File(['b'], 'graphic.png', { type: 'image/png' }),
        new File(['c'], 'icon.svg', { type: 'image/svg+xml' })
      ];
      const result = fileTypeValidator(files, dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should handle file extensions', () => {
      const dropzone = createMockDropzone('.jpeg, .png');
      const files = [
        new File(['a'], 'photo.jpg', { type: 'image/jpeg' }),
        new File(['b'], 'graphic.png', { type: 'image/png' })
      ];
      const result = fileTypeValidator(files, dropzone);
      expect(result.validity.valid).toBe(true);
    });

    it('should return invalid when any file does not match accepted types', () => {
      const dropzone = createMockDropzone('image/jpeg, image/png');
      const files = [
        new File(['a'], 'photo.jpg', { type: 'image/jpeg' }),
        new File(['b'], 'doc.txt', { type: 'text/plain' })
      ];
      const result = fileTypeValidator(files, dropzone);
      expect(result.validity.valid).toBe(false);
      expect(result.validity.typeMismatch).toBe(true);
      expect(result.message).toContain('not of accepted types');
    });

    it('should reject files that do not match wildcard MIME types', () => {
      const dropzone = createMockDropzone('image/*');
      const files = [
        new File(['a'], 'photo.jpg', { type: 'image/jpeg' }),
        new File(['b'], 'video.mp4', { type: 'video/mp4' })
      ];
      const result = fileTypeValidator(files, dropzone);
      expect(result.validity.valid).toBe(false);
      expect(result.validity.typeMismatch).toBe(true);
    });

    it('should reject all files when none match', () => {
      const dropzone = createMockDropzone('image/jpeg');
      const files = [
        new File(['a'], 'doc.txt', { type: 'text/plain' }),
        new File(['b'], 'data.json', { type: 'application/json' })
      ];
      const result = fileTypeValidator(files, dropzone);
      expect(result.validity.valid).toBe(false);
      expect(result.validity.typeMismatch).toBe(true);
    });

    it('should handle mixed valid and invalid files', () => {
      const dropzone = createMockDropzone('image/png');
      const files = [
        new File(['a'], 'valid.png', { type: 'image/png' }),
        new File(['b'], 'invalid.jpg', { type: 'image/jpeg' }),
        new File(['c'], 'another-valid.png', { type: 'image/png' })
      ];
      const result = fileTypeValidator(files, dropzone);
      expect(result.validity.valid).toBe(false);
      expect(result.validity.typeMismatch).toBe(true);
    });
  });
});
