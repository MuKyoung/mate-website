# 커스텀 도메인 연결 가이드

Vercel에 직접 구매한 도메인을 연결하는 방법을 안내합니다.

## 📋 사전 준비

- Vercel에 프로젝트가 배포되어 있어야 합니다
- 도메인을 구매한 도메인 등록업체 정보 (예: 가비아, 후이즈, GoDaddy 등)
- 도메인 등록업체의 DNS 관리 페이지 접근 권한

---

## 🚀 Vercel에서 도메인 연결하기

### 1단계: Vercel 프로젝트 설정

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 연결할 프로젝트 선택
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Domains** 클릭

### 2단계: 도메인 추가

1. **Add Domain** 버튼 클릭
2. 도메인 입력 (예: `mate.dev` 또는 `www.mate.dev`)
3. **Add** 클릭

### 3단계: DNS 설정 확인

Vercel이 자동으로 필요한 DNS 레코드를 생성합니다. 다음 중 하나의 방법을 선택하세요:

#### 방법 A: Vercel 네임서버 사용 (권장) ⭐

**장점**: 자동으로 모든 DNS 레코드 관리

1. Vercel에서 제공하는 네임서버 주소 복사:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

2. 도메인 등록업체에서 네임서버 변경:
   - 가비아: 도메인 관리 → 네임서버 설정
   - 후이즈: 도메인 관리 → 네임서버 변경
   - GoDaddy: DNS 설정 → 네임서버 변경

3. 변경 사항이 적용되는데 **최대 24-48시간** 소요될 수 있습니다

#### 방법 B: DNS 레코드 직접 추가

**장점**: 기존 네임서버 유지 가능

1. Vercel에서 제공하는 DNS 레코드 확인:
   - **A 레코드**: `76.76.21.21` (또는 Vercel이 제공하는 IP)
   - **CNAME 레코드**: `cname.vercel-dns.com`

2. 도메인 등록업체의 DNS 관리 페이지에서 추가:

   **루트 도메인 (mate.dev)의 경우:**
   ```
   타입: A
   이름: @ (또는 비워두기)
   값: 76.76.21.21
   TTL: 3600 (또는 자동)
   ```

   **서브도메인 (www.mate.dev)의 경우:**
   ```
   타입: CNAME
   이름: www
   값: cname.vercel-dns.com
   TTL: 3600 (또는 자동)
   ```

---

## 🔧 주요 도메인 등록업체별 설정 방법

### 가비아 (Gabia)

