import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getChosung } from '../utils/hangul'
import styles from './GamePage.module.css'

const ROUND_LENGTH = 8

const OX_QUESTIONS = [
  {
    statement: '친구가 싫어하는 행동을 알면서도 계속하는 것은 학교폭력이 아니다.',
    answer: false,
    explain: '싫다는 뜻을 밝혔는데도 반복하면 그것도 괴롭힘, 즉 학교폭력에 해당해요.',
  },
  {
    statement: '학교폭력은 직접 때리는 것만 해당된다.',
    answer: false,
    explain: '따돌림, 욕설, 협박, 단톡방 괴롭힘처럼 몸에 손대지 않아도 학교폭력이 될 수 있어요.',
  },
  {
    statement: '장난으로 한 말이었다면 학교폭력이 아니다.',
    answer: false,
    explain: '듣는 사람이 괴로웠다면 의도와 상관없이 학교폭력이 될 수 있어요.',
  },
  {
    statement: '여러 명이 한 명을 계속 따돌리는 것도 학교폭력이다.',
    answer: true,
    explain: '집단 따돌림은 대표적인 학교폭력 유형이에요.',
  },
  {
    statement: '단체 채팅방에서 한 사람만 빼고 놀리는 것도 학교폭력이다.',
    answer: true,
    explain: '사이버 따돌림, 사이버 폭력도 엄연한 학교폭력이에요.',
  },
  {
    statement: '학교폭력을 목격하면 모르는 척 지나가도 괜찮다.',
    answer: false,
    explain: '방관하면 문제가 더 커질 수 있어요. 선생님이나 어른에게 알리는 게 중요해요.',
  },
  {
    statement: '친구의 돈이나 물건을 억지로 빼앗는 것도 학교폭력이다.',
    answer: true,
    explain: '이런 행동을 금품갈취라고 부르며, 학교폭력에 해당돼요.',
  },
  {
    statement: '학교폭력을 당하면 혼자 참는 게 가장 좋은 방법이다.',
    answer: false,
    explain: '혼자 참지 말고 선생님, 부모님, 학교폭력 신고센터(117)에 꼭 알려야 해요.',
  },
  {
    statement: '다른 사람 몰래 찍은 사진이나 영상을 퍼뜨리는 것도 학교폭력이다.',
    answer: true,
    explain: '명예훼손이나 모욕에 해당하는 학교폭력이에요.',
  },
  {
    statement: '학교폭력 신고는 이름을 밝히지 않고도 할 수 있다.',
    answer: true,
    explain: '학교전담경찰관이나 117 신고센터는 익명 신고도 가능해요.',
  },
]

const CHOSUNG_QUESTIONS = [
  { word: '따돌림', hint: '친구를 무리에서 일부러 빼고 어울리지 않는 것' },
  { word: '방관자', hint: '학교폭력을 보고도 모른 척하는 사람' },
  { word: '신고', hint: '문제가 생겼을 때 선생님이나 기관에 알리는 것' },
  { word: '존중', hint: '다른 사람의 마음과 입장을 소중히 여기는 것' },
  { word: '배려', hint: '다른 사람을 생각해서 마음을 써주는 것' },
  { word: '사과', hint: '잘못을 인정하고 미안하다고 말하는 것' },
  { word: '화해', hint: '다툰 사람들끼리 마음을 풀고 다시 좋아지는 것' },
  { word: '우정', hint: '친구 사이의 다정한 마음' },
  { word: '상담', hint: '고민을 선생님이나 전문가와 이야기 나누는 것' },
  { word: '용기', hint: "옳지 않은 일에 '아니야'라고 말할 수 있는 힘" },
]

