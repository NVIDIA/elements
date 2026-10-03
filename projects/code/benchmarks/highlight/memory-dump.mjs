// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const bytes = value => (value === undefined ? undefined : Number.parseInt(value, 16));

export function summarizeMemoryDump(events, processInfo) {
  const processes = new Map(processInfo.map(process => [process.id, { type: process.type }]));
  for (const event of events) {
    if (event.ph !== 'v' || !event.args?.dumps || !processes.has(event.pid)) continue;
    const process = processes.get(event.pid);
    const dump = event.args.dumps;
    if (dump.process_totals) process.privateFootprintBytes = bytes(dump.process_totals.private_footprint_bytes);
    const allocators = dump.allocators;
    if (!allocators) continue;
    const allocated = name => {
      const size = allocators[name]?.attrs?.size;
      return size?.units === 'bytes' ? bytes(size.value) : undefined;
    };
    for (const [field, name] of [
      ['blinkBytes', 'blink_gc/main/allocated_objects'],
      ['v8Bytes', 'v8/main'],
      ['mallocBytes', 'malloc/allocated_objects']
    ]) {
      const value = allocated(name);
      if (value !== undefined) process[field] = value;
    }
  }
  const renderers = [...processes.values()].filter(process => process.type === 'renderer');
  if (!renderers.length || renderers.some(process => process.privateFootprintBytes === undefined))
    throw new Error('Renderer private footprint unavailable');
  const measured = [...processes.values()].filter(process => process.privateFootprintBytes !== undefined);
  return {
    rendererPrivateFootprintBytes: renderers.reduce((sum, process) => sum + process.privateFootprintBytes, 0),
    measuredProcessPrivateFootprintBytes: measured.reduce((sum, process) => sum + process.privateFootprintBytes, 0),
    renderers,
    // Allocator measurements overlap; do not sum them with each other or heaps.
    measuredProcesses: measured
  };
}

export async function memorySnapshot(browser, page) {
  const client = await page.context().newCDPSession(page);
  const session = await browser.newBrowserCDPSession();
  const events = [];
  session.on('Tracing.dataCollected', ({ value }) => events.push(...value));
  try {
    await client.send('HeapProfiler.collectGarbage');
    const heap = await client.send('Runtime.getHeapUsage');
    const dom = await client.send('Memory.getDOMCounters');
    await client.send('Performance.enable');
    const { metrics } = await client.send('Performance.getMetrics');
    await session.send('Tracing.start', {
      traceConfig: {
        includedCategories: ['disabled-by-default-memory-infra'],
        memoryDumpConfig: { triggers: [] }
      },
      transferMode: 'ReportEvents'
    });
    const dump = await session.send('Tracing.requestMemoryDump', { deterministic: true, levelOfDetail: 'detailed' });
    const complete = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Memory trace completion timed out')), 20_000);
      session.once('Tracing.tracingComplete', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
    await session.send('Tracing.end');
    await complete;
    if (!dump.success) throw new Error('Native memory dump failed');
    const { processInfo } = await session.send('SystemInfo.getProcessInfo');
    return {
      javascriptHeapBytes: heap.usedSize,
      embedderHeapBytes: heap.embedderHeapUsedSize,
      backingStorageBytes: heap.backingStorageSize,
      ...dom,
      layoutObjects: metrics.find(metric => metric.name === 'LayoutObjects')?.value,
      ...summarizeMemoryDump(events, processInfo)
    };
  } finally {
    await client.detach();
    await session.detach();
  }
}
