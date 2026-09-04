// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { withSoftwareWebGPUChromiumArgs } from './utils.js';

const observerPath = fileURLToPath(new URL('./webgpu-observer.js', import.meta.url));
const DEFAULT_READY_TIMEOUT = 30_000;
const DEFAULT_TRACE_FINALIZATION_TIMEOUT = 10_000;
const nativeChromiumArgs = [
  '--enable-unsafe-webgpu',
  '--use-gpu-in-tests',
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding'
];

export const WEBGPU_BUFFER_USAGE = Object.freeze({
  storage: 0x80,
  uniform: 0x40
});

export class WebGPUTestRunner {
  #adapterMode;
  #browser;
  #executablePath;
  #harnessPath;
  #headless;
  #outputRoot;
  #projectRoot;
  #server;
  #sessions = new Set();

  constructor(options = {}) {
    this.mode = options.mode ?? getWebGPUTestMode();
    this.#adapterMode = options.adapterMode ?? (this.mode === 'check' ? 'software' : 'native');
    this.#projectRoot = path.resolve(options.projectRoot ?? process.cwd());
    this.#outputRoot = path.resolve(this.#projectRoot, options.outputRoot ?? '.webgpu');
    this.#harnessPath = normalizeHarnessPath(options.harnessPath ?? 'performance/index.html');
    this.#headless = options.headless ?? (this.mode === 'check' || process.env.WEBGPU_TEST_HEADLESS === '1');
    this.#executablePath = options.executablePath ?? nativeChromiumExecutable();
  }

  get projectRoot() {
    return this.#projectRoot;
  }