const SHORT_QUESTIONS = [
  { question: '학교폭력을 당했을 때 가장 먼저 해야 할 행동은 무엇일까요?', accepted: ['신고', '신고하기', '알리기', '도움요청'] },
  { question: '학교폭력을 보고도 못 본 척하는 사람을 무엇이라고 부를까요?', accepted: ['방관자'] },
  { question: '여러 사람이 한 사람을 따돌리는 행동을 무엇이라고 할까요?', accepted: ['따돌림'] },
  { question: '학교폭력 신고 대표 전화번호는 국번 없이 몇 번일까요?', accepted: ['117'] },
  { question: '친구의 돈이나 물건을 억지로 빼앗는 행동을 무엇이라고 할까요?', accepted: ['금품갈취', '갈취'] },
  { question: '다투고 나서 서로 마음을 풀고 다시 사이좋아지는 것을 무엇이라고 할까요?', accepted: ['화해'] },
  { question: '상대방의 입장에서 마음과 감정을 헤아리는 태도를 무엇이라고 할까요?', accepted: ['배려', '공감'] },
]

const WORD_QUESTIONS = [
  { clue: '친구를 무리에서 따로 떼어놓고 함께 어울리지 않는 행동', answer: '따돌림' },
  { clue: '학교폭력을 보고도 모르는 척 지나가는 사람', answer: '방관자' },
  { clue: '문제가 생겼을 때 선생님이나 기관에 사실을 알리는 것', answer: '신고' },
  { clue: '다른 사람의 생각과 마음을 소중히 여기는 태도', answer: '존중' },
  { clue: '잘못했을 때 미안한 마음을 표현하는 것', answer: '사과' },
  { clue: '인터넷이나 메신저를 이용해 괴롭히는 행동', answer: '사이버폭력' },
  { clue: '돈이나 물건을 강제로 빼앗는 행동', answer: '금품갈취' },
  { clue: '다투었던 사람과 마음을 풀고 다시 가까워지는 것', answer: '화해' },
]

const MODES = [
  {
    key: 'word',
    label: '단어맞추기',
    desc: '힌트를 보고 빈칸 채우기',
    icon: (
      <>
        <rect x="3" y="10" width="4.5" height="7" rx="1" />
        <rect x="9.75" y="10" width="4.5" height="7" rx="1" />
        <rect x="16.5" y="10" width="4.5" height="7" rx="1" />
        <path d="M6 6h12" />
      </>
    ),
  },
  {
    key: 'ox',
    label: 'OX퀴즈',
    desc: '맞으면 O, 틀리면 X',
    icon: (
      <>
        <circle cx="8" cy="12" r="5.5" />
        <path d="M14.5 6.5l7 11M21.5 6.5l-7 11" />
      </>
    ),
  },
  {
    key: 'short',
    label: '주관식퀴즈',
    desc: '질문에 답을 직접 입력',
    icon: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </>
    ),
  },
  {
    key: 'chosung',
    label: '초성퀴즈',
    desc: '초성을 보고 단어 맞히기',
    icon: (
      <>
        <text x="3.5" y="16.5" fontSize="11" fontWeight="700" stroke="none" fill="currentColor">ㄱㄴㄷ</text>
      </>
    ),
  },
]

const MODE_LABEL = Object.fromEntries(MODES.map((m) => [m.key, m.label]))

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function normalize(str) {
  return (str || '').trim().replace(/\s+/g, '')
}

function buildQueue(modeKey) {
  let pool
  if (modeKey === 'mixed') {
    pool = shuffle([
      ...OX_QUESTIONS.map((q) => ({ type: 'ox', ...q })),
      ...CHOSUNG_QUESTIONS.map((q) => ({ type: 'chosung', ...q })),
      ...SHORT_QUESTIONS.map((q) => ({ type: 'short', ...q })),
      ...WORD_QUESTIONS.map((q) => ({ type: 'word', ...q })),
    ])
  } else if (modeKey === 'ox') {
    pool = shuffle(OX_QUESTIONS.map((q) => ({ type: 'ox', ...q })))
  } else if (modeKey === 'chosung') {
    pool = shuffle(CHOSUNG_QUESTIONS.map((q) => ({ type: 'chosung', ...q })))
  } else if (modeKey === 'short') {
    pool = shuffle(SHORT_QUESTIONS.map((q) => ({ type: 'short', ...q })))
  } else {
    pool = shuffle(WORD_QUESTIONS.map((q) => ({ type: 'word', ...q })))
  }
  return pool.slice(0, Math.min(ROUND_LENGTH, pool.length))
}

