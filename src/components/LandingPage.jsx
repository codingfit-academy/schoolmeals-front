import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MealTray from './MealTray'
import { formatToday } from '../utils/formatToday'
import { fetchSchools, fetchTopLikedSchools } from '../api/schoolmeals'
import { parseDishes, parseKcal } from '../utils/parseMeal'
import { useSchool } from '../context/SchoolContext'
import styles from './LandingPage.module.css'

const REGIONS = ['서울', '경기']
const TOP_SCHOOL_ARTS = [
  { from: '#f3bc63', to: '#cf8a26' },
  { from: '#a3c274', to: '#4f6b2e' },
  { from: '#ff9466', to: '#a8321b' },
  { from: '#8fb8d8', to: '#3a6690' },
  { from: '#d59ad0', to: '#8a4a86' },
  { from: '#f0d264', to: '#b98a1f' },
]

const QUICK_ACTIONS = [
  {
    key: 'calendar',
    to: '/calendar',
    label: '알레르기 체크표',
    desc: '알레르기가 나오는 급식을 달력으로 한눈에',
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
    label: '학교폭력 예방 게임',
    desc: ' 재미있는 미니게임',
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
    key: 'vote',
    to: '/vote',
    label: '메뉴 투표',
    desc: '다음 급식 뽑기',
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

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const filterRef = useRef(null)
  const searchInputRef = useRef(null)

  const { school, setSchool } = useSchool()

  const [filterOpen, setFilterOpen] = useState(false)
  const [region, setRegion] = useState(school?.region || REGIONS[0])
  const [search, setSearch] = useState('')
  const [schools, setSchools] = useState([])
  const [schoolsLoading, setSchoolsLoading] = useState(false)
  const [schoolsError, setSchoolsError] = useState(null)

  const bestTrackRef = useRef(null)
  const bestPausedRef = useRef(false)
  const bestScrollTimeoutRef = useRef(null)
  const bestSyncingRef = useRef(false)
  const [bestIndex, setBestIndex] = useState(0)
  const [topSchools, setTopSchools] = useState([])

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

  useEffect(() => {
    let cancelled = false
    setSchoolsLoading(true)
    setSchoolsError(null)
    fetchSchools(region)
      .then((data) => {
        if (!cancelled) setSchools(data)
      })
      .catch((err) => {
        if (!cancelled) setSchoolsError(err.message)
      })
      .finally(() => {
        if (!cancelled) setSchoolsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [region])

  const visibleSchools = schools.filter((s) => s.name?.includes(search.trim()))

  useEffect(() => {
    let cancelled = false
    fetchTopLikedSchools()
      .then((data) => {
        if (cancelled) return
        const schoolsList = (data.schools ?? []).map((s, i) => {
          const dishes = s.menuText ? parseDishes(s.menuText) : []
          const kcal = s.calorieInfo ? parseKcal(s.calorieInfo) : null
          const art = TOP_SCHOOL_ARTS[i % TOP_SCHOOL_ARTS.length]
          return {
            key: `${s.officeCode}-${s.schoolCode}`,
            officeCode: s.officeCode,
            schoolCode: s.schoolCode,
            schoolName: s.schoolName,
            totalLikes: s.totalLikes,
            dishNames: dishes.map((d) => d.name),
            kcal,
            from: art.from,
            to: art.to,
          }
        })
        setTopSchools(schoolsList)
      })
      .catch(() => {
        // 인기 학교 정보를 못 받아도 페이지의 다른 부분은 그대로 보여준다
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (topSchools.length === 0) return

    const id = setInterval(() => {
      if (bestPausedRef.current) return
      setBestIndex((i) => (i + 1) % topSchools.length)
    }, 3800)

    return () => clearInterval(id)
  }, [topSchools.length])

  useEffect(() => {
    const track = bestTrackRef.current
    const child = track?.children[bestIndex]
    if (!track || !child) return
    bestSyncingRef.current = true
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // track.scrollTo (not child.scrollIntoView) so only the card track's own
    // scrollLeft moves — scrollIntoView can still nudge the page's vertical
    // scroll even with block:'nearest', which yanked focus down the page.
    track.scrollTo({ left: child.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [bestIndex])

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

  function goToSchoolMenu(s) {
    setSchool({ officeCode: s.officeCode, schoolCode: s.schoolCode, name: s.schoolName })
    navigate('/menu')
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
              <span>학교를 선택하세요</span>
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
                {schoolsLoading && <li className={styles.emptySchools}>학교 목록을 불러오는 중이에요...</li>}
                {!schoolsLoading && schoolsError && (
                  <li className={styles.emptySchools}>학교 목록을 불러오지 못했어요.</li>
                )}
                {!schoolsLoading && !schoolsError && visibleSchools.length === 0 && (
                  <li className={styles.emptySchools}>검색 결과가 없어요.</li>
                )}
                {!schoolsLoading &&
                  !schoolsError &&
                  visibleSchools.map((s, i) => (
                    <li key={`${s.schoolCode}-${i}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setSchool(s)
                          setFilterOpen(false)
                          navigate('/menu')
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
          {school && (
            <button type="button" className={styles.quickMenuBtn} onClick={() => navigate('/menu')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
              {school.name} 급식 메뉴
            </button>
          )}
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
                  <span className={styles.quickFill} aria-hidden="true" />
                  <span className={styles.quickArrow} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
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
                  <span className={styles.quickLabel}>{action.label}</span>
                  <span className={styles.quickDesc}>{action.desc}</span>
                </Tag>
              )
            })}
          </div>
        </div>

        {topSchools.length > 0 && (
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
                <p className={styles.eyebrow}>이번 달 인기 급식</p>
                <h2>이번달 가장 인기있는 급식 학교</h2>
              </div>
              <div className={styles.bestNav}>
                <button
                  type="button"
                  aria-label="이전 학교"
                  onClick={() => setBestIndex((i) => (i - 1 + topSchools.length) % topSchools.length)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="다음 학교"
                  onClick={() => setBestIndex((i) => (i + 1) % topSchools.length)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.bestViewport} ref={bestTrackRef} onScroll={handleBestScroll}>
              {topSchools.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={styles.bestCard}
                  onClick={() => goToSchoolMenu(s)}
                >
                  <span className={styles.bestRank}>{i + 1}위</span>
                  <svg className={styles.bestArt} viewBox="0 0 100 60">
                    <defs>
                      <linearGradient id={`bestGrad-${s.key}`} x1="10%" y1="0%" x2="90%" y2="100%">
                        <stop offset="0%" stopColor={s.from} />
                        <stop offset="100%" stopColor={s.to} />
                      </linearGradient>
                    </defs>
                    <rect x="5" y="8" width="90" height="44" rx="18" fill={`url(#bestGrad-${s.key})`} />
                    <ellipse cx="32" cy="20" rx="16" ry="7" fill="#ffffff" opacity="0.25" />
                    <g fill="#ffffff" opacity="0.35">
                      <circle cx="60" cy="30" r="1.6" />
                      <circle cx="70" cy="24" r="1.4" />
                      <circle cx="50" cy="38" r="1.4" />
                    </g>
                  </svg>
                  <h3 className={styles.bestName}>{s.schoolName}</h3>
                  {s.dishNames.length > 0 && (
                    <p className={styles.bestDishes}>{s.dishNames.slice(0, 3).join(', ')}</p>
                  )}
                  <p className={styles.bestMeta}>
                    {s.kcal != null && (
                      <>
                        <span>{s.kcal}kcal</span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span>좋아요 {s.totalLikes.toLocaleString('ko-KR')}</span>
                  </p>
                </button>
              ))}
            </div>

            <div className={styles.bestDots}>
              {topSchools.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={styles.bestDot}
                  aria-label={`${s.schoolName}로 이동`}
                  aria-current={i === bestIndex ? 'true' : 'false'}
                  onClick={() => setBestIndex(i)}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