  async open() {
    if (this.#browser) return;
    this.#server = await createServer({
      appType: 'mpa',
      configFile: false,
      logLevel: 'error',
      mode: 'production',
      root: this.#projectRoot,
      server: {
        forwardConsole: false,
        headers: {
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Opener-Policy': 'same-origin'
        },
        host: '127.0.0.1',
        port: 0,
        strictPort: false
      }
    });
    try {
      await this.#server.listen();
      const args =
        this.#adapterMode === 'software' ? withSoftwareWebGPUChromiumArgs(nativeChromiumArgs) : nativeChromiumArgs;
      this.#browser = await chromium.launch({
        args,
        ...(this.#adapterMode === 'native' && this.#executablePath ? { executablePath: this.#executablePath } : {}),
        headless: this.#headless
      });
    } catch (error) {
      await this.#server.close();
      this.#server = undefined;
      throw error;
    }
  }

  async close() {
    const sessions = [...this.#sessions];
    const browser = this.#browser;
    const server = this.#server;
    this.#sessions.clear();
    this.#browser = undefined;
    this.#server = undefined;

    const results = await Promise.allSettled(sessions.map(session => session.close()));
    results.push(...(await Promise.allSettled([browser?.close(), server?.close()])));
    const errors = results.filter(result => result.status === 'rejected').map(result => result.reason);

    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) throw new AggregateError(errors, 'Unable to close the WebGPU test runner cleanly.');
  }

  async load(options = {}) {
    if (!this.#browser || !this.#server) throw new Error('Open the WebGPU test runner before loading a workload.');
    const readyTimeout = positiveMilliseconds(options.readyTimeout ?? DEFAULT_READY_TIMEOUT, 'readyTimeout');
    const address = this.#server.httpServer?.address();
    if (!address || typeof address === 'string') throw new Error('Unable to resolve the WebGPU test server port.');
    const context = await this.#browser.newContext({
      deviceScaleFactor: options.deviceScaleFactor ?? 1,
      viewport: options.viewport ?? { height: 720, width: 1280 }
    });
    let session;
    try {
      if (options.observeWebGPU) await context.addInitScript({ path: observerPath });
      const page = await context.newPage();
      const errors = [];
      const allowedConsoleErrors = options.allowedConsoleErrors ?? [];
      page.on('pageerror', error => errors.push(`Page error: ${error.message}`));
      page.on('console', message => {
        if (message.type() === 'error' && !allowedConsoleErrors.some(prefix => message.text().startsWith(prefix))) {
          errors.push(`Console error: ${message.text()}`);
        }
      });
      session = new WebGPUTestSession({
        context,
        errors,
        onClose: () => this.#sessions.delete(session),
        page
      });
      this.#sessions.add(session);
      const url = new URL(this.#harnessPath, `http://127.0.0.1:${address.port}`);
      if (options.profile) url.searchParams.set('profile', options.profile);
      await page.goto(url.href, { waitUntil: 'load' });
      await page.evaluate(async timeout => {
        const workload = Reflect.get(globalThis, '__webgpuTestWorkload');
        if (!workload) throw new Error('The page did not register globalThis.__webgpuTestWorkload.');
        let timeoutId;
        try {
          await Promise.race([
            Reflect.get(workload, 'ready'),
            new Promise((_, reject) => {
              timeoutId = setTimeout(
                () => reject(new Error(`The WebGPU workload did not become ready within ${timeout} ms.`)),
                timeout
              );
            })
          ]);
        } finally {
          clearTimeout(timeoutId);
        }
      }, readyTimeout);
      session.adapter = await getAdapterInfo(page);
      if (this.#adapterMode === 'native') assertNativeWebGPUAdapter(session.adapter);
      return session;
    } catch (error) {
      await (session?.close() ?? context.close()).catch(() => undefined);
      throw error;
    }
  }

  async environmentReport(session) {
    if (!this.#browser) throw new Error('Open the WebGPU test runner before reading its environment.');
    return {
      adapter: session.adapter,
      browser: { name: 'Chromium', version: this.#browser.version() },
      buildMode: 'production',
      devicePixelRatio: await session.page.evaluate(() => devicePixelRatio),
      host: {
        architecture: os.arch(),
        cpu: os.cpus()[0]?.model ?? 'unavailable',
        operatingSystem: `${os.type()} ${os.release()}`
      },
      powerState: process.env.WEBGPU_TEST_POWER_STATE ?? 'unavailable',
      viewport: session.page.viewportSize(),
      worktree: {
        commit: git(this.#projectRoot, ['rev-parse', 'HEAD']),
        status: git(this.#projectRoot, ['status', '--short']) || 'clean'
      }
    };
  }

  async inspectProductionBoundary(options = {}) {
    const directory = path.join(this.#projectRoot, options.directory ?? 'dist');
    const files = await listFiles(directory);
    const relative = file => path.relative(this.#projectRoot, file).replaceAll(path.sep, '/');
    const isAllowedFile = options.isAllowedFile ?? (() => false);
    const forbiddenFiles = files.filter(file => {
      const name = relative(file);
      return !isAllowedFile(name) && options.isForbiddenFile?.(name);
    });
    if (forbiddenFiles.length > 0) {
      throw new Error(
        `Test-only performance modules reached production output: ${forbiddenFiles.map(relative).join(', ')}`
      );
    }
    const javascript = files.filter(file => file.endsWith('.js'));
    for (const file of javascript) {
      const name = relative(file);
      const source = await readFile(file, 'utf8');
      const token = options.forbiddenTokens?.find(candidate => source.includes(candidate));
      if (token) throw new Error(`Production output ${name} contains monitoring token ${token}.`);
      if (!isAllowedFile(name)) {
        const match = options.forbiddenSourcePatterns?.find(candidate => {
          candidate.pattern.lastIndex = 0;
          return candidate.pattern.test(source);
        });
        if (match) throw new Error(`Production output ${name} ${match.message}.`);
      }
    }
    const fingerprints = await Promise.all(
      javascript.map(async file => {
        const contents = await readFile(file);
        return {
          bytes: contents.byteLength,
          path: relative(file),
          sha256: createHash('sha256').update(contents).digest('hex')
        };
      })
    );
    return {
      allowedFiles: files.map(relative).filter(isAllowedFile),
      bundleBytes: fingerprints.reduce((total, file) => total + file.bytes, 0),
      files: fingerprints
    };
  }

  async captureTrace(session, options) {
    const cdp = await session.createCDPSession();
    const traceComplete = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
    const finalizationTimeout = positiveMilliseconds(
      options.finalizationTimeout ?? DEFAULT_TRACE_FINALIZATION_TIMEOUT,
      'finalizationTimeout'
    );
    let actionError;
    try {
      await cdp.send('Tracing.start', {
        categories: options.categories ?? 'devtools.timeline,v8,disabled-by-default-v8.gc,gpu',
        options: options.traceOptions ?? 'sampling-frequency=10000',
        transferMode: 'ReturnAsStream'
      });
      try {
        await options.run();
      } catch (error) {
        actionError = error;
      }
      const [endResult, completeResult] = await Promise.allSettled([
        withDeadline(
          cdp.send('Tracing.end'),
          finalizationTimeout,
          `Tracing.end did not settle within ${finalizationTimeout} ms.`
        ),
        withDeadline(
          traceComplete,
          finalizationTimeout,
          `Tracing.tracingComplete did not arrive within ${finalizationTimeout} ms.`
        )
      ]);
      let finalizationError =
        endResult.status === 'rejected'
          ? endResult.reason
          : completeResult.status === 'rejected'
            ? completeResult.reason
            : undefined;
      let tracePath;
      if (completeResult.status === 'fulfilled') {
        try {
          const trace = await withDeadline(
            readProtocolStream(cdp, completeResult.value.stream),
            finalizationTimeout,
            `Reading the trace stream did not settle within ${finalizationTimeout} ms.`
          );
          tracePath = await this.writeArtifact(options.label ?? 'diagnostic', 'trace.json', trace);
        } catch (error) {
          finalizationError ??= error;
        }
      }
      if (actionError) throw actionError;
      if (finalizationError) throw finalizationError;
      return tracePath;
    } finally {
      await cdp.detach().catch(() => undefined);
    }
  }

  async writeReport(label, report) {
    return this.writeArtifact(label, 'report.json', `${JSON.stringify(report, null, 2)}\n`);
  }

  async writeArtifact(label, suffix, contents) {
    await mkdir(this.#outputRoot, { recursive: true });
    const timestamp = new Date().toISOString().replaceAll(':', '-');
    const target = path.join(this.#outputRoot, `${timestamp}-${label}-${suffix}`);
    await writeFile(target, contents);
    return target;
  }
}

export class WebGPUTestSession {
  #closed = false;
  #context;
  #onClose;

  constructor(options) {
    this.#context = options.context;
    this.#onClose = options.onClose;
    this.errors = options.errors;
    this.page = options.page;
    this.adapter = { available: false };
  }

  async call(method, ...args) {
    return this.page.evaluate(
      ({ args: parameters, method: methodName }) => {
        const workload = Reflect.get(globalThis, '__webgpuTestWorkload');
        if (!workload) throw new Error('The page did not register globalThis.__webgpuTestWorkload.');
        const operation = Reflect.get(workload, methodName);
        if (typeof operation !== 'function') throw new Error(`The WebGPU workload does not implement ${methodName}().`);
        return Reflect.apply(operation, workload, parameters);
      },
      { args, method }
    );
  }

  async resetObserver() {
    await this.page.evaluate(() => {
      const observer = Reflect.get(globalThis, '__webgpuTestObserver');
      if (!observer) throw new Error('The WebGPU observer is not installed for this session.');
      observer.reset();
    });
  }

  async snapshotObserver() {
    return this.page.evaluate(() => {
      const observer = Reflect.get(globalThis, '__webgpuTestObserver');
      if (!observer) throw new Error('The WebGPU observer is not installed for this session.');
      return observer.snapshot();
    });
  }

  createCDPSession() {
    return this.#context.newCDPSession(this.page);
  }

  async close() {
    if (this.#closed) return;
    this.#closed = true;
    this.#onClose?.();
    await this.#context.close();
  }
}

export function getWebGPUTestMode() {
  const mode = process.env.WEBGPU_TEST_MODE ?? 'check';
  if (!['check', 'measure', 'diagnostic', 'lifecycle'].includes(mode)) {
    throw new Error(`Unknown WebGPU test mode: ${mode}`);
  }
  return mode;
}

export function assertNativeWebGPUAdapter(adapter) {
  if (!adapter.available) throw new Error('Native WebGPU is unavailable.');
  const identity = `${adapter.vendor} ${adapter.architecture} ${adapter.device} ${adapter.description}`.toLowerCase();
  if (adapter.isFallbackAdapter === true || /(swiftshader|llvmpipe|software)/u.test(identity)) {
    throw new Error(`The WebGPU test requires a native GPU adapter; observed ${identity}.`);
  }
}

export async function collectWebGPUMemorySnapshot(cdp, page) {
  const cdpMetrics = await cdp.send('Performance.getMetrics');
  const cdpValues = Object.fromEntries(cdpMetrics.metrics.map(metric => [metric.name, metric.value]));
  const browserMemory = await page.evaluate(async () => {
    if (typeof performance.measureUserAgentSpecificMemory !== 'function') return { available: false };
    try {
      return { available: true, value: await performance.measureUserAgentSpecificMemory() };
    } catch (error) {
      return { available: false, reason: error instanceof Error ? error.message : String(error) };
    }
  });
  return { browser: browserMemory, cdp: cdpValues };
}

export function getWebGPUWrites(snapshot, requiredUsage, excludedUsage = 0) {
  return snapshot.writes.filter(
    write =>
      write.epoch === snapshot.epoch &&
      write.usage !== null &&
      (write.usage & requiredUsage) !== 0 &&
      (write.usage & excludedUsage) === 0
  );
}

export function getCurrentWebGPUTextures(snapshot) {
  return snapshot.textures.filter(texture => texture.epoch === snapshot.epoch);
}

export function summarizeWebGPUWrites(writes) {
  return { bytes: writes.reduce((total, write) => total + write.size, 0), count: writes.length };
}

export function summarizeWebGPUResources(snapshot) {
  return {
    bufferCreates: snapshot.buffers.filter(buffer => buffer.epoch === snapshot.epoch).length,
    bufferDestroys: snapshot.destroys.filter(resource => resource.kind === 'buffer').length,
    draws: snapshot.draws.length,
    liveBuffers: snapshot.buffers.filter(buffer => !buffer.destroyed).length,
    liveTextures: snapshot.textures.filter(texture => !texture.destroyed).length,
    onePixelScissors: snapshot.scissors.filter(scissor => scissor.width === 1 && scissor.height === 1).length,
    renderPasses: snapshot.renderPasses.length,
    submits: snapshot.submits.length,
    textureCopies: snapshot.textureCopies.length,
    textureCreates: snapshot.textures.filter(texture => texture.epoch === snapshot.epoch).length,
    textureDestroys: snapshot.destroys.filter(resource => resource.kind === 'texture').length,
    writes: summarizeWebGPUWrites(snapshot.writes)
  };
}

export function median(values) {
  const sorted = values.filter(value => value !== null).sort((left, right) => left - right);
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2 : sorted[middle];
}

export function positiveEnvironmentInteger(name, fallback) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

export function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function withDeadline(promise, milliseconds, message) {
  let timeoutId;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), milliseconds);
      })
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

function positiveMilliseconds(value, name) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be a positive number.`);
  return value;
}

async function getAdapterInfo(page) {
  return page.evaluate(async () => {
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) return { available: false };
    const info = adapter.info;
    return {
      available: true,
      architecture: info?.architecture ?? 'unavailable',
      description: info?.description ?? 'unavailable',
      device: info?.device ?? 'unavailable',
      isFallbackAdapter: info?.isFallbackAdapter ?? adapter.isFallbackAdapter ?? 'unavailable',
      vendor: info?.vendor ?? 'unavailable'
    };
  });
}

async function readProtocolStream(cdp, stream) {
  let result = '';
  while (true) {
    const chunk = await cdp.send('IO.read', { handle: stream });
    result += chunk.base64Encoded ? Buffer.from(chunk.data, 'base64').toString('utf8') : chunk.data;
    if (chunk.eof) break;
  }
  await cdp.send('IO.close', { handle: stream });
  return result;
}

function nativeChromiumExecutable() {
  const configured = process.env.WEBGPU_TEST_EXECUTABLE_PATH;
  if (configured) return configured;
  const candidates =
    process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
          '/Applications/Chromium.app/Contents/MacOS/Chromium'
        ]
      : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return candidates.find(candidate => existsSync(candidate));
}

function normalizeHarnessPath(value) {
  return value.startsWith('/') ? value : `/${value}`;
}

function git(cwd, args) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  } catch {
    return 'unavailable';
  }
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(entry => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(target) : [target];
    })
  );
  return nested.flat().sort();
}
