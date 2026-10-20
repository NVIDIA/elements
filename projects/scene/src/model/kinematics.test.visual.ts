// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import { composePreciseMat4, multiplyPreciseMat4, transformPointMat4 } from '../internal/math/mat4.js';
import { multiplyQuaternions } from '../internal/math/quaternion.js';
import type { Quaternion, ScenePose, Vec3 } from '../index.js';
import type { Scene } from '../scene/scene.js';
import type { SceneBody } from '../body/body.js';
import type { loadGeometry } from '../index.js';

declare global {
  interface Window {
    sceneLoadGeometry: typeof loadGeometry;
  }
}

interface ReplayRobot {
  joints: {
    name: string;
    child: string;
    parent: string;
    axis: Vec3;
    position: Vec3;
    orientation: Quaternion;
    scale: number;
    offset: number;
  }[];
  links: { name: string; visuals: { asset: string; motor: boolean }[] }[];
  jawTip: Vec3;
}

// Frozen origins, axes, and calibration from the pre-joint replay, independent of the regenerated metadata.
const replayOrigins: Quaternion[] = [
  [0.7071045443232222, 0, 0, 0.7071090180427968],
  [-0.7833269096274834, 0, 0, 0.6216099682706644],
  [0.7071045443232222, 0, 0, 0.7071090180427968],
  [-0.479425538604203, 0, 0, 0.8775825618903728],
  [0, 0.7071045443232222, 0, 0.7071090180427968],
  [0, 0.9999999999799858, 0, 0.000006326794896668469]
];
const replayPositions: Vec3[] = [
  [0, -0.0452, 0.0165],
  [0, 0.1025, 0.0306],
  [0, 0.11257, 0.028],
  [0, 0.0052, 0.1349],
  [0, -0.0601, 0],
  [-0.0202, -0.0244, 0]
];
const replayAxes: Vec3[] = [
  [0, 1, 0],
  [1, 0, 0],
  [1, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1]
];
const replayCalibration = [
  [-1, 0],
  [1, 1.8],
  [1, -Math.PI / 2],
  [1, 1 - Math.PI / 2],
  [-1, 0],
  [1, 0]
];
// Printed-part colors per link, matching the replay palette that approximates the recorded arm.
const replayLinkColors: Record<string, string> = {
  base: '#ff7a33',
  shoulder: '#ff7a33',
  upper_arm: '#ff7a33',
  lower_arm: '#ff7a33',
  wrist: '#eceae6',
  gripper: '#eceae6',
  jaw: '#ff7a33'
};

function referencePoses(values: number[]): ScenePose[] {
  return replayOrigins.map((origin, index) => {
    const axis = replayAxes[index]!;
    const [scale, offset] = replayCalibration[index]!;
    const half = (scale! * values[index]! + offset!) / 2;
    const motion: Quaternion = [
      axis[0] * Math.sin(half),
      axis[1] * Math.sin(half),
      axis[2] * Math.sin(half),
      Math.cos(half)
    ];
    return { position: replayPositions[index]!, orientation: multiplyQuaternions(origin, motion) };
  });
}

function referencePoint(poses: ScenePose[], point: Vec3): Vec3 {
  let world = composePreciseMat4([0, 0, 0], [0, 0, Math.SQRT1_2, Math.SQRT1_2]);
  for (const pose of poses) world = multiplyPreciseMat4(world, composePreciseMat4(pose.position, pose.orientation));
  return transformPointMat4(world, point);
}

const imports = `<script type="module">
  import { loadGeometry } from '@nvidia-elements/scene';
  window.sceneLoadGeometry = loadGeometry;
  import '@nvidia-elements/scene/model/define.js';
  import '@nvidia-elements/scene/joint/define.js';
  import '@nvidia-elements/scene/body/define.js';
  import '@nvidia-elements/scene/camera/define.js';
  import '@nvidia-elements/scene/gridlines/define.js';
</script>`;

const cameraMarkup =
  '<nve-scene-camera behavior="orbit" target="[0,0,1]" distance="4.6" polar-angle="1.15" azimuth="-0.75"></nve-scene-camera>';

