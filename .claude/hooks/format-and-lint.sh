#!/usr/bin/env bash
# Post-Write/Edit hook: runs Prettier + ESLint on the affected file.
# Triggered by Claude Code after Write or Edit tool calls.
# Only applies to Arcade Vault (lives in this project's .claude/).

set -euo pipefail

# ── 1. Extract file_path from the hook JSON payload ──────────────────────────
payload=$(cat)
file=$(printf '%s' "$payload" | node -e '
  let d = "";
  process.stdin
    .on("data", c => (d += c))
    .on("end", () => {
      try {
        process.stdout.write(JSON.parse(d).tool_input?.file_path ?? "");
      } catch {
        process.stdout.write("");
      }
    });
')

# Nothing to do if no path was found or file does not exist on disk.
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

# ── 2. Move to project root ───────────────────────────────────────────────────
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$PROJECT_DIR"

# ── 3. Prettier — format in place ────────────────────────────────────────────
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.css|*.md|*.mdx)
    npx prettier --write "$file" --log-level warn
    ;;
esac

# ── 3b. Remove blank lines ────────────────────────────────────────────────────
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.css)
    sed -i '' '/^[[:space:]]*$/d' "$file"
    ;;
esac

# ── 4. ESLint — auto-fix, then report remaining errors ───────────────────────
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    # First pass: auto-fix everything ESLint can fix.
    npx eslint --fix "$file" || true

    # Second pass: check whether unfixable errors remain.
    LINT_OUT=$(npx eslint --format stylish "$file" 2>&1 || true)

    # eslint exits 0 when there are no errors or only warnings treated as warnings.
    # We re-run with --max-warnings=0 to surface warnings-as-errors too.
    if ! npx eslint --max-warnings=0 "$file" > /dev/null 2>&1; then
      echo "" >&2
      echo "⚠️  ESLint: quedan errores/warnings sin corregir en ${file}:" >&2
      echo "$LINT_OUT" >&2
      exit 2
    fi
    ;;
esac

exit 0
