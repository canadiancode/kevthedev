#!/usr/bin/env bash
# Export 90 WebP frames (1280px wide) from each MP4 under raw/scroll/<id>/.
# Requires: ffmpeg, cwebp (brew install ffmpeg webp)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install with: brew install ffmpeg" >&2
  exit 1
fi
if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp not found. Install with: brew install webp" >&2
  exit 1
fi

export_sequence() {
  local id="$1"
  local dir="raw/scroll/${id}"
  local out="public/sequence/${id}"

  shopt -s nullglob
  local files=("${dir}"/*.mp4)
  shopt -u nullglob

  if [[ ${#files[@]} -eq 0 ]]; then
    echo "No .mp4 in ${dir}; skipping ${id}." >&2
    return 1
  fi

  if [[ ${#files[@]} -gt 1 ]]; then
    echo "Multiple .mp4 files in ${dir}; using first: ${files[0]}" >&2
  fi

  local input="${files[0]}"
  mkdir -p "${out}"

  echo "Exporting 90 frames → ${out}/ from ${input}"
  rm -f "${out}"/frame_*.webp

  local tmp
  tmp="$(mktemp -d "${TMPDIR:-/tmp}/kev-seq.XXXXXX")"

  ffmpeg -hide_banner -loglevel warning -stats -y -i "${input}" \
    -vf "fps=90/8,scale=1280:-2:flags=lanczos" \
    -frames:v 90 \
    -c:v png \
    "${tmp}/frame_%05d.png"

  local pngs=()
  local line
  while IFS= read -r line; do
    [[ -n "${line}" ]] && pngs+=("${line}")
  done < <(find "${tmp}" -maxdepth 1 -name 'frame_*.png' | LC_ALL=C sort)

  if [[ ${#pngs[@]} -ne 90 ]]; then
    rm -rf "${tmp}"
    echo "Expected 90 PNG frames from ffmpeg, got ${#pngs[@]} for ${id}" >&2
    return 1
  fi

  local idx=1
  local png num
  for png in "${pngs[@]}"; do
    num="$(printf '%05d' "${idx}")"
    cwebp -q 82 -quiet "${png}" -o "${out}/frame_${num}.webp"
    idx=$((idx + 1))
  done
  rm -rf "${tmp}"

  echo "Done: ${out}/ (90 WebP files)"
}

export_sequence "scroll-1"
export_sequence "scroll-2"
echo "All sequences exported."
