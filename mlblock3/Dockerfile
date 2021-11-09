ARG BUILD_FROM=ghcr.io/hassio-addons/base/amd64:10.2.0
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

# Copy Node-RED package.json
COPY package.json /app/
COPY ./.next /app/.next
COPY ./public /app/.public


# Set workdir
WORKDIR /app

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Setup base
RUN \
    apk add --no-cache --virtual .build-dependencies \
        g++=10.3.1_git20210424-r2 \
        gcc=10.3.1_git20210424-r2 \
        libc-dev=0.7.2-r3 \
        linux-headers=5.10.41-r0 \
        make=4.3-r0 \
        py3-pip=20.3.4-r1 \
        python3-dev=3.9.5-r1 \
    \
    && apk add --no-cache \
        git=2.32.0-r0 \
        nginx=1.20.1-r3 \
        nodejs=14.18.1-r0 \
        npm=7.17.0-r0 \
        openssh-client=8.6_p1-r3 \
        patch=2.7.6-r7 \
        python3=3.9.5-r1 \
    \
    && npm config set unsafe-perm true \
    \
    && npm install \
        --no-audit \
        --no-appional \
        --no-update-notifier \
        --only=production \
        --legacy-peer-deps \
        --unsafe-perm \
    \
    && npm cache clear --force \
    \
    && echo -e "StrictHostKeyChecking no" >> /etc/ssh/ssh_config \
    \
    && apk del --no-cache --purge .build-dependencies \
    && rm -fr \
        /tmp/* \
        /etc/nginx
# RUN mkdir -p /var/log/nginx && touch /var/log/nginx/error.log


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
