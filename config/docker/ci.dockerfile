ARG NODE_VERSION

FROM node:${NODE_VERSION}

# Use the browser path provided by .gitlab-ci.yaml to story the browsers
ENV PLAYWRIGHT_BROWSERS_PATH /var/cache/ms-playwright

COPY package.json pnpm-lock.yaml ./

# install/setup pnpm and playwright
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && \
  apt-get update && apt-get -y upgrade && \
  # install common dependencies
  apt-get install -y git-lfs yq && \
  # https://github.com/nodejs/corepack/issues/612
  npm install -g corepack@0.34.0 && \
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

# install/setup vault
RUN curl https://registry.npmjs.org -L -o vault.zip && \
  unzip vault.zip -d /root && \
  cp /root/vault /usr/local/bin/vault && \
  rm vault.zip && \
  vault --version  && \
  apt-get update && apt-get install -y jq

# install aws cli (default install: /usr/local/bin/aws)
RUN curl https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o awscliv2.zip && \
  unzip awscliv2.zip && \
  ./aws/install && \
  rm awscliv2.zip && \
  rm -rf ./aws && \
  aws --version
