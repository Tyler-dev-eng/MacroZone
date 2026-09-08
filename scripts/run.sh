#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

npm run format
npm run format:check
npm run lint
