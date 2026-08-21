#!/usr/bin/env bash
# setup-all.sh 재생성. 배포 파일을 고치면 이걸 다시 돌려 드리프트를 막는다.
#   bash gen-setup-all.sh
set -euo pipefail
cd "$(dirname "$0")"

FILES=(bootstrap.sh cloudflared-config.yml cloudflared.service
       pull-deploy.sh pull-deploy.service pull-deploy.timer install.sh)

{
  cat <<'HEAD'
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
HEAD

  for f in "${FILES[@]}"; do
    grep -q 'SETUP_EOF' "$f" && { echo "ERROR: $f 에 SETUP_EOF 포함 — heredoc 충돌" >&2; exit 1; }
    printf '\ncat > "$DEST/%s" <<'"'"'SETUP_EOF'"'"'\n' "$f"
    cat "$f"
    printf 'SETUP_EOF\n'
  done

  cat <<'TAIL'

chmod +x "$DEST"/*.sh
echo "생성 완료: $DEST"
ls -la "$DEST"
echo
echo "다음: sudo bash $DEST/bootstrap.sh"
TAIL
} > setup-all.sh

chmod +x setup-all.sh gen-setup-all.sh
echo "setup-all.sh 재생성 완료"
