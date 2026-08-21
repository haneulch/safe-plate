#!/usr/bin/env bash
# /usr/local/bin/pull-deploy.sh
# GHCR의 :latest 다이제스트가 바뀌었을 때만 재기동.
#
# 패키지가 public이면 인증이 필요 없다. private면 /etc/ghcr.env 에
#   GHCR_USER=<github-계정>
#   GHCR_TOKEN=<read:packages 권한 PAT>
# 를 두면 로그인한다. 단 private 패키지는 전송량 1GB/월 제한이 걸리므로
# (이미지 ~100MB → 월 10회 배포) 패키지만 public으로 바꾸는 쪽을 권한다.
set -euo pipefail

if [ -f /etc/ghcr.env ]; then
  # shellcheck disable=SC1091
  . /etc/ghcr.env
  if [ -n "${GHCR_TOKEN:-}" ]; then
    printf '%s' "$GHCR_TOKEN" \
      | docker login ghcr.io -u "${GHCR_USER:?GHCR_USER 필요}" --password-stdin >/dev/null
  fi
fi

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
