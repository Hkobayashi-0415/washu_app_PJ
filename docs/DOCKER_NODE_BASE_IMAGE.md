Node base image pinning and fallback

Overview
- The frontend Dockerfiles are parameterized to allow setting the Node base image via a build arg `NODE_IMAGE`.
- docker-compose.common.yml passes this arg from the environment variable `FRONTEND_NODE_IMAGE` with a default of `node:20-alpine`.
- Pinning by digest is recommended for reproducibility and supply‑chain safety.

Usage
- Default (no env var): builds with `node:20-alpine`.
- Pin by digest (PowerShell):
  $env:FRONTEND_NODE_IMAGE = 'node:20-alpine@sha256:<digest>'
  docker compose -f docker-compose.common.yml build
- Pin by digest (bash):
  export FRONTEND_NODE_IMAGE='node:20-alpine@sha256:<digest>'
  docker compose -f docker-compose.common.yml build
- Alternate tag (e.g., Debian-based):
  FRONTEND_NODE_IMAGE=node:20-bookworm-slim docker compose -f docker-compose.common.yml build

Notes
- If Docker Hub is intermittently unavailable, consider configuring a registry mirror in Docker Desktop (Settings → Docker Engine → `registry-mirrors`).
- The project keeps lifecycle scripts disabled by default during install to reduce risk; rebuild only the packages that require postinstall (e.g., esbuild) if needed.

