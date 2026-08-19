/**
 * 백엔드(schoolmeals-api)의 학교/급식 엔드포인트 호출
 * ─────────────────────────────────────────────────────────────
 *   GET /schools?region=서울|경기
 *   GET /meals?atpt_ofcdc_sc_code=...&sd_schul_code=...&mlsv_ymd=... (또는 from/to)
 */
import { config } from '../config'

/** 지역(서울 | 경기)의 학교 목록을 가져옵니다. */
export async function fetchSchools(region) {
  const res = await fetch(`${config.apiUrl}/schools?region=${encodeURIComponent(region)}`)
  if (!res.ok) throw new Error(`학교 목록을 불러오지 못했어요 (${res.status})`)
  return res.json()
}

/**
 * 특정 학교의 급식 정보를 가져옵니다.
 * ymd 하나만 주면 특정 일자, fromYmd/toYmd를 주면 기간 조회입니다.
 * mealCode 기본값은 2(중식/점심)입니다.
 */
export async function fetchMeals({ officeCode, schoolCode, ymd, fromYmd, toYmd, mealCode = '2' }) {
  const params = new URLSearchParams({
    atpt_ofcdc_sc_code: officeCode,
    sd_schul_code: schoolCode,
    mmeal_sc_code: mealCode,
  })
  if (ymd) params.set('mlsv_ymd', ymd)
  if (fromYmd) params.set('mlsv_from_ymd', fromYmd)
  if (toYmd) params.set('mlsv_to_ymd', toYmd)

  const res = await fetch(`${config.apiUrl}/meals?${params.toString()}`)
  if (!res.ok) throw new Error(`급식 정보를 불러오지 못했어요 (${res.status})`)
  const data = await res.json()
  return data.mealServiceDietInfo?.[1]?.row ?? []
}
