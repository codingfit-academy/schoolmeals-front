/**
 * 중앙 설정 (config)
 * ─────────────────────────────────────────────────────────────
 * 프론트의 환경변수를 여기 한 곳에서 읽습니다. 컴포넌트는 이 파일을 import 하세요.
 *
 *   import { config, getPublicConfig } from './config'
 *
 * - config.apiUrl       : 배포 시 자동(VITE_API_URL) 설정.
 *                         로컬은 .env.local 에서 지정 (.env.local.example 참고)
 * - getPublicConfig()   : api 의 GET /config (지도 키 등 공개 값) 조회
 *
 * ⚠ 브라우저에 노출되는 값은 반드시 VITE_ 접두사가 있어야 합니다.
 *   새 공개 env 가 필요하면 아래 config 객체에 한 줄 추가하세요.
 */
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  // 새 공개 env 는 여기 한 줄 추가 (예: kakaoKey: import.meta.env.VITE_KAKAO_KEY)
}

/** api 의 GET /config (선생님 공유 키 등) 조회 */
export async function getPublicConfig() {
  const res = await fetch(`${config.apiUrl}/config`)
  if (!res.ok) throw new Error(`/config 요청 실패: ${res.status}`)
  return res.json()
}
