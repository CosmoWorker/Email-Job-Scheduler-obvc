import { useState } from 'react'
import { DashboardPage } from '@/pages/DashboardPage'
import { ComposePage } from '@/components/compose/ComposePage'
import { LoginPage } from '@/pages/LoginPage'
import './App.css'

type View = 'login' | 'dashboard' | 'compose'

export default function App() {
  const [view, setView] = useState<View>('dashboard')

  if (view === 'login') {
    return <LoginPage onLogin={() => setView('dashboard')} />
  }

  if (view === 'compose') {
    return <ComposePage onBack={() => setView('dashboard')} />
  }

  return <DashboardPage onCompose={() => setView('compose')} />
}
