import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.credit}>매교초등학교 6학년 김시준</span>
        <span className={styles.badge}>AI 경진대회 출품작</span>
      </div>
      <Link className={styles.introLink} to="/project-intro">
        프로젝트 소개
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>
    </footer>
  )
}
