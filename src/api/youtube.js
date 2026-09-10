/**
 * 백엔드(schoolmeals-api)를 통한 유튜브 영상 검색
 * ─────────────────────────────────────────────────────────────
 * 유튜브 API 키는 서버에만 두고, 검색어당 1회만 실제 호출한 뒤 서버 DB에
 * 캐시된 결과를 내려받습니다.
 *
 *   GET /youtube/search?q=돈까스 급식 먹방&max=2
 */
import { config } from '../config'

/** 검색어에 해당하는 영상 목록을 가져옵니다. 키 미설정 등으로 결과가 없으면 빈 배열입니다. */
export async function fetchYoutubeVideos(query, max = 1) {
  const params = new URLSearchParams({ q: query, max: String(max) })
  const res = await fetch(`${config.apiUrl}/youtube/search?${params.toString()}`)
  if (!res.ok) throw new Error(`영상을 불러오지 못했어요 (${res.status})`)
  return res.json()
}
