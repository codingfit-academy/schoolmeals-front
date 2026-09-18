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

/**
 * 달력 표 렌더링용 주 단위 셀 배열을 만듭니다.
 * 월의 시작 요일 앞/끝 뒤는 null로 채워 7의 배수가 되게 합니다.
 * 반환값: [[{day, date, isWeekend} | null, ...7개], ...]
 */
export function buildMonthShell(year, month) {
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    cells.push({ day, date, isWeekend: date.getDay() === 0 || date.getDay() === 6 })
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}
