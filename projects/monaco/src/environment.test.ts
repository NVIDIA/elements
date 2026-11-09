// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { createMonacoEnvironment } from './environment.js';

vi.mock('./workers/json.worker.js?worker&inline', () => ({
  default: class {
    kind = 'json';
  }
}));

vi.mock('./workers/css.worker.js?worker&inline', () => ({
  default: class {
    kind = 'css';
  }
}));

vi.mock('./workers/html.worker.js?worker&inline', () => ({
  default: class {
    kind = 'html';
  }
}));

vi.mock('./workers/ts.worker.js?worker&inline', () => ({
  default: class {
    kind = 'typescript';
  }
}));

vi.mock('./workers/editor.worker.js?worker&inline', () => ({
  default: class {
    kind = 'editor';
  }
}));

describe('createMonacoEnvironment', () => {
  it.each([
    ['json', 'json'],
    ['css', 'css'],
    ['html', 'html'],
    ['javascript', 'typescript'],
    ['typescript', 'typescript'],
    ['', 'editor'],
    ['unknown', 'editor']
  ])('selects the %s worker', async (label, kind) => {
    const environment = createMonacoEnvironment();
    expect(await environment.getWorker('module', label)).toMatchObject({ kind });
  });

  it('creates an independent worker for every request', async () => {
    const environment = createMonacoEnvironment();
    expect(await environment.getWorker('', 'json')).not.toBe(await environment.getWorker('', 'json'));
  });
});
