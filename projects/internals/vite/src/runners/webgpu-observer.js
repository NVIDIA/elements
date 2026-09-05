// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

(() => {
  const gpu = navigator.gpu;
  if (!gpu) return;

  let epoch = 0;
  let nextResourceId = 1;
  let latestDevice;
  const buffers = [];
  const textures = [];
  const devices = [];
  const writes = [];
  const destroys = [];
  const renderPasses = [];
  const draws = [];
  const submits = [];
  const textureCopies = [];
  const scissors = [];
  const bufferInfo = new WeakMap();
  const textureInfo = new WeakMap();
  const deviceIds = new WeakMap();
  const encoderDeviceIds = new WeakMap();
  const passDeviceIds = new WeakMap();
  const queueDeviceIds = new WeakMap();
  const wrappedPrototypes = new WeakMap();

  wrapPrototypeMethod(
    Object.getPrototypeOf(gpu),
    'requestAdapter',
    original =>
      async function (...args) {
        const adapter = await Reflect.apply(original, this, args);
        if (adapter) observeAdapter(adapter);
        return adapter;
      }
  );

  globalThis.__webgpuTestObserver = {
    destroyLatestDevice() {
      latestDevice?.destroy();
    },
    reset() {
      epoch += 1;
      buffers.splice(
        0,
        buffers.length,
        ...buffers.filter(resource => !(resource.destroyed && resource.destroyedEpoch < epoch))
      );
      textures.splice(
        0,
        textures.length,
        ...textures.filter(resource => !(resource.destroyed && resource.destroyedEpoch < epoch))
      );
      writes.length = 0;
      destroys.length = 0;
      renderPasses.length = 0;
      draws.length = 0;
      submits.length = 0;
      textureCopies.length = 0;
      scissors.length = 0;
    },
    snapshot() {
      return {
        buffers: buffers.map(value => ({ ...value })),
        destroys: destroys.map(value => ({ ...value })),
        devices: devices.map(value => ({ ...value })),
        draws: draws.map(value => ({ ...value })),
        epoch,
        renderPasses: renderPasses.map(value => ({ ...value })),
        submits: submits.map(value => ({ ...value })),
        textureCopies: textureCopies.map(value => ({ ...value })),
        textures: textures.map(value => ({ ...value })),
        scissors: scissors.map(value => ({ ...value })),
        writes: writes.map(value => ({ ...value }))
      };
    }
  };

  function observeAdapter(adapter) {
    wrapPrototypeMethod(
      Object.getPrototypeOf(adapter),
      'requestDevice',
      original =>
        async function (...args) {
          const device = await Reflect.apply(original, this, args);
          observeDevice(device);
          return device;
        }
    );
  }

  function observeDevice(device) {
    latestDevice = device;
    const deviceId = devices.length + 1;
    deviceIds.set(device, deviceId);
    queueDeviceIds.set(device.queue, deviceId);
    devices.push({ deviceId, epoch });
    const prototype = Object.getPrototypeOf(device);
    wrapPrototypeMethod(
      prototype,
      'createBuffer',
      original =>
        function (descriptor) {
          const buffer = Reflect.apply(original, this, [descriptor]);
          const activeDeviceId = deviceIds.get(this) ?? deviceId;
          const info = {
            destroyed: false,
            destroyedEpoch: null,
            deviceId: activeDeviceId,
            epoch,
            id: nextResourceId++,
            label: descriptor.label ?? '',
            size: descriptor.size,
            usage: descriptor.usage
          };
          buffers.push(info);
          bufferInfo.set(buffer, info);
          observeBuffer(buffer);
          return buffer;
        }
    );
    wrapPrototypeMethod(
      prototype,
      'createTexture',
      original =>
        function (descriptor) {
          const texture = Reflect.apply(original, this, [descriptor]);
          const activeDeviceId = deviceIds.get(this) ?? deviceId;
          const size = normalizeTextureSize(descriptor.size);
          const info = {
            depthOrArrayLayers: size.depthOrArrayLayers,
            destroyed: false,
            destroyedEpoch: null,
            deviceId: activeDeviceId,
            epoch,
            format: descriptor.format,
            height: size.height,
            id: nextResourceId++,
            label: descriptor.label ?? '',
            usage: descriptor.usage,
            width: size.width
          };
          textures.push(info);
          textureInfo.set(texture, info);
          observeTexture(texture);
          return texture;
        }
    );
    wrapPrototypeMethod(
      prototype,
      'createCommandEncoder',
      original =>
        function (...args) {
          const encoder = Reflect.apply(original, this, args);
          const activeDeviceId = deviceIds.get(this) ?? deviceId;
          encoderDeviceIds.set(encoder, activeDeviceId);
          observeCommandEncoder(encoder, activeDeviceId);
          return encoder;
        }
    );
    observeQueue(device.queue, deviceId);
  }

  function observeQueue(queue, deviceId) {
    const prototype = Object.getPrototypeOf(queue);
    wrapPrototypeMethod(
      prototype,
      'writeBuffer',
      original =>
        function (buffer, offset, data, dataOffset, size) {
          const info = bufferInfo.get(buffer);
          const activeDeviceId = queueDeviceIds.get(this) ?? deviceId;
          writes.push({
            bufferId: info?.id ?? null,
            deviceId: activeDeviceId,
            epoch,
            offset,
            size: resolveWriteSize(data, dataOffset, size),
            usage: info?.usage ?? null
          });
          return Reflect.apply(original, this, [buffer, offset, data, dataOffset, size]);
        }
    );
    wrapPrototypeMethod(
      prototype,
      'submit',
      original =>
        function (commandBuffers) {
          const submitted = Array.from(commandBuffers);
          submits.push({ count: submitted.length, deviceId: queueDeviceIds.get(this) ?? deviceId, epoch });
          return Reflect.apply(original, this, [submitted]);
        }
    );
  }

  function observeBuffer(buffer) {
    wrapPrototypeMethod(
      Object.getPrototypeOf(buffer),
      'destroy',
      original =>
        function (...args) {
          const info = bufferInfo.get(this);
          if (info && !info.destroyed) {
            info.destroyed = true;
            info.destroyedEpoch = epoch;
            destroys.push({ epoch, id: info.id, kind: 'buffer' });
          }
          return Reflect.apply(original, this, args);
        }
    );
  }

  function observeTexture(texture) {
    wrapPrototypeMethod(
      Object.getPrototypeOf(texture),
      'destroy',
      original =>
        function (...args) {
          const info = textureInfo.get(this);
          if (info && !info.destroyed) {
            info.destroyed = true;
            info.destroyedEpoch = epoch;
            destroys.push({ epoch, id: info.id, kind: 'texture' });
          }
          return Reflect.apply(original, this, args);
        }
    );
  }

  function observeCommandEncoder(encoder, deviceId) {
    const prototype = Object.getPrototypeOf(encoder);
    wrapPrototypeMethod(
      prototype,
      'beginRenderPass',
      original =>
        function (...args) {
          const pass = Reflect.apply(original, this, args);
          const activeDeviceId = encoderDeviceIds.get(this) ?? deviceId;
          passDeviceIds.set(pass, activeDeviceId);
          renderPasses.push({ deviceId: activeDeviceId, epoch });
          observeRenderPass(pass, activeDeviceId);
          return pass;
        }
    );
    wrapPrototypeMethod(
      prototype,
      'copyTextureToBuffer',
      original =>
        function (...args) {
          textureCopies.push({ deviceId: encoderDeviceIds.get(this) ?? deviceId, epoch });
          return Reflect.apply(original, this, args);
        }
    );
  }

  function observeRenderPass(pass, deviceId) {
    const prototype = Object.getPrototypeOf(pass);
    for (const method of ['draw', 'drawIndexed', 'drawIndirect', 'drawIndexedIndirect']) {
      wrapPrototypeMethod(
        prototype,
        method,
        original =>
          function (...args) {
            draws.push({ deviceId: passDeviceIds.get(this) ?? deviceId, epoch, method });
            return Reflect.apply(original, this, args);
          }
      );
    }
    wrapPrototypeMethod(
      prototype,
      'setScissorRect',
      original =>
        function (x, y, width, height) {
          scissors.push({ deviceId: passDeviceIds.get(this) ?? deviceId, epoch, height, width, x, y });
          return Reflect.apply(original, this, [x, y, width, height]);
        }
    );
  }

  function wrapPrototypeMethod(prototype, name, createWrapper) {
    if (!prototype) return;
    let methods = wrappedPrototypes.get(prototype);
    if (!methods) {
      methods = new Set();
      wrappedPrototypes.set(prototype, methods);
    }
    if (methods.has(name)) return;
    const original = prototype[name];
    if (typeof original !== 'function') return;
    Object.defineProperty(prototype, name, {
      configurable: true,
      value: createWrapper(original),
      writable: true
    });
    methods.add(name);
  }

  function normalizeTextureSize(size) {
    if (Symbol.iterator in Object(size)) {
      const values = [...size];
      return { depthOrArrayLayers: values[2] ?? 1, height: values[1] ?? 1, width: values[0] ?? 1 };
    }
    return {
      depthOrArrayLayers: size.depthOrArrayLayers ?? 1,
      height: size.height ?? 1,
      width: size.width ?? 1
    };
  }

  function resolveWriteSize(data, dataOffset = 0, size) {
    const bytesPerElement = ArrayBuffer.isView(data) && !(data instanceof DataView) ? data.BYTES_PER_ELEMENT : 1;
    if (size !== undefined) return size * bytesPerElement;
    return Math.max(0, data.byteLength - dataOffset * bytesPerElement);
  }
})();
