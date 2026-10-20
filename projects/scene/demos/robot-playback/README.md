# SO-100 episode playback

`EpisodeReplay` in `src/scene/replay.examples.ts` combines a joint recording with
the original SO-100 STL assets. The documentation site copies this directory to
`/static/scene/robot-playback/`.

- `episode-0.ndjson.gz` contains the observed and commanded ROS joint messages for
  the 962 samples in episode 0 of the LeRobot sorting dataset.
- `robot.json` contains six joint definitions, seven links, references to 13 STL
  files, and a jaw-tip point for the tool paths. It contains no vertex arrays.
- `assets/*.stl` contains the original binary STL files, with their coordinates
  in metres. The files need no centering, scaling, or visual offset transforms.
- `provenance.json` records the pinned source revisions and SHA-256 hashes for the
  source files and replay outputs.

The example creates one `nve-scene-body` per visual, sets its `src` URL and
`tint`, and waits for `loadComplete` before enabling playback. Motors keep the
dark tint and printed bodies keep the light tint. One `nve-scene-model` contains flat
`nve-scene-joint` declarations and the bodies attached through `frame`. Joint values move the entity
without changing body geometry. Failed loads
remove the robot bodies, which also cancels the remaining body requests.

The metadata preserves the joint definitions and jaw-tip point from the earlier
prepared geometry. The jaw-tip point is the midpoint of the moving jaw's bounds
in x and z at its minimum y. Joint zero offsets and gripper travel remain
visualization estimates; the recording contains no hardware calibration.

The STL assets come from [TheRobotStudio SO-ARM100](https://github.com/TheRobotStudio/SO-ARM100/tree/5f6d2b876a53a4872e405b991dd925556c9e38a4/Simulation/SO100).
The recording comes from the [LeRobot sorting dataset](https://huggingface.co/datasets/lerobot/svla_so100_sorting/tree/13870ca969084d8ce4d8a0391b06cead78e804ba).
Both sources use Apache-2.0. The assets directory includes the original
[license](assets/LICENSE). The camera video streams from the pinned dataset
revision; playback uses a local clock when the video is unavailable.

## Metadata regeneration

The body/shape and joint update regenerated `robot.json` from the pinned local metadata.
Each joint origin now contains an x y z w `orientation` quaternion, converted once with
`Rz(yaw) * Ry(pitch) * Rx(roll)`, and `frame` names its parent joint (`null` for the model root).
The previous visualization zero and direction conventions now appear as joint `offset` and `scale`.
The geometry, recording, source revisions, and jaw-tip point remain unchanged. `provenance.json` records
the prior metadata hash, the conversion, and the regenerated output hash.
The example contains no quaternion or axis-angle calculations; both tool paths use the jaw joint's
`getWorldPoint` after synchronous `arm.joints.set` assignments.