describe('example kinematics preservation', () => {
  test('renders the flat arm with the same world matrices and pixels as the nested arm', async () => {
    const source = readFileSync(new URL('./model.examples.ts', import.meta.url), 'utf8');
    const section = source.slice(source.indexOf('export const RobotArmAnimated'));
    const markup = section
      .slice(section.indexOf('<nve-scene '), section.indexOf('</nve-scene>') + '</nve-scene>'.length)
      .replace('id="robot-arm-scene"', 'id="actual"');
    const armPoses: ScenePose[] = [
      { position: [0, 0, 0.35], orientation: [0, 0, 0.25881904510252074, 0.9659258262890683] },
      { position: [0, 0, 0.25], orientation: [0, -0.35836794954530027, 0, 0.9335804264972017] },
      { position: [0, 0, 1.05], orientation: [0, 0.6293203910498374, 0, 0.7771459614569709] },
      { position: [0, 0, 0.9], orientation: [0, 0, 0.17364817766693033, 0.984807753012208] },
      { position: [0, 0, 0.2], orientation: [0, -0.42261826174069944, 0, 0.9063077870366499] },
      { position: [0, 0, 0.2], orientation: [0, 0, 0, 1] }
    ];
    const result = await visualRunner.inspect(
      'scene-arm-flat',
      `${markup}<nve-scene id="reference">${cameraMarkup}<nve-scene-gridlines spacing="0.25" count="24"></nve-scene-gridlines></nve-scene>${imports}`,
      page =>
        page.evaluate(
          async ({ poses, camera }) => {
            const actual = document.querySelector<Scene>('#actual')!;
            const reference = document.querySelector<Scene>('#reference')!;
            for (const scene of [actual, reference]) scene.style.cssText = 'width:512px;height:512px;background:black';
            actual.querySelector('nve-scene-camera')!.outerHTML = camera;
            const model = actual.querySelector('nve-scene-model')!;
            let parent: HTMLElement = reference;
            const frames = poses.map(pose => {
              const frame = document.createElement('nve-scene-frame');
              Object.assign(frame, pose);
              parent.append(frame);
              parent = frame;
              return frame;
            });
            for (const body of model.querySelectorAll('nve-scene-body')) {
              const clone = body.cloneNode(true) as SceneBody;
              const name = body.name;
              clone.removeAttribute('frame');
              const owner = name?.startsWith('body') ? frames[Number(name.slice(4)) - 1]! : reference;
              owner.insertBefore(clone, owner.querySelector(':scope > nve-scene-frame'));
            }
            await Promise.all([actual.ready, reference.ready]);
            await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
            const read = async (scene: Scene): Promise<number[]> => {
              const canvas = scene.shadowRoot!.querySelector('canvas')!;
              const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
              if (!blob) throw new Error('Expected scene pixels.');
              const bitmap = await createImageBitmap(blob);
              const probe = document.createElement('canvas');
              probe.width = bitmap.width;
              probe.height = bitmap.height;
              const context = probe.getContext('2d')!;
              context.drawImage(bitmap, 0, 0);
              bitmap.close();
              return [...context.getImageData(0, 0, probe.width, probe.height).data];
            };
            // The reference scene was initially empty; ready may precede its late geometry preparation.
            let first = await read(actual);
            let second = await read(reference);
            const deadline = performance.now() + 5000;
            const equalPixels = () =>
              first.length === second.length && first.every((value, index) => value === second[index]);
            const hasBodyPixels = () =>
              first.some(
                (value, index) =>
                  index % 4 === 1 && value > 40 && value > first[index - 1]! * 1.2 && value > first[index + 1]! * 1.2
              );
            while ((!equalPixels() || !hasBodyPixels()) && performance.now() < deadline) {
              await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
              first = await read(actual);
              second = await read(reference);
            }
            const joints = [...model.querySelectorAll('nve-scene-joint')];
            const maxMatrixError = Math.max(
              ...joints.flatMap((joint, index) =>
                [...model.bodies.get(joint.child ?? '')!.getWorldMatrix()].map((value, component) =>
                  Math.abs(value - frames[index]!.getWorldMatrix()[component]!)
                )
              )
            );
            return {
              equal: equalPixels(),
              differences: first.filter((value, index) => value !== second[index]).length,
              lengths: [first.length, second.length],
              visible: hasBodyPixels(),
              maxMatrixError
            };
          },
          { poses: armPoses, camera: cameraMarkup }
        )
    );
    expect(result.maxMatrixError).toBeLessThan(1e-6);
    expect(result.visible).toBe(true);
    expect(result.equal, JSON.stringify(result)).toBe(true);
  });

  test('preserves all 1924 replay jaw-tip points and representative STL pixels', async () => {
    const directory = new URL('../../demos/so-100/', import.meta.url);
    // Frozen pre-URDF metadata keeps the expected robot independent of the example translator.
    const fixtureRobot: ReplayRobot = {
      links: [
        {
          name: 'base',
          visuals: [
            {
              asset: 'assets/Base.stl',
              motor: false
            },
            {
              asset: 'assets/Base_Motor.stl',
              motor: true
            }
          ]
        },
        {
          name: 'shoulder',
          visuals: [
            {
              asset: 'assets/Rotation_Pitch.stl',
              motor: false
            },
            {
              asset: 'assets/Rotation_Pitch_Motor.stl',
              motor: true
            }
          ]
        },
        {
          name: 'upper_arm',
          visuals: [
            {
              asset: 'assets/Upper_Arm.stl',
              motor: false
            },
            {
              asset: 'assets/Upper_Arm_Motor.stl',
              motor: true
            }
          ]
        },
        {
          name: 'lower_arm',
          visuals: [
            {
              asset: 'assets/Lower_Arm.stl',
              motor: false
            },
            {
              asset: 'assets/Lower_Arm_Motor.stl',
              motor: true
            }
          ]
        },
        {
          name: 'wrist',
          visuals: [
            {
              asset: 'assets/Wrist_Pitch_Roll.stl',
              motor: false
            },
            {
              asset: 'assets/Wrist_Pitch_Roll_Motor.stl',
              motor: true
            }
          ]
        },
        {
          name: 'gripper',
          visuals: [
            {
              asset: 'assets/Fixed_Jaw.stl',
              motor: false
            },
            {
              asset: 'assets/Fixed_Jaw_Motor.stl',
              motor: true
            }
          ]
        },
        {
          name: 'jaw',
          visuals: [
            {
              asset: 'assets/Moving_Jaw.stl',
              motor: false
            }
          ]
        }
      ],
      joints: [
        {
          name: 'shoulder_pan',
          child: 'shoulder',
          position: [0.0, -0.0452, 0.0165],
          axis: [0.0, 1.0, 0.0],
          orientation: [0.7071045443232222, 0.0, 0.0, 0.7071090180427968],
          scale: -1,
          offset: 0,
          parent: 'base'
        },
        {
          name: 'shoulder_lift',
          child: 'upper_arm',
          position: [0.0, 0.1025, 0.0306],
          axis: [1.0, 0.0, 0.0],
          orientation: [-0.7833269096274834, 0.0, 0.0, 0.6216099682706644],
          scale: 1,
          offset: 1.8,
          parent: 'shoulder'
        },
        {
          name: 'elbow_flex',
          child: 'lower_arm',
          position: [0.0, 0.11257, 0.028],
          axis: [1.0, 0.0, 0.0],
          orientation: [0.7071045443232222, 0.0, 0.0, 0.7071090180427968],
          scale: 1,
          offset: -1.5707963267948966,
          parent: 'upper_arm'
        },
        {
          name: 'wrist_flex',
          child: 'wrist',
          position: [0.0, 0.0052, 0.1349],
          axis: [1.0, 0.0, 0.0],
          orientation: [-0.479425538604203, 0.0, 0.0, 0.8775825618903728],
          scale: 1,
          offset: -0.5707963267948966,
          parent: 'lower_arm'
        },
        {
          name: 'wrist_roll',
          child: 'gripper',
          position: [0.0, -0.0601, 0.0],
          axis: [0.0, 1.0, 0.0],
          orientation: [0.0, 0.7071045443232222, 0.0, 0.7071090180427968],
          scale: -1,
          offset: 0,
          parent: 'wrist'
        },
        {
          name: 'gripper',
          child: 'jaw',
          position: [-0.0202, -0.0244, 0.0],
          axis: [0.0, 0.0, 1.0],
          orientation: [0.0, 0.9999999999799858, 0.0, 6.326794896668469e-6],
          scale: 1,
          offset: 0,
          parent: 'gripper'
        }
      ],
      jawTip: [-0.00115, -0.082, 9.99999999999994e-5]
    };
    const records = readFileSync(new URL('episode-0.ndjson', directory), 'utf8')
      .trim()
      .split('\n')
      .map(line => JSON.parse(line) as { msg: { position: number[] } });
    const fixtureValues = records.map(record => record.msg.position);
    const fixturePoses = fixtureValues.map(referencePoses);
    const fixturePoints = fixturePoses.map(pose => referencePoint(pose, fixtureRobot.jawTip));
    const fixtureAssets = Object.fromEntries(
      fixtureRobot.links.flatMap(link =>
        link.visuals.map(visual => [
          visual.asset,
          'data:application/sla;base64,' + readFileSync(new URL(visual.asset, directory)).toString('base64')
        ])
      )
    );
    const replaySource = readFileSync(new URL('../scene/replay.examples.ts', import.meta.url), 'utf8');
    const replayMarkup = replaySource
      .slice(replaySource.indexOf('<div id="lerobot-episode-replay"'), replaySource.lastIndexOf('  `'))
      .replace(/video\.src = 'https:[^']+';/, "video.src = 'data:video/mp4;base64,';");
    const fixtureFiles = {
      ...fixtureAssets,
      'so100.urdf': 'data:application/xml;base64,' + readFileSync(new URL('so100.urdf', directory)).toString('base64'),
      'episode-0.ndjson':
        'data:application/x-ndjson;base64,' + readFileSync(new URL('episode-0.ndjson', directory)).toString('base64')
    };
    const fixtureScript = `<script type="application/json" id="replay-fixtures">${JSON.stringify(fixtureFiles)}</script>
      <script>
        addEventListener('error', event => { document.body.dataset.fixtureError = event.message; });
        addEventListener('unhandledrejection', event => { document.body.dataset.fixtureError = String(event.reason); });
        const fixtureFiles = JSON.parse(document.querySelector('#replay-fixtures').textContent);
        const originalFetch = globalThis.fetch;
        globalThis.fetch = (url, options) => {
          const path = new URL(url instanceof Request ? url.url : url, document.baseURI).pathname;
          const prefix = '/static/scene/so-100/';
          const asset = fixtureFiles[path.slice(prefix.length)];
          return path.startsWith(prefix) && asset ? originalFetch(asset, options) : originalFetch(url, options);
        };
      </script>`;
    const result = await visualRunner.inspect(
      'scene-replay-flat',
      `${fixtureScript}${replayMarkup}<nve-scene id="reference">${cameraMarkup}</nve-scene>${imports}`,
      async page => {
        await page
          .waitForFunction(
            () => {
              const output = document.querySelector('#lerobot-frame-time');
              return (
                output?.textContent?.startsWith('Frame 0 / 961') ||
                output?.textContent?.startsWith('Robot recording unavailable:') ||
                document.body.dataset.fixtureError
              );
            },
            null,
            { timeout: 10000 }
          )
          .catch(async () => {
            throw new Error(
              await page.evaluate(() =>
                JSON.stringify({
                  output: document.querySelector('#lerobot-frame-time')?.textContent,
                  error: document.body.dataset.fixtureError,
                  bodies: document.querySelectorAll('nve-scene-body').length,
                  modelDefined: !!customElements.get('nve-scene-model'),
                  geometryLoaded: !!window.sceneLoadGeometry
                })
              )
            );
          });
        return page.evaluate(
          async ({ robot, values, poses, points, assets, camera, colors }) => {
            const originalFetch = globalThis.fetch;
            globalThis.fetch = (url, options) => {
              const path = new URL(url instanceof Request ? url.url : url, document.baseURI).pathname;
              const asset = assets[path.slice('/replay-fixture/'.length)];
              return path.startsWith('/replay-fixture/') && asset
                ? originalFetch(asset, options)
                : originalFetch(url, options);
            };
            if (document.body.dataset.fixtureError) throw new Error(document.body.dataset.fixtureError);
            const actual = document.querySelector<Scene>('#lerobot-replay-scene')!;
            const wrapper = document.querySelector<HTMLElement>('#lerobot-episode-replay')!;
            const output = wrapper.querySelector<HTMLOutputElement>('#lerobot-frame-time')!;
            if (!output.value.startsWith('Frame 0 / 961')) throw new Error(output.value);
            wrapper.before(actual);
            wrapper.hidden = true;
            for (const layer of actual.querySelectorAll('nve-scene-gridlines, nve-scene-axes, nve-scene-lines'))
              layer.remove();
            const reference = document.querySelector<Scene>('#reference')!;
            actual.querySelector('nve-scene-camera')!.outerHTML = camera;
            for (const scene of [actual, reference]) {
              scene.style.cssText = 'width:512px;height:512px;background:black';
              const cameraControl = scene.querySelector('nve-scene-camera')!;
              cameraControl.target = [0, 0, 0.15];
              cameraControl.distance = 0.8;
            }
            const model = actual.querySelector('nve-scene-model')!;
            const root = document.createElement('nve-scene-frame');
            root.position = [0, 0, 0];
            root.orientation = [0, 0, Math.SQRT1_2, Math.SQRT1_2];
            reference.append(root);
            let parent: HTMLElement = root;
            const jointUpdates: Promise<unknown>[] = [];
            const frames = robot.joints.map(joint => {
              const frame = document.createElement('nve-scene-frame');
              parent.append(frame);
              parent = frame;
              const element = model.joints.get(joint.name)!;
              if (element.parent !== joint.parent || element.child !== joint.child)
                throw new Error('Incorrect URDF endpoints.');
              jointUpdates.push(element.updateComplete);
              return frame;
            });
            const loads: Promise<unknown>[] = [model.updateComplete];
            for (const link of robot.links) {
              const jointIndex = robot.joints.findIndex(joint => joint.child === link.name);
              loads.push(
                Promise.all(
                  link.visuals.map(async visual => {
                    const geometry = await window.sceneLoadGeometry('/replay-fixture/' + visual.asset);
                    return geometry.map(node => ({ ...node, color: visual.motor ? '#222326' : colors[link.name]! }));
                  })
                ).then(visuals => {
                  const clone = document.createElement('nve-scene-body');
                  clone.geometry = visuals.flat();
                  const owner = jointIndex >= 0 ? frames[jointIndex]! : root;
                  owner.insertBefore(clone, owner.querySelector(':scope > nve-scene-frame'));
                })
              );
            }
            await Promise.all([...loads, actual.ready, reference.ready, ...jointUpdates]);
            await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
            let maxPointError = 0;
            let equal = true;
            let visible = true;
            const read = async (scene: Scene): Promise<number[]> => {
              const canvas = scene.shadowRoot!.querySelector('canvas')!;
              const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
              if (!blob) throw new Error('Expected scene pixels.');
              const bitmap = await createImageBitmap(blob);
              const probe = document.createElement('canvas');
              probe.width = bitmap.width;
              probe.height = bitmap.height;
              const context = probe.getContext('2d')!;
              context.drawImage(bitmap, 0, 0);
              bitmap.close();
              return [...context.getImageData(0, 0, probe.width, probe.height).data];
            };
            const capture = async () => {
              let first = await read(actual);
              let second = await read(reference);
              const deadline = performance.now() + 5000;
              const same = () =>
                first.length === second.length && first.every((value, index) => value === second[index]);
              const hasBodyPixels = () => first.filter((value, index) => index % 4 !== 3 && value > 30).length > 100;
              while ((!same() || !hasBodyPixels()) && performance.now() < deadline) {
                await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
                first = await read(actual);
                second = await read(reference);
              }
              return { equal: same(), visible: hasBodyPixels() };
            };
            for (let sample = 0; sample < values.length; sample += 1) {
              robot.joints.forEach((joint, index) => model.joints.set(joint.name, values[sample]![index]!));
              const point = model.bodies.get('jaw')!.getWorldPoint(robot.jawTip)!;
              maxPointError = Math.max(
                maxPointError,
                ...point.map((value, index) => Math.abs(value - points[sample]![index]!))
              );
              if ([0, 962, 1923].includes(sample)) {
                frames.forEach((frame, index) => Object.assign(frame, poses[sample]![index]!));
                await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
                const comparison = await capture();
                equal &&= comparison.equal;
                visible &&= comparison.visible;
              }
            }
            return {
              maxPointError,
              equal,
              visible,
              count: values.length,
              bodyCount: model.querySelectorAll('nve-scene-body').length,
              jointCount: model.querySelectorAll('nve-scene-joint').length
            };
          },
          {
            robot: fixtureRobot,
            values: fixtureValues,
            poses: fixturePoses,
            points: fixturePoints,
            assets: fixtureAssets,
            camera: cameraMarkup,
            colors: replayLinkColors
          }
        );
      }
    );
    expect(result.count).toBe(1924);
    expect(result.bodyCount).toBe(7);
    expect(result.jointCount).toBe(6);
    expect(result.visible).toBe(true);
    expect(result.maxPointError).toBeLessThan(1e-10);
    expect(result.equal, JSON.stringify(result)).toBe(true);
  });
});
