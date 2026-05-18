#!/bin/sh
set -eu

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

git config core.hooksPath .githooks

echo "Git hooks enabled: core.hooksPath=.githooks"

if command -v python >/dev/null 2>&1 && python --version >/dev/null 2>&1; then
  exit 0
fi

if command -v python3 >/dev/null 2>&1 && python3 --version >/dev/null 2>&1; then
  exit 0
fi

echo "Warning: Python 3 was not found on PATH. Install Python 3 or set POCKEN_PYTHON before committing." >&2
