import { Link } from 'react-router-dom'
import MealTray, { TODAY_MENU } from './MealTray'
import { formatToday } from '../utils/formatToday'
import styles from './TodayMenuPage.module.css'

const MUKBANG_VIDEOS = [
  {
    title: '급식 돈까스, 소스 없이 바삭하게 완식',
    channel: '급식맛집 지호',
    duration: '8:12',
    views: '12.4만',
    from: '#f4cf94',
    to: '#874f22',
  },
  {
    title: '된장찌개 국물까지 완샷! 급식 먹방',
    channel: '든든한 한끼',
    duration: '11:03',
    views: '8.7만',
    from: '#8a6234',
    to: '#3d2513',
  },
  {
    title: '김치 없인 못 살아, 급식 브이로그',
    channel: '밥친구 소라',
    duration: '6:45',
    views: '5.2만',
    from: '#e2673c',
    to: '#8a321b',
  },
]

const TIPS = [
  {
    title: '밥과 김치를 먼저 한 입',
    body: '새콤하고 아삭한 배추김치로 입맛을 먼저 돋운 뒤 식사를 시작해보세요.',
  },
  {
    title: '돈까스는 소스를 살짝만',
    body: '소스를 듬뿍 찍기보다 살짝만 곁들이면 튀김옷의 바삭한 식감을 더 오래 즐길 수 있어요.',
  },
  {
    title: '된장찌개는 밥에 곁들여서',
    body: '국물에 밥을 말기보다 한 숟갈씩 곁들이면 짜지 않게 든든한 식사가 돼요.',
  },
  {
    title: '시금치나물은 마지막에',
    body: '담백한 나물을 마지막에 먹으면 입안이 개운하게 정리돼요.',
  },
]

const TOTAL_KCAL = TODAY_MENU.reduce((sum, food) => sum + food.kcal, 0)

const BODY_BASE = '#e3d3ae'
const BODY_BASE_DEEP = '#c9b183'

function BodyMap({ regions, color }) {
  const partFill = (key) => (regions.includes(key) ? color : BODY_BASE)
  const eyeFill = regions.includes('eyes') ? color : BODY_BASE_DEEP

  return (
    <svg className={styles.bodyMap} viewBox="0 0 60 110" aria-hidden="true">
      <circle cx="30" cy="14" r="10" fill={partFill('head')} />
      <circle cx="26.5" cy="12.5" r="1.7" fill={eyeFill} />
      <circle cx="33.5" cy="12.5" r="1.7" fill={eyeFill} />
      <rect x="26" y="23" width="8" height="6" rx="2" fill={BODY_BASE} />
      <rect x="6" y="30" width="9" height="32" rx="4.5" fill={partFill('leftArm')} />
      <rect x="45" y="30" width="9" height="32" rx="4.5" fill={partFill('rightArm')} />
      <rect x="17" y="30" width="26" height="16" rx="7" fill={partFill('stomach')} />
      <rect x="17" y="45" width="26" height="18" rx="7" fill={partFill('intestine')} />
      <rect x="18" y="62" width="10" height="36" rx="5" fill={partFill('leftLeg')} />
      <rect x="32" y="62" width="10" height="36" rx="5" fill={partFill('rightLeg')} />
    </svg>
  )
}

export default function TodayMenuPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.backLink} to="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          홈으로
        </Link>
        <span className={styles.topbarDate}>
          <b>{formatToday()}</b> · 점심 12:10
        </span>
      </header>

      <section className={styles.section}>
        <div className={styles.introHead}>
          <p className={styles.eyebrow}>오늘의 식단</p>
          <h1>{formatToday()} 급식은 이렇게 차려졌어요</h1>
        </div>
        <p className={styles.lede}>
          고소한 쌀밥에 구수한 된장찌개, 바삭한 돈까스, 향긋한 시금치나물, 새콤달콤한 배추김치까지 —
          탄수화물과 단백질, 채소와 발효식품이 골고루 담긴 균형 잡힌 한 끼예요.
        </p>
        <ul className={styles.menuList}>
          {TODAY_MENU.map((food) => (
            <li key={food.type} className={styles.menuChip}>
              <b>{food.name}</b>
              <span>{food.kcal}kcal</span>
            </li>
          ))}
          <li className={`${styles.menuChip} ${styles.menuTotal}`}>
            <b>총 칼로리</b>
            <span>{TOTAL_KCAL}kcal</span>
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <div className={styles.showcaseGrid}>
          <div className={styles.trayPane}>
            <p className={styles.paneLabel}> 오늘의 급식</p>
            <div className={styles.trayHolder}>
              <MealTray />
            </div>
            <p className={styles.paneCaption}>실제 배식은 학교 사정에 따라 조금씩 달라질 수 있어요.</p>
          </div>

          <div className={styles.videoPane}>
            <p className={styles.paneLabel}>이 급식을 맛있게 먹는 영상</p>
            <div className={styles.videoList}>
              {MUKBANG_VIDEOS.map((video) => (
                <article key={video.title} className={styles.videoCard}>
                  <div className={styles.thumb} style={{ background: `linear-gradient(135deg, ${video.from}, ${video.to})` }}>
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
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.tips}`}>
        <p className={styles.eyebrow}>맛있게 먹는 방법</p>
        <h2>오늘 급식, 이 방법대로 먹으면 더 맛있어요</h2>
        <ol className={styles.tipList}>
          {TIPS.map((tip) => (
            <li key={tip.title}>
              <b>{tip.title}</b>
              <p>{tip.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${styles.section} ${styles.health}`}>
        <p className={styles.eyebrow}>건강 정보</p>
        <h2>오늘 한 끼, 영양은 어떻게 채워질까요?</h2>
        <div className={styles.healthSummary}>
          <span className={styles.healthKcal}>{TOTAL_KCAL}kcal</span>
          <p>
            탄수화물(쌀밥), 단백질(돈까스), 채소(시금치나물), 발효식품(된장·김치)이 골고루 포함된 구성이에요.
            성장기 학생의 한 끼 권장 열량에 맞춰 무리 없이 든든하게 채울 수 있어요.
          </p>
        </div>
        <div className={styles.healthGrid}>
          {TODAY_MENU.map((food) => (
            <div key={food.type} className={styles.healthCard}>
              <div className={styles.healthText}>
                <h3>{food.name}</h3>
                <p>{food.health}</p>
              </div>
              <div className={styles.healthBody}>
                <BodyMap regions={food.bodyRegions} color={food.bodyColor} />
                <span className={styles.healthBodyLabel} style={{ color: food.bodyColor }}>
                  {food.bodyLabel} 건강
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
