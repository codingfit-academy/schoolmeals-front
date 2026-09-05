import { Link, useParams } from 'react-router-dom'
import { BEST_FOODS } from '../data/bestFoods'
import styles from './FoodDetailPage.module.css'

const FOOD_DETAILS = {
  donkkaseu: {
    videos: [
      { title: '학교 급식 돈까스, 이 조합이 국룰이지', channel: '급식맛집 지호', duration: '7:20', views: '9.8만' },
      { title: '돈까스 바삭하게 오래 먹는 법', channel: '바삭이', duration: '5:41', views: '6.3만' },
    ],
    tips: [
      { title: '소스는 콕 찍어서 살짝만', body: '듬뿍 붓기보다 찍어 먹으면 튀김옷의 바삭함이 훨씬 오래가요.' },
      { title: '채소 반찬이랑 같이', body: '기름진 맛을 잡아주고 씹는 식감도 재밌어져요.' },
      { title: '밥 한 숟갈 크게 곁들이기', body: '고기와 밥을 함께 먹으면 더 든든하고 감칠맛이 살아나요.' },
    ],
    recipe: {
      ingredients: ['돼지고기 등심 2장', '소금·후추 약간', '밀가루', '달걀물', '빵가루', '식용유'],
      steps: [
        '돼지고기를 두드려 얇게 편 뒤 소금, 후추로 밑간해요.',
        '밀가루 → 달걀물 → 빵가루 순서로 튀김옷을 입혀요.',
        '170도로 예열한 기름에서 앞뒤로 노릇하게 튀겨요.',
        '한 김 식힌 뒤 먹기 좋은 크기로 썰어요.',
      ],
    },
  },
  tteokbokki: {
    videos: [
      { title: '매콤달콤 떡볶이 완식 브이로그', channel: '밥친구 소라', duration: '8:02', views: '11.2만' },
      { title: '떡볶이엔 역시 튀김 조합이지', channel: '든든한 한끼', duration: '6:15', views: '7.7만' },
    ],
    tips: [
      { title: '국물에 다른 반찬 찍어 먹기', body: '떡볶이 국물은 활용도 만점, 튀김이나 순대를 찍어보세요.' },
      { title: '치즈나 계란 추가하기', body: '매운맛이 부드러워지고 고소함이 더해져요.' },
      { title: '튀김이랑 같이 먹기', body: '바삭한 튀김과 함께면 식감 대비가 재밌어요.' },
    ],
    recipe: {
      ingredients: ['떡', '어묵', '대파', '고추장', '고춧가루', '설탕', '물'],
      steps: [
        '냄비에 물과 고추장, 고춧가루, 설탕을 넣고 끓여요.',
        '떡과 어묵을 넣고 중불에서 익혀요.',
        '국물이 걸쭉해지면 대파를 넣고 한소끔 더 끓여요.',
      ],
    },
  },
  jeyukbokkeum: {
    videos: [
      { title: '제육볶음 밥도둑 조합 리뷰', channel: '급식맛집 지호', duration: '6:48', views: '8.5만' },
      { title: '제육볶음 건강하게 먹는 법', channel: '균형이', duration: '5:30', views: '4.9만' },
    ],
    tips: [
      { title: '밥이랑 크게 한 입', body: '고기와 밥을 함께 크게 떠먹으면 양념 맛이 확 살아나요.' },
      { title: '상추에 쌈 싸먹기', body: '쌈채소에 싸 먹으면 느끼함 없이 깔끔하게 즐길 수 있어요.' },
      { title: '마늘종·야채 곁들이기', body: '아삭한 식감이 매콤한 맛과 잘 어울려요.' },
    ],
    recipe: {
      ingredients: ['돼지고기 앞다리살', '고추장', '고춧가루', '간장', '설탕', '다진마늘', '양파', '대파'],
      steps: [
        '돼지고기에 고추장, 고춧가루, 간장, 설탕, 다진마늘을 버무려 재워요.',
        '팬에 양파를 볶다가 재운 고기를 넣고 볶아요.',
        '고기가 다 익으면 대파를 넣고 한 번 더 볶아요.',
      ],
    },
  },
  japchae: {
    videos: [
      { title: '잡채 야채 골고루 먹기 챌린지', channel: '밥친구 소라', duration: '7:05', views: '5.4만' },
      { title: '잡채 당면 쫄깃하게 삶는 법', channel: '급식맛집 지호', duration: '4:52', views: '6.1만' },
    ],
    tips: [
      { title: '야채 골고루 함께 먹기', body: '당면만 건져 먹지 말고 채소도 같이 집어보세요.' },
      { title: '밥이랑 비벼 먹기', body: '간장 양념이 밥과 잘 어우러져 색다른 맛이 나요.' },
      { title: '참기름 향 즐기기', body: '마지막에 도는 고소한 향이 잡채의 포인트예요.' },
    ],
    recipe: {
      ingredients: ['당면', '소고기', '시금치', '당근', '양파', '표고버섯', '간장', '설탕', '참기름'],
      steps: [
        '당면을 삶아 찬물에 헹군 뒤 간장, 설탕으로 밑간해요.',
        '소고기와 채소를 각각 볶아요.',
        '당면과 볶은 재료를 모두 넣고 간장, 참기름으로 버무려요.',
      ],
    },
  },
  chickennugget: {
    videos: [
      { title: '치킨너겟 바삭하게 튀기는 법', channel: '바삭이', duration: '5:18', views: '7.0만' },
      { title: '너겟 소스 조합 추천 3가지', channel: '든든한 한끼', duration: '4:40', views: '5.6만' },
    ],
    tips: [
      { title: '소스 두 가지로 즐기기', body: '케첩과 머스타드를 같이 두면 질리지 않고 오래 즐길 수 있어요.' },
      { title: '채소랑 같이 먹기', body: '튀김 사이사이 채소를 곁들이면 입안이 개운해져요.' },
      { title: '갓 나왔을 때 바로', body: '식기 전에 먹어야 겉바속촉을 제대로 즐길 수 있어요.' },
    ],
    recipe: {
      ingredients: ['닭가슴살', '소금·후추', '밀가루', '달걀물', '빵가루', '식용유'],
      steps: [
        '닭가슴살을 한입 크기로 썰어 소금, 후추로 밑간해요.',
        '밀가루 → 달걀물 → 빵가루 순으로 튀김옷을 입혀요.',
        '170도 기름에서 노릇하게 튀겨요.',
      ],
    },
  },
  miyeokguk: {
    videos: [
      { title: '미역국 든든하게 먹는 법', channel: '균형이', duration: '6:02', views: '4.1만' },
      { title: '미역국 국물까지 완샷!', channel: '든든한 한끼', duration: '5:55', views: '5.8만' },
    ],
    tips: [
      { title: '밥은 말지 말고 곁들이기', body: '국에 밥을 말면 짜지기 쉬워요, 한 숟갈씩 곁들여보세요.' },
      { title: '김치랑 같이 먹기', body: '개운한 국물에 아삭한 김치가 잘 어울려요.' },
      { title: '뜨거울 때 먹기', body: '미역국은 뜨끈할 때가 가장 깊은 맛이 나요.' },
    ],
    recipe: {
      ingredients: ['건미역', '소고기', '국간장', '다진마늘', '참기름', '물'],
      steps: [
        '불린 미역을 참기름에 소고기와 함께 볶아요.',
        '물을 붓고 끓으면 국간장, 다진마늘로 간을 해요.',
        '중약불에서 20분 정도 더 끓여요.',
      ],
    },
  },
}

