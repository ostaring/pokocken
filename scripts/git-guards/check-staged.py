#!/usr/bin/env python3
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import PurePosixPath


BLOCKED_EXTENSIONS = {
    ".pem",
    ".key",
    ".p12",
    ".pfx",
    ".sqlite",
    ".sqlite3",
    ".db",
    ".bak",
    ".dump",
}

SECRET_PATTERNS = [
    re.compile(r"-----BEGIN (RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----"),
    re.compile(
        r"\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*['\"]?[A-Za-z0-9_./+=:@-]{16,}",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(connectionstrings?:[A-Za-z0-9_.:-]*|connection[_-]?string)\b\s*[:=]\s*['\"]?.*password\s*=",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|GITHUB_TOKEN|NPM_TOKEN|VITE_[A-Z0-9_]*TOKEN)\b\s*[:=]",
        re.IGNORECASE,
    ),
]


def run_git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    return result.stdout


def normalize_git_path(path: str) -> str:
    return path.replace("\\", "/")


def is_blocked_path(path: str) -> bool:
    normalized_path = normalize_git_path(path)
    file_name = PurePosixPath(normalized_path).name

    if file_name == ".env.example":
        return False

    if file_name == ".env" or file_name.startswith(".env."):
        return True

    return PurePosixPath(file_name).suffix.lower() in BLOCKED_EXTENSIONS


def looks_like_secret(line: str) -> bool:
    return any(pattern.search(line) for pattern in SECRET_PATTERNS)


def staged_files() -> list[str]:
    output = run_git("diff", "--cached", "--name-only", "--diff-filter=ACMR")
    return [line.strip() for line in output.splitlines() if line.strip()]


def staged_secret_hits() -> list[str]:
    diff = run_git("diff", "--cached", "--no-ext-diff", "--unified=0")
    current_file: str | None = None
    hits: set[str] = set()

    for line in diff.splitlines():
        if line.startswith("+++ b/"):
            current_file = normalize_git_path(line.removeprefix("+++ b/"))
            continue

        if line == "+++ /dev/null":
            current_file = None
            continue

        if current_file is None:
            continue

        if not line.startswith("+") or line.startswith("+++"):
            continue

        if looks_like_secret(line[1:]):
            hits.add(current_file)

    return sorted(hits)


def print_failure(title: str, paths: list[str]) -> None:
    print(f"git guard: {title}", file=sys.stderr)
    for path in sorted(set(paths)):
        print(f"  - {path}", file=sys.stderr)
    print("", file=sys.stderr)


def main() -> int:
    blocked_files = [
        normalize_git_path(path)
        for path in staged_files()
        if is_blocked_path(path)
    ]
    secret_hits = staged_secret_hits()

    has_failures = False

    if blocked_files:
        has_failures = True
        print_failure("blocked staged file(s):", blocked_files)
        print(
            "Use .env.example for documented local config. Real env files, keys, "
            "certs, databases, and dumps must stay out of git.",
            file=sys.stderr,
        )

    if secret_hits:
        has_failures = True
        print_failure("possible secret(s) in staged diff:", secret_hits)
        print(
            "If this is an intentional dev placeholder, make it clearly fake or "
            "move it to an example file.",
            file=sys.stderr,
        )

    if has_failures:
        print("", file=sys.stderr)
        print("Commit blocked by local git guard.", file=sys.stderr)
        return 1

    print("git guard: staged files look ok.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
