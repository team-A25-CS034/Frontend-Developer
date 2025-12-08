import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import FleetOverview from './components/FleetOverview'
import MachineDetail from './components/MachineDetail'
import TicketSimulation from './components/TicketSimulation'
import ProfileSettings from './components/ProfileSettings'
import CopilotModal from './components/CopilotModal'
import Wireframes from './components/Wireframes'
import { CopilotProvider } from './contexts/CopilotContext'

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('access_token')
    })
    
    const [isCopilotOpen, setIsCopilotOpen] = useState(false)
    const [isCopilotMinimized, setIsCopilotMinimized] = useState(false)

    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem('access_token'))
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const handleLogin = () => {
        setIsAuthenticated(true)
    }

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('username')
        setIsAuthenticated(false)
    }

    return (
        <Router >
            <Routes>
                <Route path='/wireframes' element={<Wireframes />} />

                <Route
                    path='/login'
                    element={
                        isAuthenticated ? (
                            <Navigate to='/fleet' replace />
                        ) : (
                            <LoginPage onLogin={handleLogin} />
                        )
                    }
                />

                <Route
                    path='/*'
                    element={
                        isAuthenticated ? (
                            <CopilotProvider
                                openCopilot={() => {
                                    setIsCopilotMinimized(false)
                                    setIsCopilotOpen(true)
                                }}
                                closeCopilot={() => setIsCopilotOpen(false)}
                                minimizeCopilot={() => {
                                    setIsCopilotOpen(false)
                                    setIsCopilotMinimized(true)
                                }}
                                restoreCopilot={() => {
                                    setIsCopilotMinimized(false)
                                    setIsCopilotOpen(true)
                                }}
                                isOpen={isCopilotOpen}
                                isMinimized={isCopilotMinimized}
                            >
                                <DashboardLayout onOpenCopilot={() => {
                                    setIsCopilotMinimized(false)
                                    setIsCopilotOpen(true)
                                }}>
                                    <Routes>
                                        <Route path='/fleet' element={<FleetOverview />} />
                                        <Route path='/machine/:id' element={<MachineDetail />} />
                                        <Route path='/tickets' element={<TicketSimulation />} />
                                        <Route path='/profile' element={<ProfileSettings />} />
                                        <Route path='/' element={<Navigate to='/fleet' replace />} />
                                    </Routes>
                                </DashboardLayout>

                                <CopilotModal
                                    isOpen={isCopilotOpen}
                                    onClose={() => setIsCopilotOpen(false)}
                                />
                                
                                {isCopilotMinimized && (
                                    <div className='fixed bottom-6 right-6 z-50'>
                                        <button
                                            onClick={() => {
                                                setIsCopilotMinimized(false)
                                                setIsCopilotOpen(true)
                                            }}
                                            className='flex items-center gap-3 bg-white shadow-lg rounded-full px-3 py-2 h-12 w-56 hover:shadow-xl focus:outline-none transition-all'
                                            title='Restore Copilot'
                                        >
                                            <div className='w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center'>
                                                <span className='text-white font-bold'>AI</span>
                                            </div>
                                            <div className='flex-1 text-left'>
                                                <div className='text-sm font-medium text-slate-900'>AI Copilot</div>
                                                <div className='text-xs text-slate-500'>Click to restore</div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </CopilotProvider>
                        ) : (
                            <Navigate to='/login' replace />
                        )
                    }
                />
            </Routes>
        </Router>
    )
}