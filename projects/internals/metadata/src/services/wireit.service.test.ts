import { describe, expect, it } from 'vitest';
import { WireitService } from './wireit.service.js';

describe('WireitService', () => {
  it('should return the wireit graph data', async () => {
    const graph = await WireitService.getGraph();
    expect(graph).toBeDefined();
    expect(graph.nodes).toBeDefined();
    expect(graph.links).toBeDefined();
  });
});
