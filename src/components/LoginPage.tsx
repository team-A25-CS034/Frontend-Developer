import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Building2, AlertCircle, Loader2 } from 'lucide-react'

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

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || 'Gagal login ke server')
            }

            localStorage.setItem('access_token', data.access_token)
            
            localStorage.setItem('username', username)

            onLogin()
        } catch (err: any) {
            console.error("Login Error:", err)
            setError(err.message || 'Terjadi kesalahan saat login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <div className='bg-white rounded-lg shadow-xl p-8'>
                    <div className='flex flex-col items-center mb-8'>
                        <div className='w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4'>
                            <Building2 className='w-8 h-8 text-white' />
                        </div>
                        <h1 className='text-2xl font-bold text-slate-900'>
                            Predictive Maintenance
                        </h1>
                        <p className='text-slate-600 mt-2'>
                            Masuk untuk memonitor mesin
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {error && (
                            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center gap-2'>
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className='space-y-2'>
                            <Label htmlFor='username'>Username</Label>
                            <Input
                                id='username'
                                type='text'
                                placeholder='Masukkan username'
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
                                placeholder='Masukkan password'
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
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                    Verifikasi...
                                </>
                            ) : 'Sign In'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}