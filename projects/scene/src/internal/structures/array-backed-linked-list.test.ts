// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { ArrayBackedLinkedList } from './array-backed-linked-list.js';

function indices(list: ArrayBackedLinkedList): number[] {
  const result: number[] = [];
  let current = list.first;
  for (let index = 0; index < list.size; index += 1) {
    result.push(current);
    current = list.next(current);
  }
  return result;
}

describe(ArrayBackedLinkedList.name, () => {
  it('represents an empty list without links', () => {
    const list = new ArrayBackedLinkedList(0);
    expect(list.first).toBe(-1);
    expect(list.size).toBe(0);
    expect(list.next(0)).toBe(-1);
    expect(list.previous(0)).toBe(-1);
    expect(list.remove(0)).toBe(false);
  });

  it('links a singleton to itself and removes it completely', () => {
    const list = new ArrayBackedLinkedList(1);
    expect(list.next(0)).toBe(0);
    expect(list.previous(0)).toBe(0);
    expect(list.remove(0)).toBe(true);
    expect(list.first).toBe(-1);
    expect(list.size).toBe(0);
    expect(list.next(0)).toBe(-1);
    expect(list.previous(0)).toBe(-1);
    expect(list.remove(0)).toBe(false);
  });

  it('preserves stable indices when removing the head, tail, and middle', () => {
    const list = new ArrayBackedLinkedList(6);
    expect(list.remove(0)).toBe(true);
    expect(list.first).toBe(1);
    expect(list.remove(5)).toBe(true);
    expect(list.remove(3)).toBe(true);
    expect(indices(list)).toEqual([1, 2, 4]);
    expect(list.previous(1)).toBe(4);
    expect(list.next(4)).toBe(1);
    expect(list.previous(4)).toBe(2);
    expect(list.next(2)).toBe(4);
    expect(list.remove(3)).toBe(false);
  });

  it.each([-1, 5, 1.5, NaN, Infinity])('ignores invalid index %s', index => {
    const list = new ArrayBackedLinkedList(5);
    expect(list.next(index)).toBe(-1);
    expect(list.previous(index)).toBe(-1);
    expect(list.remove(index)).toBe(false);
    expect(indices(list)).toEqual([0, 1, 2, 3, 4]);
  });

  it.each([1, 2, 7, 64, 257])('matches array removal through exhaustion with %i indices', length => {
    const list = new ArrayBackedLinkedList(length);
    const reference = Array.from({ length }, (_, index) => index);
    let step = 0;
    while (reference.length > 0) {
      const offset = (step++ * 37) % reference.length;
      const removed = reference.splice(offset, 1)[0]!;
      expect(list.remove(removed)).toBe(true);
      expect(list.size).toBe(reference.length);
      expect(list.first).toBe(reference[0] ?? -1);
      expect(indices(list)).toEqual(reference);
      for (let index = 0; index < reference.length; index += 1) {
        expect(list.previous(reference[index]!)).toBe(reference[(index + reference.length - 1) % reference.length]);
        expect(list.next(reference[index]!)).toBe(reference[(index + 1) % reference.length]);
      }
      expect(list.next(removed)).toBe(-1);
      expect(list.previous(removed)).toBe(-1);
    }
  });

  it.each([-1, 1.5, NaN, Infinity, 0x8000_0000])('rejects invalid length %s', length => {
    expect(() => new ArrayBackedLinkedList(length)).toThrow(RangeError);
  });
});
