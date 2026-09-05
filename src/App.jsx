import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import TodayMenuPage from './components/TodayMenuPage'
import CalendarPage from './components/CalendarPage'
import GamePage from './components/GamePage'
import VotePage from './components/VotePage'
import FoodDetailPage from './components/FoodDetailPage'
import { SchoolProvider } from './context/SchoolContext'

function App() {
  return (
    <SchoolProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<TodayMenuPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/food/:slug" element={<FoodDetailPage />} />
      </Routes>
    </SchoolProvider>
  )
}

export default App
