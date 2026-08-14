import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './CalendarPage.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const CHIP_COLORS = ['#e8a33d', '#c1391f', '#4f6b2e', '#874f22', '#565c5f', '#7a5028', '#a8321b', '#4f7a6b']

const ALLERGENS = [
  { key: 'peanut', label: '땅콩 알레르기가 있어요' },
  { key: 'dairy', label: '유제품 알레르기가 있어요' },
  { key: 'egg', label: '달걀 알레르기가 있어요' },
  { key: 'wheat', label: '밀가루 알레르기가 있어요' },
  { key: 'soy', label: '대두(콩) 알레르기가 있어요' },
  { key: 'buckwheat', label: '메밀 알레르기가 있어요' },
  { key: 'walnut', label: '호두 알레르기가 있어요' },
  { key: 'pinenut', label: '잣 알레르기가 있어요' },
  { key: 'shrimp', label: '새우 알레르기가 있어요' },
  { key: 'crab', label: '게 알레르기가 있어요' },
  { key: 'squid', label: '오징어 알레르기가 있어요' },
  { key: 'shellfish', label: '조개류 알레르기가 있어요' },
  { key: 'mackerel', label: '고등어 알레르기가 있어요' },
  { key: 'pork', label: '돼지고기 알레르기가 있어요' },
  { key: 'beef', label: '쇠고기 알레르기가 있어요' },
  { key: 'chicken', label: '닭고기 알레르기가 있어요' },
  { key: 'peach', label: '복숭아 알레르기가 있어요' },
  { key: 'tomato', label: '토마토 알레르기가 있어요' },
  { key: 'sulfite', label: '아황산류 알레르기가 있어요' },
].map((a, i) => ({ ...a, color: CHIP_COLORS[i % CHIP_COLORS.length] }))

const ALLERGEN_LABEL = Object.fromEntries(ALLERGENS.map((a) => [a.key, a.label.replace(' 알레르기가 있어요', '')]))

const MENU_TEMPLATES = [
  { dish: '돈까스 정식', allergens: ['wheat', 'egg', 'dairy', 'pork'] },
  { dish: '된장찌개·제육볶음', allergens: ['soy', 'pork'] },
  { dish: '카레라이스', allergens: ['wheat', 'dairy'] },
  { dish: '짜장밥', allergens: ['wheat', 'soy', 'pork'] },
  { dish: '고등어구이 정식', allergens: ['mackerel', 'soy'] },
  { dish: '새우튀김·잡채', allergens: ['shrimp', 'wheat', 'egg'] },
  { dish: '떡볶이·계란찜', allergens: ['wheat', 'egg'] },
  { dish: '미역국·소불고기', allergens: ['beef', 'soy'] },
  { dish: '닭갈비 정식', allergens: ['chicken', 'soy', 'wheat'] },
  { dish: '우동·유부초밥', allergens: ['wheat', 'soy'] },
]

function buildMonth(year, month) {
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)

  let weekdayCount = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    let menu = null
    if (!isWeekend) {
      menu = MENU_TEMPLATES[weekdayCount % MENU_TEMPLATES.length]
      weekdayCount += 1
    }
    cells.push({ day, date, isWeekend, menu })
  }

  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export default function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [activeAllergens, setActiveAllergens] = useState([])
  const [modalOpen, setModalOpen] = useState(false)

  const weeks = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor])

  const matchedCount = useMemo(() => {
    if (activeAllergens.length === 0) return 0
    let count = 0
    weeks.forEach((week) =>
      week.forEach((cell) => {
        if (cell?.menu?.allergens.some((a) => activeAllergens.includes(a))) count += 1
      })
    )
    return count
  }, [weeks, activeAllergens])

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
        <span className={styles.topbarTitle}>급식 달력표</span>
      </header>

      <div className={styles.sheet}>
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
                const matched = activeAllergens.length > 0 && cell.menu?.allergens.some((a) => activeAllergens.includes(a))
                const isToday = isCurrentMonth && cell.day === today.getDate()
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
                    {cell.menu && (
                      <>
                        <span className={styles.cellDish}>{cell.menu.dish}</span>
                        {matched ? (
                          <span className={styles.cellWarning}>
                            ⚠ {cell.menu.allergens
                              .filter((a) => activeAllergens.includes(a))
                              .map((a) => ALLERGEN_LABEL[a])
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