export default function FoodDetailPage() {
  const { slug } = useParams()
  const food = BEST_FOODS.find((f) => f.slug === slug)
  const detail = FOOD_DETAILS[slug]

  if (!food || !detail) {
    return (
      <div className={styles.page}>
        <header className={styles.topbar}>
          <Link className={styles.backLink} to="/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            홈으로
          </Link>
        </header>
        <div className={styles.sheet}>
          <p className={styles.notFound}>이 급식 메뉴를 찾을 수 없어요.</p>
          <Link className={styles.backCta} to="/">홈으로 돌아가기</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.backLink} to="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          홈으로
        </Link>
        <span className={styles.topbarTitle}>이번 달 BEST 급식</span>
      </header>

      <div className={styles.sheet}>
        <div className={styles.hero}>
          <svg className={styles.heroArt} viewBox="0 0 100 60" aria-hidden="true">
            <defs>
              <linearGradient id="heroGrad" x1="10%" y1="0%" x2="90%" y2="100%">
                <stop offset="0%" stopColor={food.from} />
                <stop offset="100%" stopColor={food.to} />
              </linearGradient>
            </defs>
            <rect x="5" y="8" width="90" height="44" rx="18" fill="url(#heroGrad)" />
            <ellipse cx="32" cy="20" rx="16" ry="7" fill="#ffffff" opacity="0.25" />
            <g fill="#ffffff" opacity="0.35">
              <circle cx="60" cy="30" r="1.6" />
              <circle cx="70" cy="24" r="1.4" />
              <circle cx="50" cy="38" r="1.4" />
            </g>
          </svg>
          <div className={styles.heroBody}>
            <span className={styles.heroRank}>이번 달 {food.rank}위</span>
            <h1 className={styles.heroName}>{food.name}</h1>
            <p className={styles.heroMeta}>
              <span>{food.kcal}kcal</span>
              <span aria-hidden="true">·</span>
              <span>찜 {food.votes.toLocaleString('ko-KR')}</span>
            </p>
          </div>
        </div>

        <section className={styles.section}>
          <p className={styles.eyebrow}>먹방 영상</p>
          <h2 className={styles.sectionTitle}>{food.name} 먹는 영상 보러가기</h2>
          <div className={styles.videoList}>
            {detail.videos.map((video) => (
              <article key={video.title} className={styles.videoCard}>
                <div className={styles.thumb} style={{ background: `linear-gradient(135deg, ${food.from}, ${food.to})` }}>
                  <div className={styles.thumbPlay}>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#2a1a08">
                        <path d="M6 4l14 8-14 8V4z" />
                      </svg>
                    </span>
                  </div>
                  <span className={styles.thumbDuration}>{video.duration}</span>
                </div>
                <div className={styles.videoMeta}>
                  <h3>{video.title}</h3>
                  <p>{video.channel} · 조회수 {video.views}</p>
                </div>
              </article>
            ))}
          </div>
          <p className={styles.videoNote}>* 먹방 영상은 예시이며, 추후 실제 유튜브 영상으로 연결될 예정이에요.</p>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>맛있게 먹는 방법</p>
          <h2 className={styles.sectionTitle}>{food.name}, 이렇게 먹으면 더 맛있어요</h2>
          <div className={styles.tipGrid}>
            {detail.tips.map((tip) => (
              <div key={tip.title} className={styles.tipCard}>
                <b>{tip.title}</b>
                <p>{tip.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>요리 방법</p>
          <h2 className={styles.sectionTitle}>집에서 만드는 {food.name}</h2>

          <p className={styles.ingredientsLabel}>재료</p>
          <ul className={styles.ingredientList}>
            {detail.recipe.ingredients.map((item) => (
              <li key={item} className={styles.ingredientChip}>{item}</li>
            ))}
          </ul>

          <ol className={styles.stepList}>
            {detail.recipe.steps.map((step, i) => (
              <li key={i} className={styles.stepItem}>
                <span className={styles.stepNum}>{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
