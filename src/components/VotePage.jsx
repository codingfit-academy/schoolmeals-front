import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { castVote, fetchVotes } from '../api/engagement'
import { fetchYoutubeVideos } from '../api/youtube'
import styles from './VotePage.module.css'

const VOTED_STORAGE_KEY = 'schoolmeals:votedWeek'

const OPTIONS = [
  {
    key: 'a',
    title: '김치 한 입 먼저, 입맛 스타트',
    desc: '새콤한 배추김치로 입맛을 돋운 뒤 식사를 시작해요.',
    searchQuery: '김치 급식 먹방',
    from: '#e2673c',
    to: '#8a321b',
  },
  {
    key: 'b',
    title: '국물 먼저 호로록',
    desc: '뜨끈한 국으로 속을 데운 다음 나머지를 먹어요.',
    searchQuery: '된장찌개 급식 먹방',
    from: '#8a6234',
    to: '#3d2513',
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

function readVoted(week) {
  try {
    const raw = JSON.parse(localStorage.getItem(VOTED_STORAGE_KEY) ?? 'null')
    return raw?.week === week ? raw.optionKey : null
  } catch {
    return null
  }
}

export default function VotePage() {
  const [votes, setVotes] = useState(() => Object.fromEntries(OPTIONS.map((o) => [o.key, 0])))
  const [myVote, setMyVote] = useState(null)
  const [videos, setVideos] = useState({})

  useEffect(() => {
    let cancelled = false
    fetchVotes()
      .then(({ week, counts }) => {
        if (cancelled) return
        setVotes(Object.fromEntries(OPTIONS.map((o) => [o.key, counts[o.key] ?? 0])))
        setMyVote(readVoted(week))
      })
      .catch(() => {
        // 결과를 못 받아도 투표 자체는 할 수 있게 둔다
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    // 검색어당 서버가 유튜브를 1회만 호출하고, 이후에는 저장된 결과를 내려준다
    Promise.all(
      OPTIONS.map((o) =>
        fetchYoutubeVideos(o.searchQuery, 1)
          .then((rows) => [o.key, rows[0] ?? null])
          .catch(() => [o.key, null])
      )
    ).then((entries) => {
      if (!cancelled) setVideos(Object.fromEntries(entries))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const total = votes.a + votes.b
  const hasVoted = myVote !== null
  const pctA = total === 0 ? 50 : Math.round((votes.a / total) * 100)
  const pctB = 100 - pctA

  function handleVote(key) {
    if (hasVoted) return
    setVotes((prev) => ({ ...prev, [key]: prev[key] + 1 }))
    setMyVote(key)
    castVote(key)
      .then(({ week, count }) => {
        setVotes((prev) => ({ ...prev, [key]: count }))
        try {
          localStorage.setItem(VOTED_STORAGE_KEY, JSON.stringify({ week, optionKey: key }))
        } catch {
          // localStorage를 쓸 수 없는 환경이면 조용히 무시
        }
      })
      .catch(() => {
        setVotes((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }))
        setMyVote(null)
      })
  }

  function renderOption(opt, pct) {
    const voted = myVote === opt.key
    const isWinner = hasVoted && pct > 50
    const video = videos[opt.key]

    return (
      <button
        key={opt.key}
        type="button"
        className={styles.optionCard}
        data-voted={voted ? 'true' : 'false'}
        onClick={() => handleVote(opt.key)}
      >
        {isWinner && <span className={styles.winnerTag}>👑 BEST</span>}
        {voted && <span className={styles.checkBadge}>✓</span>}

        <div className={styles.thumb} style={{ background: `linear-gradient(135deg, ${opt.from}, ${opt.to})` }}>
          {video?.thumbnail && (
            <img className={styles.thumbImg} src={video.thumbnail} alt="" loading="lazy" />
          )}
          <div className={styles.thumbPlay}>
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#2a1a08">
                <path d="M6 4l14 8-14 8V4z" />
              </svg>
            </span>
          </div>
          {video?.duration && <span className={styles.thumbDuration}>{video.duration}</span>}
        </div>

        <p className={styles.videoTitle}>{video?.title ?? '영상을 불러오는 중이에요'}</p>
        <p className={styles.videoMeta}>
          {video ? `${video.channelTitle} · 조회수 ${video.views}` : ' '}
        </p>

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
