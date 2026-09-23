import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatDate } from '../utils/formatToday'
import { toYmd, monthRange, buildMonthShell } from '../utils/date'
import { parseDishes, parseKcal, ALLERGEN_LABEL } from '../utils/parseMeal'
import { fetchMeals, fetchMenuInsights, fetchVideoEatingGuide, likeSchoolMeal } from '../api/schoolmeals'
import { searchVideos, parseViewCount } from '../api/youtube'
import { useSchool } from '../context/SchoolContext'
import SchoolPicker from './SchoolPicker'
import styles from './TodayMenuPage.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const LIKED_MEALS_KEY = 'schoolmeals:likedMeals'

/** 유튜브 검색어. 백엔드의 youtube_caches 키와 반드시 같아야 하므로 여기서만 만듭니다. */
function buildVideoQuery(keyword) {
  return `${keyword} 먹방`
}

// 영양 밸런스 점수 링(원)의 둘레 — strokeDasharray로 점수만큼만 채우는 데 씁니다.
const BALANCE_RING_LENGTH = 2 * Math.PI * 34

function getLikedMealsSet() {
  try {
    const raw = localStorage.getItem(LIKED_MEALS_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveLikedMealsSet(set) {
  try {
    localStorage.setItem(LIKED_MEALS_KEY, JSON.stringify([...set]))
  } catch {
    // localStorage를 쓸 수 없는 환경이면 조용히 무시
  }
}

// 건강 포인트 신체 부위 → 인체 그림 위 대략적인 좌표 (viewBox 0 0 200 420, 정밀할 필요 없음)
const BODY_PART_POSITIONS = {
  뇌: { x: 100, y: 28 },
  눈: { x: 100, y: 38 },
  목: { x: 100, y: 66 },
  심장: { x: 86, y: 112 },
  폐: { x: 114, y: 106 },
  위장: { x: 100, y: 150 },
  장: { x: 100, y: 176 },
  근육: { x: 44, y: 140 },
  뼈: { x: 100, y: 320 },
  혈액: { x: 156, y: 160 },
  피부: { x: 100, y: 90 },
  면역력: { x: 100, y: 130 },
  전신: { x: 100, y: 200 },
}
const DEFAULT_BODY_POS = { x: 100, y: 200 }

/** 주말이면 가장 가까운 평일로 당겨줍니다 (토요일 → 금요일, 일요일 → 월요일). */
function nearestWeekday(date) {
  const day = date.getDay()
  if (day === 0) {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    return d
  }
  if (day === 6) {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    return d
  }
  return date
}

export default function TodayMenuPage() {
  const { school, setSchool } = useSchool()
  const [searchParams] = useSearchParams()
  const [meal, setMeal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [shareCopied, setShareCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [likeError, setLikeError] = useState(null)

  const [insights, setInsights] = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState(null)

  // 메뉴(밥·국·반찬)별 먹방 영상 — [{ dish, videos }] 형태이고 조회수 1위 메뉴가 맨 앞에 옵니다.
  const [dishVideos, setDishVideos] = useState([])
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState(null)
  const [slideIndex, setSlideIndex] = useState(0)
  const slidePausedRef = useRef(false)

  // 영상들을 AI가 읽고 정리한 '유튜버들이 가장 추천하는 식사법'
  const [videoGuide, setVideoGuide] = useState(null)
  const [guideLoading, setGuideLoading] = useState(false)
  const [guideError, setGuideError] = useState(null)

  // 인체 그림에서 선택된 건강 포인트 (같은 번호를 다시 누르면 꺼집니다)
  const [activePart, setActivePart] = useState(null)

  const today = useMemo(() => new Date(), [])
  // 상단 "오늘의 급식" 영역이 보여주는 날짜. 기본은 오늘(주말이면 가장 가까운 평일)이고,
  // 달력에서 다른 날짜를 클릭하면 그 날짜로 바뀝니다.
  const [displayDate, setDisplayDate] = useState(() => nearestWeekday(new Date()))
  const displayYmd = toYmd(displayDate)
  const isActualToday = displayYmd === toYmd(today)
  const displayIsWeekend = displayDate.getDay() === 0 || displayDate.getDay() === 6

  const [calCursor, setCalCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [calMealMap, setCalMealMap] = useState({})
  const [calLoading, setCalLoading] = useState(false)
  const [calError, setCalError] = useState(null)

  const calWeeks = useMemo(() => buildMonthShell(calCursor.year, calCursor.month), [calCursor])
  const calIsCurrentMonth = calCursor.year === today.getFullYear() && calCursor.month === today.getMonth()

  function goToToday() {
    setDisplayDate(nearestWeekday(new Date()))
    setCalCursor({ year: today.getFullYear(), month: today.getMonth() })
  }

  function selectCalendarDate(date) {
    setDisplayDate(date)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // URL에 학교 정보(office/school/name/region)가 담겨 있으면 그 학교로 맞춰줍니다 —
  // 친구가 공유한 링크로 들어왔을 때 바로 그 학교의 급식이 보이게 하기 위함입니다.
  useEffect(() => {
    const officeCode = searchParams.get('office')
    const schoolCode = searchParams.get('school')
    const name = searchParams.get('name')
    const region = searchParams.get('region')
    if (!officeCode || !schoolCode || !name) return
    if (school?.officeCode === officeCode && school?.schoolCode === schoolCode) return
    setSchool({ officeCode, schoolCode, name, region: region ?? '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  function buildShareUrl() {
    if (!school) return window.location.origin + '/menu'
    const params = new URLSearchParams({
      office: school.officeCode,
      school: school.schoolCode,
      name: school.name,
    })
    if (school.region) params.set('region', school.region)
    return `${window.location.origin}/menu?${params.toString()}`
  }

  async function handleShare() {
    const url = buildShareUrl()
    const shareData = {
      title: '오늘의 급식',
      text: school ? `${school.name}의 급식 시대을 확인해보세요!` : '오늘의 급식을 확인해보세요!',
      url,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
    } catch {
      // 공유 시트를 취소했거나 실패하면 클립보드 복사로 대체합니다.
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // 클립보드도 못 쓰는 환경이면 조용히 무시
    }
  }

  // displayDate가 바뀔 때마다 그 날짜의 급식을 불러옵니다.
  useEffect(() => {
    if (!school) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchMeals({
      officeCode: school.officeCode,
      schoolCode: school.schoolCode,
      ymd: displayYmd,
    })
      .then((rows) => {
        if (!cancelled) setMeal(rows[0] ?? null)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [school, displayYmd])

  // 이 학교×날짜 급식에 이미 좋아요를 눌렀는지 localStorage로 확인합니다 (중복 클릭 방지).
  useEffect(() => {
    if (!school) {
      setLiked(false)
      return
    }
    const key = `${school.officeCode}|${school.schoolCode}|${displayYmd}`
    setLiked(getLikedMealsSet().has(key))
  }, [school, displayYmd])

  async function handleLike() {
    if (!school || liked || likeLoading) return
    const key = `${school.officeCode}|${school.schoolCode}|${displayYmd}`
    setLikeLoading(true)
    setLikeError(null)
    try {
      await likeSchoolMeal({
        officeCode: school.officeCode,
        schoolCode: school.schoolCode,
        mealDate: displayYmd,
      })
      const set = getLikedMealsSet()
      set.add(key)
      saveLikedMealsSet(set)
      setLiked(true)
    } catch (err) {
      // 조용히 무시하면 버튼이 '안 눌리는' 것처럼 보이므로 이유를 보여줍니다.
      setLikeError(err.message)
    } finally {
      setLikeLoading(false)
    }
  }

  const dishes = meal ? parseDishes(meal.DDISH_NM) : []
  const totalKcal = meal ? parseKcal(meal.CAL_INFO) : null
  const dishNamesKey = dishes.map((d) => d.name).join('|')

  // AI(Gemini)가 오늘 메뉴를 한 번에 분석합니다 — 인기 메뉴 / 먹는 팁(있을 때만) / 건강 포인트.
  // 학교×날짜 단위로 서버에 캐시되어 그 학교의 그 날짜 페이지 최초 접속 때만 AI가 호출됩니다.
  useEffect(() => {
    if (!school || !dishNamesKey) {
      setInsights(null)
      return
    }
    let cancelled = false
    // 이전 날짜의 분석 결과를 남겨두면 아래 영상 검색이 옛 검색어를 써버리므로 먼저 비웁니다.
    setInsights(null)
    setInsightsLoading(true)
    setInsightsError(null)
    setActivePart(null)
    fetchMenuInsights({
      officeCode: school.officeCode,
      schoolCode: school.schoolCode,
      mealDate: displayYmd,
      dishes: dishNamesKey.split('|'),
    })
      .then((data) => {
        if (!cancelled) setInsights(data)
      })
      .catch((err) => {
        if (!cancelled) setInsightsError(err.message)
      })
      .finally(() => {
        if (!cancelled) setInsightsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [school, displayYmd, dishNamesKey])

  const eatingTip = insights?.eatingTip ?? null
  const healthNotes = insights?.healthNotes ?? []
  const balance = insights?.balance ?? null
  const searchKeywords = insights?.searchKeywords ?? []

  // 급식 표기('포크타코또띠아롤-')는 유튜브에서 잘 검색되지 않아, AI가 다듬어준 검색어('타코')로
  // 찾습니다. 분석이 끝나기 전에 미리 검색하면 같은 메뉴를 두 번 검색해 유튜브 할당량이 낭비되므로
  // 분석이 끝날 때까지(또는 실패할 때까지) 기다렸다가 한 번만 검색합니다.
  const insightsSettled = insights !== null || insightsError !== null
  const videoQueriesKey = useMemo(() => {
    if (!dishNamesKey || !insightsSettled) return ''
    const keywordByDish = new Map((insights?.searchKeywords ?? []).map((k) => [k.dish, k.keyword]))
    return dishNamesKey
      .split('|')
      .map((dish) => `${dish}>${keywordByDish.get(dish) || dish}`)
      .join('|')
  }, [dishNamesKey, insightsSettled, insights])

  // 메뉴마다 먹방 영상을 찾습니다. 어떤 메뉴가 1위인지는 AI가 아니라 실제 유튜브 조회수로 정합니다.
  // 검색어별로 서버에 캐시되어 같은 검색어는 유튜브 API를 다시 호출하지 않습니다.
  useEffect(() => {
    if (!videoQueriesKey) {
      setDishVideos([])
      return
    }
    let cancelled = false
    setVideoLoading(true)
    setVideoError(null)
    setSlideIndex(0)
    setVideoGuide(null)
    Promise.all(
      videoQueriesKey.split('|').map((pair) => {
        const [dish, query] = pair.split('>')
        return searchVideos(buildVideoQuery(query), 3)
          .then((videos) => ({ dish, videos }))
          .catch(() => ({ dish, videos: [] }))
      }),
    )
      .then((groups) => {
        if (cancelled) return
        const ranked = groups
          .map((group) => ({
            dish: group.dish,
            videos: [...group.videos].sort((a, b) => parseViewCount(b.views) - parseViewCount(a.views)),
          }))
          .filter((group) => group.videos.length > 0)
          .sort((a, b) => parseViewCount(b.videos[0].views) - parseViewCount(a.videos[0].views))
        setDishVideos(ranked)
      })
      .catch((err) => {
        if (!cancelled) setVideoError(err.message)
      })
      .finally(() => {
        if (!cancelled) setVideoLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [videoQueriesKey])

  // 메뉴별 영상이 슬라이더처럼 계속 넘어갑니다 (마우스를 올리면 잠시 멈춥니다).
  useEffect(() => {
    if (dishVideos.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      if (slidePausedRef.current) return
      setSlideIndex((i) => (i + 1) % dishVideos.length)
    }, 5000)
    return () => clearInterval(id)
  }, [dishVideos.length])

  const topDish = dishVideos[0] ?? null
  const topVideo = topDish?.videos[0] ?? null

  // 영상을 다 찾은 뒤에 그 영상들을 AI가 읽고 식사법을 정리합니다.
  // (서버가 이미 캐시해 둔 영상 정보를 쓰므로 검색어만 보냅니다.)
  // 학교×날짜 단위로 DB에 저장되어, 그 다음부터는 AI 호출 없이 저장된 값이 내려옵니다.
  useEffect(() => {
    if (!school || !videoQueriesKey || videoLoading || dishVideos.length === 0) return
    let cancelled = false
    setGuideLoading(true)
    setGuideError(null)
    fetchVideoEatingGuide({
      officeCode: school.officeCode,
      schoolCode: school.schoolCode,
      mealDate: displayYmd,
      // query는 실제로 유튜브 검색에 쓴 문자열 그대로여야 서버가 캐시를 찾을 수 있습니다.
      queries: videoQueriesKey.split('|').map((pair) => {
        const [dish, keyword] = pair.split('>')
        return { dish, query: buildVideoQuery(keyword) }
      }),
    })
      .then((data) => {
        if (!cancelled) setVideoGuide(data)
      })
      .catch((err) => {
        if (!cancelled) setGuideError(err.message)
      })
      .finally(() => {
        if (!cancelled) setGuideLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [school, displayYmd, videoQueriesKey, videoLoading, dishVideos.length])

  // 달력별 급식표 — 선택한 달의 급식을 한 번에 불러와 날짜별로 매핑합니다.
  useEffect(() => {
    if (!school) return
    let cancelled = false
    setCalLoading(true)
    setCalError(null)
    const { fromYmd, toYmd: toYmdEnd } = monthRange(calCursor.year, calCursor.month)
    fetchMeals({
      officeCode: school.officeCode,
      schoolCode: school.schoolCode,
      fromYmd,
      toYmd: toYmdEnd,
    })
      .then((rows) => {
        if (cancelled) return
        const map = {}
        rows.forEach((row) => {
          map[row.MLSV_YMD] = {
            dishes: parseDishes(row.DDISH_NM),
            kcal: parseKcal(row.CAL_INFO),
          }
        })
        setCalMealMap(map)
      })
      .catch((err) => {
        if (!cancelled) setCalError(err.message)
      })
      .finally(() => {
        if (!cancelled) setCalLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [school, calCursor])

  function changeCalMonth(delta) {
    setCalCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const calMonthName = new Date(calCursor.year, calCursor.month, 1).toLocaleDateString('en-US', { month: 'long' }).toUpperCase()

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.backLink} to="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          홈으로
        </Link>
        <SchoolPicker />
      </header>

      <section className={styles.section}>
        <div className={styles.introHead}>
          <p className={styles.eyebrow}>{isActualToday ? '오늘의 식단' : '급식 정보'}</p>
          <h1>{formatDate(displayDate)} 급식은 이렇게 차려졌어요</h1>
          <div className={styles.introHeadActions}>
            {!isActualToday && (
              <button type="button" className={styles.backToTodayBtn} onClick={goToToday}>
                급식 시대으로 돌아가기
              </button>
            )}
            {school && (
              <button type="button" className={styles.shareBtn} onClick={handleShare}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8" />
                </svg>
                {shareCopied ? '링크를 복사했어요' : '공유하기'}
              </button>
            )}
          </div>
        </div>

        {!school && (
          <p className={styles.lede}>
            아직 선택한 학교가 없어요. <Link to="/">홈으로 돌아가</Link> 학교를 먼저 선택해주세요.
          </p>
        )}

        {school && (
          <p className={styles.lede}>
            {isActualToday
              ? `${school.name}의 오늘 점심 식단이에요. 실제 배식은 학교 사정에 따라 조금씩 달라질 수 있어요.`
              : `${school.name}의 ${formatDate(displayDate)} 점심 식단이에요.`}
          </p>
        )}

        {school && loading && <p className={styles.lede}>급식 정보를 불러오는 중이에요...</p>}
        {school && !loading && error && (
          <p className={styles.lede}>급식 정보를 불러오지 못했어요. ({error})</p>
        )}
        {school && !loading && !error && !meal && (
          <p className={styles.lede}>
            {displayIsWeekend
              ? '이 날은 주말이라 급식이 없어요.'
              : '이 날은 등록된 급식 정보가 없어요. (방학·휴교일 등)'}
          </p>
        )}

        {school && !loading && !error && meal && (
          <>
            <ul className={styles.menuList}>
              {dishes.map((dish) => (
                <li key={dish.name} className={styles.menuChip}>
                  <b>{dish.name}</b>
                  {dish.allergens.length > 0 && (
                    <span>{dish.allergens.map((a) => ALLERGEN_LABEL[a]).join(', ')}</span>
                  )}
                </li>
              ))}
              {totalKcal != null && (
                <li className={`${styles.menuChip} ${styles.menuTotal}`}>
                  <b>총 칼로리</b>
                  <span>{totalKcal}kcal</span>
                </li>
              )}
            </ul>

            <button
              type="button"
              className={styles.likeBtn}
              data-liked={liked ? 'true' : 'false'}
              disabled={liked || likeLoading}
              onClick={handleLike}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20.5s-7.5-4.6-10-9.3C.4 8 1.8 4.5 5 3.5c2.1-.7 4.2.1 5.5 1.9L12 7.5l1.5-2.1c1.3-1.8 3.4-2.6 5.5-1.9 3.2 1 4.6 4.5 3 7.7-2.5 4.7-10 9.3-10 9.3z" />
              </svg>
              {liked ? '좋아요를 눌렀어요' : '이 급식 좋아요'}
            </button>
            {likeError && <p className={styles.videoNote}>좋아요를 저장하지 못했어요. ({likeError})</p>}
          </>
        )}
      </section>

      {school && meal && (
        <div className={`${styles.section} ${styles.sectionFlush}`}>
          <Link to="/game" className={styles.violenceBanner} aria-label="학교폭력 예방 게임 하러 가기">
            {/* 배너 그림 전체가 하나의 이미지처럼 보이고, 어디를 눌러도 게임으로 이동합니다.
                실제 사진을 쓰고 싶으면 public/images/ 에 파일을 넣고 이 svg를 <img>로 바꾸면 됩니다. */}
            <svg className={styles.violenceArt} viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <linearGradient id="violenceSky" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4d6fa8" />
                  <stop offset="55%" stopColor="#3a5a8f" />
                  <stop offset="100%" stopColor="#2b3f63" />
                </linearGradient>
                <linearGradient id="violenceGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              <rect width="1200" height="400" fill="url(#violenceSky)" />
              <circle cx="980" cy="90" r="190" fill="#ffffff" opacity="0.07" />
              <circle cx="1090" cy="300" r="140" fill="#ffffff" opacity="0.05" />
              <rect width="1200" height="200" fill="url(#violenceGlow)" />

              {/* 손을 맞잡은 두 친구 */}
              <g transform="translate(820 120)">
                <circle cx="0" cy="40" r="34" fill="#f6d5b4" />
                <path d="M-42 92 Q0 68 42 92 L46 210 L-46 210 Z" fill="#e8a33d" />
                <circle cx="150" cy="40" r="34" fill="#f0c49c" />
                <path d="M108 92 Q150 68 192 92 L196 210 L104 210 Z" fill="#f2f2f0" />
                <path d="M40 150 Q75 128 110 150" stroke="#ffffff" strokeWidth="13" fill="none" strokeLinecap="round" />
                <path d="M62 120 l13 -13 l13 13 l-13 13 z" fill="#ff8c8c" />
              </g>

              {/* 지켜주는 방패 */}
              <g transform="translate(150 118) scale(1.5)">
                <path d="M60 0 L112 22 V78 C112 112 88 136 60 148 C32 136 8 112 8 78 V22 Z" fill="#ffffff" opacity="0.95" />
                <path d="M38 74 l16 16 l30 -34" stroke="#3a5a8f" strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>

            <span className={styles.violenceOverlay}>
              <span className={styles.violenceKicker}>학교폭력 예방 캠페인</span>
              <b className={styles.violenceHeadline}>학교폭력, 얼마나 알고 있나요?</b>
              <span className={styles.violenceSub}>
                퀴즈를 풀면서 무엇이 학교폭력인지, 어떻게 대처해야 하는지 함께 알아봐요.
              </span>
              <span className={styles.violenceCta}>
                게임하러 가기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </span>
            </span>
          </Link>
        </div>
      )}

      {dishes.length > 0 && (
        <section className={styles.section}>
          <p className={styles.eyebrow}>먹방 영상</p>
          <h2 className={styles.sectionTitle}>오늘 메뉴마다 먹방 영상을 모았어요</h2>
          {searchKeywords.length > 0 && (
            <p className={styles.aiTag}>
              <span>AI</span> 급식 표기를 유튜브에서 잘 찾히는 검색어로 다듬었어요
            </p>
          )}

          {insightsLoading && <p className={styles.videoNote}>AI가 검색어를 다듬고 있어요...</p>}
          {videoLoading && <p className={styles.videoNote}>메뉴별로 먹방 영상을 찾고 있어요...</p>}
          {!videoLoading && videoError && (
            <p className={styles.videoNote}>영상을 불러오지 못했어요. ({videoError})</p>
          )}
          {!videoLoading && !videoError && dishVideos.length === 0 && (
            <p className={styles.videoNote}>관련 영상을 아직 찾지 못했어요.</p>
          )}

          {!videoLoading && topDish && topVideo && (
            <a className={styles.videoHero} href={topVideo.url} target="_blank" rel="noreferrer">
              <div
                className={styles.videoHeroThumb}
                style={{ backgroundImage: `url(${topVideo.thumbnail})` }}
              >
                <span className={styles.videoHeroBadge}>조회수 1위 · {topDish.dish}</span>
                <div className={`${styles.thumbPlay} ${styles.thumbPlayBig}`}>
                  <span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#2a1a08">
                      <path d="M6 4l14 8-14 8V4z" />
                    </svg>
                  </span>
                </div>
                {topVideo.duration && <span className={styles.thumbDuration}>{topVideo.duration}</span>}
              </div>
              <div className={styles.videoHeroMeta}>
                <p className={styles.videoHeroDish}>{topDish.dish}</p>
                <h3>{topVideo.title}</h3>
                <p>{topVideo.channelTitle}{topVideo.views ? ` · 조회수 ${topVideo.views}` : ''}</p>
              </div>
            </a>
          )}

          {dishVideos.length > 0 && (
            <div
              className={styles.slider}
              onMouseEnter={() => { slidePausedRef.current = true }}
              onMouseLeave={() => { slidePausedRef.current = false }}
              onTouchStart={() => { slidePausedRef.current = true }}
            >
              <div className={styles.sliderTabs}>
                {dishVideos.map((group, i) => (
                  <button
                    key={group.dish}
                    type="button"
                    className={styles.sliderTab}
                    data-active={i === slideIndex ? 'true' : 'false'}
                    onClick={() => setSlideIndex(i)}
                  >
                    {group.dish}
                  </button>
                ))}
              </div>

              <div className={styles.sliderViewport}>
                <div
                  className={styles.sliderTrack}
                  style={{ transform: `translateX(-${slideIndex * 100}%)` }}
                >
                  {dishVideos.map((group, i) => (
                    <div key={group.dish} className={styles.sliderSlide} aria-hidden={i !== slideIndex}>
                      <div className={styles.videoGrid}>
                        {group.videos.map((video) => (
                          <a
                            key={video.videoId}
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.videoCard}
                            tabIndex={i === slideIndex ? 0 : -1}
                          >
                            <div
                              className={styles.thumb}
                              style={{ backgroundImage: `url(${video.thumbnail})` }}
                            >
                              <div className={styles.thumbPlay}>
                                <span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#2a1a08">
                                    <path d="M6 4l14 8-14 8V4z" />
                                  </svg>
                                </span>
                              </div>
                              {video.duration && <span className={styles.thumbDuration}>{video.duration}</span>}
                            </div>
                            <div className={styles.videoMeta}>
                              <h3>{video.title}</h3>
                              <p>{video.channelTitle}{video.views ? ` · 조회수 ${video.views}` : ''}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.sliderDots}>
                {dishVideos.map((group, i) => (
                  <button
                    key={group.dish}
                    type="button"
                    className={styles.sliderDot}
                    aria-label={`${group.dish} 영상 보기`}
                    aria-current={i === slideIndex ? 'true' : 'false'}
                    onClick={() => setSlideIndex(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {(guideLoading || guideError || videoGuide?.summary || videoGuide?.topMethod) && (
        <section className={styles.section}>
          <p className={styles.eyebrow}>유튜버들의 식사법</p>
          <h2 className={styles.sectionTitle}>유튜버들이 가장 추천하는 식사법</h2>
          <p className={styles.aiTag}>
            <span>AI</span> 위 먹방 영상들의 제목과 설명을 AI가 읽고 정리했어요
          </p>

          {guideLoading && (
            <p className={styles.videoNote}>영상들을 읽고 어떻게 먹는지 정리하고 있어요...</p>
          )}
          {!guideLoading && guideError && (
            <p className={styles.videoNote}>식사법을 불러오지 못했어요. ({guideError})</p>
          )}

          {!guideLoading && videoGuide?.summary && (
            <p className={styles.lede}>{videoGuide.summary}</p>
          )}

          {!guideLoading && videoGuide?.topMethod && (
            <div className={styles.topMethodCard}>
              <span className={styles.topMethodBadge}>영상에서 가장 많이 나온 방법</span>
              <p className={styles.topMethodDish}>{videoGuide.topMethod.dish}</p>
              <h3 className={styles.topMethodName}>{videoGuide.topMethod.method}</h3>
              <p className={styles.topMethodHowTo}>{videoGuide.topMethod.howTo}</p>
              <p className={styles.topMethodWhy}>{videoGuide.topMethod.why}</p>
            </div>
          )}

          {!guideLoading && videoGuide?.methods?.length > 0 && (
            <div className={styles.methodGrid}>
              {videoGuide.methods.map((method, i) => (
                <div key={i} className={styles.methodCard}>
                  <p className={styles.methodDish}>{method.dish}</p>
                  <h3 className={styles.methodName}>{method.method}</h3>
                  <p className={styles.methodHowTo}>{method.howTo}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {school && meal && (
        <div className={styles.section}>
          <Link to="/calendar" className={styles.allergyBanner}>
            <span className={styles.allergyBannerIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5 21 20H3z" />
                <path d="M12 10v4.5" />
                <circle cx="12" cy="17.3" r="0.6" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className={styles.allergyBannerText}>
              <b>알레르기가 있나요?</b>
              <p>급식 달력에서 알레르기 성분이 들어간 날짜를 한눈에 확인해보세요.</p>
            </span>
            <svg className={styles.allergyBannerArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      )}

      {school && meal && (insightsLoading || insightsError) && (
        <div className={styles.section}>
          <p className={styles.videoNote}>
            {insightsLoading
              ? 'AI가 오늘 메뉴를 분석하고 있어요...'
              : 'AI 분석은 지금 불러올 수 없어요. 급식과 먹방 영상은 그대로 볼 수 있어요.'}
          </p>
        </div>
      )}

      {(eatingTip || healthNotes.length > 0 || balance) && (
        <section className={styles.section}>
          <div
            className={
              eatingTip && (healthNotes.length > 0 || balance)
                ? styles.tipsHealthGrid
                : `${styles.tipsHealthGrid} ${styles.tipsHealthGridSingle}`
            }
          >
            {eatingTip && (
              <div className={styles.tipsHealthCol}>
                <p className={styles.eyebrow}>맛있게 먹는 방법</p>
                <h2 className={styles.sectionTitle}>{eatingTip.dish}, 이렇게 먹으면 더 맛있어요</h2>
                <div className={styles.eatingTipCard}>
                  <p>{eatingTip.tip}</p>
                </div>
              </div>
            )}

            {(healthNotes.length > 0 || balance) && (
              <div className={styles.tipsHealthCol}>
                <p className={styles.eyebrow}>건강 포인트</p>
                <h2 className={styles.sectionTitle}>이 급식은 몸의 이런 곳에 도움이 돼요</h2>

                {balance && (
                  <div className={styles.balanceCard}>
                    <svg className={styles.balanceRing} viewBox="0 0 84 84" aria-hidden="true">
                      <circle className={styles.balanceRingTrack} cx="42" cy="42" r="34" />
                      <circle
                        className={styles.balanceRingValue}
                        cx="42"
                        cy="42"
                        r="34"
                        style={{
                          strokeDasharray: BALANCE_RING_LENGTH,
                          strokeDashoffset: BALANCE_RING_LENGTH * (1 - balance.score / 100),
                        }}
                      />
                      <text className={styles.balanceRingText} x="42" y="42" textAnchor="middle" dy="0.35em">
                        {balance.score}
                      </text>
                    </svg>
                    <div className={styles.balanceBody}>
                      <p className={styles.aiTag}>
                        <span>AI</span> 급식 시대 영양 밸런스 점수
                      </p>
                      <p className={styles.balanceSummary}>{balance.summary}</p>
                      {balance.groups.length > 0 && (
                        <ul className={styles.balanceGroups}>
                          {balance.groups.map((group) => (
                            <li key={group.group} data-level={group.level}>
                              {group.group}
                              <b>{group.level}</b>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {healthNotes.length > 0 && (
                <div className={styles.healthShowcase}>
                  <svg className={styles.bodyDiagram} viewBox="0 0 200 420">
                    <defs>
                      <linearGradient id="bodyFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--amber-100)" />
                        <stop offset="100%" stopColor="var(--surface-2)" />
                      </linearGradient>
                      <radialGradient id="bodyGlow" cx="50%" cy="34%" r="50%">
                        <stop offset="0%" stopColor="var(--amber-500)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--amber-500)" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect x="0" y="0" width="200" height="420" fill="url(#bodyGlow)" />
                    {/* 머리 */}
                    <ellipse className={styles.bodyShape} cx="100" cy="34" rx="23" ry="27" />
                    {/* 목 */}
                    <path className={styles.bodyShape} d="M85 56 L85 74 Q100 83 115 74 L115 56 Z" />
                    {/* 오른팔 */}
                    <path
                      className={styles.bodyShape}
                      d="M66 96 C50 102 40 118 37 142 C34 168 35 196 40 220 C42 232 47 240 54 242
                         C60 240 62 233 60 224 C56 200 55 175 58 150 C60 130 68 112 74 100 Z"
                    />
                    {/* 왼팔 */}
                    <path
                      className={styles.bodyShape}
                      d="M134 96 C150 102 160 118 163 142 C166 168 165 196 160 220 C158 232 153 240 146 242
                         C140 240 138 233 140 224 C144 200 145 175 142 150 C140 130 132 112 126 100 Z"
                    />
                    {/* 몸통 */}
                    <path
                      className={styles.bodyShape}
                      d="M60 98 C60 86 72 80 86 78 L114 78 C128 80 140 86 140 98 C143 125 141 155 133 182
                         C138 192 137 205 130 214 L70 214 C63 205 62 192 67 182 C59 155 57 125 60 98 Z"
                    />
                    {/* 오른다리 */}
                    <path
                      className={styles.bodyShape}
                      d="M70 212 C64 240 62 270 64 300 C66 330 68 360 72 388 C73 396 78 402 86 402
                         C92 402 94 396 93 388 C90 360 88 330 89 300 C90 270 92 242 96 214 Z"
                    />
                    {/* 왼다리 */}
                    <path
                      className={styles.bodyShape}
                      d="M130 212 C136 240 138 270 136 300 C134 330 132 360 128 388 C127 396 122 402 114 402
                         C108 402 106 396 107 388 C110 360 112 330 111 300 C110 270 108 242 104 214 Z"
                    />
                    {/* 발 */}
                    <ellipse className={styles.bodyShape} cx="90" cy="406" rx="14" ry="7" />
                    <ellipse className={styles.bodyShape} cx="110" cy="406" rx="14" ry="7" />

                    {healthNotes.map((note, i) => {
                      const base = BODY_PART_POSITIONS[note.bodyPart] ?? DEFAULT_BODY_POS
                      const dupIndex = healthNotes.slice(0, i).filter((n) => n.bodyPart === note.bodyPart).length
                      const pos = { x: base.x + dupIndex * 14, y: base.y }
                      const isActive = activePart === i
                      return (
                        <g
                          key={i}
                          className={styles.bodyDot}
                          data-active={isActive ? 'true' : 'false'}
                          data-dim={activePart !== null && !isActive ? 'true' : 'false'}
                          transform={`translate(${pos.x} ${pos.y})`}
                          role="button"
                          tabIndex={0}
                          aria-label={`${note.bodyPart} 건강 포인트`}
                          onClick={() => setActivePart(isActive ? null : i)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setActivePart(isActive ? null : i)
                            }
                          }}
                        >
                          <circle className={styles.bodyDotPulse} r="11" />
                          <circle className={styles.bodyDotCore} r="11" />
                          <text textAnchor="middle" dy="0.32em">{i + 1}</text>
                        </g>
                      )
                    })}
                  </svg>

                  {activePart !== null && healthNotes[activePart] ? (
                    <div key={activePart} className={styles.bodyDetail}>
                      <span className={styles.bodyDetailPart}>{healthNotes[activePart].bodyPart}</span>
                      <p>{healthNotes[activePart].note}</p>
                    </div>
                  ) : (
                    <p className={styles.bodyHint}>번호를 누르면 몸의 어디에 좋은지 자세히 보여줘요</p>
                  )}

                  <ul className={styles.healthList}>
                    {healthNotes.map((note, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          className={styles.healthItem}
                          data-active={activePart === i ? 'true' : 'false'}
                          onClick={() => setActivePart(activePart === i ? null : i)}
                        >
                          <span className={styles.healthListNum}>{i + 1}</span>
                          <span className={styles.healthItemBody}>
                            <b>{note.bodyPart}</b>
                            <span>{note.note}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {school && (
        <section className={styles.section}>
          <p className={styles.eyebrow}>달력별 급식표</p>
          <h2 className={styles.sectionTitle}>{school.name}의 이번 달 급식이에요</h2>
          <p className={styles.lede}>날짜를 누르면 위쪽 오늘의 급식이 그 날짜 기준으로 바뀌어요.</p>

          <div className={styles.calHead}>
            <button type="button" className={styles.calNav} aria-label="이전 달" onClick={() => changeCalMonth(-1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <span className={styles.calMonthLabel}>{calMonthName} {calCursor.year}</span>
            <button type="button" className={styles.calNav} aria-label="다음 달" onClick={() => changeCalMonth(1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            {!calIsCurrentMonth && (
              <button type="button" className={styles.calTodayBtn} onClick={goToToday}>
                오늘
              </button>
            )}
          </div>

          {calLoading && <p className={styles.lede}>급식표를 불러오는 중이에요...</p>}
          {!calLoading && calError && <p className={styles.lede}>급식표를 불러오지 못했어요. ({calError})</p>}

          {!calLoading && !calError && (
            <>
              <div className={styles.calWeekHeader}>
                {WEEKDAYS.map((w, i) => (
                  <span key={w} className={styles.calWeekHeaderCell} data-weekend={i === 0 || i === 6 ? 'true' : 'false'}>
                    {w}
                  </span>
                ))}
              </div>

              <div className={styles.calGrid}>
                {calWeeks.flatMap((week, wi) =>
                  week.map((cell, di) => {
                    if (!cell) return <div key={`${wi}-${di}`} className={styles.calCellEmpty} />
                    const cellYmd = toYmd(cell.date)
                    const cellMeal = calMealMap[cellYmd]
                    const isToday = calIsCurrentMonth && cell.day === today.getDate()
                    const isSelected = cellYmd === displayYmd
                    return (
                      <button
                        key={`${wi}-${di}`}
                        type="button"
                        className={styles.calCell}
                        data-today={isToday ? 'true' : 'false'}
                        data-selected={isSelected ? 'true' : 'false'}
                        onClick={() => selectCalendarDate(cell.date)}
                      >
                        <span className={styles.calCellDate} data-sun={di === 0 ? 'true' : 'false'} data-sat={di === 6 ? 'true' : 'false'}>
                          {cell.day}
                        </span>
                        {cellMeal && (
                          <span className={styles.calCellDishList}>
                            {cellMeal.dishes.map((dish) => (
                              <span key={dish.name} className={styles.calCellDishItem}>{dish.name}</span>
                            ))}
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
