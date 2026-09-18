/**
 * 찜(이번 달 BEST) / 메뉴 투표(이번 주) 카운터
 * ─────────────────────────────────────────────────────────────
 *   GET  /foods                 → [{ slug, count, yearMonth }]
 *   POST /foods/{slug}/like     → { slug, count }
 *   GET  /votes                 → { week, counts: { a: n, b: n } }
 *   POST /votes/{optionKey}     → { week, optionKey, count }
 */
import { config } from '../config'

/** 이번 달 급식 메뉴별 찜 수를 가져옵니다. */
export async function fetchFoodLikes() {
  const res = await fetch(`${config.apiUrl}/foods`)
  if (!res.ok) throw new Error(`찜 정보를 불러오지 못했어요 (${res.status})`)
  return res.json()
}

/** 급식 메뉴를 찜합니다. */
export async function likeFood(slug) {
  const res = await fetch(`${config.apiUrl}/foods/${encodeURIComponent(slug)}/like`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`찜하지 못했어요 (${res.status})`)
  return res.json()
}

/** 이번 주 메뉴 투표 결과를 가져옵니다. */
export async function fetchVotes() {
  const res = await fetch(`${config.apiUrl}/votes`)
  if (!res.ok) throw new Error(`투표 결과를 불러오지 못했어요 (${res.status})`)
  return res.json()
}

/** 이번 주 메뉴 투표에 한 표를 던집니다. */
export async function castVote(optionKey) {
  const res = await fetch(`${config.apiUrl}/votes/${encodeURIComponent(optionKey)}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`투표하지 못했어요 (${res.status})`)
  return res.json()
}
