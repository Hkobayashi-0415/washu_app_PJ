# Frontend CI/Build image for Washu App
# - Installs dependencies
# - Runs typecheck, lint, and build

FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies (prefer lockfile when present)
COPY package.json package-lock.json* ./
# Safer install: disable lifecycle scripts during install
RUN sh -c 'if [ -f package-lock.json ]; then npm ci --ignore-scripts; else npm install --ignore-scripts; fi'


FROM node:20-alpine AS builder
WORKDIR /app

# Reuse installed node_modules from deps layer
COPY --from=deps /app/node_modules ./node_modules

# Copy project sources
COPY . ./

# Type check, lint, and build
RUN npm run typecheck \
 && npm run lint \
 && npm run build

# Final stage kept as builder to allow artifact extraction in CI
# (dist is located at /app/dist)
