# Frontend CI/Build image for Washu App
# - Installs dependencies
# - Runs typecheck, lint, and build

ARG NODE_IMAGE=node:20-alpine
FROM ${NODE_IMAGE} AS deps
WORKDIR /app

# Copy manifests (support both pnpm and npm)
COPY package.json ./
COPY pnpm-lock.yaml* ./
COPY package-lock.json* ./

# Safer install: disable lifecycle scripts during install
RUN set -eux; \
  corepack enable; \
  if [ -f pnpm-lock.yaml ]; then \
    corepack prepare pnpm@9.0.0 --activate; \
    pnpm i --frozen-lockfile --ignore-scripts --prefer-offline; \
  elif [ -f package-lock.json ]; then \
    npm ci --ignore-scripts; \
  else \
    npm install --ignore-scripts; \
  fi


FROM ${NODE_IMAGE} AS builder
WORKDIR /app

# Reuse installed node_modules from deps layer
COPY --from=deps /app/node_modules ./node_modules

# Copy project sources
COPY . ./

# Type check, lint, and build
RUN corepack enable; \
  npm run typecheck && \
  npm run lint && \
  npm run build

# Final stage kept as builder to allow artifact extraction in CI
# (dist is located at /app/dist)
