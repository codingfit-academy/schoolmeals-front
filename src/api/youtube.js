/**
 * 백엔드(schoolmeals-api)의 유튜브 검색 엔드포인트 호출
 * ─────────────────────────────────────────────────────────────
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

/** "132.7만" / "1.2억" / "5,200" 같은 한국어 표기 조회수를 정렬용 숫자로 되돌립니다. */
export function parseViewCount(views) {
  if (!views) return 0
  if (views.endsWith('억')) return parseFloat(views) * 100_000_000
  if (views.endsWith('만')) return parseFloat(views) * 10_000
  return parseFloat(views.replace(/,/g, '')) || 0
}
