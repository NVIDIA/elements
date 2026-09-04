// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const INCOMPATIBLE_SOFTWARE_ARGUMENTS = new Set(['--disable-gpu', '--disable-software-rasterizer']);
const ENABLE_FEATURES_PREFIX = '--enable-features=';
const SOFTWARE_WEBGPU_ARGUMENTS = [
  '--use-angle=swiftshader',
  '--use-vulkan=swiftshader',
  '--use-webgpu-adapter=swiftshader',
  '--enable-unsafe-webgpu',
  '--use-gpu-in-tests'
];

/** Creates deterministic software-WebGPU Chromium arguments without mutating the base profile. */
export function withSoftwareWebGPUChromiumArgs(chromiumArgs) {
  const features = chromiumArgs
    .filter(argument => argument.startsWith(ENABLE_FEATURES_PREFIX))
    .flatMap(argument => argument.slice(ENABLE_FEATURES_PREFIX.length).split(','))
    .filter(Boolean);
  features.push('Vulkan');
  return [
    ...chromiumArgs.filter(
      argument =>
        !argument.startsWith(ENABLE_FEATURES_PREFIX) &&
        !INCOMPATIBLE_SOFTWARE_ARGUMENTS.has(argument) &&
        !SOFTWARE_WEBGPU_ARGUMENTS.includes(argument)
    ),
    ...SOFTWARE_WEBGPU_ARGUMENTS,
    `${ENABLE_FEATURES_PREFIX}${[...new Set(features)].join(',')}`
  ];
}
