import { useState, useEffect } from 'react'
import { config } from './config'

function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch(`${config.apiUrl}/health`)
      .then(r => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'API 연결 실패' }))
  }, [])

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>My App</h1>
      <p>API URL: <code>{config.apiUrl}</code></p>
      <p>API 상태: <code>{health ? JSON.stringify(health) : '로딩 중...'}</code></p>
    </div>
  )
}

export default App
