/**
 * Creates an env variable to track if a build is the initial/first pass in Vite
 */
export function initial() {
  process.env.VITE_INITIAL_BUILD = 'true';
  return {
    name: 'initial-build',
    apply: 'build',
    async closeBundle() {
      delete process.env.VITE_INITIAL_BUILD;
    }
  };
}
