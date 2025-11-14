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
        const url = `${API_BASE}/readings?machine_id=${encodeURIComponent(
            machineId
        )}&limit=300`

        setLoading(true)
        fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        })
            .then(async (res) => {
                const ct = (res.headers.get('content-type') || '').toLowerCase()
                if (!res.ok) {
                    const txt = await res.text()
                    throw new Error(`${res.status} ${res.statusText} ${txt}`)
                }

                // read the raw body text once, then inspect/parse it
                const raw = await res.text()
                if (ct.includes('text/html')) {
                    const snippet = raw.slice(0, 500)
                    throw new Error(
                        'Received HTML response instead of JSON. This usually means the request hit the frontend dev server or a wrong URL. Response snippet: ' +
                            snippet
                    )
                }

                try {
                    return JSON.parse(raw)
                } catch {
                    throw new Error(
                        'Invalid JSON response: ' + raw.slice(0, 1000)
                    )
                }
            })
            .then((data) => {
                // Accept either { readings: [...] } or an array
                const arr = Array.isArray(data) ? data : data?.readings ?? data
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

                setReadings(normalized)
                setLoading(false)
            })
            .catch((err: any) => {
                setError(String(err))
                setLoading(false)
            })
    }, [machineId, API_BASE])

    // prepare chart data: sort by timestamp when possible
    const chartData = React.useMemo(() => {
        if (!readings || readings.length === 0) return []
        const arr = [...readings]
        arr.sort((a, b) => {
            const ta = a.timestamp
                ? new Date(a.timestamp).getTime()
                : Number.NaN
            const tb = b.timestamp
                ? new Date(b.timestamp).getTime()
                : Number.NaN
            if (Number.isNaN(ta) || Number.isNaN(tb)) return 0
            return ta - tb
        })
        return arr.map((r, idx) => ({
            time:
                r.timestamp && !Number.isNaN(new Date(r.timestamp).getTime())
                    ? new Date(r.timestamp).toLocaleString()
                    : String(idx + 1),
            process_temperature: r.process_temperature ?? null,
            torque: r.torque ?? null,
            air_temperature: r.air_temperature ?? null,
            tool_wear: r.tool_wear ?? null,
            rotational_speed: r.rotational_speed ?? null,
        }))
    }, [readings])

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

            {loading && <div>Loading readings...</div>}
            {error && <div className='text-red-600'>Error: {error}</div>}

            {!loading && !error && chartData.length > 0 && (
                <div>
                    <p className='mb-2'>
                        Showing {chartData.length} readings (up to 300).
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
                                        dataKey='process_temperature'
                                        stroke='#ef4444'
                                        dot={false}
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
                                        dataKey='torque'
                                        stroke='#06b6d4'
                                        dot={false}
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
                                        dataKey='air_temperature'
                                        stroke='#f59e0b'
                                        dot={false}
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
                                        dataKey='tool_wear'
                                        stroke='#7c3aed'
                                        dot={false}
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
                                        dataKey='rotational_speed'
                                        stroke='#16a34a'
                                        dot={false}
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
