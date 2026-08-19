import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'schoolmeals:selectedSchool'
const SchoolContext = createContext(null)

/** 선택된 학교({ region, officeCode, schoolCode, name, address, kind })를
 *  페이지 간에 공유하고 localStorage에 저장해 새로고침 후에도 유지합니다. */
export function SchoolProvider({ children }) {
  const [school, setSchool] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (school) localStorage.setItem(STORAGE_KEY, JSON.stringify(school))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage를 쓸 수 없는 환경이면 조용히 무시
    }
  }, [school])

  return <SchoolContext.Provider value={{ school, setSchool }}>{children}</SchoolContext.Provider>
}

export function useSchool() {
  const ctx = useContext(SchoolContext)
  if (!ctx) throw new Error('useSchool은 SchoolProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
