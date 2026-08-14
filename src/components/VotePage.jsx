import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './VotePage.module.css'

const OPTIONS = [
  {
    key: 'a',
    title: '김치 한 입 먼저, 입맛 스타트',
    desc: '새콤한 배추김치로 입맛을 돋운 뒤 식사를 시작해요.',
    baseline: 214,
    video: {
      title: '김치 없인 못 살아, 급식 브이로그',
      channel: '밥친구 소라',
      duration: '6:45',
      views: '5.2만',
      from: '#e2673c',
      to: '#8a321b',
    },
  },
  {
    key: 'b',
    title: '국물 먼저 호로록',
    desc: '뜨끈한 국으로 속을 데운 다음 나머지를 먹어요.',
    baseline: 253,
    video: {
      title: '된장찌개 국물까지 완샷! 급식 먹방',
      channel: '든든한 한끼',
      duration: '11:03',
      views: '8.7만',
      from: '#8a6234',
      to: '#3d2513',
    },
  },
]

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  const fmt = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일`
  return `${fmt(monday)} - ${fmt(friday)}`
}

const WEEK_RANGE = getWeekRange()

export default function VotePage() {
  const [votes, setVotes] = useState(() => Object.fromEntries(OPTIONS.map((o) => [o.key, o.baseline])))
  const [myVote, setMyVote] = useState(null)

  const total = votes.a + votes.b
  const hasVoted = myVote !== null
  const pctA = Math.round((votes.a / total) * 100)
  const pctB = 100 - pctA

  function castVote(key) {
    if (key === myVote) return
    setVotes((prev) => {
      const next = { ...prev }
      if (myVote) next[myVote] -= 1
      next[key] += 1
      return next
    })
    setMyVote(key)
  }

  function renderOption(opt, pct) {
    const voted = myVote === opt.key
    const isWinner = hasVoted && pct > 50

    return (
      <button
        key={opt.key}
        type="button"
        className={styles.optionCard}
        data-voted={voted ? 'true' : 'false'}
        onClick={() => castVote(opt.key)}
      >
        {isWinner && <span className={styles.winnerTag}>👑 BEST</span>}
        {voted && <span className={styles.checkBadge}>✓</span>}

        <div className={styles.thumb} style={{ background: `linear-gradient(135deg, ${opt.video.from}, ${opt.video.to})` }}>
          <div className={styles.thumbPlay}>
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#2a1a08">
                <path d="M6 4l14 8-14 8V4z" />
              </svg>
            </span>
          </div>
          <span className={styles.thumbDuration}>{opt.video.duration}</span>
        </div>

        <p className={styles.videoTitle}>{opt.video.title}</p>
        <p className={styles.videoMeta}>{opt.video.channel} · 조회수 {opt.video.views}</p>

        <p className={styles.optionLabel}>{opt.title}</p>
        <p className={styles.optionDesc}>{opt.desc}</p>

        {hasVoted && (
          <span className={styles.pctBig} data-winner={isWinner ? 'true' : 'false'}>
            {pct}%
          </span>
        )}
      </button>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.backLink} to="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          홈으로
        </Link>
        <span className={styles.topbarTitle}>메뉴 투표</span>
      </header>

      <div className={styles.sheet}>
        <p className={styles.eyebrow}>메뉴 투표</p>
        <h1 className={styles.title}>김치파 vs 국물파, 뭐가 더 맛있게 먹는 방법일까요?</h1>
        <p className={styles.lede}>
          먹방 유튜버들의 영상을 참고한 두 가지 먹는 방법 중, 더 맛있다고 생각하는 쪽에 투표해보세요.
          더 많이 뽑힌 쪽이 이번 주 <b>BEST 먹는 방법</b>이 돼요.
        </p>

        <div className={styles.vsRow}>
          {renderOption(OPTIONS[0], pctA)}
          <span className={styles.vsBadge}>VS</span>
          {renderOption(OPTIONS[1], pctB)}
        </div>

        {hasVoted && (
          <div className={styles.battleBar}>
            <span className={styles.battleFillA} style={{ width: `${pctA}%` }} />
            <span className={styles.battleFillB} style={{ width: `${pctB}%` }} />
          </div>
        )}

        <div className={styles.metaRow}>
          <span>투표 기간 {WEEK_RANGE}</span>
          {hasVoted && (
            <>
              <span aria-hidden="true">·</span>
              <span>참여 {total.toLocaleString('ko-KR')}명</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
