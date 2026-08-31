const INCOMPATIBLE_SOFTWARE_ARGUMENTS = new Set(['--disable-gpu', '--disable-software-rasterizer']);
const SOFTWARE_WEBGPU_ARGUMENTS = [
  '--use-angle=swiftshader',
  '--use-vulkan=swiftshader',
  '--use-webgpu-adapter=swiftshader',
  '--enable-features=Vulkan',
  '--enable-unsafe-webgpu',
  '--use-gpu-in-tests'
];

/** Creates deterministic software-WebGPU Chromium arguments without mutating the base profile. */
export function withSoftwareWebGPUChromiumArgs(chromiumArgs) {
  return [
    ...chromiumArgs.filter(
      argument => !INCOMPATIBLE_SOFTWARE_ARGUMENTS.has(argument) && !SOFTWARE_WEBGPU_ARGUMENTS.includes(argument)
    ),
    ...SOFTWARE_WEBGPU_ARGUMENTS
  ];
}
