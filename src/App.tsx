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

    // Hardcoded values for machine forecast
    const machineId = 'machine_01'
    const forecastDays = 1

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

        setOutput(`Generating ${forecastDays}-day forecast for ${machineId}...`)

        try {
            const resp = await fetch(`${API_BASE_URL}/forecast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    machine_id: machineId,
                    forecast_days: forecastDays,
                }),
            })

            const json = await resp.json()

            if (resp.ok) {
                // Format forecast data for display
                let outputText = `Forecast Generated Successfully!\n\n`
                outputText += `Machine: ${json.machine_id}\n`
                outputText += `Forecast Days: ${json.forecast_days}\n`
                outputText += `Created: ${new Date(
                    json.created_at
                ).toLocaleString()}\n\n`
                outputText += `Forecast Data:\n\n`

                // Get day +1 data for prediction
                let dayPlusOne: ForecastDay | null = null

                for (let idx = 0; idx < json.forecast_data.length; idx++) {
                    const day: ForecastDay = json.forecast_data[idx]

                    // Store day +1 for prediction
                    if (day.day_ahead === 1) {
                        dayPlusOne = day
                    }

                    outputText += `Day +${day.day_ahead} (${new Date(
                        day.timestamp
                    ).toLocaleDateString()}):\n`
                    outputText += `  Air Temp: ${day.air_temperature.toFixed(
                        2
                    )} K\n`
                    outputText += `  Process Temp: ${day.process_temperature.toFixed(
                        2
                    )} K\n`
                    outputText += `  Rotational Speed: ${day.rotational_speed.toFixed(
                        0
                    )} rpm\n`
                    outputText += `  Torque: ${day.torque.toFixed(2)} Nm\n`
                    outputText += `  Tool Wear: ${day.tool_wear.toFixed(
                        0
                    )} min\n`
                    if (idx < json.forecast_data.length - 1) {
                        outputText += `\n`
                    }
                }

                setOutput(outputText)

                // Automatically run prediction on day +1 data
                if (dayPlusOne) {
                    setOutput(
                        (prev) =>
                            prev + `\n\nRunning prediction for Day +1...\n`
                    )

                    // Prepare payload for prediction
                    const predictionPayload = {
                        Air_temperature: dayPlusOne.air_temperature,
                        Process_temperature: dayPlusOne.process_temperature,
                        Rotational_speed: dayPlusOne.rotational_speed,
                        Torque: dayPlusOne.torque,
                        Tool_wear: dayPlusOne.tool_wear,
                        Type: dayPlusOne.machine_type || 'M',
                    }

                    const predictionResult = await runPrediction(
                        predictionPayload
                    )

                    if (predictionResult.success) {
                        setOutput(
                            (prev) =>
                                prev +
                                `\n--- MACHINE STATUS PREDICTION ---\n` +
                                `Status: ${predictionResult.data.prediction_label}\n` +
                                `Confidence: ${
                                    predictionResult.data.probabilities
                                        ? `${(
                                              Math.max(
                                                  ...predictionResult.data
                                                      .probabilities
                                              ) * 100
                                          ).toFixed(1)}%`
                                        : 'N/A'
                                }\n` +
                                `\nFull Prediction:\n${JSON.stringify(
                                    predictionResult.data,
                                    null,
                                    2
                                )}`
                        )
                    } else {
                        setOutput(
                            (prev) =>
                                prev +
                                `\nPrediction failed: ${JSON.stringify(
                                    predictionResult.error,
                                    null,
                                    2
                                )}`
                        )
                    }
                }
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
                    +1 Day Forecast
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
