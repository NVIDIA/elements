ARG NODE_VERSION

FROM node:${NODE_VERSION}

# Use the browser path provided by ci configuration to store the browsers
ENV PLAYWRIGHT_BROWSERS_PATH /var/cache/ms-playwright

COPY package.json pnpm-lock.yaml ./

# install/setup pnpm and playwright
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && \
  apt-get update && apt-get -y upgrade && \
  # install common dependencies
  apt-get install -y git-lfs yq && \
  # https://github.com/nodejs/corepack/issues/612
  npm install -g corepack@0.34.5 && \
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

# install vale
RUN curl -sfL https://github.com/errata-ai/vale/releases/download/v3.13.0/vale_3.13.0_Linux_64-bit.tar.gz | tar xz -C /usr/local/bin vale