function resultMessage(score, total) {
  const ratio = score / total
  if (ratio === 1) return { emoji: '🏆', title: '완벽해요! 학교폭력 척척박사예요' }
  if (ratio >= 0.7) return { emoji: '👏', title: '잘했어요! 학교폭력에 대해 잘 알고 있네요' }
  if (ratio >= 0.4) return { emoji: '💪', title: '조금 더 알아볼까요? 다시 도전해봐요' }
  return { emoji: '🌱', title: '학교폭력에 대해 함께 더 알아가요' }
}

export default function GamePage() {
  const [screen, setScreen] = useState('menu')
  const [mode, setMode] = useState('mixed')
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedBool, setSelectedBool] = useState(null)

  const current = queue[index]

  function startRound(modeKey) {
    setMode(modeKey)
    setQueue(buildQueue(modeKey))
    setIndex(0)
    setScore(0)
    setAnswered(false)
    setIsCorrect(false)
    setInputValue('')
    setSelectedBool(null)
    setScreen('play')
  }

  function submitOx(bool) {
    if (answered) return
    const correct = bool === current.answer
    setSelectedBool(bool)
    setIsCorrect(correct)
    setAnswered(true)
    if (correct) setScore((s) => s + 1)
  }

  function submitText(e) {
    e.preventDefault()
    if (answered || !inputValue.trim()) return
    const accepted = current.type === 'short' ? current.accepted : [current.word ?? current.answer]
    const correct = accepted.map(normalize).includes(normalize(inputValue))
    setIsCorrect(correct)
    setAnswered(true)
    if (correct) setScore((s) => s + 1)
  }

  function nextQuestion() {
    if (index + 1 >= queue.length) {
      setScreen('done')
      return
    }
    setIndex((i) => i + 1)
    setAnswered(false)
    setIsCorrect(false)
    setInputValue('')
    setSelectedBool(null)
  }

  function backToMenu() {
    setScreen('menu')
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
        <span className={styles.topbarTitle}>급식 게임</span>
      </header>

      {screen === 'menu' && (
        <div className={styles.sheet}>
          <p className={styles.eyebrow}>급식 게임</p>
          <h1 className={styles.title}>학교폭력, 얼마나 알고 있나요?</h1>
          <p className={styles.lede}>
            퀴즈를 풀면서 학교폭력이 무엇인지, 어떻게 대처해야 하는지 함께 알아봐요.
            친구를 배려하는 마음이 더 안전한 학교를 만들어요.
          </p>

          <button type="button" className={styles.mixedBtn} onClick={() => startRound('mixed')}>
            <span className={styles.mixedBtnIcon} aria-hidden="true">🎲</span>
            <span>
              <span className={styles.mixedBtnTitle}>전체 랜덤으로 시작하기</span>
              <span className={styles.mixedBtnDesc}>네 가지 유형이 무작위로 섞여서 나와요</span>
            </span>
          </button>

          <div className={styles.modeGrid}>
            {MODES.map((m) => (
              <button key={m.key} type="button" className={styles.modeCard} onClick={() => startRound(m.key)}>
                <span className={styles.modeIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {m.icon}
                  </svg>
                </span>
                <span className={styles.modeLabel}>{m.label}</span>
                <span className={styles.modeDesc}>{m.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === 'play' && current && (
        <div className={styles.sheet}>
          <div className={styles.playHead}>
            <span className={styles.typeBadge}>{MODE_LABEL[current.type]}</span>
            <span className={styles.progressText}>
              {index + 1} / {queue.length}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${((index + (answered ? 1 : 0)) / queue.length) * 100}%` }} />
          </div>

          <div className={styles.questionCard}>
            {current.type === 'ox' && (
              <>
                <p className={styles.statement}>{current.statement}</p>
                <div className={styles.oxRow}>
                  <button
                    type="button"
                    className={styles.oxBtn}
                    data-variant="o"
                    data-picked={selectedBool === true ? 'true' : 'false'}
                    data-locked={answered ? 'true' : 'false'}
                    onClick={() => submitOx(true)}
                    disabled={answered}
                  >
                    O
                  </button>
                  <button
                    type="button"
                    className={styles.oxBtn}
                    data-variant="x"
                    data-picked={selectedBool === false ? 'true' : 'false'}
                    data-locked={answered ? 'true' : 'false'}
                    onClick={() => submitOx(false)}
                    disabled={answered}
                  >
                    X
                  </button>
                </div>
              </>
            )}

            {current.type === 'chosung' && (
              <>
                <p className={styles.hintLabel}>힌트: {current.hint}</p>
                <p className={styles.chosungDisplay}>{getChosung(current.word)}</p>
                <form className={styles.answerForm} onSubmit={submitText}>
                  <input
                    className={styles.answerInput}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="정답을 입력하세요"
                    disabled={answered}
                    autoComplete="off"
                  />
                  <button type="submit" className={styles.submitBtn} disabled={answered || !inputValue.trim()}>
                    확인
                  </button>
                </form>
              </>
            )}

            {current.type === 'short' && (
              <>
                <p className={styles.statement}>{current.question}</p>
                <form className={styles.answerForm} onSubmit={submitText}>
                  <input
                    className={styles.answerInput}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="정답을 입력하세요"
                    disabled={answered}
                    autoComplete="off"
                  />
                  <button type="submit" className={styles.submitBtn} disabled={answered || !inputValue.trim()}>
                    확인
                  </button>
                </form>
              </>
            )}

            {current.type === 'word' && (
              <>
                <p className={styles.hintLabel}>{current.clue}</p>
                <div className={styles.blankRow}>
                  {Array.from({ length: current.answer.length }).map((_, i) => (
                    <span key={i} className={styles.blankTile}>
                      {answered ? current.answer[i] : inputValue[i] || ''}
                    </span>
                  ))}
                </div>
                <form className={styles.answerForm} onSubmit={submitText}>
                  <input
                    className={styles.answerInput}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="정답을 입력하세요"
                    disabled={answered}
                    autoComplete="off"
                    maxLength={current.answer.length}
                  />
                  <button type="submit" className={styles.submitBtn} disabled={answered || !inputValue.trim()}>
                    확인
                  </button>
                </form>
              </>
            )}

            {answered && (
              <div className={styles.feedback} data-correct={isCorrect ? 'true' : 'false'}>
                <p className={styles.feedbackTitle}>
                  {isCorrect
                    ? '정답이에요! 🎉'
                    : `아쉬워요. 정답은 "${
                        current.type === 'ox'
                          ? current.answer
                            ? 'O'
                            : 'X'
                          : current.word ?? current.answer ?? current.accepted?.[0]
                      }"예요.`}
                </p>
                {current.explain && <p className={styles.feedbackExplain}>{current.explain}</p>}
                <button type="button" className={styles.nextBtn} onClick={nextQuestion}>
                  {index + 1 >= queue.length ? '결과 보기' : '다음 문제'}
                </button>
              </div>
            )}
          </div>

          <div className={styles.scoreRow}>
            현재 점수 <b>{score}</b> / {queue.length}
          </div>
        </div>
      )}

      {screen === 'done' && (
        <div className={styles.sheet}>
          <div className={styles.resultBlock}>
            <span className={styles.resultEmoji} aria-hidden="true">{resultMessage(score, queue.length).emoji}</span>
            <p className={styles.eyebrow}>결과</p>
            <h2 className={styles.resultTitle}>{resultMessage(score, queue.length).title}</h2>
            <p className={styles.resultScore}>
              <b>{score}</b> / {queue.length}
            </p>
            <div className={styles.resultActions}>
              <button type="button" className={styles.retryBtn} onClick={() => startRound(mode)}>
                다시 도전하기
              </button>
              <button type="button" className={styles.menuBtn} onClick={backToMenu}>
                다른 게임 하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
