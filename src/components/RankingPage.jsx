import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_SCHOOLS, RANK_CATEGORIES, totalScore } from '../data/mockSchoolRanking'
import styles from './RankingPage.module.css'

const CHEER_KEY = 'schoolmeals:cheeredSchools'

function readCheered() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CHEER_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

export default function RankingPage() {
  const [category, setCategory] = useState('total')
  const [cheered, setCheered] = useState(readCheered)

  function cheer(id) {
    if (cheered.has(id)) return
    const next = new Set(cheered).add(id)
    setCheered(next)
    try {
      localStorage.setItem(CHEER_KEY, JSON.stringify([...next]))
    } catch {
      // 저장소를 못 쓰면 이번 화면에서만 반영됩니다
    }
  }

  const ranked = useMemo(() => {
    const score = (s) => (category === 'total' ? totalScore(s.scores) : s.scores[category])
    return MOCK_SCHOOLS.map((s) => ({ ...s, value: score(s) })).sort((a, b) => b.value - a.value)
  }, [category])

  const [first, second, third] = ranked
  const podium = [second, first, third]

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.back}>← 홈으로</Link>
        <span className={styles.demo}>예시 데이터</span>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>학교 급식 대결</p>
        <h1>우리 학교가 더 맛있어요!</h1>
        <p className={styles.lede}>학교마다 자랑하는 급식이 달라요. 어느 학교 급식이 1등일까요?</p>
      </section>

      <div className={styles.tabs} role="tablist">
        {RANK_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={category === c.key ? 'true' : 'false'}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <section className={styles.podium}>
        {podium.map((s) => {
          const rank = ranked.indexOf(s) + 1
          return (
            <div key={s.id} className={styles.podiumItem} data-rank={rank}>
              <span className={styles.podiumMood}>{s.mood}</span>
              <b className={styles.podiumName}>{s.name}</b>
              <span className={styles.podiumValue}>{s.value}점</span>
              <div className={styles.podiumBar} style={{ background: `linear-gradient(160deg, ${s.from}, ${s.to})` }}>
                {rank}
              </div>
            </div>
          )
        })}
      </section>

      <ol className={styles.list}>
        {ranked.map((s, i) => {
          const likes = s.likes + (cheered.has(s.id) ? 1 : 0)
          return (
            <li key={s.id} className={styles.card}>
              <div className={styles.cardHead} style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
                <span className={styles.rankNum}>{i + 1}</span>
                <span className={styles.mood}>{s.mood}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>
                  <b>{s.name}</b>
                  <span>{s.area} · {s.kind}</span>
                </div>
                <p className={styles.tagline}>“{s.tagline}”</p>
                <p className={styles.signature}>대표 메뉴 · <b>{s.signature}</b></p>

                <div className={styles.bars}>
                  {RANK_CATEGORIES.slice(1).map((c) => (
                    <div key={c.key} className={styles.barRow} data-on={category === c.key ? 'true' : 'false'}>
                      <span>{c.label}</span>
                      <div className={styles.barTrack}>
                        <i style={{ width: `${s.scores[c.key]}%`, background: s.to }} />
                      </div>
                      <em>{s.scores[c.key]}</em>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className={styles.cheer}
                  data-on={cheered.has(s.id) ? 'true' : 'false'}
                  disabled={cheered.has(s.id)}
                  onClick={() => cheer(s.id)}
                >
                  {cheered.has(s.id) ? '응원했어요' : '우리 학교가 더 맛있어요'} · {likes.toLocaleString('ko-KR')}
                </button>
              </div>
            </li>
          )
        })}
      </ol>

      <p className={styles.note}>
        이 화면의 학교와 점수는 순위 화면을 보여주기 위한 예시 데이터이며, 실제 학교와 관련이 없어요.
      </p>
    </div>
  )
}
