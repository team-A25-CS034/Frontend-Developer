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
import AlertSettings from './components/AlertSettings'
import TicketSimulation from './components/TicketSimulation'
import ProfileSettings from './components/ProfileSettings'
import CopilotModal from './components/CopilotModal'
import Wireframes from './components/Wireframes'

export default function App() {
    // Initialize auth state from localStorage so a page refresh preserves login
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        try {
            return !!localStorage.getItem('access_token')
        } catch (e) {
            return false
        }
    })
    // Keep state in sync if another tab changes the token
    useEffect(() => {
        const handler = () =>
            setIsAuthenticated(!!localStorage.getItem('access_token'))
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
    }, [])
    const [isCopilotOpen, setIsCopilotOpen] = useState(false)

    return (
        <Router>
            <Routes>
                <Route
                    path='/wireframes'
                    element={<Wireframes />}
                />

                <Route
                    path='/login'
                    element={
                        isAuthenticated ? (
                            <Navigate
                                to='/fleet'
                                replace
                            />
                        ) : (
                            <LoginPage
                                onLogin={() => setIsAuthenticated(true)}
                            />
                        )
                    }
                />

                <Route
                    path='/*'
                    element={
                        isAuthenticated ? (
                            <>
                                <DashboardLayout
                                    onOpenCopilot={() => setIsCopilotOpen(true)}
                                >
                                    <Routes>
                                        <Route
                                            path='/fleet'
                                            element={<FleetOverview />}
                                        />
                                        <Route
                                            path='/machine/:id'
                                            element={<MachineDetail />}
                                        />
                                        <Route
                                            path='/alerts'
                                            element={<AlertSettings />}
                                        />
                                        <Route
                                            path='/tickets'
                                            element={<TicketSimulation />}
                                        />
                                        <Route
                                            path='/profile'
                                            element={<ProfileSettings />}
                                        />
                                        <Route
                                            path='/'
                                            element={
                                                <Navigate
                                                    to='/fleet'
                                                    replace
                                                />
                                            }
                                        />
                                    </Routes>
                                </DashboardLayout>
                                <CopilotModal
                                    isOpen={isCopilotOpen}
                                    onClose={() => setIsCopilotOpen(false)}
                                />
                            </>
                        ) : (
                            <Navigate
                                to='/login'
                                replace
                            />
                        )
                    }
                />
            </Routes>
        </Router>
    )
}
