ARG BUILD_FROM=ghcr.io/hassio-addons/debian-base/aarch64:5.2.0
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
    && apt-get update
RUN apt-get install -y --no-install-recommends build-essential nginx
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y --no-install-recommends nodejs git
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
    # RUN yarn install --frozen-lockfile
    RUN npm install
    COPY ./.next /app/.next
    COPY ./public /app/public
    # RUN npm run build
    RUN curl -L -s -o /usr/bin/tempio \
        "https://github.com/home-assistant/tempio/releases/download/2021.05.0/tempio_aarch64" && chmod a+x /usr/bin/tempio
    RUN npm cache clean --force \
    \
    && rm -fr \
        /tmp/* \
        /root/{.cache,.config,.gnupg,.local,.log,.npm} \
        /usr/local/share/.cache \
        /var/{cache,log}/* \
        /var/lib/apt/lists/*
    RUN mkdir -p /var/log/nginx && touch /var/log/nginx/error.log

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

