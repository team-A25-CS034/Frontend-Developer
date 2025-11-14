import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts'

type Reading = {
    timestamp?: string | number
    machine_id?: string
    process_temperature?: number | null
    torque?: number | null
    air_temperature?: number | null
    tool_wear?: number | null
    rotational_speed?: number | null
    [key: string]: any
}

export default function MachineDetail() {
    const { id } = useParams()
    const machineId = id ?? ''
    const navigate = useNavigate()
    const [readings, setReadings] = useState<Reading[] | null>(null)
    const [forecast, setForecast] = useState<Reading[] | null>(null)
    const [classification, setClassification] = useState<any | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const API_BASE =
        (import.meta as any)?.env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

    useEffect(() => {
        if (!machineId) {
            setError('No machine id provided in route parameters.')
            setLoading(false)
            return
        }
        const token = localStorage.getItem('access_token')

        const fetchJson = async (input: RequestInfo, init?: RequestInit) => {
            const res = await fetch(input, init)
            const ct = (res.headers.get('content-type') || '').toLowerCase()
            const raw = await res.text()
            if (!res.ok) {
                throw new Error(`${res.status} ${res.statusText} ${raw}`)
            }
            if (ct.includes('text/html')) {
                throw new Error(
                    'Received HTML response instead of JSON. Check API base or proxy. Snippet: ' +
                        raw.slice(0, 500)
                )
            }
            try {
                return JSON.parse(raw)
            } catch (e) {
                throw new Error('Invalid JSON response: ' + raw.slice(0, 1000))
            }
        }

        const readingsUrl = `${API_BASE}/readings?machine_id=${encodeURIComponent(
            machineId
        )}&limit=300`
        const forecastUrl = `${API_BASE}/forecast`

        setLoading(true)

        Promise.all([
            fetchJson(readingsUrl, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            }),
            fetchJson(forecastUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    machine_id: machineId,
                    forecast_minutes: 300,
                }),
            }),
        ])
            .then(([readingsResp, forecastResp]) => {
                // normalize readings
                const arr = Array.isArray(readingsResp)
                    ? readingsResp
                    : readingsResp?.readings ?? readingsResp
                const normalized = (Array.isArray(arr) ? arr : [])
                    .slice(0, 300)
                    .map((r: any) => ({
                        timestamp: r.timestamp ?? r.ts ?? r.time,
                        machine_id: r.machine_id ?? r.machineId,
                        process_temperature:
                            r.process_temperature ??
                            r.processTemperature ??
                            r.process_temp ??
                            null,
                        torque: r.torque ?? null,
                        air_temperature:
                            r.air_temperature ??
                            r.airTemperature ??
                            r.air_temp ??
                            null,
                        tool_wear: r.tool_wear ?? r.toolWear ?? null,
                        rotational_speed:
                            r.rotational_speed ??
                            r.rotationalSpeed ??
                            r.rpm ??
                            null,
                    }))

                // normalize forecast: forecastResp may be { forecast_data: [...] }
                const farr = Array.isArray(forecastResp)
                    ? forecastResp
                    : forecastResp?.forecast_data ??
                      forecastResp?.forecast ??
                      []
                const normalizedForecast = (Array.isArray(farr) ? farr : [])
                    .slice(0, 300)
                    .map((r: any) => ({
                        timestamp: r.timestamp ?? r.ts ?? r.time,
                        machine_id: r.machine_id ?? r.machineId ?? machineId,
                        process_temperature:
                            r.process_temperature ??
                            r.processTemperature ??
                            null,
                        torque: r.torque ?? null,
                        air_temperature:
                            r.air_temperature ?? r.airTemperature ?? null,
                        tool_wear: r.tool_wear ?? r.toolWear ?? null,
                        rotational_speed:
                            r.rotational_speed ??
                            r.rotationalSpeed ??
                            r.rpm ??
                            null,
                    }))

                setReadings(normalized)
                setForecast(normalizedForecast)
                setLoading(false)
            })
            .catch((err: any) => {
                setError(String(err))
                setLoading(false)
            })
    }, [machineId, API_BASE])

    // When readings are available, classify the latest reading via POST /predict
    useEffect(() => {
        if (!readings || readings.length === 0) {
            setClassification(null)
            return
        }

        // find latest reading by timestamp if available
        const latest = readings.reduce((best: any, cur: any) => {
            try {
                const tbest =
                    best && best.timestamp
                        ? new Date(best.timestamp).getTime()
                        : Number.NaN
                const tcur =
                    cur && cur.timestamp
                        ? new Date(cur.timestamp).getTime()
                        : Number.NaN
                if (Number.isNaN(tbest) && !Number.isNaN(tcur)) return cur
                if (!Number.isNaN(tbest) && Number.isNaN(tcur)) return best
                return tcur > tbest ? cur : best
            } catch (e) {
                return best
            }
        }, readings[0])

        const token = localStorage.getItem('access_token')

        const payload = {
            Air_temperature:
                latest.air_temperature ?? latest.process_temperature ?? 0,
            Process_temperature:
                latest.process_temperature ?? latest.air_temperature ?? 0,
            Rotational_speed: latest.rotational_speed ?? 0,
            Torque: latest.torque ?? 0,
            Tool_wear: latest.tool_wear ?? 0,
            Type: (latest.machine_type ?? latest.machine_id)
                ?.toString()
                ?.startsWith('H')
                ? 'H'
                : 'M',
        }

        const predictUrl = `${API_BASE}/predict`

        fetch(predictUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                const txt = await res.text()
                if (!res.ok)
                    throw new Error(`${res.status} ${res.statusText} ${txt}`)
                try {
                    return JSON.parse(txt)
                } catch {
                    throw new Error(
                        'Invalid JSON from predict: ' + txt.slice(0, 500)
                    )
                }
            })
            .then((data) => {
                setClassification(data)
            })
            .catch((err: any) => {
                // keep classification null but show error in UI if needed
                setClassification({ error: String(err) })
            })
    }, [readings, API_BASE])

    // prepare combined chart data: observed (db) + forecast series
    const chartData = React.useMemo(() => {
        const obs = Array.isArray(readings) ? [...readings] : []
        const fcd = Array.isArray(forecast) ? [...forecast] : []

        // sort ascending by timestamp (both arrays)
        const sortByTime = (a: any, b: any) => {
            const ta = a.timestamp
                ? new Date(a.timestamp).getTime()
                : Number.NaN
            const tb = b.timestamp
                ? new Date(b.timestamp).getTime()
                : Number.NaN
            if (Number.isNaN(ta) || Number.isNaN(tb)) return 0
            return ta - tb
        }

        obs.sort(sortByTime)
        fcd.sort(sortByTime)

        const obsMapped = obs.map((r: any, idx: number) => ({
            time:
                r.timestamp && !Number.isNaN(new Date(r.timestamp).getTime())
                    ? new Date(r.timestamp).toLocaleString()
                    : String(idx + 1),
            observed_process_temperature: r.process_temperature ?? null,
            observed_torque: r.torque ?? null,
            observed_air_temperature: r.air_temperature ?? null,
            observed_tool_wear: r.tool_wear ?? null,
            observed_rotational_speed: r.rotational_speed ?? null,
        }))

        const fcdMapped = fcd.map((r: any, idx: number) => ({
            time:
                r.timestamp && !Number.isNaN(new Date(r.timestamp).getTime())
                    ? new Date(r.timestamp).toLocaleString()
                    : String(idx + 1),
            forecast_process_temperature: r.process_temperature ?? null,
            forecast_torque: r.torque ?? null,
            forecast_air_temperature: r.air_temperature ?? null,
            forecast_tool_wear: r.tool_wear ?? null,
            forecast_rotational_speed: r.rotational_speed ?? null,
        }))

        // combine: observed first, forecast appended
        return [...obsMapped, ...fcdMapped]
    }, [readings, forecast])

    return (
        <div className='p-6'>
            <div className='mb-4'>
                <button
                    onClick={() => navigate(-1)}
                    className='px-3 py-1 rounded bg-gray-200 hover:bg-gray-250'
                >
                    Back
                </button>
            </div>

            <h1 className='text-2xl font-semibold mb-4'>
                Machine Detail — {machineId}
            </h1>

            {/* Classification result for latest reading */}
            <div className='mb-4'>
                {classification ? (
                    classification.error ? (
                        <div className='p-3 bg-yellow-50 border rounded text-sm text-red-600'>
                            Classification error: {classification.error}
                        </div>
                    ) : (
                        <div className='p-3 bg-white border rounded'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <div className='text-sm text-slate-500'>
                                        Latest classification
                                    </div>
                                    <div className='text-lg font-semibold'>
                                        {classification.prediction_label ??
                                            classification.label ??
                                            'N/A'}
                                    </div>
                                    <div className='text-xs text-slate-600'>
                                        Code:{' '}
                                        {classification.prediction_numeric ??
                                            classification.code ??
                                            'N/A'}
                                    </div>
                                </div>
                                <div className='text-right'>
                                    {classification.probabilities ? (
                                        <div className='text-xs'>
                                            Probabilities:
                                            <div className='mt-1 text-xs text-slate-600'>
                                                {classification.probabilities
                                                    .map(
                                                        (
                                                            p: number,
                                                            i: number
                                                        ) =>
                                                            `C${i}: ${p.toFixed(
                                                                2
                                                            )}`
                                                    )
                                                    .join(' · ')}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <div className='p-3 bg-gray-50 border rounded text-sm text-slate-600'>
                        Classification: waiting for latest reading...
                    </div>
                )}
            </div>

            {loading && <div>Loading readings...</div>}
            {error && <div className='text-red-600'>Error: {error}</div>}

            {!loading && !error && chartData.length > 0 && (
                <div>
                    <p className='mb-2'>
                        Showing {readings ? readings.length : 0} observed
                        readings and {forecast ? forecast.length : 0} forecast
                        points (up to 300 each).
                    </p>

                    <div className='grid gap-6'>
                        {/* Process Temperature */}
                        <div className='bg-white border rounded p-3'>
                            <h3 className='font-medium mb-2'>
                                Process Temperature
                            </h3>
                            <ResponsiveContainer
                                width='100%'
                                height={200}
                            >
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis
                                        dataKey='time'
                                        minTickGap={20}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type='monotone'
                                        dataKey='observed_process_temperature'
                                        name='Observed'
                                        stroke='#ef4444'
                                        dot={false}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='forecast_process_temperature'
                                        name='Forecast'
                                        stroke='#f97316'
                                        dot={false}
                                        strokeDasharray='4 4'
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Torque */}
                        <div className='bg-white border rounded p-3'>
                            <h3 className='font-medium mb-2'>Torque</h3>
                            <ResponsiveContainer
                                width='100%'
                                height={200}
                            >
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis
                                        dataKey='time'
                                        minTickGap={20}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type='monotone'
                                        dataKey='observed_torque'
                                        name='Observed'
                                        stroke='#06b6d4'
                                        dot={false}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='forecast_torque'
                                        name='Forecast'
                                        stroke='#0891b2'
                                        dot={false}
                                        strokeDasharray='4 4'
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Air Temperature */}
                        <div className='bg-white border rounded p-3'>
                            <h3 className='font-medium mb-2'>
                                Air Temperature
                            </h3>
                            <ResponsiveContainer
                                width='100%'
                                height={200}
                            >
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis
                                        dataKey='time'
                                        minTickGap={20}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type='monotone'
                                        dataKey='observed_air_temperature'
                                        name='Observed'
                                        stroke='#f59e0b'
                                        dot={false}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='forecast_air_temperature'
                                        name='Forecast'
                                        stroke='#d97706'
                                        dot={false}
                                        strokeDasharray='4 4'
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Tool Wear */}
                        <div className='bg-white border rounded p-3'>
                            <h3 className='font-medium mb-2'>Tool Wear</h3>
                            <ResponsiveContainer
                                width='100%'
                                height={200}
                            >
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis
                                        dataKey='time'
                                        minTickGap={20}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type='monotone'
                                        dataKey='observed_tool_wear'
                                        name='Observed'
                                        stroke='#7c3aed'
                                        dot={false}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='forecast_tool_wear'
                                        name='Forecast'
                                        stroke='#a78bfa'
                                        dot={false}
                                        strokeDasharray='4 4'
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Rotational Speed */}
                        <div className='bg-white border rounded p-3'>
                            <h3 className='font-medium mb-2'>
                                Rotational Speed
                            </h3>
                            <ResponsiveContainer
                                width='100%'
                                height={200}
                            >
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis
                                        dataKey='time'
                                        minTickGap={20}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type='monotone'
                                        dataKey='observed_rotational_speed'
                                        name='Observed'
                                        stroke='#16a34a'
                                        dot={false}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='forecast_rotational_speed'
                                        name='Forecast'
                                        stroke='#22c55e'
                                        dot={false}
                                        strokeDasharray='4 4'
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && chartData.length === 0 && (
                <div>No readings returned.</div>
            )}
        </div>
    )
}
