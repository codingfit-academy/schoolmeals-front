import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MealTray from './MealTray'
import { formatToday } from '../utils/formatToday'
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

const QUICK_ACTIONS = [
  {
    key: 'calendar',
    to: '/calendar',
    label: '급식 달력표',
    desc: '날짜별 식단 한눈에',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 4v0M16 4v0M8 13h3M8 17h3M14 13h3M14 17h3" />
      </>
    ),
    artFrom: '#f3bc63',
    artTo: '#cf8a26',
    art: (
      <>
        <rect x="12" y="14" width="48" height="44" rx="8" fill="#fdf6e6" />
        <rect x="12" y="14" width="48" height="14" rx="8" fill="#a8703f" />
        <rect x="12" y="20" width="48" height="8" fill="#a8703f" />
        <rect x="22" y="8" width="4" height="10" rx="2" fill="#a8703f" />
        <rect x="46" y="8" width="4" height="10" rx="2" fill="#a8703f" />
        <rect x="21" y="36" width="10" height="10" rx="3" fill="#f3d9ae" />
        <rect x="35" y="36" width="10" height="10" rx="3" fill="#e8a33d" />
        <rect x="21" y="50" width="10" height="8" rx="3" fill="#f3d9ae" />
        <path d="M37 40.5l1.8 1.8L43 38" stroke="#7c4a20" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    key: 'game',
    to: '/game',
    label: '급식 게임',
    desc: ' 재미있는 미니게임',
    icon: (
      <>
        <rect x="2" y="7.5" width="20" height="9" rx="4.5" />
        <path d="M7 10v4M5 12h4" />
        <circle cx="16" cy="11" r="1" />
        <circle cx="18.2" cy="13.5" r="1" />
      </>
    ),
    artFrom: '#ff9466',
    artTo: '#a8321b',
    art: (
      <>
        <rect x="30" y="12" width="30" height="30" rx="8" fill="#c1391f" transform="rotate(14 45 27)" />
        <g transform="rotate(14 45 27)" fill="#fdf6e6">
          <circle cx="38" cy="20" r="2" />
          <circle cx="52" cy="20" r="2" />
          <circle cx="45" cy="27" r="2" />
          <circle cx="38" cy="34" r="2" />
          <circle cx="52" cy="34" r="2" />
        </g>
        <rect x="12" y="30" width="30" height="30" rx="8" fill="#fdf6e6" transform="rotate(-10 27 45)" />
        <g transform="rotate(-10 27 45)" fill="#a8321b">
          <circle cx="21" cy="39" r="2.1" />
          <circle cx="33" cy="51" r="2.1" />
        </g>
      </>
    ),
  },
  {
    key: 'school',
    label: '학교 검색',
    desc: '우리 학교 찾기',
    icon: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M20 20l-4.6-4.6" />
      </>
    ),
    artFrom: '#c7cdd0',
    artTo: '#565c5f',
    art: (
      <>
        <path d="M36 14L60 24 36 34 12 24Z" fill="#fdf6e6" />
        <path d="M22 27.5V38c0 3.6 6.3 6.5 14 6.5s14-2.9 14-6.5V27.5" fill="none" stroke="#fdf6e6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M60 24v11" stroke="#fdf6e6" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="38" r="2.2" fill="#fdf6e6" />
        <circle cx="30" cy="49" r="11" fill="none" stroke="#fdf6e6" strokeWidth="4" />
        <path d="M38.5 57.5L46 65" stroke="#fdf6e6" strokeWidth="4.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: 'vote',
    to: '/vote',
    label: '메뉴 투표',
    desc: '다음 급식 뽑기',
    icon: (
      <>
        <path d="M12 3v11" />
        <path d="M7.5 8.5L12 4l4.5 4.5" />
        <rect x="3" y="14" width="18" height="7" rx="2" />
      </>
    ),
    artFrom: '#a3c274',
    artTo: '#4f6b2e',
    art: (
      <>
        <path d="M16 34h40l-5 26a4 4 0 01-4 3.4H25a4 4 0 01-4-3.4z" fill="#3f571f" />
        <path d="M14 30h44l-2.4 8H16.4z" fill="#fdf6e6" />
        <rect x="27" y="10" width="18" height="24" rx="3" fill="#e8a33d" transform="rotate(-7 36 22)" />
        <path d="M31.5 21.5l3 3 6-6.5" transform="rotate(-7 36 22)" stroke="#3f571f" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
]

const BEST_FOODS = [
  { rank: 1, name: '돈까스', kcal: 450, votes: 482, from: '#f4cf94', to: '#874f22' },
  { rank: 2, name: '떡볶이', kcal: 320, votes: 411, from: '#ff9466', to: '#b8371e' },
  { rank: 3, name: '제육볶음', kcal: 480, votes: 366, from: '#e2673c', to: '#8a321b' },
  { rank: 4, name: '잡채', kcal: 210, votes: 298, from: '#e0b47e', to: '#7c4a20' },
  { rank: 5, name: '치킨너겟', kcal: 350, votes: 274, from: '#f2c98a', to: '#a8703f' },
  { rank: 6, name: '미역국', kcal: 90, votes: 233, from: '#8a6234', to: '#3d2513' },
]

export default function LandingPage() {
  const heroRef = useRef(null)
  const filterRef = useRef(null)
  const searchInputRef = useRef(null)

  const [filterOpen, setFilterOpen] = useState(false)
  const [region, setRegion] = useState(REGIONS[0])
  const [search, setSearch] = useState('')
  const [school, setSchool] = useState('')

  const bestTrackRef = useRef(null)
  const bestPausedRef = useRef(false)
  const bestScrollTimeoutRef = useRef(null)
  const bestSyncingRef = useRef(false)
  const [bestIndex, setBestIndex] = useState(0)

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

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      if (bestPausedRef.current) return
      setBestIndex((i) => (i + 1) % BEST_FOODS.length)
    }, 3800)

    return () => clearInterval(id)
  }, [])

  // useEffect(() => {
  //   const track = bestTrackRef.current
  //   const child = track?.children[bestIndex]
  //   if (!child) return
  //   bestSyncingRef.current = true
  //   const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  //   child.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'start', block: 'nearest' })
  // }, [bestIndex])

  function handleBestScroll() {
    const track = bestTrackRef.current
    if (!track) return
    clearTimeout(bestScrollTimeoutRef.current)
    bestScrollTimeoutRef.current = setTimeout(() => {
      if (bestSyncingRef.current) {
        bestSyncingRef.current = false
        return
      }
      let closest = 0
      let closestDist = Infinity
      Array.from(track.children).forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft - track.scrollLeft)
        if (dist < closestDist) {
          closestDist = dist
          closest = i
        }
      })
      setBestIndex(closest)
    }, 120)
  }

  function pauseBest() {
    bestPausedRef.current = true
  }

  function resumeBest() {
    bestPausedRef.current = false
  }

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
            매점 음식 보다
            <br />
             <em>급식</em>이 더 맛있어요
          </h1>
          <p className={styles.lede}>
            따끈한 밥 한 그릇에 국, 메인 반찬까지. 우리 학교 급식이 얼마나 알차게 차려지는지 지금 확인해보세요.
          </p>
        </div>

        <div className={styles.trayStage}>
          <MealTray />
        </div>

        <div className={styles.heroActions}>
          <Link className={styles.cta} to="/menu">오늘 식단 확인하기</Link>
          <a className={styles.scrollCue} href="#more">
            더 알아보기
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </div>

      <section className={styles.contentArea} id="more">
        <div className={styles.quickSection}>
          <p className={styles.eyebrow}>바로가기</p>
          <div className={styles.quickGrid}>
            {QUICK_ACTIONS.map((action) => {
              const Tag = action.to ? Link : 'button'
              const tagProps = action.to ? { to: action.to } : { type: 'button' }
              return (
                <Tag key={action.key} className={styles.quickTile} {...tagProps}>
                  <span className={styles.quickBody}>
                    <span className={styles.quickIcon}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {action.icon}
                      </svg>
                    </span>
                    <span className={styles.quickLabel}>{action.label}</span>
                    <span className={styles.quickDesc}>{action.desc}</span>
                  </span>
                  <svg className={styles.quickArt} viewBox="0 0 72 72" aria-hidden="true">
                    <defs>
                      <linearGradient id={`quickArtGrad-${action.key}`} x1="10%" y1="0%" x2="90%" y2="100%">
                        <stop offset="0%" stopColor={action.artFrom} />
                        <stop offset="100%" stopColor={action.artTo} />
                      </linearGradient>
                    </defs>
                    <rect x="4" y="4" width="64" height="64" rx="20" fill={`url(#quickArtGrad-${action.key})`} />
                    {action.art}
                  </svg>
                </Tag>
              )
            })}
          </div>
        </div>

        <div
          className={styles.bestSection}
          onMouseEnter={pauseBest}
          onMouseLeave={resumeBest}
          onFocus={pauseBest}
          onBlur={resumeBest}
          onTouchStart={pauseBest}
        >
          <div className={styles.bestHead}>
            <div>
              <p className={styles.eyebrow}>이번 달 BEST</p>
              <h2>친구들이 선택한 BEST 급식</h2>
            </div>
            <div className={styles.bestNav}>
              <button
                type="button"
                aria-label="이전 메뉴"
                onClick={() => setBestIndex((i) => (i - 1 + BEST_FOODS.length) % BEST_FOODS.length)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="다음 메뉴"
                onClick={() => setBestIndex((i) => (i + 1) % BEST_FOODS.length)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.bestViewport} ref={bestTrackRef} onScroll={handleBestScroll}>
            {BEST_FOODS.map((food) => (
              <article key={food.rank} className={styles.bestCard}>
                <span className={styles.bestRank}>{food.rank}위</span>
                <svg className={styles.bestArt} viewBox="0 0 100 60">
                  <defs>
                    <linearGradient id={`bestGrad-${food.rank}`} x1="10%" y1="0%" x2="90%" y2="100%">
                      <stop offset="0%" stopColor={food.from} />
                      <stop offset="100%" stopColor={food.to} />
                    </linearGradient>
                  </defs>
                  <rect x="5" y="8" width="90" height="44" rx="18" fill={`url(#bestGrad-${food.rank})`} />
                  <ellipse cx="32" cy="20" rx="16" ry="7" fill="#ffffff" opacity="0.25" />
                  <g fill="#ffffff" opacity="0.35">
                    <circle cx="60" cy="30" r="1.6" />
                    <circle cx="70" cy="24" r="1.4" />
                    <circle cx="50" cy="38" r="1.4" />
                  </g>
                </svg>
                <h3 className={styles.bestName}>{food.name}</h3>
                <p className={styles.bestMeta}>
                  <span>{food.kcal}kcal</span>
                  <span aria-hidden="true">·</span>
                  <span>찜 {food.votes.toLocaleString('ko-KR')}</span>
                </p>
              </article>
            ))}
          </div>

          <div className={styles.bestDots}>
            {BEST_FOODS.map((food, i) => (
              <button
                key={food.rank}
                type="button"
                className={styles.bestDot}
                aria-label={`${food.name}로 이동`}
                aria-current={i === bestIndex ? 'true' : 'false'}
                onClick={() => setBestIndex(i)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
