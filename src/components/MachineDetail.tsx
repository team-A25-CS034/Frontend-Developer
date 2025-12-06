import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar,
} from 'recharts'

// Mock maintenance history
const maintenanceHistory = [
    { month: 'May', count: 2 },
    { month: 'Jun', count: 1 },
    { month: 'Jul', count: 3 },
    { month: 'Aug', count: 1 },
    { month: 'Sep', count: 2 },
    { month: 'Oct', count: 1 },
]

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

        const timelineUrl = `${API_BASE}/timeline?limit=50&forecast_minutes=100`

        setLoading(true)

        fetchJson(timelineUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        })
            .then((timelineResp) => {
                const readingsResp = timelineResp?.last_readings ?? []
                const forecastResp = timelineResp?.forecast_data ?? []

                // normalize readings
                const arr = Array.isArray(readingsResp)
                    ? readingsResp
                    : readingsResp?.readings ?? readingsResp

                const normalizeReadings = (input: any[]) =>
                    (Array.isArray(input) ? input.reverse() : [])
                        .slice(0, 50)
                        .map((r: any, idx: number, all: any[]) => {
                            // If no timestamp in DB row, synthesize one so chart continuity works
                            const syntheticTs =
                                Date.now() - (all.length - idx) * 60 * 1000

                            return {
                                timestamp:
                                    r.timestamp ??
                                    r.ts ??
                                    r.time ??
                                    r['timestamp'] ??
                                    new Date(syntheticTs).toISOString(),
                                machine_id:
                                    r.machine_id ??
                                    r.machineId ??
                                    r['Product ID'] ??
                                    r.product_id ??
                                    null,
                                process_temperature:
                                    r.process_temperature ??
                                    r.processTemperature ??
                                    r.process_temp ??
                                    r['Process temperature [K]'] ??
                                    null,
                                torque: r.torque ?? r['Torque [Nm]'] ?? null,
                                air_temperature:
                                    r.air_temperature ??
                                    r.airTemperature ??
                                    r.air_temp ??
                                    r['Air temperature [K]'] ??
                                    null,
                                tool_wear:
                                    r.tool_wear ??
                                    r.toolWear ??
                                    r['Tool wear [min]'] ??
                                    null,
                                rotational_speed:
                                    r.rotational_speed ??
                                    r.rotationalSpeed ??
                                    r.rpm ??
                                    r['Rotational speed [rpm]'] ??
                                    null,
                            }
                        })

                const normalized = normalizeReadings(arr)

                // normalize forecast: forecastResp may be { forecast_data: [...] }
                const farr = Array.isArray(forecastResp)
                    ? forecastResp
                    : forecastResp?.forecast_data ??
                      forecastResp?.forecast ??
                      []
                const normalizedForecast = (Array.isArray(farr) ? farr : [])
                    .slice(0, 100)
                    .map((r: any) => ({
                        timestamp: r.timestamp ?? r.ts ?? r.time,
                        machine_id: r.machine_id ?? r.machineId ?? machineId,
                        process_temperature:
                            r.process_temperature ??
                            r.processTemperature ??
                            r['Process temperature [K]'] ??
                            null,
                        torque: r.torque ?? null,
                        air_temperature:
                            r.air_temperature ??
                            r.airTemperature ??
                            r['Air temperature [K]'] ??
                            null,
                        tool_wear:
                            r.tool_wear ??
                            r.toolWear ??
                            r['Tool wear [min]'] ??
                            null,
                        rotational_speed:
                            r.rotational_speed ??
                            r.rotationalSpeed ??
                            r.rpm ??
                            r['Rotational speed [rpm]'] ??
                            null,
                    }))

                // If no readings came back for this machine_id, retry without filter to show sample data
                if (normalized.length === 0) {
                    const fallbackUrl = `${API_BASE}/readings?limit=50`
                    fetchJson(fallbackUrl, {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            ...(token
                                ? { Authorization: `Bearer ${token}` }
                                : {}),
                        },
                    })
                        .then((fallbackResp) => {
                            const arr2 = Array.isArray(fallbackResp)
                                ? fallbackResp
                                : fallbackResp?.readings ?? fallbackResp
                            const normalizedFallback = normalizeReadings(arr2)
                            setReadings(normalizedFallback)
                            setForecast(normalizedForecast)
                            setLoading(false)
                        })
                        .catch((err2: any) => {
                            setError(String(err2))
                            setForecast(normalizedForecast)
                            setLoading(false)
                        })
                    return
                }

                setReadings(normalized)
                setForecast(normalizedForecast)
                setLoading(false)
            })
            .catch((err: any) => {
                setError(String(err))
                setLoading(false)
            })
    }, [machineId, API_BASE])

    const latestReading = useMemo(() => {
        if (!readings || readings.length === 0) return null

        return readings.reduce((best: any, cur: any) => {
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
    }, [readings])

    // When readings are available, classify the latest reading via POST /predict
    useEffect(() => {
        if (!latestReading) {
            setClassification(null)
            return
        }

        const token = localStorage.getItem('access_token')

        const payload = {
            Air_temperature:
                latestReading.air_temperature ??
                latestReading.process_temperature ??
                0,
            Process_temperature:
                latestReading.process_temperature ??
                latestReading.air_temperature ??
                0,
            Rotational_speed: latestReading.rotational_speed ?? 0,
            Torque: latestReading.torque ?? 0,
            Tool_wear: latestReading.tool_wear ?? 0,
            Type: (latestReading.machine_type ?? latestReading.machine_id)
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
    }, [latestReading, API_BASE])

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

        // Determine the last observed timestamp to anchor forecast continuity
        const lastObsTimeMs = (() => {
            for (let i = obs.length - 1; i >= 0; i -= 1) {
                const t = obs[i]?.timestamp
                const ms = t ? new Date(t).getTime() : Number.NaN
                if (!Number.isNaN(ms)) return ms
            }
            return Number.NaN
        })()

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
            time: (() => {
                const forecastMs = r.timestamp
                    ? new Date(r.timestamp).getTime()
                    : Number.NaN
                if (!Number.isNaN(forecastMs)) {
                    return new Date(forecastMs).toLocaleString()
                }
                if (!Number.isNaN(lastObsTimeMs)) {
                    const t = lastObsTimeMs + (idx + 1) * 60 * 1000
                    return new Date(t).toLocaleString()
                }
                return String(obs.length + idx + 1)
            })(),
            forecast_process_temperature: r.process_temperature ?? null,
            forecast_torque: r.torque ?? null,
            forecast_air_temperature: r.air_temperature ?? null,
            forecast_tool_wear: r.tool_wear ?? null,
            forecast_rotational_speed: r.rotational_speed ?? null,
        }))

        // combine: observed first, forecast appended (times already made continuous)
        return [...obsMapped, ...fcdMapped]
    }, [readings, forecast])

    // Calculate dynamic Y-axis domains from observed + forecast data
    const yAxisDomains = React.useMemo(() => {
        const allData = [...(readings || []), ...(forecast || [])]

        const calcDomain = (field: string) => {
            const values = allData
                .map((d: any) => d[field])
                .filter((v: any) => v != null && !isNaN(v))
            if (values.length === 0) return undefined
            const min = Math.min(...values)
            const max = Math.max(...values)
            const padding = (max - min) * 0.1 || 1
            return [Math.floor(min - padding), Math.ceil(max + padding)]
        }

        return {
            process_temperature: calcDomain('process_temperature'),
            torque: calcDomain('torque'),
            air_temperature: calcDomain('air_temperature'),
            tool_wear: calcDomain('tool_wear'),
            rotational_speed: calcDomain('rotational_speed'),
        }
    }, [readings, forecast])

    return (
        <div className='p-6'>
            <div className='mb-4'>
                <button
                    onClick={() => navigate(-1)}
                    className='inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer'
                    aria-label='Back'
                >
                    <ArrowLeft className='w-4 h-4' />
                    <span className='text-sm font-medium'>Back</span>
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

            {latestReading && (
                <div className='mb-6'>
                    <h3 className='text-sm text-slate-500 mb-2'>
                        Latest sensor snapshot
                    </h3>
                    <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                        <div className='bg-white border rounded p-3'>
                            <div className='text-xs text-slate-500 mb-1'>
                                Process Temperature
                            </div>
                            <div className='text-lg font-semibold text-slate-800'>
                                {latestReading.process_temperature ?? 'N/A'}
                            </div>
                        </div>
                        <div className='bg-white border rounded p-3'>
                            <div className='text-xs text-slate-500 mb-1'>
                                Air Temperature
                            </div>
                            <div className='text-lg font-semibold text-slate-800'>
                                {latestReading.air_temperature ?? 'N/A'}
                            </div>
                        </div>
                        <div className='bg-white border rounded p-3'>
                            <div className='text-xs text-slate-500 mb-1'>
                                Torque
                            </div>
                            <div className='text-lg font-semibold text-slate-800'>
                                {latestReading.torque ?? 'N/A'}
                            </div>
                        </div>
                        <div className='bg-white border rounded p-3'>
                            <div className='text-xs text-slate-500 mb-1'>
                                Rotational Speed
                            </div>
                            <div className='text-lg font-semibold text-slate-800'>
                                {latestReading.rotational_speed ?? 'N/A'}
                            </div>
                        </div>
                        <div className='bg-white border rounded p-3'>
                            <div className='text-xs text-slate-500 mb-1'>
                                Tool Wear
                            </div>
                            <div className='text-lg font-semibold text-slate-800'>
                                {latestReading.tool_wear ?? 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && <div>Loading readings...</div>}
            {error && <div className='text-red-600'>Error: {error}</div>}

            {!loading && !error && chartData.length > 0 && (
                <div>
                    <p className='mb-2'>
                        Showing up to 50 observed readings and 100 forecast
                        points (actual returned:{' '}
                        {readings ? readings.length : 0} observed,{' '}
                        {forecast ? forecast.length : 0} forecast).
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
                                    <YAxis
                                        domain={
                                            yAxisDomains.process_temperature
                                        }
                                    />
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
                                    <YAxis domain={yAxisDomains.torque} />
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
                                    <YAxis
                                        domain={yAxisDomains.air_temperature}
                                    />
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
                                    <YAxis domain={yAxisDomains.tool_wear} />
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
                                    <YAxis
                                        domain={yAxisDomains.rotational_speed}
                                    />
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

            {/* Maintenance History */}
            <div className='mt-6 bg-white border rounded p-4'>
                <h3 className='font-medium mb-4'>Maintenance History</h3>
                <ResponsiveContainer
                    width='100%'
                    height={250}
                >
                    <BarChart data={maintenanceHistory}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='month' />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                            dataKey='count'
                            fill='#3b82f6'
                            name='Maintenance Count'
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {!loading && !error && chartData.length === 0 && (
                <div>No readings returned.</div>
            )}
        </div>
    )
}
