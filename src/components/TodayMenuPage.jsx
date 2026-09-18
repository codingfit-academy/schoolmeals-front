import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatToday } from '../utils/formatToday'
import { toYmd, monthRange, buildMonthShell } from '../utils/date'
import { parseDishes, parseKcal, ALLERGEN_LABEL } from '../utils/parseMeal'
import { fetchMeals, fetchMenuInsights } from '../api/schoolmeals'
import { searchVideos, parseViewCount } from '../api/youtube'
import { useSchool } from '../context/SchoolContext'
import SchoolPicker from './SchoolPicker'
import styles from './TodayMenuPage.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

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

function formatDetailDate(ymd) {
  const y = Number(ymd.slice(0, 4))
  const m = Number(ymd.slice(4, 6)) - 1
  const d = Number(ymd.slice(6, 8))
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date(y, m, d))
}

export default function TodayMenuPage() {
  const { school } = useSchool()
  const [meal, setMeal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [insights, setInsights] = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState(null)

  const [videos, setVideos] = useState([])
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState(null)

  const today = useMemo(() => new Date(), [])
  const [calCursor, setCalCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [calMealMap, setCalMealMap] = useState({})
  const [calLoading, setCalLoading] = useState(false)
  const [calError, setCalError] = useState(null)
  const [calSelectedDate, setCalSelectedDate] = useState(null)

  const calWeeks = useMemo(() => buildMonthShell(calCursor.year, calCursor.month), [calCursor])
  const calIsCurrentMonth = calCursor.year === today.getFullYear() && calCursor.month === today.getMonth()

  useEffect(() => {
    if (!school) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchMeals({
      officeCode: school.officeCode,
      schoolCode: school.schoolCode,
      ymd: toYmd(new Date()),
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
  }, [school])

  const dishes = meal ? parseDishes(meal.DDISH_NM) : []
  const totalKcal = meal ? parseKcal(meal.CAL_INFO) : null
  const mainDish = dishes[0]?.name ?? null
  const dishNamesKey = dishes.map((d) => d.name).join('|')
  const todayYmd = toYmd(today)

  // AI(Gemini)가 오늘 메뉴를 한 번에 분석합니다 — 인기 메뉴 / 먹는 팁(있을 때만) / 건강 포인트.
  // 학교×날짜 단위로 서버에 캐시되어 그 학교의 그 날짜 페이지 최초 접속 때만 AI가 호출됩니다.
  useEffect(() => {
    if (!school || !dishNamesKey) {
      setInsights(null)
      return
    }
    let cancelled = false
    setInsightsLoading(true)
    setInsightsError(null)
    fetchMenuInsights({
      officeCode: school.officeCode,
      schoolCode: school.schoolCode,
      mealDate: todayYmd,
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
  }, [school, todayYmd, dishNamesKey])

  const favoriteDish = insights?.favorite ?? null
  const eatingTip = insights?.eatingTip ?? null
  const healthNotes = insights?.healthNotes ?? []

  // AI가 고른 메뉴가 준비되면 그 메뉴로, 실패하면 첫 메뉴로 영상을 검색합니다.
  const videoTopic = favoriteDish ?? (insightsError ? mainDish : null)

  // 먹방 영상 (YouTube) — 조회수가 가장 높은 영상을 메인으로 둡니다.
  useEffect(() => {
    if (!videoTopic) return
    let cancelled = false
    setVideoLoading(true)
    setVideoError(null)
    searchVideos(`${videoTopic} 급식 먹방`, 4)
      .then((data) => {
        if (!cancelled) {
          const sorted = [...data].sort((a, b) => parseViewCount(b.views) - parseViewCount(a.views))
          setVideos(sorted)
        }
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
  }, [videoTopic])

  const [mainVideo, ...sideVideos] = videos

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

  useEffect(() => {
    setCalSelectedDate(null)
  }, [calCursor, school])

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
          <p className={styles.eyebrow}>오늘의 식단</p>
          <h1>{formatToday()} 급식은 이렇게 차려졌어요</h1>
        </div>

        {!school && (
          <p className={styles.lede}>
            아직 선택한 학교가 없어요. <Link to="/">홈으로 돌아가</Link> 학교를 먼저 선택해주세요.
          </p>
        )}

        {school && (
          <p className={styles.lede}>
            {school.name}의 오늘 점심 식단이에요. 실제 배식은 학교 사정에 따라 조금씩 달라질 수 있어요.
          </p>
        )}

        {school && loading && <p className={styles.lede}>급식 정보를 불러오는 중이에요...</p>}
        {school && !loading && error && (
          <p className={styles.lede}>급식 정보를 불러오지 못했어요. ({error})</p>
        )}
        {school && !loading && !error && !meal && (
          <p className={styles.lede}>오늘은 등록된 급식 정보가 없어요. (주말·방학·휴교일 등)</p>
        )}

        {school && !loading && !error && meal && (
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
        )}
      </section>

      {school && (
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

      {mainDish && (
        <section className={styles.section}>
          <p className={styles.eyebrow}>먹방 영상</p>
          <h2 className={styles.sectionTitle}>오늘 급식 먹는 영상 보러가기</h2>

          {insightsLoading && (
            <p className={styles.videoNote}>AI가 오늘 메뉴 중 가장 좋아할 만한 메뉴를 고르고 있어요...</p>
          )}
          {!insightsLoading && videoTopic && (
            <p className={styles.videoTopicNote}>
              AI가 고른 오늘의 인기 메뉴 · <b>{videoTopic}</b>
            </p>
          )}

          {videoTopic && videoLoading && <p className={styles.videoNote}>영상을 불러오는 중이에요...</p>}
          {videoTopic && !videoLoading && videoError && (
            <p className={styles.videoNote}>영상을 불러오지 못했어요. ({videoError})</p>
          )}
          {videoTopic && !videoLoading && !videoError && videos.length === 0 && (
            <p className={styles.videoNote}>관련 영상을 아직 찾지 못했어요.</p>
          )}
          {videoTopic && !videoLoading && !videoError && mainVideo && (
            <div className={styles.videoShowcase}>
              <a
                href={mainVideo.url}
                target="_blank"
                rel="noreferrer"
                className={styles.videoMain}
              >
                <div
                  className={styles.videoMainThumb}
                  style={{ backgroundImage: `url(${mainVideo.thumbnail})` }}
                >
                  <div className={`${styles.thumbPlay} ${styles.thumbPlayBig}`}>
                    <span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#2a1a08">
                        <path d="M6 4l14 8-14 8V4z" />
                      </svg>
                    </span>
                  </div>
                  {mainVideo.duration && <span className={styles.thumbDuration}>{mainVideo.duration}</span>}
                </div>
                <div className={styles.videoMainMeta}>
                  <h3>{mainVideo.title}</h3>
                  <p>{mainVideo.channelTitle}{mainVideo.views ? ` · 조회수 ${mainVideo.views}` : ''}</p>
                </div>
              </a>

              {sideVideos.length > 0 && (
                <div className={styles.videoSideList}>
                  {sideVideos.map((video) => (
                    <a
                      key={video.videoId}
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.videoCard}
                    >
                      <div
                        className={styles.thumb}
                        style={{ backgroundImage: `url(${video.thumbnail})` }}
                      >
                        <div className={styles.thumbPlay}>
                          <span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#2a1a08">
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
              )}
            </div>
          )}
        </section>
      )}

      {eatingTip && (
        <section className={styles.section}>
          <p className={styles.eyebrow}>맛있게 먹는 방법</p>
          <h2 className={styles.sectionTitle}>{eatingTip.dish}, 이렇게 먹으면 더 맛있어요</h2>
          <div className={styles.eatingTipCard}>
            <p>{eatingTip.tip}</p>
          </div>
        </section>
      )}

      {healthNotes.length > 0 && (
        <section className={styles.section}>
          <p className={styles.eyebrow}>건강 포인트</p>
          <h2 className={styles.sectionTitle}>오늘 급식은 몸의 이런 곳에 도움이 돼요</h2>

          <div className={styles.healthShowcase}>
            <svg className={styles.bodyDiagram} viewBox="0 0 200 420" aria-hidden="true">
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
                return (
                  <g key={i} className={styles.bodyDot} transform={`translate(${pos.x} ${pos.y})`}>
                    <circle r="11" />
                    <text textAnchor="middle" dy="0.32em">{i + 1}</text>
                  </g>
                )
              })}
            </svg>

            <ul className={styles.healthList}>
              {healthNotes.map((note, i) => (
                <li key={i}>
                  <span className={styles.healthListNum}>{i + 1}</span>
                  <div>
                    <b>{note.bodyPart}</b>
                    <p>{note.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {school && (
        <section className={styles.section}>
          <p className={styles.eyebrow}>달력별 급식표</p>
          <h2 className={styles.sectionTitle}>{school.name}의 이번 달 급식이에요</h2>

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
              <button
                type="button"
                className={styles.calTodayBtn}
                onClick={() => setCalCursor({ year: today.getFullYear(), month: today.getMonth() })}
              >
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
                    const isSelected = calSelectedDate === cellYmd
                    return (
                      <button
                        key={`${wi}-${di}`}
                        type="button"
                        className={styles.calCell}
                        data-today={isToday ? 'true' : 'false'}
                        data-selected={isSelected ? 'true' : 'false'}
                        onClick={() => setCalSelectedDate((prev) => (prev === cellYmd ? null : cellYmd))}
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

              {calSelectedDate && (
                <div className={styles.calDetail}>
                  <div className={styles.calDetailHead}>
                    <p className={styles.eyebrow}>{formatDetailDate(calSelectedDate)}</p>
                    <button type="button" className={styles.calDetailClose} aria-label="닫기" onClick={() => setCalSelectedDate(null)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                  {!calMealMap[calSelectedDate] && (
                    <p className={styles.lede}>이 날은 급식 정보가 없어요. 주말·방학·공휴일이거나, 아직 등록되지 않았을 수 있어요.</p>
                  )}
                  {calMealMap[calSelectedDate] && (
                    <>
                      <ul className={styles.calDishList}>
                        {calMealMap[calSelectedDate].dishes.map((dish, i) => (
                          <li key={i}>
                            <span>{dish.name}</span>
                            {dish.allergens.length > 0 && (
                              <span className={styles.calDishAllergens}>
                                {dish.allergens.map((a) => ALLERGEN_LABEL[a]).join(', ')}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {calMealMap[calSelectedDate].kcal != null && (
                        <p className={styles.calDetailKcal}>총 {calMealMap[calSelectedDate].kcal}kcal</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  )
}
