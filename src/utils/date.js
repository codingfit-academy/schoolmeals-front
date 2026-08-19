/** Date 객체를 NEIS API가 요구하는 YYYYMMDD 문자열로 변환합니다. */
export function toYmd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

/** 특정 연/월(0-indexed month)의 첫날~마지막날을 YYYYMMDD 범위로 반환합니다. */
export function monthRange(year, month) {
  const from = new Date(year, month, 1)
  const to = new Date(year, month + 1, 0)
  return { fromYmd: toYmd(from), toYmd: toYmd(to) }
}
