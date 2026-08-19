import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSchool } from '../context/SchoolContext'
import { fetchMeals } from '../api/schoolmeals'
import { parseDishes, parseKcal, ALLERGENS as ALLERGEN_DEFS } from '../utils/parseMeal'
import { monthRange, toYmd } from '../utils/date'
import styles from './CalendarPage.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const CHIP_COLORS = ['#e8a33d', '#c1391f', '#4f6b2e', '#874f22', '#565c5f', '#7a5028', '#a8321b', '#4f7a6b']

const ALLERGENS = ALLERGEN_DEFS.map((a, i) => ({
  key: a.key,
  label: `${a.label} 알레르기가 있어요`,
  color: CHIP_COLORS[i % CHIP_COLORS.length],
}))

const ALLERGEN_SHORT_LABEL = Object.fromEntries(ALLERGEN_DEFS.map((a) => [a.key, a.label]))

function buildMonthShell(year, month) {
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    cells.push({ day, date, isWeekend: date.getDay() === 0 || date.getDay() === 6 })
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export default function CalendarPage() {
  const { school } = useSchool()
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [activeAllergens, setActiveAllergens] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [mealMap, setMealMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const weeks = useMemo(() => buildMonthShell(cursor.year, cursor.month), [cursor])

  useEffect(() => {
    if (!school) return
    let cancelled = false
    setLoading(true)
    setError(null)
    const { fromYmd, toYmd: toYmdEnd } = monthRange(cursor.year, cursor.month)
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
        setMealMap(map)
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
  }, [school, cursor])

  const matchedCount = useMemo(() => {
    if (activeAllergens.length === 0) return 0
    let count = 0
    weeks.forEach((week) =>
      week.forEach((cell) => {
        const meal = cell && mealMap[toYmd(cell.date)]
        const dayAllergens = meal ? meal.dishes.flatMap((d) => d.allergens) : []
        if (dayAllergens.some((a) => activeAllergens.includes(a))) count += 1
      })
    )
    return count
  }, [weeks, mealMap, activeAllergens])

  useEffect(() => {
    if (!modalOpen) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') setModalOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [modalOpen])

  function toggleAllergen(key) {
    setActiveAllergens((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  function changeMonth(delta) {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const monthName = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-US', { month: 'long' }).toUpperCase()
  const isCurrentMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth()

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.backLink} to="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          홈으로
        </Link>
        <span className={styles.topbarTitle}>급식 달력표{school ? ` · ${school.name}` : ''}</span>
      </header>

      <div className={styles.sheet}>
        {!school && (
          <p className={styles.noteText}>
            아직 선택한 학교가 없어요. <Link to="/">홈으로 돌아가</Link> 학교를 먼저 선택해주세요.
          </p>
        )}

        {school && (
          <>
            <div className={styles.head}>
              <div className={styles.monthBlock}>
                <button
                  type="button"
                  className={styles.monthNav}
                  aria-label="이전 달"
                  onClick={() => changeMonth(-1)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
                <span className={styles.bigNum}>{cursor.month + 1}</span>
                <div className={styles.monthWords}>
                  <span className={styles.monthName}>{monthName}</span>
                  <span className={styles.yearName}>{cursor.year}</span>
                </div>
                <button
                  type="button"
                  className={styles.monthNav}
                  aria-label="다음 달"
                  onClick={() => changeMonth(1)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
                {!isCurrentMonth && (
                  <button type="button" className={styles.todayBtn} onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}>
                    오늘
                  </button>
                )}
              </div>

              <div className={styles.noteWrap}>
                <div className={styles.mascot} aria-hidden="true">
                  <svg viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="19" fill="#fdf1e6" stroke="#ef8a68" strokeWidth="2" />
                    <circle cx="20" cy="21.5" r="12" fill="#fbe3d8" />
                    <path d="M20.5 9 Q26 6.5 24.5 12.5 Q19.5 12.5 20.5 9Z" fill="#7fa050" />
                    <rect x="19" y="6.5" width="2.6" height="6" rx="1.3" fill="#4f6b2e" transform="rotate(-12 20 9)" />
                    <circle cx="16" cy="20.5" r="1.6" fill="#2a1a08" />
                    <circle cx="24" cy="20.5" r="1.6" fill="#2a1a08" />
                    <circle cx="13.5" cy="24.5" r="2" fill="#f0876a" opacity="0.55" />
                    <circle cx="26.5" cy="24.5" r="2" fill="#f0876a" opacity="0.55" />
                    <path d="M16 25 Q20 28 24 25" stroke="#2a1a08" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <p className={styles.eyebrow}>알레르기 안내</p>
                <p className={styles.noteText}>
                  아래에서 알레르기 항목을 선택하면, 급식에 그 성분이 들어간 날짜가
                  <b> 진한 빨간색</b>으로 표시돼요.
                </p>
              </div>
            </div>

            {loading && <p className={styles.noteText}>급식 정보를 불러오는 중이에요...</p>}
            {!loading && error && <p className={styles.noteText}>급식 정보를 불러오지 못했어요. ({error})</p>}

            <div className={styles.chipSection}>
              <button
                type="button"
                className={styles.allergyTrigger}
                data-active={activeAllergens.length > 0 ? 'true' : 'false'}
                aria-haspopup="dialog"
                onClick={() => setModalOpen(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3.5 21 20H3z" />
                  <path d="M12 10v4.5" />
                  <circle cx="12" cy="17.3" r="0.6" fill="currentColor" stroke="none" />
                </svg>
                알레르기가 있어요
                {activeAllergens.length > 0 && <span className={styles.triggerCount}>{activeAllergens.length}</span>}
              </button>
              {activeAllergens.length > 0 && (
                <p className={styles.matchSummary}>
                  이번 달 중 <b>{matchedCount}일</b>에 선택한 알레르기 성분이 포함된 급식이 있어요.
                </p>
              )}
            </div>

            <div className={styles.calendar}>
              <div className={styles.weekHeader}>
                {WEEKDAYS.map((w, i) => (
                  <span key={w} className={styles.weekHeaderCell} data-weekend={i === 0 || i === 6 ? 'true' : 'false'}>
                    {w}
                  </span>
                ))}
              </div>

              <div className={styles.grid}>
                {weeks.flatMap((week, wi) =>
                  week.map((cell, di) => {
                    if (!cell) return <div key={`${wi}-${di}`} className={styles.cellEmpty} />
                    const meal = mealMap[toYmd(cell.date)]
                    const dayAllergens = meal ? [...new Set(meal.dishes.flatMap((d) => d.allergens))] : []
                    const matched = activeAllergens.length > 0 && dayAllergens.some((a) => activeAllergens.includes(a))
                    const isToday = isCurrentMonth && cell.day === today.getDate()
                    const firstDish = meal?.dishes[0]?.name
                    const dishSummary = firstDish
                      ? meal.dishes.length > 1
                        ? `${firstDish} 외 ${meal.dishes.length - 1}개`
                        : firstDish
                      : null
                    return (
                      <div
                        key={`${wi}-${di}`}
                        className={styles.cell}
                        data-matched={matched ? 'true' : 'false'}
                        data-today={isToday ? 'true' : 'false'}
                      >
                        <span className={styles.cellDate} data-sun={di === 0 ? 'true' : 'false'} data-sat={di === 6 ? 'true' : 'false'}>
                          {cell.day}
                        </span>
                        {meal && (
                          <>
                            <span className={styles.cellDish}>{dishSummary}</span>
                            {matched ? (
                              <span className={styles.cellWarning}>
                                ⚠ {dayAllergens
                                  .filter((a) => activeAllergens.includes(a))
                                  .map((a) => ALLERGEN_SHORT_LABEL[a])
                                  .join(', ')}
                              </span>
                            ) : (
                              <span className={styles.cellDot} />
                            )}
                          </>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className={styles.legendBar}>
              <div className={styles.legendTab}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l2.6 5.6 6.2.7-4.6 4.2 1.2 6.1L12 16.8l-5.4 2.8 1.2-6.1-4.6-4.2 6.2-.7z" fill="#f0876a" />
                </svg>
                범례
              </div>
              <div className={styles.legendItems}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} />
                  급식이 있는 날
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendWarn}>⚠</span>
                  선택한 알레르기 성분이 포함된 날
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div
            className={styles.modalPanel}
            role="dialog"
            aria-modal="true"
            aria-label="알레르기 선택"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>알레르기 선택</p>
                <h2 className={styles.modalTitle}>해당하는 알레르기를 모두 골라주세요</h2>
              </div>
              <button type="button" className={styles.modalClose} aria-label="닫기" onClick={() => setModalOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalChipGrid}>
              {ALLERGENS.map((a) => {
                const active = activeAllergens.includes(a.key)
                return (
                  <button
                    key={a.key}
                    type="button"
                    className={styles.chip}
                    data-active={active ? 'true' : 'false'}
                    style={{ '--chip-color': a.color }}
                    aria-pressed={active ? 'true' : 'false'}
                    onClick={() => toggleAllergen(a.key)}
                  >
                    <span className={styles.chipDot} />
                    {a.label}
                  </button>
                )
              })}
            </div>

            {activeAllergens.length > 0 && (
              <p className={styles.matchSummary}>
                이번 달 중 <b>{matchedCount}일</b>에 선택한 알레르기 성분이 포함된 급식이 있어요.
              </p>
            )}

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalResetBtn}
                disabled={activeAllergens.length === 0}
                onClick={() => setActiveAllergens([])}
              >
                초기화
              </button>
              <button type="button" className={styles.modalDoneBtn} onClick={() => setModalOpen(false)}>
                완료{activeAllergens.length > 0 ? ` (${activeAllergens.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
