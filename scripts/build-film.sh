#!/bin/bash
# Builds the scroll-scrubbed opening film from the approved Higgsfield clips.
#   raw/video/v1/*.mp4  ->  raw/video/film-master.mp4  ->  public/film/{lg,sm}/NNNN.webp
# Picks and job IDs are recorded in raw/film-manifest.md.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=raw/video/v1
FPS=${FPS:-12}
N="scale=2560:1440:force_original_aspect_ratio=increase:flags=lanczos,crop=2560:1440,fps=24,setsar=1,format=yuv420p"

# Clip 03 hard-cuts to clouds at ~11.2s; hide it with a short crossfade.
ffmpeg -v error -y \
  -i $SRC/01-garage-mm-a.mp4 -i $SRC/02-crf-mm-a.mp4 -i $SRC/03-mtb-flux-b.mp4 -i $SRC/04-snow-mm-a.mp4 \
  -filter_complex "[0:v]${N}[a];[1:v]${N}[b];[2:v]${N},split[s0][s1];[s0]trim=0:10.9,setpts=PTS-STARTPTS,fps=24[c0];[s1]trim=11.4,setpts=PTS-STARTPTS,fps=24[c1];[c0][c1]xfade=transition=fade:duration=0.4:offset=10.5,fps=24[c];[3:v]${N}[d];[a][b][c][d]concat=n=4:v=1:a=0[v]" \
  -map "[v]" -an -c:v libx264 -crf 14 -preset slow raw/video/film-master.mp4

rm -rf public/film && mkdir -p public/film/lg public/film/sm
# Desktop: 16:9.
ffmpeg -v error -y -i raw/video/film-master.mp4 \
  -vf "fps=${FPS},scale=1280:720:flags=lanczos" -c:v libwebp -quality 62 -compression_level 6 public/film/lg/%04d.webp
# Phones: centred 9:16 crop from the 1440p master.
ffmpeg -v error -y -i raw/video/film-master.mp4 \
  -vf "fps=${FPS},crop=810:1440,scale=540:960:flags=lanczos" -c:v libwebp -quality 62 -compression_level 6 public/film/sm/%04d.webp

COUNT=$(ls public/film/lg | wc -l | tr -d ' ')
echo "{ \"fps\": ${FPS}, \"frames\": ${COUNT} }" > public/film/meta.json
echo "frames: ${COUNT}"
du -sh public/film/lg public/film/sm
