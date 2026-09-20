/**
 * 백엔드(schoolmeals-api)의 학교/급식 엔드포인트 호출
 * ─────────────────────────────────────────────────────────────
 *   GET /schools?region=서울|경기
 *   GET /meals?atpt_ofcdc_sc_code=...&sd_schul_code=...&mlsv_ymd=... (또는 from/to)
 *   POST /meals/menu-insights
 *   POST /meals/allergen-notes
 *   GET /project-intro
 *   POST /schools/{officeCode}/{schoolCode}/meals/{mealDate}/like
 *   GET /schools/top-liked?month=YYYY-MM
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

/**
 * 그 학교의 그 날짜 급식 메뉴를 AI(Gemini)로 분석합니다 — 인기 메뉴, 맛있게 먹는 팁(있을 때만),
 * 건강 포인트를 한 번의 호출로 함께 받습니다.
 * 학교×날짜 단위로 서버에 캐시되어, 그 학교의 그 날짜 페이지에 처음 접속했을 때만 AI가
 * 호출되고 이후에는 저장된 값을 그대로 받습니다. dishes는 최초 생성 시에만 쓰입니다.
 * 반환: { favorite: string, eatingTip: { dish, tip } | null, healthNotes: [{ bodyPart, note }] }
 */
export async function fetchMenuInsights({ officeCode, schoolCode, mealDate, dishes }) {
  const res = await fetch(`${config.apiUrl}/meals/menu-insights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      atpt_ofcdc_sc_code: officeCode,
      sd_schul_code: schoolCode,
      mlsv_ymd: mealDate,
      dishes,
    }),
  })
  if (!res.ok) throw new Error(`메뉴 분석을 불러오지 못했어요 (${res.status})`)
  return res.json()
}

/**
 * 그 학교의 달력에 보이는 날짜들에 대해, NEIS 공식 알레르기 코드에 빠졌을 수 있는 성분을
 * AI(Gemini)가 보완합니다 — 참고용이며 공식 코드를 대체하지 않습니다.
 * 학교×날짜 단위로 서버에 캐시되어, 메뉴 내용이 바뀌지 않는 한 같은 학교·같은 날짜는
 * 달력을 다시 봐도(다른 달 갔다가 돌아와도) AI가 재호출되지 않습니다.
 * days: [{ mlsv_ymd, dishes: [{ name, knownAllergens }] }]
 * 반환: { notes: { 'YYYY-MM-DD': [{ dish, allergen, reason }] } }
 */
export async function fetchAllergenNotes({ officeCode, schoolCode, days }) {
  const res = await fetch(`${config.apiUrl}/meals/allergen-notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      atpt_ofcdc_sc_code: officeCode,
      sd_schul_code: schoolCode,
      days,
    }),
  })
  if (!res.ok) throw new Error(`알레르기 보완 정보를 불러오지 못했어요 (${res.status})`)
  return res.json()
}

/** 그 학교의 그 날짜 급식에 좋아요를 누릅니다. 중복 클릭 방지는 프론트가 localStorage로 처리합니다. */
export async function likeSchoolMeal({ officeCode, schoolCode, mealDate }) {
  const res = await fetch(`${config.apiUrl}/schools/${officeCode}/${schoolCode}/meals/${mealDate}/like`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`좋아요를 누르지 못했어요 (${res.status})`)
  return res.json()
}

/**
 * 이번 달(또는 지정한 달) 좋아요를 가장 많이 받은 학교 순위를 가져옵니다.
 * 각 학교에는 그 학교가 이번 달 가장 많이 좋아요를 받은 날짜의 실제 급식(menuText/calorieInfo)이
 * 함께 오므로, parseDishes/parseKcal로 그대로 파싱해 보여줄 수 있습니다.
 */
export async function fetchTopLikedSchools(month) {
  const params = month ? `?month=${encodeURIComponent(month)}` : ''
  const res = await fetch(`${config.apiUrl}/schools/top-liked${params}`)
  if (!res.ok) throw new Error(`인기 학교 순위를 불러오지 못했어요 (${res.status})`)
  return res.json()
}

/** AI 경진대회 제출용 프로젝트 소개 자료(AI 사용 내역, 프롬프트, 기술 스펙, 기능 목록)를 가져옵니다. */
export async function fetchProjectIntro() {
  const res = await fetch(`${config.apiUrl}/project-intro`)
  if (!res.ok) throw new Error(`프로젝트 소개를 불러오지 못했어요 (${res.status})`)
  return res.json()
}
