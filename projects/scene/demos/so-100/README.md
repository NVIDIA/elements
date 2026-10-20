# SO-100 episode playback

`EpisodeReplay` in `src/scene/replay.examples.ts` translates the original SO-100 URDF into scene bodies and joints, then replays a ROS joint recording beside its camera video. The documentation site copies this directory to `/static/scene/so-100/`.

- `so100.urdf` is the unmodified, pinned robot description. It supplies the seven links, six joints, origins, axes, limits, material assignments, and references to 13 STL files.
- `episode-0.ndjson` contains observed and commanded ROS joint messages for the 962 samples in episode 0 of the LeRobot sorting dataset.
- `assets/*.stl` contains the original binary STL files in metres.
- `provenance.json` records source revisions, conversions, and SHA-256 hashes.

The example uses browser XML parsing. Each top-level URDF link becomes one named
`nve-scene-body`; each top-level joint becomes an `nve-scene-joint` with explicit `parent` and `child` body names. Transmission joint references do not create scene joints. URDF origin `rpy` values convert to quaternions with `quaternionFromRpy` from the package root. Visual origins and mesh scales become each mesh part's position, orientation, and scale.

Each URDF visual becomes an `nve-scene-mesh` part of its link's body, with `src` resolved against the URDF URL. The replay palette approximates the recorded arm: printed parts take an orange or white color per link, and visuals with the URDF `sts3215` material render as black servos. Joint values move the arm without rebuilding geometry. The example handles the mesh visuals in this pinned URDF; the library supplies no URDF parser or loader.

The example embeds joint scale and offset estimates, the jaw-tip point, and palette overrides in its script. Joint zero offsets and gripper travel remain visualization estimates; the recording contains no hardware calibration. The jaw-tip point is the midpoint of the moving jaw's bounds in x and z at its minimum y. Both tool paths use the jaw body's `getWorldPoint` after synchronous `arm.joints.set` assignments.

The URDF and STL assets come from [TheRobotStudio SO-ARM100](https://github.com/TheRobotStudio/SO-ARM100/tree/5f6d2b876a53a4872e405b991dd925556c9e38a4/Simulation/SO100). The recording comes from the [LeRobot sorting dataset](https://huggingface.co/datasets/lerobot/svla_so100_sorting/tree/13870ca969084d8ce4d8a0391b06cead78e804ba). Both sources use Apache-2.0. The assets directory includes the original [license](assets/LICENSE). Camera video streams from the pinned dataset revision; playback uses a local clock when video is unavailable.

The rendering test in `src/model/kinematics.test.visual.ts` embeds the earlier prepared robot metadata as an independent regression reference. It executes EpisodeReplay's URDF translation and compares all 1,924 observed and commanded jaw-tip positions and representative pixels against that reference.
