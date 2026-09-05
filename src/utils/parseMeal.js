/**
 * NEIS 급식식단정보 파싱 유틸
 * ─────────────────────────────────────────────────────────────
 * DDISH_NM 예: "발아현미밥 <br/>육개장 (5.6.16)<br/>두부구이 (5)<br/>오렌지 "
 * CAL_INFO 예: "1267.0 Kcal"
 */

// NEIS 표준 알레르기 유발식품 코드(1~19)
export const ALLERGENS = [
  { key: 'egg', code: 1, label: '난류' },
  { key: 'dairy', code: 2, label: '우유' },
  { key: 'buckwheat', code: 3, label: '메밀' },
  { key: 'peanut', code: 4, label: '땅콩' },
  { key: 'soy', code: 5, label: '대두' },
  { key: 'wheat', code: 6, label: '밀' },
  { key: 'mackerel', code: 7, label: '고등어' },
  { key: 'crab', code: 8, label: '게' },
  { key: 'shrimp', code: 9, label: '새우' },
  { key: 'pork', code: 10, label: '돼지고기' },
  { key: 'peach', code: 11, label: '복숭아' },
  { key: 'tomato', code: 12, label: '토마토' },
  { key: 'sulfite', code: 13, label: '아황산류' },
  { key: 'walnut', code: 14, label: '호두' },
  { key: 'chicken', code: 15, label: '닭고기' },
  { key: 'beef', code: 16, label: '쇠고기' },
  { key: 'squid', code: 17, label: '오징어' },
  { key: 'shellfish', code: 18, label: '조개류(굴,전복,홍합 포함)' },
  { key: 'pinenut', code: 19, label: '잣' },
]

const CODE_TO_KEY = Object.fromEntries(ALLERGENS.map((a) => [a.code, a.key]))
export const ALLERGEN_LABEL = Object.fromEntries(ALLERGENS.map((a) => [a.key, a.label]))

/** DDISH_NM 문자열을 [{ name, allergens }] 배열로 파싱합니다. */
export function parseDishes(ddishNm) {
  if (!ddishNm) return []
  return ddishNm
    .split(/<br\s*\/?>/i)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*?)\s*\(([\d.]+)\)$/)
      if (!match) return { name: line, allergens: [] }
      const [, name, codes] = match
      const allergens = codes
        .split('.')
        .map((c) => CODE_TO_KEY[Number(c)])
        .filter(Boolean)
      return { name: name.trim(), allergens }
    })
}

/** CAL_INFO 문자열("1267.0 Kcal")에서 총 칼로리 숫자만 뽑아냅니다. */
export function parseKcal(calInfo) {
  if (!calInfo) return null
  const match = calInfo.match(/([\d.]+)/)
  return match ? Math.round(parseFloat(match[1])) : null
}

/** "라벨 : 값<br/>라벨 : 값" 형태의 문자열(NTR_INFO, ORPLC_INFO)을 [{ label, value }]로 파싱합니다. */
export function parseInfoList(infoStr) {
  if (!infoStr) return []
  return infoStr
    .split(/<br\s*\/?>/i)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':')
      if (idx === -1) return { label: line, value: '' }
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() }
    })
}
