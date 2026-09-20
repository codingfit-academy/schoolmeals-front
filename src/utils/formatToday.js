/** 임의의 날짜를 "9월 19일 (토)" 형태로 포맷합니다. */
export function formatDate(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

export function formatToday() {
  return formatDate(new Date())
}
