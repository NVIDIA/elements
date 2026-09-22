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

The example creates one `nve-scene-model` per visual, sets its `asset` URL and
`tint`, and waits for `loadComplete` before enabling playback. Motors keep the
dark tint and printed parts keep the light tint. Nested `nve-scene-frame`
elements apply the joint poses without changing model geometry. Failed loads
remove the robot models, which also cancels the remaining model requests.

The metadata preserves the joint definitions and jaw-tip point from the earlier
prepared geometry. The jaw-tip point is the midpoint of the moving jaw's bounds
in x and z at its minimum y. Joint zero offsets and gripper travel remain
visualization estimates; the recording contains no hardware calibration.

The STL assets come from [TheRobotStudio SO-ARM100](https://github.com/TheRobotStudio/SO-ARM100/tree/5f6d2b876a53a4872e405b991dd925556c9e38a4/Simulation/SO100).
The recording comes from the [LeRobot sorting dataset](https://huggingface.co/datasets/lerobot/svla_so100_sorting/tree/13870ca969084d8ce4d8a0391b06cead78e804ba).
Both sources use Apache-2.0. The assets directory includes the original
[license](assets/LICENSE). The camera video streams from the pinned dataset
revision; playback uses a local clock when the video is unavailable.
