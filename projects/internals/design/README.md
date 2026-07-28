# Elements design artifacts

This private workspace project owns build-time design analysis and generated artifacts that describe the NVIDIA Elements design system as a whole.

## DESIGN.md

`src/design-md.js` resolves maintained Elements theme tokens and combines them with reviewed design and component guidance. The build writes the result to `dist/DESIGN.md`.

Run `pnpm build` to generate the internal artifact. Run `pnpm sync:root` when an intentional generator change should update the checked-in `DESIGN.md` at the repository root.

Tests verify that the built and repository artifacts match the generator. The site consumes the built artifact and publishes it at `/DESIGN.md`.
