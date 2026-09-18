/**
 * 백엔드(schoolmeals-api)의 유튜브 검색 엔드포인트 호출
 * ─────────────────────────────────────────────────────────────
 * 유튜브 API 키는 서버에만 두고, 검색어당 1회만 실제 호출한 뒤 서버 DB에
 * 캐시된 결과를 내려받습니다.
 *
 *   GET /youtube/search?q=...&max=...
 */
import { config } from '../config'

/** 검색어에 맞는 먹방 영상 목록을 가져옵니다. */
export async function searchVideos(query, max = 3) {
  const params = new URLSearchParams({ q: query, max: String(max) })
  const res = await fetch(`${config.apiUrl}/youtube/search?${params.toString()}`)
  if (!res.ok) throw new Error(`영상을 불러오지 못했어요 (${res.status})`)
  return res.json()
}

/** searchVideos의 다른 이름 — VotePage/FoodDetailPage가 이 이름으로 가져다 씁니다. */
export const fetchYoutubeVideos = searchVideos

/** "132.7만" / "1.2억" / "5,200" 같은 한국어 표기 조회수를 정렬용 숫자로 되돌립니다. */
export function parseViewCount(views) {
  if (!views) return 0
  if (views.endsWith('억')) return parseFloat(views) * 100_000_000
  if (views.endsWith('만')) return parseFloat(views) * 10_000
  return parseFloat(views.replace(/,/g, '')) || 0
}
