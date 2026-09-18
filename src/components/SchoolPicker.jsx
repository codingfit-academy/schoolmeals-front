import { useEffect, useRef, useState } from 'react'
import { fetchSchools } from '../api/schoolmeals'
import { useSchool } from '../context/SchoolContext'
import styles from './SchoolPicker.module.css'

const REGIONS = ['서울', '경기']

/**
 * 학교를 검색해서 바꿀 수 있는 드롭다운. useSchool() context를 직접 갱신하므로,
 * 어느 페이지에 놓든 학교가 바뀌면 그 페이지의 데이터가 알아서 다시 로드됩니다.
 */
export default function SchoolPicker() {
  const { school, setSchool } = useSchool()
  const filterRef = useRef(null)
  const searchInputRef = useRef(null)

  const [open, setOpen] = useState(false)
  const [region, setRegion] = useState(school?.region || REGIONS[0])
  const [search, setSearch] = useState('')
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    searchInputRef.current?.focus()

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchSchools(region)
      .then((data) => {
        if (!cancelled) setSchools(data)
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
  }, [region])

  const visibleSchools = schools.filter((s) => s.name?.includes(search.trim()))

  return (
    <div className={styles.filter} data-open={open ? 'true' : 'false'} ref={filterRef}>
      <button
        type="button"
        className={styles.filterBtn}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.4" />
        </svg>
        <span>{school?.name || '학교를 선택하세요'}</span>
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
          {loading && <li className={styles.emptySchools}>학교 목록을 불러오는 중이에요...</li>}
          {!loading && error && <li className={styles.emptySchools}>학교 목록을 불러오지 못했어요.</li>}
          {!loading && !error && visibleSchools.length === 0 && (
            <li className={styles.emptySchools}>검색 결과가 없어요.</li>
          )}
          {!loading &&
            !error &&
            visibleSchools.map((s, i) => (
              <li key={`${s.schoolCode}-${i}`}>
                <button
                  type="button"
                  onClick={() => {
                    setSchool(s)
                    setOpen(false)
                  }}
                >
                  {s.name}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
