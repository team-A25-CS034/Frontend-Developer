import { useState, useEffect } from 'react'
import './App.css'

declare const importMetaEnv: Record<string, string | boolean | undefined>

function getEnv(name: string, fallback = ''): string {
    const env: Record<string, unknown> =
        (import.meta as unknown as { env?: Record<string, unknown> }).env ??
        importMetaEnv ??
        {}
    const v = env[name]
    return typeof v === 'string' && v.length > 0 ? v : fallback
}

function App() {
    // Credentials and API base URL from Vite env
    const API_BASE_URL = getEnv('VITE_API_BASE_URL', 'http://127.0.0.1:8000')
    const USERNAME = getEnv('VITE_API_USERNAME', 'admin')
    const PASSWORD = getEnv('VITE_API_PASSWORD', '')

    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [output, setOutput] = useState<string>('')
    const [isPredictDisabled, setIsPredictDisabled] = useState<boolean>(true)

    const samplePayload = {
        Air_temperature: 298.4,
        Process_temperature: 308.7,
        Rotational_speed: 1421,
        Torque: 60.7,
        Tool_wear: 119,
        Type: 'M',
    }

    // Check if token exists in localStorage on page load
    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken')
        const tokenExpiry = localStorage.getItem('tokenExpiry')

        if (storedToken && tokenExpiry) {
            const now = Date.now()
            if (now < Number.parseInt(tokenExpiry)) {
                // Token is still valid
                setAccessToken(storedToken)
                setIsPredictDisabled(false)
                const remainingSeconds = Math.floor(
                    (Number.parseInt(tokenExpiry) - now) / 1000
                )
                setOutput(
                    `Already logged in!\nToken expires in: ${remainingSeconds} seconds`
                )
                console.log('Token loaded from storage')
            } else {
                // Token expired, clear it
                localStorage.removeItem('accessToken')
                localStorage.removeItem('tokenExpiry')
                console.log('Stored token expired')
            }
        }
    }, [])

    // Login handler
    const handleLogin = async () => {
        setOutput('Logging in...')

        try {
            const resp = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: USERNAME,
                    password: PASSWORD,
                }),
            })

            const json = await resp.json()

            if (resp.ok) {
                setAccessToken(json.access_token)

                // Store token and expiry time in localStorage
                const expiryTime = Date.now() + json.expires_in * 1000
                localStorage.setItem('accessToken', json.access_token)
                localStorage.setItem('tokenExpiry', expiryTime.toString())

                setOutput(
                    `Login successful!\nToken expires in: ${json.expires_in} seconds`
                )
                setIsPredictDisabled(false)
                console.log('Access token:', json.access_token)
            } else {
                setOutput(`Login failed: ${JSON.stringify(json, null, 2)}`)
                setAccessToken(null)
                setIsPredictDisabled(true)
                localStorage.removeItem('accessToken')
                localStorage.removeItem('tokenExpiry')
            }
        } catch (err) {
            console.error('Login failed', err)
            setOutput(`Request failed: ${err}`)
            setAccessToken(null)
            setIsPredictDisabled(true)
            localStorage.removeItem('accessToken')
            localStorage.removeItem('tokenExpiry')
        }
    }

    // Prediction handler
    const handlePredict = async () => {
        if (!accessToken) {
            setOutput('Please login first!')
            return
        }

        setOutput('Calling server...')

        try {
            const resp = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(samplePayload),
            })

            const text = await resp.text()
            console.log('Raw response status:', resp.status)

            try {
                const json = JSON.parse(text)
                console.log('Response JSON:', json)

                if (resp.ok) {
                    setOutput(
                        `Prediction successful!\n\n${JSON.stringify(
                            json,
                            null,
                            2
                        )}`
                    )
                } else {
                    setOutput(
                        `Prediction failed:\n${JSON.stringify(json, null, 2)}`
                    )
                    if (resp.status === 401) {
                        setOutput(
                            (prev) =>
                                prev + '\n\nToken expired. Please login again.'
                        )
                        setIsPredictDisabled(true)
                        setAccessToken(null)
                        localStorage.removeItem('accessToken')
                        localStorage.removeItem('tokenExpiry')
                    }
                }
            } catch {
                console.warn('Response not JSON, raw text:', text)
                setOutput(text)
            }
        } catch (err) {
            console.error('Fetch failed', err)
            setOutput(`Request failed: ${err}`)
        }
    }

    return (
        <>
            <h2>Classifier Test - Authenticated</h2>
            <p>Click the button to login and make a prediction</p>
            <button onClick={handleLogin}>Login</button>
            <button
                onClick={handlePredict}
                disabled={isPredictDisabled}
            >
                Run Prediction
            </button>
            <pre>{output}</pre>
        </>
    )
}

export default App
