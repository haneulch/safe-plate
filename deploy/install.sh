#!/usr/bin/env bash
# bootstrap.sh 실행 + 터널 생성이 끝난 뒤 실행. root로.
# 이 디렉터리 전체를 VM에 올린 상태에서 실행할 것.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f /etc/cloudflared/config.yml ]; then
  echo "!! /etc/cloudflared/config.yml 없음."
  echo "   cloudflared-config.yml의 example.com을 실제 도메인으로 바꾼 뒤"
  echo "   /etc/cloudflared/config.yml 로 복사하고, tunnel create가 만든"
  echo "   자격증명 json도 /etc/cloudflared/ 에 두고 다시 실행."
  exit 1
fi

install -m 755 pull-deploy.sh /usr/local/bin/pull-deploy.sh
install -m 644 pull-deploy.service /etc/systemd/system/pull-deploy.service
install -m 644 pull-deploy.timer   /etc/systemd/system/pull-deploy.timer
install -m 644 cloudflared.service /etc/systemd/system/cloudflared.service

systemctl daemon-reload
systemctl enable --now cloudflared.service
systemctl enable --now pull-deploy.timer

# 첫 배포는 타이머를 기다리지 않고 즉시
systemctl start pull-deploy.service || true

echo
echo "── 상태 ──"
systemctl is-active cloudflared.service && echo "cloudflared: up"
systemctl list-timers pull-deploy.timer --no-pager || true
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
