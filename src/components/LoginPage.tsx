import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Building2 } from 'lucide-react'

interface LoginPageProps {
    onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const API_BASE =
        (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({ detail: 'Login failed' }))
                throw new Error(errorData.detail || 'Invalid credentials')
            }

            const data = await response.json()

            // Store JWT token
            localStorage.setItem('access_token', data.access_token)

            // Call onLogin callback
            onLogin()
        } catch (err: any) {
            setError(err.message || 'An error occurred during login')
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
                        {error && (
                            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>
                                {error}
                            </div>
                        )}

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
                                disabled={loading}
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
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type='submit'
                            className='w-full bg-blue-600 hover:bg-blue-700'
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
