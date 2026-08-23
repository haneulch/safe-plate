// Google Play 등록 요건인 개인정보처리방침. 정적 페이지 (ko + en).
export const metadata = { title: '개인정보처리방침 · SafePlate Korea' };

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px', lineHeight: 1.7 }}>
      <h1>개인정보처리방침</h1>
      <p>최종 수정: 2026-08-23</p>

      <h2>수집하는 정보</h2>
      <ul>
        <li>
          <b>식이 제약 프로필(선택, 민감정보)</b>: 만성질환·알레르기·종교 식단 선택 항목.
          기본적으로 기기에만 저장되며, Google 로그인 시에만 기기 간 동기화를 위해 서버에 저장합니다.
          식당·메뉴 판정 이외의 목적에 사용하지 않습니다.
        </li>
        <li><b>Google 로그인(선택)</b>: 이메일, 이름. 프로필 동기화 용도로만 사용합니다.</li>
        <li>
          <b>익명 통계</b>: 온보딩 완료 시 프로필 선택 항목의 통계를 수집하되,
          이메일·아이디·IP·자유 입력 텍스트·위치 등 <b>식별 가능한 정보는 일절 포함하지 않습니다</b>.
        </li>
        <li><b>위치 정보</b>: 주변 식당 조회에 일시적으로만 사용하며 서버에 저장하지 않습니다.</li>
      </ul>

      <h2>보관과 보호</h2>
      <p>동기화된 프로필은 Supabase(암호화 전송·저장)에 보관하며, 제3자에게 판매·제공하지 않습니다.</p>

      <h2>삭제</h2>
      <p>앱에서 로그아웃 후 아래 문의처로 요청하시면 서버의 프로필을 즉시 삭제합니다. 기기 내 데이터는 브라우저 데이터 삭제로 제거됩니다.</p>

      <h2>문의</h2>
      <p>
        <a href="https://github.com/haneulch/safe-plate/issues">github.com/haneulch/safe-plate/issues</a>
      </p>

      <hr style={{ margin: '32px 0' }} />

      <h1>Privacy Policy</h1>
      <p>Last updated: 2026-08-23</p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <b>Dietary profile (optional, sensitive)</b>: your selected chronic conditions, allergens,
          and religious diets. Stored on your device by default; saved to our server only when you
          sign in with Google, solely for cross-device sync. Used only to screen restaurants and menus.
        </li>
        <li><b>Google sign-in (optional)</b>: email and name, used only for profile sync.</li>
        <li>
          <b>Anonymous statistics</b>: aggregate counts of profile selections at onboarding.
          <b> No identifiers are ever included</b> — no email, id, IP, free text, or location.
        </li>
        <li><b>Location</b>: used transiently to find nearby restaurants; never stored on our servers.</li>
      </ul>

      <h2>Storage & protection</h2>
      <p>Synced profiles are stored in Supabase (encrypted in transit and at rest) and are never sold or shared with third parties.</p>

      <h2>Deletion</h2>
      <p>Sign out and contact us below to delete your server-side profile immediately. On-device data is removed by clearing browser data.</p>

      <h2>Contact</h2>
      <p>
        <a href="https://github.com/haneulch/safe-plate/issues">github.com/haneulch/safe-plate/issues</a>
      </p>
    </main>
  );
}
