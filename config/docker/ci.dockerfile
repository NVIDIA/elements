ARG NODE_VERSION

FROM node:${NODE_VERSION}

# Use the browser path provided by .gitlab-ci.yaml to story the browsers
ENV PLAYWRIGHT_BROWSERS_PATH /var/cache/ms-playwright

COPY package.json pnpm-lock.yaml ./

RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && \
  apt-get update && apt-get -y upgrade && \
  # install common dependencies
  apt-get install -y git-lfs yq && \
  # https://github.com/nodejs/corepack/issues/612
  npm install -g corepack@0.31.0 && \
  # install pnpm from our package.json `packageManager` definition
  corepack enable && \
  corepack prepare --activate && \
  # ensure our pnpm dlx commands story the cache in a known location so we can cleanup
  pnpm config set store-dir /var/cache/pnpm-store && \
  PLAYWRIGHT_VERSION="$(cat pnpm-lock.yaml| yq -r '.importers["."].devDependencies.playwright.version')" && \
  pnpm dlx playwright@${PLAYWRIGHT_VERSION} install chromium --with-deps chromium && \
  # cleanup any files we don't need
  rm -rf package.json pnpm-lock.yaml node_modules /var/cache/pnpm-store && \
  apt-get -y autoremove --purge && apt-get -y clean
