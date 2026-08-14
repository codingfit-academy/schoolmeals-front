import styles from './MealTray.module.css'

export const TODAY_MENU = [
  {
    type: 'rice',
    slot: 'cellRice',
    name: '쌀밥',
    kcal: 320,
    blurb: '가장 든든한 에너지원이 되는 기본 탄수화물이에요.',
    health: '탄수화물은 뇌와 근육이 쓰는 주 에너지원이에요. 흰쌀밥은 소화가 빠른 편이라 활동량이 많은 점심시간에 잘 맞아요.',
    bodyRegions: ['head'],
    bodyLabel: '뇌',
    bodyColor: '#cf8a26',
  },
  {
    type: 'soup',
    slot: 'cellSoup',
    name: '된장찌개',
    kcal: 90,
    blurb: '구수한 국물이 입맛을 돋우고 속을 편하게 해줘요.',
    health: '된장은 콩을 발효시켜 만든 식품으로 소화를 돕는 성분과 나트륨이 함께 들어 있어요. 국물보다는 건더기 위주로 먹으면 더 균형 잡힌 섭취가 가능해요.',
    bodyRegions: ['stomach'],
    bodyLabel: '위',
    bodyColor: '#4a2f18',
  },
  {
    type: 'cutlet',
    slot: 'cellMain',
    name: '돈까스',
    kcal: 450,
    blurb: '바삭한 튀김옷 속 부드러운 고기가 오늘 급식의 주인공이에요.',
    health: '성장기에 필요한 단백질을 든든하게 채워주는 메뉴예요. 튀김이라 기름기가 있는 만큼, 채소 반찬과 함께 먹으면 균형을 맞출 수 있어요.',
    bodyRegions: ['leftArm', 'rightArm', 'leftLeg', 'rightLeg'],
    bodyLabel: '근육',
    bodyColor: '#874f22',
  },
  {
    type: 'greens',
    slot: 'cellSide1',
    name: '시금치나물',
    kcal: 45,
    blurb: '참기름 향이 은은하게 도는 담백한 채소 반찬이에요.',
    health: '철분과 비타민A, 엽산이 풍부해 빈혈 예방과 눈 건강에 도움을 줘요. 기름진 메인 메뉴와 함께 먹으면 소화에도 좋아요.',
    bodyRegions: ['eyes'],
    bodyLabel: '눈',
    bodyColor: '#4f6b2e',
  },
  {
    type: 'kimchi',
    slot: 'cellSide2',
    name: '배추김치',
    kcal: 15,
    blurb: '새콤달콤 아삭한 김치가 느끼함을 잡아줘요.',
    health: '발효 과정에서 생기는 유산균이 장 건강에 도움을 주고, 식이섬유가 풍부해 소화를 도와줘요.',
    bodyRegions: ['intestine'],
    bodyLabel: '장',
    bodyColor: '#a8321b',
  },
]

