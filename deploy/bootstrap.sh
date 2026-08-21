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
# 1GB RAM에서는 swap을 적극적으로 쓰는 게 OOM kill보다 낫다
sysctl -w vm.swappiness=60
echo 'vm.swappiness=60' > /etc/sysctl.d/99-swap.conf

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

# ── 3. cloudflared ──
if ! command -v cloudflared >/dev/null; then
  curl -fsSLo /usr/local/bin/cloudflared \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
  chmod +x /usr/local/bin/cloudflared
fi
mkdir -p /etc/cloudflared

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
