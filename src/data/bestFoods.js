/**
 * 랜딩페이지 '이번 달 BEST 급식'과 그 상세 페이지(FoodDetailPage)가
 * 함께 참조하는 공용 데이터입니다. slug는 /food/:slug 라우트 키입니다.
 */
export const BEST_FOODS = [
  { rank: 1, slug: 'donkkaseu', name: '돈까스', kcal: 450, votes: 482, from: '#f4cf94', to: '#874f22' },
  { rank: 2, slug: 'tteokbokki', name: '떡볶이', kcal: 320, votes: 411, from: '#ff9466', to: '#b8371e' },
  { rank: 3, slug: 'jeyukbokkeum', name: '제육볶음', kcal: 480, votes: 366, from: '#e2673c', to: '#8a321b' },
  { rank: 4, slug: 'japchae', name: '잡채', kcal: 210, votes: 298, from: '#e0b47e', to: '#7c4a20' },
  { rank: 5, slug: 'chickennugget', name: '치킨너겟', kcal: 350, votes: 274, from: '#f2c98a', to: '#a8703f' },
  { rank: 6, slug: 'miyeokguk', name: '미역국', kcal: 90, votes: 233, from: '#8a6234', to: '#3d2513' },
]
