# e2-micro 단일 인스턴스 배포 (safe-plate + sanneomeo)

```
Cloudflare edge (TLS·캐싱·DDoS)
      ↑ outbound-only 터널 — inbound 포트 0
 [cloudflared]  ─┬─ 127.0.0.1:3000  safeplate
                 └─ 127.0.0.1:3001  sanneomeo
      ↓ ephemeral 외부 IP (outbound 전용: GHCR pull, data.go.kr)
```

리버스 프록시 없음 — cloudflared `ingress` 규칙이 hostname → port 라우팅 담당.
배포는 **pull 기반**: VM이 3분마다 GHCR `:latest` 다이제스트를 확인해 변경 시에만 재기동.
→ Actions에서 SSH로 들어올 필요가 없어 inbound 포트를 하나도 열지 않는다.

## 왜 외부 IP를 떼지 않는가

터널은 inbound만 처리한다. VM은 outbound가 필요하다 (GHCR pull, data.go.kr/TourAPI/MFDS
호출, apt). 외부 IP 없이 outbound 하려면 Cloud NAT이 필요하고 그건 월 $32 수준 —
아끼려는 IPv4 비용(~$3/월)의 10배다. ephemeral 외부 IP를 유지한다.

## 파일

| 파일 | 위치 | 역할 |
|---|---|---|
| `bootstrap.sh` | (일회성 실행) | swap 2GB, Docker, cloudflared, 시크릿 파일 스캐폴딩 |
| `cloudflared-config.yml` | `/etc/cloudflared/config.yml` | hostname → port ingress 규칙 |
| `cloudflared.service` | `/etc/systemd/system/` | 터널 상주 |
| `pull-deploy.sh` | `/usr/local/bin/` | GHCR 다이제스트 폴링 → 변경 시 배포 |
| `pull-deploy.{service,timer}` | `/etc/systemd/system/` | 3분 간격 실행 |
| `install.sh` | (일회성 실행) | 위 유닛 설치·enable + 첫 배포 |

## 순서

로컬에 gcloud/cloudflared가 없어도 된다 — 전부 VM 안에서 한다.
VM 접속은 GCP 콘솔의 브라우저 SSH 또는 `gcloud compute ssh --tunnel-through-iap`.

### 1) 파일 받기 (VM에서)

이 디렉터리는 safe-plate repo에 들어 있고 repo가 public이라 인증이 필요 없다.

```bash
sudo apt-get update && sudo apt-get install -y git
git clone --depth 1 https://github.com/haneulch/safe-plate.git ~/safe-plate
ln -sfn ~/safe-plate/deploy ~/deploy
```

이후 배포 파일을 고치면 VM에서 `git -C ~/safe-plate pull` 로 갱신한다.
(앱 배포는 이와 무관하게 pull-deploy 타이머가 GHCR에서 처리한다.)

### 2) 부트스트랩 (VM에서)
```bash
sudo bash ~/deploy/bootstrap.sh
```
swap 2GB, Docker, cloudflared, 시크릿 파일이 준비된다.

### 3) 터널 생성 (VM에서)
자격증명이 `/root/.cloudflared/`에 떨어져야 4단계 경로와 맞으므로 **전부 sudo로** 실행한다.
비루트로 실행하면 `$HOME/.cloudflared/`에 생성돼 경로가 어긋난다.

```bash
sudo cloudflared tunnel login
#   → 출력된 URL을 로컬 브라우저로 열어 도메인 선택·승인
#   → /root/.cloudflared/cert.pem 생성

sudo cloudflared tunnel create dsp-demo
#   → /root/.cloudflared/<UUID>.json 생성. 이 UUID를 기억

sudo cloudflared tunnel route dns dsp-demo plate.<도메인>
sudo cloudflared tunnel route dns dsp-demo mtn.<도메인>
#   → Cloudflare DNS에 CNAME 자동 생성 (proxied)
```

### 4) config 배치 (VM에서)
```bash
sudo cp ~/deploy/cloudflared-config.yml /etc/cloudflared/config.yml
sudo cp /root/.cloudflared/<UUID>.json /etc/cloudflared/

sudo sed -i "s/example\.com/<도메인>/g" /etc/cloudflared/config.yml
sudo sed -i "s#/etc/cloudflared/dsp-demo\.json#/etc/cloudflared/<UUID>.json#" \
  /etc/cloudflared/config.yml

# 확인
grep -E 'hostname|credentials' /etc/cloudflared/config.yml
```

### 5) 유닛 설치 + 첫 배포
```bash
sudo bash ~/deploy/install.sh
```

### 6) API 키 입력
```bash
sudo nano /etc/safeplate.env    # TOUR_API_KEY, MFDS_API_KEY
sudo nano /etc/sanneomeo.env    # DATA_GO_KR_KEY

# 컨테이너에 반영
sudo docker restart safeplate sanneomeo
```
비워두면 앱이 mock 모드로 뜬다 (동작은 함).

### 7) 검증
```bash
curl -s localhost:3000/api/health   # {"status":"ok","tourapi":"live"|"mock",...}
curl -s localhost:3001/api/health   # {"status":"ok","publicdata":"live"|"mock"}
sudo journalctl -u cloudflared -n 30 --no-pager
free -h                             # 사용량 ~480MB 예상
```
그다음 브라우저로 `https://plate.<도메인>`, `https://mtn.<도메인>`.

## Cloudflare 대시보드

- SSL/TLS 모드: **Full** 이상. Flexible 쓰지 말 것
- 터널 hostname은 정의상 proxied → `/_next/static/*` (.js/.css)는 확장자 기반
  기본 캐싱에 걸린다. 별도 룰 불필요

## 방화벽

inbound 규칙 **불필요**. SSH도 IAP로:
```bash
gcloud compute ssh dsp-demo --tunnel-through-iap
```

## 알아둘 것

- **HEALTHCHECK는 자동 복구를 하지 않는다.** `--restart unless-stopped`는 프로세스
  종료 시에만 재기동하고, unhealthy 상태는 `docker ps`에 표시될 뿐이다.
  자동 치유가 필요하면 별도 워치독을 붙여야 한다.
- 재배포마다 Next.js Data Cache(`revalidate: 86400`)가 초기화된다.
  배포 직후 첫 요청은 data.go.kr 왕복(미국↔한국, 300~500ms)을 그대로 맞는다.
- 리전이 미국이라 한국 사용자 RTT 150~200ms는 free tier의 구조적 제약이다.