1. [가비아 홈페이지](https://www.gabia.com) 로그인
2. **도메인 관리** → **내 도메인** 선택
3. 도메인 선택 → **DNS 관리**
4. **네임서버 변경** 또는 **DNS 레코드 추가**

**네임서버 변경:**
- 네임서버 1: `ns1.vercel-dns.com`
- 네임서버 2: `ns2.vercel-dns.com`

**DNS 레코드 추가:**
- A 레코드: `@` → `76.76.21.21`
- CNAME 레코드: `www` → `cname.vercel-dns.com`

### 후이즈 (Whois)

1. [후이즈 홈페이지](https://whois.co.kr) 로그인
2. **도메인 관리** → 도메인 선택
3. **DNS 관리** 또는 **네임서버 설정**

**네임서버 변경:**
- 네임서버 1: `ns1.vercel-dns.com`
- 네임서버 2: `ns2.vercel-dns.com`

### GoDaddy

1. [GoDaddy 홈페이지](https://www.godaddy.com) 로그인
2. **My Products** → **Domains** 선택
3. 도메인 옆 **DNS** 클릭
4. **Nameservers** 또는 **Records** 수정

**네임서버 변경:**
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

### Cloudflare (도메인을 Cloudflare로 이전한 경우)

1. Cloudflare 대시보드 접속
2. 도메인 선택 → **DNS** 메뉴
3. **A 레코드** 또는 **CNAME 레코드** 추가
4. **Proxy status**: DNS only (주황색 구름 끄기)

---

## ✅ 연결 확인

### 1. DNS 전파 확인

DNS 변경 사항이 전 세계에 전파되는데 시간이 걸립니다:

```bash
# 명령 프롬프트 또는 터미널에서 확인
nslookup mate.dev
# 또는
dig mate.dev
```

### 2. Vercel 대시보드 확인

- Vercel의 **Domains** 페이지에서 상태 확인
- **Valid Configuration** 표시되면 성공
- **Invalid Configuration**이면 DNS 설정을 다시 확인

### 3. 브라우저에서 확인

- 도메인을 브라우저에서 열어보기
- SSL 인증서가 자동으로 적용되어 `https://`로 접속 가능

---

## 🔒 SSL 인증서 (자동)

Vercel은 **Let's Encrypt**를 통해 자동으로 SSL 인증서를 발급합니다:
- 도메인 연결 후 자동으로 HTTPS 활성화
- 추가 설정 불필요
- 인증서 갱신도 자동

---

## 🌐 www와 루트 도메인 모두 연결하기

### 방법 1: 두 도메인 모두 추가

1. Vercel에서 `mate.dev` 추가
2. Vercel에서 `www.mate.dev` 추가
3. Vercel이 자동으로 리다이렉트 설정

### 방법 2: 자동 리다이렉트 설정

Vercel은 기본적으로:
- `www.mate.dev` → `mate.dev`로 리다이렉트
- 또는 그 반대 (설정 가능)

**설정 변경:**
1. Vercel 프로젝트 Settings → Domains
2. 도메인 옆 **⋮** 메뉴 → **Configure**
3. Redirect 설정 선택

---

## 🐛 문제 해결

### 도메인이 연결되지 않을 때

1. **DNS 전파 대기**: 최대 48시간 소요될 수 있음
2. **DNS 레코드 확인**: 
   - [whatsmydns.net](https://www.whatsmydns.net)에서 전 세계 DNS 전파 상태 확인
3. **Vercel DNS 확인**: Vercel 대시보드의 오류 메시지 확인
4. **TTL 값 확인**: 너무 높은 TTL 값은 변경 사항 반영이 느려질 수 있음

### SSL 인증서 오류

- 도메인 연결 후 SSL 인증서 발급까지 **몇 분~몇 시간** 소요
- Vercel이 자동으로 처리하므로 대기

### 서브도메인 연결

예: `blog.mate.dev`, `api.mate.dev`

1. Vercel에서 서브도메인 추가
2. DNS에 CNAME 레코드 추가:
   ```
   타입: CNAME
   이름: blog (또는 api)
   값: cname.vercel-dns.com
   ```

---

## 📝 체크리스트

- [ ] Vercel 프로젝트 배포 완료
- [ ] Vercel에서 도메인 추가
- [ ] 도메인 등록업체에서 네임서버 또는 DNS 레코드 설정
- [ ] DNS 전파 대기 (최대 48시간)
- [ ] Vercel 대시보드에서 "Valid Configuration" 확인
- [ ] 브라우저에서 도메인 접속 테스트
- [ ] HTTPS 자동 적용 확인

---

## 💡 추가 팁

### 도메인 프라이버시

- Vercel은 기본적으로 WHOIS 프라이버시를 제공하지 않음
- 필요시 도메인 등록업체에서 프라이버시 서비스 구매

### 성능 최적화

- Vercel의 글로벌 CDN이 자동으로 활성화됨
- 추가 설정 불필요

### 도메인 이전

- 다른 등록업체로 도메인을 이전해도 DNS 설정만 변경하면 계속 사용 가능

---

## 📞 도움말

- [Vercel 도메인 문서](https://vercel.com/docs/concepts/projects/domains)
- [Vercel 커뮤니티](https://github.com/vercel/vercel/discussions)

