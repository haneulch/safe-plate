#!/usr/bin/env bash
# setup-all.sh — 자체 완결 배포 파일 생성기. gen-setup-all.sh가 생성한다 (직접 수정 금지).
#
# repo에 접근할 수 없는 VM용. git·토큰·업로드 도구 없이 콘솔 SSH에
# 이 파일 내용을 붙여넣고 실행하면 ~/deploy 아래에 배포 파일이 만들어진다.
#
#   sudo bash setup-all.sh && sudo bash ~/deploy/bootstrap.sh
set -euo pipefail

DEST="${DEST:-$HOME/deploy}"
mkdir -p "$DEST"

cat > "$DEST/bootstrap.sh" <<'SETUP_EOF'
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
SETUP_EOF

cat > "$DEST/cloudflared-config.yml" <<'SETUP_EOF'
# /etc/cloudflared/config.yml
# 터널 자격증명은 `cloudflared tunnel login` + `tunnel create` 로 생성됨.
tunnel: dsp-demo
credentials-file: /etc/cloudflared/dsp-demo.json

# 원본은 loopback이므로 TLS 불필요 (CF edge ↔ cloudflared 구간은 이미 암호화)
originRequest:
  connectTimeout: 30s
  # 미국 리전 → data.go.kr 왕복이 느려 API 라우트가 30s 넘길 수 있음
  noTLSVerify: false

ingress:
  - hostname: plate.example.com
    service: http://127.0.0.1:3000
  - hostname: mtn.example.com
    service: http://127.0.0.1:3001
  # 매칭 안 되는 요청은 404 (필수 — 마지막 규칙은 catch-all이어야 함)
  - service: http_status:404
SETUP_EOF

cat > "$DEST/cloudflared.service" <<'SETUP_EOF'
# /etc/systemd/system/cloudflared.service
[Unit]
Description=Cloudflare Tunnel
After=network-online.target
Wants=network-online.target

# ExecStart의 __CLOUDFLARED__ 는 install.sh 가 실제 경로로 치환한다
# (apt 설치는 /usr/bin, 바이너리 직접 내려받으면 /usr/local/bin).
[Service]
ExecStart=__CLOUDFLARED__ --config /etc/cloudflared/config.yml --no-autoupdate tunnel run
Restart=always
RestartSec=5
MemoryMax=150M
User=root

[Install]
WantedBy=multi-user.target
SETUP_EOF

cat > "$DEST/pull-deploy.sh" <<'SETUP_EOF'
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

  # 다이제스트가 같아도 컨테이너가 없으면 배포해야 한다. 마커만 보면
  # (수동 삭제·prune·재부팅 실패 등으로) 컨테이너가 사라진 뒤 영구히 안 뜬다.
  if [ "$remote" = "$local_d" ] && docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null | grep -q true; then
    return 0
  fi

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
SETUP_EOF

cat > "$DEST/pull-deploy.service" <<'SETUP_EOF'
# /etc/systemd/system/pull-deploy.service
[Unit]
Description=GHCR 신규 이미지 확인 후 배포
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/pull-deploy.sh
SETUP_EOF

cat > "$DEST/pull-deploy.timer" <<'SETUP_EOF'
# /etc/systemd/system/pull-deploy.timer
[Unit]
Description=GHCR 신규 이미지 폴링 배포

[Timer]
OnBootSec=2min
OnUnitActiveSec=3min
Unit=pull-deploy.service

[Install]
WantedBy=timers.target
SETUP_EOF

cat > "$DEST/install.sh" <<'SETUP_EOF'
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
SETUP_EOF

cat > "$DEST/cloudflared-token.service" <<'SETUP_EOF'
# /etc/systemd/system/cloudflared.service
# 대시보드 관리(remotely-managed) 터널용. ingress 규칙은 Cloudflare에 있고
# 로컬 config.yml은 무시된다. 로컬 관리 터널이면 cloudflared.service를 쓸 것.
#
# 토큰은 /etc/cloudflared/token.env 에 두고 여기엔 박지 않는다 (커밋 사고 방지).
#   TUNNEL_TOKEN=eyJ...
[Unit]
Description=Cloudflare Tunnel (dashboard-managed)
After=network-online.target
Wants=network-online.target

# ExecStart의 __CLOUDFLARED__ 는 install.sh 가 실제 경로로 치환한다
# (apt 설치는 /usr/bin, 바이너리 직접 내려받으면 /usr/local/bin).
[Service]
EnvironmentFile=/etc/cloudflared/token.env
ExecStart=__CLOUDFLARED__ --no-autoupdate tunnel run
Restart=always
RestartSec=5
MemoryMax=150M
User=root

[Install]
WantedBy=multi-user.target
SETUP_EOF

chmod +x "$DEST"/*.sh
echo "생성 완료: $DEST"
ls -la "$DEST"
echo
echo "다음: sudo bash $DEST/bootstrap.sh"
