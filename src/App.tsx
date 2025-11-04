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

interface ForecastDay {
    day_ahead: number
    timestamp: string
    air_temperature: number
    process_temperature: number
    rotational_speed: number
    torque: number
    tool_wear: number
    machine_type?: string
}

function App() {
    // Credentials and API base URL from Vite env
    const API_BASE_URL = getEnv('VITE_API_BASE_URL', 'http://127.0.0.1:8000')
    const USERNAME = getEnv('VITE_API_USERNAME', 'admin')
    const PASSWORD = getEnv('VITE_API_PASSWORD', '')

    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [output, setOutput] = useState<string>('')
    const [isPredictDisabled, setIsPredictDisabled] = useState<boolean>(true)

    // Hardcoded values for machine forecast (fixed to 300 minutes ahead)
    const machineId = 'machine_01'
    const forecastMinutes = 300

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

    // Prediction handler (can be used standalone or with custom payload)
    const runPrediction = async (customPayload?: typeof samplePayload) => {
        if (!accessToken) {
            return { success: false, error: 'No access token' }
        }

        const payload = customPayload || samplePayload

        try {
            const resp = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            })

            const text = await resp.text()
            console.log('Raw response status:', resp.status)

            try {
                const json = JSON.parse(text)
                console.log('Response JSON:', json)

                if (resp.ok) {
                    return { success: true, data: json }
                } else {
                    if (resp.status === 401) {
                        setIsPredictDisabled(true)
                        setAccessToken(null)
                        localStorage.removeItem('accessToken')
                        localStorage.removeItem('tokenExpiry')
                    }
                    return { success: false, error: json }
                }
            } catch {
                console.warn('Response not JSON, raw text:', text)
                return { success: false, error: text }
            }
        } catch (err) {
            console.error('Fetch failed', err)
            return { success: false, error: err }
        }
    }

    const handlePredict = async () => {
        if (!accessToken) {
            setOutput('Please login first!')
            return
        }

        setOutput('Calling server...')

        const result = await runPrediction()

        if (result.success) {
            setOutput(
                `Prediction successful!\n\n${JSON.stringify(
                    result.data,
                    null,
                    2
                )}`
            )
        } else {
            setOutput(
                `Prediction failed:\n${JSON.stringify(result.error, null, 2)}`
            )
        }
    }

    // Forecast handler
    const handleForecast = async () => {
        if (!accessToken) {
            setOutput('Please login first!')
            return
        }

        setOutput(
            `Generating ${forecastMinutes}-minute forecast for ${machineId}...`
        )

        try {
            const resp = await fetch(`${API_BASE_URL}/forecast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    machine_id: machineId,
                    forecast_minutes: forecastMinutes,
                }),
            })

            const json = await resp.json()

            if (resp.ok) {
                // Format forecast data for display (minute-based forecast)
                let outputText = `Forecast Generated Successfully!\n\n`
                outputText += `Machine: ${json.machine_id}\n`
                outputText += `Forecast Minutes: ${json.forecast_minutes}\n`
                outputText += `Created: ${new Date(
                    json.created_at
                ).toLocaleString()}\n\n`
                outputText += `Forecast Data:\n\n`

                for (let idx = 0; idx < json.forecast_data.length; idx++) {
                    const minute: ForecastDay = json.forecast_data[idx]

                    // (no automatic prediction anymore)

                    outputText += `Minute +${minute.day_ahead} (${new Date(
                        minute.timestamp
                    ).toLocaleString()}):\n`
                    outputText += `  Air Temp: ${minute.air_temperature.toFixed(
                        2
                    )} K\n`
                    outputText += `  Process Temp: ${minute.process_temperature.toFixed(
                        2
                    )} K\n`
                    outputText += `  Rotational Speed: ${minute.rotational_speed.toFixed(
                        0
                    )} rpm\n`
                    outputText += `  Torque: ${minute.torque.toFixed(2)} Nm\n`
                    outputText += `  Tool Wear: ${minute.tool_wear.toFixed(
                        0
                    )} min\n`
                    if (idx < json.forecast_data.length - 1) {
                        outputText += `\n`
                    }
                }

                setOutput(outputText)

                // Auto-prediction after generating the 300-minute forecast
                // has been removed per request — no automatic machine status
                // prediction will be performed here.
            } else {
                setOutput(`Forecast failed:\n${JSON.stringify(json, null, 2)}`)
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
        } catch (err) {
            console.error('Forecast failed', err)
            setOutput(`Request failed: ${err}`)
        }
    }

    // Show DB data handler — calls the admin-protected dump endpoint using
    // the password from Vite env (VITE_API_PASSWORD). This avoids requiring
    // JWT and is intended for local testing only.
    const handleShowDB = async (limit = 20) => {
        setOutput(`Fetching last ${limit} readings for ${machineId}...`)

        try {
            const resp = await fetch(
                `${API_BASE_URL}/readings-dump?machine_id=${encodeURIComponent(
                    machineId
                )}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'X-Admin-Password': PASSWORD,
                    },
                }
            )

            const json = await resp.json()

            if (resp.ok) {
                let outputText = `Readings for ${json.machine_id} (count=${json.count})\n\n`

                for (let i = 0; i < json.readings.length; i++) {
                    const r = json.readings[i]
                    outputText += `#${i + 1} ${
                        r.timestamp
                            ? new Date(r.timestamp).toLocaleString()
                            : r.timestamp
                    } - `
                    outputText += `Air: ${
                        r.air_temperature ?? 'N/A'
                    }, Process: ${r.process_temperature ?? 'N/A'}, `
                    outputText += `Rot: ${
                        r.rotational_speed ?? 'N/A'
                    }, Torque: ${r.torque ?? 'N/A'}, Tool wear: ${
                        r.tool_wear ?? 'N/A'
                    }\n`
                }

                setOutput(outputText)
            } else {
                setOutput(
                    `Failed to fetch readings: ${JSON.stringify(json, null, 2)}`
                )
                if (resp.status === 401) {
                    setIsPredictDisabled(true)
                    setAccessToken(null)
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('tokenExpiry')
                }
            }
        } catch (err) {
            console.error('Fetch readings failed', err)
            setOutput(`Request failed: ${err}`)
        }
    }

    return (
        <>
            <h2>Machine Monitoring - Authenticated</h2>

            <div>
                <h3>Authentication</h3>
                <button onClick={handleLogin}>Login</button>
            </div>

            <div>
                <h3>Prediction Test</h3>
                <button
                    onClick={handlePredict}
                    disabled={isPredictDisabled}
                >
                    Run Prediction
                </button>
            </div>

            <div>
                <h3>Machine Forecast</h3>
                <button
                    onClick={handleForecast}
                    disabled={isPredictDisabled}
                >
                    +300 Minute Forecast
                </button>
                <button
                    onClick={() => handleShowDB(20)}
                    disabled={isPredictDisabled}
                    style={{ marginLeft: '8px' }}
                >
                    Show DB Data (last 20)
                </button>
            </div>

            <div>
                <h3>Output</h3>
                <pre>{output}</pre>
            </div>
        </>
    )
}

export default App
