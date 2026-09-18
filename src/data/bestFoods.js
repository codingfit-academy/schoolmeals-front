/**
 * 급식 메뉴 카탈로그 (정적 콘텐츠)
 * ─────────────────────────────────────────────────────────────
 * 랜딩페이지 '이번 달 BEST 급식'과 상세 페이지(FoodDetailPage)가 함께 참조합니다.
 * slug는 /food/:slug 라우트 키입니다.
 *
 * 순위와 찜 수는 여기 두지 않습니다 — 서버(GET /foods)의 실제 찜 카운터로
 * 정렬해서 만듭니다. image에 사진 URL을 넣으면 카드에 그 사진이 표시되고,
 * 비워두면 from/to 색상 그라데이션 플레이스홀더가 대신 표시됩니다.
 */
export const FOOD_CATALOG = [
  { slug: 'donkkaseu', name: '돈까스', kcal: 450, from: '#f4cf94', to: '#874f22', image: '' },
  { slug: 'tteokbokki', name: '떡볶이', kcal: 320, from: '#ff9466', to: '#b8371e', image: '' },
  { slug: 'jeyukbokkeum', name: '제육볶음', kcal: 480, from: '#e2673c', to: '#8a321b', image: '' },
  { slug: 'japchae', name: '잡채', kcal: 210, from: '#e0b47e', to: '#7c4a20', image: '' },
  { slug: 'chickennugget', name: '치킨너겟', kcal: 350, from: '#f2c98a', to: '#a8703f', image: '' },
  { slug: 'miyeokguk', name: '미역국', kcal: 90, from: '#8a6234', to: '#3d2513', image: '' },
]

/** 서버에서 받은 찜 수([{slug, count}])를 카탈로그에 합쳐 찜 많은 순으로 정렬합니다. */
export function rankFoods(likes) {
  const countBySlug = Object.fromEntries((likes ?? []).map((l) => [l.slug, l.count]))
  return FOOD_CATALOG.map((food) => ({ ...food, likes: countBySlug[food.slug] ?? 0 }))
    .sort((a, b) => b.likes - a.likes)
    .map((food, i) => ({ ...food, rank: i + 1 }))
}
