## 0.0.0

- Rename rigid compounds to bodies and primitive declarations to shapes, with `kind` selecting the primitive.
  Expose geometry loading helpers from `body`.
- Add named frame references to coordinate frames and every layer, with cycle rejection, resolved-chain visibility,
  and the shared `frame-unresolved` diagnostic.
- Add joint frames with synchronous motion, calibration, limits, and one-level mimic dependencies.
- Add model entities with nested name scopes, qualified references, a live joint view, and body tint composition.
  Rewrite the arm and replay examples around flat joints and record the replay metadata conversion.

- Load body geometry through `src` with lazy extension dispatch, unchanged sub-asset fragments, and external decoder registration.
  Preserve bounded requests and cancellation; report file failures with `body-src`.

Initial release.
