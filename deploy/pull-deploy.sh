#!/usr/bin/env bash
# /usr/local/bin/pull-deploy.sh
# GHCR의 :latest 다이제스트가 바뀌었을 때만 재기동. public package라 인증 불필요.
set -euo pipefail

deploy() {
  local name=$1 image=$2 port=$3; shift 3
  local manifest remote local_d
  # GHCR 도달 실패 시 manifest가 비는데, 그대로 해시하면 "빈 문자열 해시"가
  # 저장된 다이제스트와 달라 매 tick 재배포를 시도한다 → 빈 응답은 스킵.
  manifest=$(docker manifest inspect "$image" 2>/dev/null || true)
  [ -z "$manifest" ] && { echo "[$name] manifest 조회 실패 — 스킵"; return 0; }
  remote=$(printf '%s' "$manifest" | sha256sum | cut -d' ' -f1)
  local_d=$(cat "/var/lib/pull-deploy/$name" 2>/dev/null || true)
  [ "$remote" = "$local_d" ] && return 0

  echo "[$name] 새 이미지 감지 → 배포"
  docker pull "$image"
  docker rm -f "$name" 2>/dev/null || true

  local envopt=()
  [ -f "/etc/$name.env" ] && envopt=(--env-file "/etc/$name.env")

  docker run -d --name "$name" --restart unless-stopped \
    -p "127.0.0.1:$port:3000" \
    --memory=400m --memory-swap=700m \
    "${envopt[@]}" \
    -v "$name-data:${DATA_VOL:-/app/data}" \
    "$@" "$image"
  mkdir -p /var/lib/pull-deploy
  echo "$remote" > "/var/lib/pull-deploy/$name"
  docker image prune -f
}

DATA_VOL=/app/data       deploy safeplate ghcr.io/haneulch/safe-plate:latest 3000
DATA_VOL=/app/data/store deploy sanneomeo ghcr.io/haneulch/sanneomeo:latest  3001
