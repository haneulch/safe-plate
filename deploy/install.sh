#!/usr/bin/env bash
# bootstrap.sh 실행 + 터널 생성이 끝난 뒤 실행. root로.
# 이 디렉터리 전체를 VM에 올린 상태에서 실행할 것.
set -euo pipefail
cd "$(dirname "$0")"

# ── 터널 유닛 판별 ──
# `cloudflared service install <TOKEN>` 은 이미 /etc/systemd/system/cloudflared.service
# 를 만들고 실행한다. 그 경우 우리 유닛으로 덮으면 동작 중인 터널이 끊긴다 → 손대지 않는다.
CF_UNIT=/etc/systemd/system/cloudflared.service
TUNNEL_UNIT=""

if systemctl is-active --quiet cloudflared.service; then
  echo "터널: cloudflared.service 이미 실행 중 — 유닛 건드리지 않음"
elif [ -f "$CF_UNIT" ] && grep -q -- '--token' "$CF_UNIT"; then
  echo "터널: cloudflared service install 로 구성됨(중단 상태) — 유닛 건드리지 않음"
  systemctl start cloudflared.service || true
elif [ -s /etc/cloudflared/token.env ]; then
  TUNNEL_UNIT=cloudflared-token.service
  echo "터널: 대시보드 관리 (token.env 사용)"
elif [ -f /etc/cloudflared/config.yml ]; then
  TUNNEL_UNIT=cloudflared.service
  echo "터널: 로컬 관리 (config.yml 사용)"
else
  echo "!! 터널 설정이 없다. 셋 중 하나:"
  echo "   [이미 구성됨]   sudo cloudflared service install <TOKEN>"
  echo "   [대시보드 관리] /etc/cloudflared/token.env 에  TUNNEL_TOKEN=eyJ..."
  echo "   [로컬 관리]     cloudflared-config.yml 의 example.com 을 실제 도메인으로"
  echo "                   바꿔 /etc/cloudflared/config.yml 로 복사 +"
  echo "                   tunnel create 가 만든 자격증명 json 도 같은 디렉터리에"
  exit 1
fi

install -m 755 pull-deploy.sh /usr/local/bin/pull-deploy.sh
install -m 644 pull-deploy.service /etc/systemd/system/pull-deploy.service
install -m 644 pull-deploy.timer   /etc/systemd/system/pull-deploy.timer
if [ -n "$TUNNEL_UNIT" ]; then
  # systemd 는 ExecStart 에 절대경로를 요구한다 — 설치 위치가 apt(/usr/bin)냐
  # 직접 내려받기(/usr/local/bin)냐에 따라 달라지므로 여기서 확정한다.
  CF_BIN=$(command -v cloudflared || true)
  [ -n "$CF_BIN" ] || { echo "!! cloudflared 바이너리를 찾을 수 없다. bootstrap.sh 먼저 실행."; exit 1; }
  sed "s#__CLOUDFLARED__#${CF_BIN}#" "$TUNNEL_UNIT" > /etc/systemd/system/cloudflared.service
  chmod 644 /etc/systemd/system/cloudflared.service
  echo "cloudflared 바이너리: $CF_BIN"
fi

systemctl daemon-reload
[ -n "$TUNNEL_UNIT" ] && systemctl enable --now cloudflared.service
systemctl enable --now pull-deploy.timer

# 첫 배포는 타이머를 기다리지 않고 즉시
systemctl start pull-deploy.service || true

echo
echo "── 상태 ──"
systemctl is-active cloudflared.service && echo "cloudflared: up"
systemctl list-timers pull-deploy.timer --no-pager || true
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
