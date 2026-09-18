import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjectIntro } from '../api/schoolmeals'
import styles from './ProjectIntroPage.module.css'

export default function ProjectIntroPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchProjectIntro()
      .then((res) => {
        if (!cancelled) setData(res)
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
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.backLink} to="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          홈으로
        </Link>
        <span className={styles.topbarTitle}>프로젝트 소개</span>
      </header>

      {loading && (
        <div className={styles.sheet}>
          <p className={styles.lede}>소개 자료를 불러오는 중이에요...</p>
        </div>
      )}

      {!loading && error && (
        <div className={styles.sheet}>
          <p className={styles.lede}>소개 자료를 불러오지 못했어요. ({error})</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>AI 경진대회 출품작</p>
            <h1>{data.project.name}</h1>
            <p className={styles.tagline}>{data.project.tagline}</p>
            <p className={styles.lede}>{data.project.description}</p>
            <div className={styles.repoRow}>
              <span className={styles.repoBadge}>
                <b>frontend</b> {data.project.repositories.frontend}
              </span>
              <span className={styles.repoBadge}>
                <b>backend</b> {data.project.repositories.backend}
              </span>
            </div>
          </section>

          <section className={styles.section}>
            <p className={styles.eyebrow}>어떤 AI를 썼나요</p>
            <h2 className={styles.sectionTitle}>{data.ai.provider} · {data.ai.defaultModel}</h2>

            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <b>왜 이 모델인가요</b>
                <p>{data.ai.modelSelectionReason}</p>
              </div>
              <div className={styles.infoCard}>
                <b>키가 없을 때는</b>
                <p>{data.ai.fallback}</p>
                <p>{data.ai.swappable}</p>
              </div>
            </div>

            <div className={styles.capabilityList}>
              {data.ai.capabilities.map((cap) => (
                <article key={cap.name} className={styles.capabilityCard}>
                  <h3 className={styles.capabilityTitle}>{cap.name}</h3>
                  <p className={styles.lede}>{cap.purpose}</p>

                  <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                      <b>구조화 출력</b>
                      <p>{cap.structuredOutput.reason}</p>
                      <ul className={styles.kvList}>
                        {Object.entries(cap.structuredOutput.schema).map(([key, desc]) => (
                          <li key={key}>
                            <code>{key}</code>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.infoCard}>
                      <b>언제, 얼마나 호출하나요</b>
                      {Object.values(cap.callPolicy).map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>

                  <p className={styles.subLabel}>비용 관리</p>
                  <ul className={styles.checkList}>
                    {cap.costControls.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <p className={styles.eyebrow}>어떤 프롬프트를 썼나요</p>
            <h2 className={styles.sectionTitle}>실제 코드가 만드는 프롬프트 그대로</h2>

            <div className={styles.promptList}>
              {Object.entries(data.prompts).map(([key, prompt]) => (
                <article key={key} className={styles.promptCard}>
                  <div className={styles.promptHead}>
                    <h3>{key}</h3>
                    {prompt.usedBy?.includes('호출하지 않음') && <span className={styles.unusedBadge}>현재 미사용</span>}
                  </div>
                  <p className={styles.promptMeta}><b>사용처</b> {prompt.usedBy}</p>
                  <p className={styles.promptMeta}><b>생성 함수</b> {prompt.builder}</p>
                  <p className={styles.promptMeta}><b>입력</b> {prompt.inputs.join(', ')}</p>

                  <p className={styles.subLabel}>실제 렌더링된 예시</p>
                  <pre className={styles.promptExample}>{prompt.renderedExample}</pre>

                  <p className={styles.subLabel}>설계 의도</p>
                  <ul className={styles.checkList}>
                    {prompt.designNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <p className={styles.eyebrow}>기술 스펙</p>
            <h2 className={styles.sectionTitle}>어떤 기술로 만들었나요</h2>

            <div className={styles.stackGrid}>
              <div className={styles.infoCard}>
                <b>프론트엔드</b>
                <ul className={styles.kvList}>
                  {Object.entries(data.spec.frontend).map(([key, value]) => (
                    <li key={key}>
                      <code>{key}</code>
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.infoCard}>
                <b>백엔드</b>
                <ul className={styles.kvList}>
                  {Object.entries(data.spec.backend).map(([key, value]) => (
                    <li key={key}>
                      <code>{key}</code>
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className={styles.subLabel}>외부 API</p>
            <div className={styles.apiGrid}>
              {Object.entries(data.spec.externalApis).map(([name, api]) => (
                <div key={name} className={styles.infoCard}>
                  <b>{name}</b>
                  <p>{api.usage}</p>
                  {api.endpoints && (
                    <p className={styles.apiEndpoints}>{api.endpoints.join(' · ')}</p>
                  )}
                  {api.quotaNote && <p className={styles.quotaNote}>{api.quotaNote}</p>}
                </div>
              ))}
            </div>

            <p className={styles.subLabel}>DB 테이블</p>
            <ul className={styles.kvList}>
              {Object.entries(data.spec.tables).map(([name, desc]) => (
                <li key={name}>
                  <code>{name}</code>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>

            <p className={styles.subLabel}>외부 호출 정책</p>
            <p className={styles.lede}>{data.spec.externalCallPolicy.principle}</p>
            <div className={styles.tableWrap}>
              <table className={styles.policyTable}>
                <thead>
                  <tr>
                    <th>대상</th>
                    <th>호출 시점</th>
                    <th>재호출</th>
                  </tr>
                </thead>
                <tbody>
                  {data.spec.externalCallPolicy.rules.map((rule) => (
                    <tr key={rule['대상']}>
                      <td>{rule['대상']}</td>
                      <td>{rule['호출 시점']}</td>
                      <td>{rule['재호출']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.section}>
            <p className={styles.eyebrow}>기능</p>
            <h2 className={styles.sectionTitle}>이 서비스로 할 수 있는 것</h2>

            <div className={styles.featureGrid}>
              {data.features.map((f) => (
                <div key={f.route} className={styles.featureCard}>
                  <div className={styles.featureHead}>
                    <b>{f.name}</b>
                    {f.usesAI && <span className={styles.aiBadge}>AI</span>}
                  </div>
                  <p className={styles.featureRoute}>{f.route}</p>
                  <p>{f.description}</p>
                  <p className={styles.featureSource}>{f.dataSource}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
