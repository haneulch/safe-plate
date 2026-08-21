#!/usr/bin/env bash
# e2-micro 초기 세팅. Debian 12 기준. root로 실행.
set -euo pipefail

# ── 1. swap 2GB (1GB RAM에서 OOM 방지 — 필수) ──
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
# swappiness는 이미 설정돼 있으면 손대지 않는다 — 두 곳에 쓰면 어느 값이 이기는지
# 헷갈리고 재부팅 후 동작이 바뀐다.
if grep -rqs '^[[:space:]]*vm\.swappiness' /etc/sysctl.conf /etc/sysctl.d/ 2>/dev/null; then
  echo "vm.swappiness 이미 설정됨 (현재 $(sysctl -n vm.swappiness)) — 유지"
else
  # 기본 60. 낮추면 OOM kill 위험이 커지고, 높이면 pd-standard에서 지연이 늘어난다.
  echo 'vm.swappiness=60' > /etc/sysctl.d/99-swap.conf
  sysctl -q -w vm.swappiness=60
fi

# ── 2. Docker ──
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
# 로그가 디스크 30GB를 잠식하지 않도록 제한
cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
JSON
systemctl restart docker

# ── 3. cloudflared (apt 저장소 — 서명 검증 + apt 로 버전 관리) ──
if ! command -v cloudflared >/dev/null; then
  mkdir -p --mode=0755 /usr/share/keyrings
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
    > /usr/share/keyrings/cloudflare-main.gpg
  echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' \
    > /etc/apt/sources.list.d/cloudflared.list
  apt-get update -qq
  apt-get install -y cloudflared
fi
mkdir -p /etc/cloudflared
# 대시보드 관리 터널을 쓸 경우에만 채운다 (TUNNEL_TOKEN=eyJ...).
# 로컬 관리 터널이면 비워두고 config.yml 을 쓴다.
[ -f /etc/cloudflared/token.env ] || { touch /etc/cloudflared/token.env; chmod 600 /etc/cloudflared/token.env; }

# ── 4. 앱 시크릿 파일 (비어 있으면 앱이 mock 모드로 동작) ──
for f in /etc/safeplate.env /etc/sanneomeo.env; do
  [ -f "$f" ] || { touch "$f"; chmod 600 "$f"; }
done
grep -q STATS_DIR /etc/safeplate.env || cat >> /etc/safeplate.env <<'ENV'
STATS_DIR=/app/data
TOUR_API_KEY=
MFDS_API_KEY=
ENV
grep -q DATA_STORE_DIR /etc/sanneomeo.env || cat >> /etc/sanneomeo.env <<'ENV'
DATA_STORE_DIR=/app/data/store
DATA_GO_KR_KEY=
ENV

# ── 5. GHCR 인증 (패키지가 private일 때만 채운다) ──
if [ ! -f /etc/ghcr.env ]; then
  cat > /etc/ghcr.env <<'ENV'
# 패키지를 public으로 바꿨으면 이 파일은 비워둬도 된다.
# private로 쓸 경우: read:packages 권한 PAT 발급 후 채울 것.
GHCR_USER=
GHCR_TOKEN=
ENV
  chmod 600 /etc/ghcr.env
fi

echo "완료. 다음: sudo cloudflared tunnel login && sudo cloudflared tunnel create dsp-demo"