function FoodArt({ type }) {
  switch (type) {
    case 'rice':
      return (
        <svg className={styles.foodArt} viewBox="0 0 100 100">
          <defs>
            <radialGradient id="riceGrad" cx="35%" cy="28%" r="78%">
              <stop offset="0%" stopColor="#fdf6e6" />
              <stop offset="55%" stopColor="var(--rice-100)" />
              <stop offset="100%" stopColor="var(--rice-300)" />
            </radialGradient>
          </defs>
          <ellipse cx="50" cy="60" rx="37" ry="24" fill="var(--rice-500)" opacity="0.55" />
          <ellipse cx="50" cy="54" rx="36" ry="25" fill="url(#riceGrad)" />
          <ellipse cx="50" cy="42" rx="27" ry="18" fill="url(#riceGrad)" />
          <g fill="#dcc697" opacity="0.7">
            <ellipse cx="36" cy="40" rx="2.6" ry="1.3" transform="rotate(25 36 40)" />
            <ellipse cx="60" cy="36" rx="2.6" ry="1.3" transform="rotate(-15 60 36)" />
            <ellipse cx="48" cy="30" rx="2.4" ry="1.2" transform="rotate(10 48 30)" />
            <ellipse cx="66" cy="50" rx="2.4" ry="1.2" transform="rotate(40 66 50)" />
            <ellipse cx="30" cy="54" rx="2.4" ry="1.2" transform="rotate(-20 30 54)" />
          </g>
          <ellipse cx="40" cy="32" rx="15" ry="7" fill="#ffffff" opacity="0.55" />
        </svg>
      )
    case 'soup':
      return (
        <svg className={styles.foodArt} viewBox="0 0 160 100">
          <defs>
            <radialGradient id="soupGrad" cx="46%" cy="34%" r="75%">
              <stop offset="0%" stopColor="var(--broth-500)" />
              <stop offset="70%" stopColor="var(--broth-700)" />
              <stop offset="100%" stopColor="#2c1a0c" />
            </radialGradient>
          </defs>
          <ellipse cx="80" cy="58" rx="58" ry="30" fill="url(#soupGrad)" />
          <ellipse cx="80" cy="58" rx="58" ry="30" fill="none" stroke="var(--honey-300)" strokeWidth="2.5" opacity="0.45" />
          <g fill="#f5e9cf" opacity="0.92">
            <rect x="58" y="46" width="12" height="12" rx="2" transform="rotate(18 64 52)" />
            <rect x="88" y="52" width="11" height="11" rx="2" transform="rotate(-10 93 57)" />
          </g>
          <g fill="var(--spinach-400)" opacity="0.85">
            <ellipse cx="76" cy="66" rx="7" ry="2.6" transform="rotate(20 76 66)" />
            <ellipse cx="96" cy="62" rx="6" ry="2.2" transform="rotate(-25 96 62)" />
          </g>
          <ellipse cx="58" cy="42" rx="16" ry="6" fill="#ffffff" opacity="0.18" />
          <g className={styles.steam} stroke="#f3e3c8" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6">
            <path d="M68 34 C64 26, 72 22, 68 14" />
            <path d="M80 36 C76 27, 85 23, 80 14" />
            <path d="M92 34 C88 26, 96 22, 92 14" />
          </g>
        </svg>
      )
    case 'cutlet':
      return (
        <svg className={styles.foodArt} viewBox="0 0 100 100">
          <defs>
            <linearGradient id="cutletGrad" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#f4cf94" />
              <stop offset="50%" stopColor="var(--cutlet-300)" />
              <stop offset="100%" stopColor="#874f22" />
            </linearGradient>
          </defs>
          <g stroke="#e4edd0" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
            <path d="M20 78 C26 70 24 63 31 57" />
            <path d="M29 82 C35 73 30 65 39 59" />
            <path d="M72 80 C65 72 69 64 62 58" />
          </g>
          <rect x="15" y="33" width="48" height="31" rx="14" fill="url(#cutletGrad)" transform="rotate(-7 39 48)" />
          <rect x="37" y="45" width="50" height="32" rx="14" fill="url(#cutletGrad)" transform="rotate(5 62 61)" />
          <g fill="#6b3d18" opacity="0.32">
            <circle cx="30" cy="42" r="1.3" /><circle cx="40" cy="38" r="1.2" /><circle cx="50" cy="43" r="1.3" />
            <circle cx="48" cy="56" r="1.3" /><circle cx="60" cy="52" r="1.2" /><circle cx="68" cy="60" r="1.3" />
            <circle cx="35" cy="52" r="1.2" /><circle cx="57" cy="65" r="1.2" />
          </g>
          <g fill="#fef1d6" opacity="0.6">
            <circle cx="34" cy="46" r="1.1" /><circle cx="45" cy="40" r="1" /><circle cx="55" cy="50" r="1.1" />
            <circle cx="63" cy="57" r="1" /><circle cx="42" cy="58" r="1" />
          </g>
          <path d="M22 45 Q30 39 38 45 T54 43 T70 47" stroke="#5a2f10" strokeWidth="2.2" fill="none" opacity="0.5" strokeLinecap="round" />
          <ellipse cx="33" cy="40" rx="13" ry="6" fill="#ffffff" opacity="0.32" />
        </svg>
      )
    case 'greens':
      return (
        <svg className={styles.foodArt} viewBox="0 0 100 100">
          <g fill="none" strokeLinecap="round">
            <path d="M28 70 C32 50, 40 46, 36 28" stroke="var(--spinach-600)" strokeWidth="6" opacity="0.85" />
            <path d="M42 74 C48 54, 44 44, 52 26" stroke="var(--spinach-400)" strokeWidth="6" opacity="0.9" />
            <path d="M58 72 C62 56, 56 46, 64 30" stroke="var(--spinach-600)" strokeWidth="6" opacity="0.85" />
            <path d="M70 68 C74 52, 68 44, 74 32" stroke="var(--spinach-400)" strokeWidth="5.5" opacity="0.8" />
          </g>
          <g fill="#fdf6e6" opacity="0.85">
            <circle cx="46" cy="52" r="1.6" />
            <circle cx="58" cy="46" r="1.4" />
            <circle cx="36" cy="60" r="1.4" />
          </g>
        </svg>
      )
    case 'kimchi':
      return (
        <svg className={styles.foodArt} viewBox="0 0 100 100">
          <defs>
            <linearGradient id="kimchiGrad" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#e2673c" />
              <stop offset="55%" stopColor="var(--kimchi-400)" />
              <stop offset="100%" stopColor="var(--kimchi-600)" />
            </linearGradient>
          </defs>
          <rect x="16" y="38" width="42" height="26" rx="10" fill="url(#kimchiGrad)" transform="rotate(-11 37 51)" />
          <rect x="40" y="30" width="42" height="27" rx="10" fill="url(#kimchiGrad)" transform="rotate(9 61 43)" />
          <rect x="28" y="58" width="42" height="25" rx="10" fill="url(#kimchiGrad)" transform="rotate(-4 49 70)" />
          <g stroke="#f7e6cf" strokeWidth="1.6" fill="none" opacity="0.55" strokeLinecap="round">
            <path d="M25 48 C31 46 37 47 43 51" />
            <path d="M50 40 C56 38 62 39 68 43" />
            <path d="M36 66 C42 64 48 65 54 69" />
          </g>
          <g fill="#7c2412" opacity="0.4">
            <circle cx="30" cy="46" r="1.1" /><circle cx="46" cy="52" r="1" /><circle cx="55" cy="38" r="1.1" />
            <circle cx="68" cy="45" r="1" /><circle cx="40" cy="65" r="1.1" /><circle cx="58" cy="70" r="1" />
          </g>
          <g fill="#fdf6e6" opacity="0.85">
            <circle cx="36" cy="52" r="1.3" />
            <circle cx="60" cy="46" r="1.2" />
            <circle cx="48" cy="72" r="1.2" />
          </g>
          <ellipse cx="52" cy="35" rx="12" ry="5" fill="#ffffff" opacity="0.28" />
        </svg>
      )
    default:
      return null
  }
}

