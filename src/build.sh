#!/usr/bin/env bash
# ATLAS Prime — deterministic build: concatenate parts → index.html
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"
OUT="$(dirname "$HERE")/index.html"
P=parts

# JS load order. part-14-engine MUST be last (it boots the app).
JS=(
  part-03-core.js
  part-04-svr.js
  part-06-data.js
  part-05-cmd.js
  part-07-shell.js
  part-08-view-command.js
  part-09-view-research.js
  part-10-view-decisions.js
  part-11-view-portfolio.js
  part-12-view-review.js
  part-13-view-system.js
  part-15-merge.js
  part-16-v12.js
  part-17-synchrony.js
  part-18-unified.js
  part-19-chartpro.js
  part-20-live.js
  part-21-markets-deep.js
  part-22-research-deep.js
  part-23-decisions-deep.js
  part-24-portfolio-deep.js
  part-25-review-deep.js
  part-26-command-system-deep.js
  part-27-auditarmy.js
  part-28-fabric.js
  part-29-estate.js
  part-14-engine.js
)

# HTML head + shell (part-02 leaves a <script> tag open)
cat "$P/part-01-head.html" "$P/part-02-shell.html" > "$OUT"
# JS, each part separated by a newline
for f in "${JS[@]}"; do
  printf '\n' >> "$OUT"
  cat "$P/$f" >> "$OUT"
done
# close
printf '\n</script>\n</body>\n</html>\n' >> "$OUT"

echo "built $OUT ($(wc -l < "$OUT") lines, $(wc -c < "$OUT") bytes)"
