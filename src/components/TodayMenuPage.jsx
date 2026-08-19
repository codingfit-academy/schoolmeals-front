import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatToday } from '../utils/formatToday'
import { toYmd } from '../utils/date'
import { parseDishes, parseKcal, ALLERGEN_LABEL } from '../utils/parseMeal'
import { fetchMeals } from '../api/schoolmeals'
import { useSchool } from '../context/SchoolContext'
import styles from './TodayMenuPage.module.css'

export default function TodayMenuPage() {
  const { school } = useSchool()
  const [meal, setMeal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
    </div>
  )
}