export default function MealTray({ menu = TODAY_MENU }) {
  return (
    <div className={styles.trayWrap}>
      <div className={styles.tray}>
        <div className={styles.trayGrid}>
          {menu.map((food) => (
            <div key={food.type} className={`${styles.cell} ${styles[food.slot]}`} tabIndex={0}>
              <FoodArt type={food.type} />
              <span className={styles.foodTag}>
                {food.name} · <b>{food.kcal}kcal</b>
              </span>
            </div>
          ))}
        </div>
      </div>

      <svg className={styles.utensils} viewBox="0 0 220 90">
        <defs>
          <linearGradient id="steelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--steel-200)" />
            <stop offset="45%" stopColor="var(--steel-400)" />
            <stop offset="100%" stopColor="var(--steel-800)" />
          </linearGradient>
        </defs>
        <g>
          <rect x="4" y="40" width="128" height="7" rx="3.5" fill="url(#steelGrad)" />
          <ellipse cx="146" cy="43" rx="22" ry="15" fill="url(#steelGrad)" />
          <ellipse cx="140" cy="38" rx="9" ry="5" fill="#ffffff" opacity="0.35" />
        </g>
        <g>
          <rect x="0" y="6" width="210" height="4.6" rx="2.3" fill="url(#steelGrad)" transform="rotate(1.2 105 8)" />
          <rect x="0" y="16" width="210" height="4.6" rx="2.3" fill="url(#steelGrad)" transform="rotate(1.2 105 18)" />
        </g>
      </svg>
    </div>
  )
}
