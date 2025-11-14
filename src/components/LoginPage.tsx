import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Building2 } from 'lucide-react'

interface LoginPageProps {
    onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const API_BASE =
        import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    const ENV_USER = import.meta.env.VITE_API_USERNAME || ''
    const ENV_PASS = import.meta.env.VITE_API_PASSWORD || ''

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password }),
            })

            if (!res.ok) {
                const err = await res
                    .json()
                    .catch(() => ({ detail: res.statusText }))
                throw new Error(err.detail || 'Login failed')
            }

            const data = await res.json()
            if (!data?.access_token) throw new Error('No access token returned')

            // Persist token for authenticated requests (development choice)
            localStorage.setItem('access_token', data.access_token)
            onLogin()
        } catch (err: any) {
            console.error('Login error', err)
            alert(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <div className='bg-white rounded-lg shadow-xl p-8'>
                    {/* Logo and Title */}
                    <div className='flex flex-col items-center mb-8'>
                        <div className='w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4'>
                            <Building2 className='w-8 h-8 text-white' />
                        </div>
                        <h1 className='text-slate-900'>
                            Predictive Maintenance Copilot
                        </h1>
                        <p className='text-slate-600 mt-2'>
                            Sign in to monitor your fleet
                        </p>
                    </div>

                    {/* Login Form */}
                    <form
                        onSubmit={handleSubmit}
                        className='space-y-4'
                    >
                        <div className='space-y-2'>
                            <Label htmlFor='username'>Username</Label>
                            <Input
                                id='username'
                                type='text'
                                placeholder='username'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className='w-full'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='password'>Password</Label>
                            <Input
                                id='password'
                                type='password'
                                placeholder='Enter your password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className='w-full'
                            />
                        </div>

                        <div className='flex items-center justify-end'>
                            <button
                                type='button'
                                className='text-blue-600 hover:text-blue-700'
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <Button
                            type='submit'
                            className='w-full bg-blue-600 hover:bg-blue-700'
                        >
                            Sign In
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
