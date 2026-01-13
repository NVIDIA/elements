import { describe, expect, it } from 'vitest';
import { WireitService } from './wireit.service.js';

describe('WireitService', () => {
  it('should return the wireit graph data', async () => {
    expect(WireitService.getData).toBeTruthy();
  });
});
