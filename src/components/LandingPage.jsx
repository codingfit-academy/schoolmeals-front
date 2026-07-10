import { useEffect, useRef, useState } from 'react'
import styles from './LandingPage.module.css'

const REGIONS = ['서울', '경기', '부산', '대구', '광주']

const SCHOOLS = [
  { name: '강남중학교', region: '서울' },
  { name: '잠실고등학교', region: '서울' },
  { name: '한강중학교', region: '서울' },
  { name: '분당중학교', region: '경기' },
  { name: '수원고등학교', region: '경기' },
  { name: '해운대중학교', region: '부산' },
  { name: '동래고등학교', region: '부산' },
  { name: '수성중학교', region: '대구' },
  { name: '광산고등학교', region: '광주' },
]

function formatToday() {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date())
}

export default function LandingPage() {
  const heroRef = useRef(null)
  const filterRef = useRef(null)
  const searchInputRef = useRef(null)

  const [filterOpen, setFilterOpen] = useState(false)
  const [region, setRegion] = useState(REGIONS[0])
  const [search, setSearch] = useState('')
  const [school, setSchool] = useState('')

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canHover = window.matchMedia('(hover: hover)').matches
    if (reduceMotion || !canHover) return

    const hero = heroRef.current
    if (!hero) return

    function handleMove(e) {
      const rect = hero.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width) * 100
      const my = ((e.clientY - rect.top) / rect.height) * 100
      hero.style.setProperty('--mx', `${mx}%`)
      hero.style.setProperty('--my', `${my}%`)
    }

    hero.addEventListener('mousemove', handleMove)
    return () => hero.removeEventListener('mousemove', handleMove)
  }, [])

  useEffect(() => {
    if (!filterOpen) return

    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setFilterOpen(false)
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    searchInputRef.current?.focus()

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [filterOpen])

  const visibleSchools = SCHOOLS.filter(
    (s) => s.region === region && s.name.includes(search.trim())
  )

  return (
    <div className={styles.page}>
      <div className={styles.hero} ref={heroRef}>
        <svg className={styles.grainSvg} aria-hidden="true">
          <filter id="woodgrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" seed="7" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#woodgrain)" />
        </svg>

        <header className={styles.topbar}>
          <div className={`${styles.dateChip} ${styles.glass}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            <span>
              <span className={styles.dMain}>{formatToday()}</span>
              <span className={styles.dSub}> · 점심 12:10</span>
            </span>
          </div>

          <div className={styles.filter} data-open={filterOpen ? 'true' : 'false'} ref={filterRef}>
            <button
              type="button"
              className={styles.filterBtn}
              aria-haspopup="true"
              aria-expanded={filterOpen ? 'true' : 'false'}
              onClick={() => setFilterOpen((open) => !open)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
              <span>{school || '학교를 선택하세요'}</span>
              <svg className={styles.chev} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <div className={styles.filterPanel}>
              <div className={styles.regionTabs} role="tablist">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="tab"
                    className={styles.regionTab}
                    aria-selected={region === r ? 'true' : 'false'}
                    onClick={() => {
                      setRegion(r)
                      setSearch('')
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <input
                ref={searchInputRef}
                className={styles.schoolSearch}
                type="text"
                placeholder="학교 이름 검색"
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <ul className={styles.schoolList}>
                {visibleSchools.length === 0 && (
                  <li className={styles.emptySchools}>검색 결과가 없어요.</li>
                )}
                {visibleSchools.map((s) => (
                  <li key={s.name}>
                    <button
                      type="button"
                      onClick={() => {
                        setSchool(s.name)
                        setFilterOpen(false)
                      }}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </header>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>오늘의 급식</p>
          <h1>
            매점 갈 시간에,
            <br />
            오늘은 <em>급식</em>이 더 맛있어요
          </h1>
          <p className={styles.lede}>
            따끈한 밥 한 그릇에 국, 메인 반찬까지. 우리 학교 급식이 얼마나 알차게 차려지는지 지금 확인해보세요.
          </p>
        </div>

        <div className={styles.trayStage}>
          <div className={styles.trayWrap}>
            <div className={styles.tray}>
              <div className={styles.trayGrid}>

                <div className={`${styles.cell} ${styles.cellRice}`} tabIndex={0}>
                  <svg className={styles.foodArt} viewBox="0 0 100 100">
                    <defs>
                      <radialGradient id="riceGrad" cx="35%" cy="28%" r="78%">
                        <stop offset="0%" stopColor="#fdf6e6" />
                        <stop offset="55%" stopColor="var(--rice-100)" />
                        <stop offset="100%" stopColor="var(--rice-300)" />
                      </radialGradient>
                    </defs>
                    <ellipse cx="50" cy="60" rx="37" ry="24" fill="var(--rice-500)" opacity="0.55" />
                    <ellipse cx="50" cy="54" rx="36" ry="25" fill="url(#riceGrad)" />
                    <ellipse cx="50" cy="42" rx="27" ry="18" fill="url(#riceGrad)" />
                    <g fill="#dcc697" opacity="0.7">
                      <ellipse cx="36" cy="40" rx="2.6" ry="1.3" transform="rotate(25 36 40)" />
                      <ellipse cx="60" cy="36" rx="2.6" ry="1.3" transform="rotate(-15 60 36)" />
                      <ellipse cx="48" cy="30" rx="2.4" ry="1.2" transform="rotate(10 48 30)" />
                      <ellipse cx="66" cy="50" rx="2.4" ry="1.2" transform="rotate(40 66 50)" />
                      <ellipse cx="30" cy="54" rx="2.4" ry="1.2" transform="rotate(-20 30 54)" />
                    </g>
                    <ellipse cx="40" cy="32" rx="15" ry="7" fill="#ffffff" opacity="0.55" />
                  </svg>
                  <span className={styles.foodTag}>쌀밥 · <b>320kcal</b></span>
                </div>

                <div className={`${styles.cell} ${styles.cellSoup}`} tabIndex={0}>
                  <svg className={styles.foodArt} viewBox="0 0 160 100">
                    <defs>
                      <radialGradient id="soupGrad" cx="46%" cy="34%" r="75%">
                        <stop offset="0%" stopColor="var(--broth-500)" />
                        <stop offset="70%" stopColor="var(--broth-700)" />
                        <stop offset="100%" stopColor="#2c1a0c" />
                      </radialGradient>
                    </defs>
                    <ellipse cx="80" cy="58" rx="58" ry="30" fill="url(#soupGrad)" />
                    <ellipse cx="80" cy="58" rx="58" ry="30" fill="none" stroke="var(--honey-300)" strokeWidth="2.5" opacity="0.45" />
                    <g fill="#f5e9cf" opacity="0.92">
                      <rect x="58" y="46" width="12" height="12" rx="2" transform="rotate(18 64 52)" />
                      <rect x="88" y="52" width="11" height="11" rx="2" transform="rotate(-10 93 57)" />
                    </g>
                    <g fill="var(--spinach-400)" opacity="0.85">
                      <ellipse cx="76" cy="66" rx="7" ry="2.6" transform="rotate(20 76 66)" />
                      <ellipse cx="96" cy="62" rx="6" ry="2.2" transform="rotate(-25 96 62)" />
                    </g>
                    <ellipse cx="58" cy="42" rx="16" ry="6" fill="#ffffff" opacity="0.18" />
                    <g className={styles.steam} stroke="#f3e3c8" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6">
                      <path d="M68 34 C64 26, 72 22, 68 14" />
                      <path d="M80 36 C76 27, 85 23, 80 14" />
                      <path d="M92 34 C88 26, 96 22, 92 14" />
                    </g>
                  </svg>
                  <span className={styles.foodTag}>된장찌개 · <b>90kcal</b></span>
                </div>

                <div className={`${styles.cell} ${styles.cellMain}`} tabIndex={0}>
                  <svg className={styles.foodArt} viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="cutletGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                        <stop offset="0%" stopColor="#f4cf94" />
                        <stop offset="50%" stopColor="var(--cutlet-300)" />
                        <stop offset="100%" stopColor="#874f22" />
                      </linearGradient>
                    </defs>
                    <g stroke="#e4edd0" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
                      <path d="M20 78 C26 70 24 63 31 57" />
                      <path d="M29 82 C35 73 30 65 39 59" />
                      <path d="M72 80 C65 72 69 64 62 58" />
                    </g>
                    <rect x="15" y="33" width="48" height="31" rx="14" fill="url(#cutletGrad)" transform="rotate(-7 39 48)" />
                    <rect x="37" y="45" width="50" height="32" rx="14" fill="url(#cutletGrad)" transform="rotate(5 62 61)" />
                    <g fill="#6b3d18" opacity="0.32">
                      <circle cx="30" cy="42" r="1.3" /><circle cx="40" cy="38" r="1.2" /><circle cx="50" cy="43" r="1.3" />
                      <circle cx="48" cy="56" r="1.3" /><circle cx="60" cy="52" r="1.2" /><circle cx="68" cy="60" r="1.3" />
                      <circle cx="35" cy="52" r="1.2" /><circle cx="57" cy="65" r="1.2" />
                    </g>
                    <g fill="#fef1d6" opacity="0.6">
                      <circle cx="34" cy="46" r="1.1" /><circle cx="45" cy="40" r="1" /><circle cx="55" cy="50" r="1.1" />
                      <circle cx="63" cy="57" r="1" /><circle cx="42" cy="58" r="1" />
                    </g>
                    <path d="M22 45 Q30 39 38 45 T54 43 T70 47" stroke="#5a2f10" strokeWidth="2.2" fill="none" opacity="0.5" strokeLinecap="round" />
                    <ellipse cx="33" cy="40" rx="13" ry="6" fill="#ffffff" opacity="0.32" />
                  </svg>
                  <span className={styles.foodTag}>돈까스 · <b>450kcal</b></span>
                </div>

                <div className={`${styles.cell} ${styles.cellSide1}`} tabIndex={0}>
                  <svg className={styles.foodArt} viewBox="0 0 100 100">
                    <g fill="none" strokeLinecap="round">
                      <path d="M28 70 C32 50, 40 46, 36 28" stroke="var(--spinach-600)" strokeWidth="6" opacity="0.85" />
                      <path d="M42 74 C48 54, 44 44, 52 26" stroke="var(--spinach-400)" strokeWidth="6" opacity="0.9" />
                      <path d="M58 72 C62 56, 56 46, 64 30" stroke="var(--spinach-600)" strokeWidth="6" opacity="0.85" />
                      <path d="M70 68 C74 52, 68 44, 74 32" stroke="var(--spinach-400)" strokeWidth="5.5" opacity="0.8" />
                    </g>
                    <g fill="#fdf6e6" opacity="0.85">
                      <circle cx="46" cy="52" r="1.6" />
                      <circle cx="58" cy="46" r="1.4" />
                      <circle cx="36" cy="60" r="1.4" />
                    </g>
                  </svg>
                  <span className={styles.foodTag}>시금치나물 · <b>45kcal</b></span>
                </div>

                <div className={`${styles.cell} ${styles.cellSide2}`} tabIndex={0}>
                  <svg className={styles.foodArt} viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="kimchiGrad" x1="10%" y1="0%" x2="90%" y2="100%">
                        <stop offset="0%" stopColor="#e2673c" />
                        <stop offset="55%" stopColor="var(--kimchi-400)" />
                        <stop offset="100%" stopColor="var(--kimchi-600)" />
                      </linearGradient>
                    </defs>
                    <rect x="16" y="38" width="42" height="26" rx="10" fill="url(#kimchiGrad)" transform="rotate(-11 37 51)" />
                    <rect x="40" y="30" width="42" height="27" rx="10" fill="url(#kimchiGrad)" transform="rotate(9 61 43)" />
                    <rect x="28" y="58" width="42" height="25" rx="10" fill="url(#kimchiGrad)" transform="rotate(-4 49 70)" />
                    <g stroke="#f7e6cf" strokeWidth="1.6" fill="none" opacity="0.55" strokeLinecap="round">
                      <path d="M25 48 C31 46 37 47 43 51" />
                      <path d="M50 40 C56 38 62 39 68 43" />
                      <path d="M36 66 C42 64 48 65 54 69" />
                    </g>
                    <g fill="#7c2412" opacity="0.4">
                      <circle cx="30" cy="46" r="1.1" /><circle cx="46" cy="52" r="1" /><circle cx="55" cy="38" r="1.1" />
                      <circle cx="68" cy="45" r="1" /><circle cx="40" cy="65" r="1.1" /><circle cx="58" cy="70" r="1" />
                    </g>
                    <g fill="#fdf6e6" opacity="0.85">
                      <circle cx="36" cy="52" r="1.3" />
                      <circle cx="60" cy="46" r="1.2" />
                      <circle cx="48" cy="72" r="1.2" />
                    </g>
                    <ellipse cx="52" cy="35" rx="12" ry="5" fill="#ffffff" opacity="0.28" />
                  </svg>
                  <span className={styles.foodTag}>배추김치 · <b>15kcal</b></span>
                </div>

              </div>
            </div>

            <svg className={styles.utensils} viewBox="0 0 220 90">
              <defs>
                <linearGradient id="steelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--steel-200)" />
                  <stop offset="45%" stopColor="var(--steel-400)" />
                  <stop offset="100%" stopColor="var(--steel-800)" />
                </linearGradient>
              </defs>
              <g>
                <rect x="4" y="40" width="128" height="7" rx="3.5" fill="url(#steelGrad)" />
                <ellipse cx="146" cy="43" rx="22" ry="15" fill="url(#steelGrad)" />
                <ellipse cx="140" cy="38" rx="9" ry="5" fill="#ffffff" opacity="0.35" />
              </g>
              <g>
                <rect x="0" y="6" width="210" height="4.6" rx="2.3" fill="url(#steelGrad)" transform="rotate(1.2 105 8)" />
                <rect x="0" y="16" width="210" height="4.6" rx="2.3" fill="url(#steelGrad)" transform="rotate(1.2 105 18)" />
              </g>
            </svg>
          </div>
        </div>

        <div className={styles.heroActions}>
          <button className={styles.cta} type="button">오늘 식단 확인하기</button>
          <a className={styles.scrollCue} href="#more">
            더 알아보기
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </div>

      <section className={styles.contentArea} id="more">
        <div className={styles.contentHead}>
          <p className={styles.eyebrow}>이번 주 급식</p>
          <h2>매점 갈 시간에, 급식이 더 맛있어졌어요</h2>
          <p>식단표부터 잔반 포인트, 친구들의 후기까지. 급식을 더 즐겁게 만드는 기능들을 준비했어요.</p>
        </div>

        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.icon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M3 9h18M8 4v0M8 13h3M8 17h3M14 13h3M14 17h3" />
              </svg>
            </div>
            <h3>주간 식단표</h3>
            <p>월요일부터 금요일까지, 이번 주 메뉴를 한눈에 확인하세요.</p>
            <a href="#">식단표 보기 →</a>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.2 2" />
              </svg>
            </div>
            <h3>잔반 없는 날 포인트</h3>
            <p>잔반을 남기지 않으면 포인트가 쌓여요. 매점 쿠폰으로도 교환할 수 있어요.</p>
            <a href="#">포인트 확인 →</a>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>오늘 급식 후기</h3>
            <p>친구들이 남긴 오늘 급식의 별점과 솔직한 후기를 확인해보세요.</p>
            <a href="#">후기 보러가기 →</a>
          </div>
        </div>

        <div className={styles.moreSpace}>
          공지사항, 영양 정보, 알레르기 안내 등 추가 콘텐츠가 이 영역에 들어갑니다.
        </div>
      </section>
    </div>
  )
}
