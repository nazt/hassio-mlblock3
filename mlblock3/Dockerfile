ARG BUILD_FROM=ghcr.io/hassio-addons/debian-base/aarch64:5.2.0
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Setup base
ARG BUILD_ARCH
# hadolint ignore=DL3018,DL3008
WORKDIR /app

RUN ls
RUN \
    MAKEFLAGS="-j$(nproc)" \
    && export MAKEFLAGS \
    \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential nginx \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    \
    && apt-get install -y --no-install-recommends \
        nodejs
    # && apt-get purge -y --auto-remove \
    #     build-essential \
    #     dirmngr \
    #     gpg \
    #     gpg-agent \
    #     libffi-dev \
    #     libfreetype6-dev \
    #     libjpeg62-turbo-dev \
    #     libmariadb-dev \
    #     libpng-dev \
    #     libpq-dev \
    #     libssl-dev \
    #     libtiff5-dev \
    #     libxml2-dev \
    #     libxslt1-dev \
    #     libzmq3-dev \
    #     pkg-config \
    #     zlib1g-dev \
    # \
    COPY package.json ./
    # COPY yarn.lock ./
    RUN yarn install --frozen-lockfile
    RUN npm cache clean --force \
    \
    && rm -fr \
        /tmp/* \
        /root/{.cache,.config,.gnupg,.local,.log,.npm} \
        /usr/local/share/.cache \
        /var/{cache,log}/* \
        /var/lib/apt/lists/*

# Copy root filesystem
COPY rootfs /

# Build arguments
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_DESCRIPTION
ARG BUILD_NAME
ARG BUILD_REF
ARG BUILD_REPOSITORY
ARG BUILD_VERSION
