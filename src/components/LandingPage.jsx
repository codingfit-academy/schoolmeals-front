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

// 첫 화면 가로 스크롤 스토리 — 과거부터 지금까지 급식이 어떻게 좋아졌는지 보여줍니다.
// 연도는 '몇 년대' 수준으로만 적습니다 (정확한 수치를 단정하지 않기 위함).
//
// bg: 배경 사진 경로. public/images/story/ 에 파일을 넣고 여기에 경로만 적으면
//     그 패널이 사진 배경으로 바뀝니다 (예: bg: '/images/story/1980-dosirak.jpg').
//     비워두면 아래 bgTint 색 배경이 쓰이므로, 사진이 없어도 화면은 정상입니다.
const STORY_PANELS = [
  {
    key: 'start',
    era: '1980년대',
    tag: '급식의 시작',
    title: '도시락을 싸 오던 시절',
    desc: '학교급식법이 만들어지면서 학교에서 밥을 주기 시작했어요. 아직은 일부 학교만, 반찬도 몇 가지뿐이었죠.',
    bg: '/images/story/1980-dosirak.jpg',
    bgTint: 'linear-gradient(140deg, #4a443c 0%, #2b2724 70%)',
    from: '#b3aa9c',
    to: '#6d6459',
    art: (
      <>
        <rect x="14" y="26" width="72" height="48" rx="8" fill="#efe7d8" />
        <rect x="14" y="26" width="72" height="10" rx="5" fill="#8c7a63" />
        <rect x="22" y="44" width="28" height="22" rx="4" fill="#dcd0b8" />
        <rect x="54" y="44" width="24" height="10" rx="3" fill="#c9b48f" />
        <rect x="54" y="58" width="24" height="8" rx="3" fill="#c9b48f" />
      </>
    ),
  },
  {
    key: 'spread',
    era: '1990~2000년대',
    tag: '전국으로',
    title: '모든 학교에 급식실이 생겼어요',
    desc: '초·중·고로 급식이 퍼지면서, 밥과 국에 반찬까지 갖춘 한 끼가 당연한 일이 되었어요.',
    bg: '/images/story/2000-gupsiksil.jpg',
    bgTint: 'linear-gradient(140deg, #6b4f2a 0%, #2e241a 70%)',
    from: '#e0b877',
    to: '#a87630',
    art: (
      <>
        <rect x="10" y="30" width="80" height="44" rx="7" fill="#f6efdf" />
        <rect x="16" y="36" width="26" height="32" rx="4" fill="#e4d6b6" />
        <rect x="46" y="36" width="18" height="14" rx="4" fill="#e8a33d" />
        <rect x="68" y="36" width="16" height="14" rx="4" fill="#cf8a26" />
        <rect x="46" y="54" width="38" height="14" rx="4" fill="#e4d6b6" />
        <circle cx="76" cy="26" r="9" fill="#f6efdf" />
        <circle cx="76" cy="26" r="5" fill="#d8a45a" />
      </>
    ),
  },
  {
    key: 'free',
    era: '2010년대',
    tag: '누구나 같은 한 끼',
    title: '무상급식과 영양 선생님',
    desc: '누구나 눈치 보지 않고 같은 밥을 먹게 됐어요. 영양 선생님이 한 끼의 영양을 직접 계산해 식단을 짜기 시작했고요.',
    bg: '/images/story/2010-musang.jpg',
    bgTint: 'linear-gradient(140deg, #3f5a2c 0%, #1f2a17 70%)',
    from: '#a3c274',
    to: '#4f6b2e',
    art: (
      <>
        <rect x="8" y="28" width="84" height="46" rx="8" fill="#f4f6ec" />
        <rect x="14" y="34" width="24" height="34" rx="4" fill="#dfe8cc" />
        <rect x="42" y="34" width="22" height="16" rx="4" fill="#8fae5f" />
        <rect x="68" y="34" width="18" height="16" rx="4" fill="#e8a33d" />
        <rect x="42" y="54" width="44" height="14" rx="4" fill="#dfe8cc" />
        <rect x="60" y="14" width="14" height="18" rx="3" fill="#ffffff" />
        <path d="M63 22l2.4 2.4 5-5" stroke="#4f6b2e" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    key: 'now',
    era: '2020년대',
    tag: '지금의 급식',
    title: '알레르기까지 챙기는 한 끼',
    desc: '19가지 알레르기 표시, 매일 바뀌는 메뉴, 계산된 칼로리까지. 이제 급식은 그냥 밥이 아니라 잘 설계된 한 끼예요.',
    bg: '/images/story/2020-now.jpg',
    bgTint: 'linear-gradient(140deg, #7a3a1c 0%, #2a1a12 70%)',
    from: '#f3bc63',
    to: '#c1391f',
    art: (
      <>
        <rect x="8" y="26" width="84" height="48" rx="9" fill="#fdf6e6" />
        <rect x="14" y="32" width="24" height="36" rx="5" fill="#f0e2c2" />
        <rect x="42" y="32" width="22" height="17" rx="5" fill="#d9533a" />
        <rect x="68" y="32" width="18" height="17" rx="5" fill="#8fae5f" />
        <rect x="42" y="53" width="44" height="15" rx="5" fill="#e8a33d" />
        <circle cx="80" cy="20" r="11" fill="#c1391f" />
        <path d="M80 15v6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="80" cy="25" r="1.4" fill="#fff" />
      </>
    ),
  },
]

// 마지막 '결론' 패널의 배경 사진 (식판 + 문구는 그대로 위에 올라갑니다)
const STORY_FINALE_BG = '/images/story/2020-now2.jpg'

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

  // 첫 화면 가로 스크롤 스토리 — 세로로 스크롤한 만큼 패널이 옆으로 밀립니다.
  const storyRef = useRef(null)
  const [storyProgress, setStoryProgress] = useState(0)
  const [storyHorizontal, setStoryHorizontal] = useState(false)

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

  // 좁은 화면이나 '모션 줄이기' 설정에서는 가로 스크롤 대신 위아래로 넘겨 보게 합니다.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 761px) and (prefers-reduced-motion: no-preference)')
    const apply = () => setStoryHorizontal(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!storyHorizontal) {
      setStoryProgress(0)
      return
    }
    const el = storyRef.current
    if (!el) return

    let frame = 0
    function update() {
      frame = 0
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) {
        setStoryProgress(0)
        return
      }
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total)
      setStoryProgress(scrolled / total)
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [storyHorizontal])

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
    searchInputRef.current?.focus({ preventScroll: true })

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

  // 헤더(학교 선택)는 페이지 맨 위에 있어서, 스토리를 스크롤한 뒤에는 화면 밖에 있습니다.
  // 그래서 맨 위로 올려 헤더를 보여준 다음 드롭다운을 엽니다.
  // stopPropagation: 이 클릭이 document 까지 올라가면 '바깥 클릭'으로 간주돼 방금 연 드롭다운이 다시 닫힙니다.
  function openSchoolPicker(e) {
    e.stopPropagation()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterOpen(true)
  }

  function goToSchoolMenu(s) {
    setSchool({ officeCode: s.officeCode, schoolCode: s.schoolCode, name: s.schoolName })
    navigate('/menu')
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero} ref={heroRef}>
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

        <div
          className={styles.story}
          ref={storyRef}
          data-horizontal={storyHorizontal ? 'true' : 'false'}
          style={storyHorizontal ? { height: `${(STORY_PANELS.length + 1) * 100}vh` } : undefined}
        >
          <div className={styles.storyViewport}>
            <svg className={styles.grainSvg} aria-hidden="true">
              <filter id="woodgrain">
                <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" seed="7" result="n" />
                <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#woodgrain)" />
            </svg>

            <div
              className={styles.storyTrack}
              style={
                storyHorizontal
                  ? { transform: `translate3d(-${storyProgress * STORY_PANELS.length * 100}%, 0, 0)` }
                  : undefined
              }
            >
              {STORY_PANELS.map((panel, i) => (
                <section key={panel.key} className={styles.storyPanel} data-photo={panel.bg ? 'true' : 'false'}>
                  <div
                    className={styles.storyBg}
                    style={panel.bg ? { backgroundImage: `url(${panel.bg})` } : { background: panel.bgTint }}
                  />
                  <div className={styles.storyPanelInner}>
                    {!panel.bg && (
                      <svg className={styles.storyArt} viewBox="0 0 100 100" aria-hidden="true">
                        <defs>
                          <linearGradient id={`storyGrad-${panel.key}`} x1="10%" y1="0%" x2="90%" y2="100%">
                            <stop offset="0%" stopColor={panel.from} />
                            <stop offset="100%" stopColor={panel.to} />
                          </linearGradient>
                        </defs>
                        <rect x="2" y="2" width="96" height="96" rx="28" fill={`url(#storyGrad-${panel.key})`} />
                        {panel.art}
                      </svg>
                    )}

                    <div className={styles.storyCopy}>
                      <p className={styles.storyEra}>{panel.era}</p>
                      <p className={styles.storyTag}>{panel.tag}</p>
                      <h2 className={styles.storyTitle}>{panel.title}</h2>
                      <p className={styles.storyDesc}>{panel.desc}</p>
                      {i === 0 && (
                        <p className={styles.storyCue}>
                          {storyHorizontal ? '스크롤하면 급식이 어떻게 바뀌었는지 이어져요' : '아래로 넘겨보세요'}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 6l6 6-6 6" />
                          </svg>
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              ))}

              <section className={styles.storyPanel}>
                <div className={styles.storyBg} style={{ backgroundImage: `url(${STORY_FINALE_BG})` }} />
                <div className={`${styles.storyPanelInner} ${styles.storyFinale}`}>
                  <div className={styles.storyTray}>
                    <MealTray />
                  </div>
                  <div className={styles.storyCopy}>
                    <p className={styles.storyEra}>그래서 오늘</p>
                    <h2 className={styles.storyFinaleTitle}>
                      이제는 밖에서 사 먹는 것보다
                      <br />
                      <em>급식</em>이 더 맛있어요
                    </h2>
                    <p className={styles.storyDesc}>
                      따끈한 밥 한 그릇에 국, 메인 반찬까지. 영양까지 계산해서 차려지는 한 끼를 지금 확인해보세요.
                    </p>
                    <a className={styles.storyMore} href="#more">
                      더 알아보기
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </section>
            </div>

            <div className={styles.storyFooter}>
              {school ? (
                <button type="button" className={styles.quickMenuBtn} onClick={() => navigate('/menu')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
                    <circle cx="12" cy="10" r="2.4" />
                  </svg>
                  {school.name} 급식 메뉴
                </button>
              ) : (
                <button type="button" className={styles.quickMenuBtn} onClick={openSchoolPicker}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M16.5 16.5L21 21" />
                  </svg>
                  학교 검색하기
                </button>
              )}
              {storyHorizontal && (
                <div className={styles.storyProgress}>
                  <span style={{ transform: `scaleX(${storyProgress})` }} />
                </div>
              )}
            </div>
          </div>
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
