import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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

export default function MachineDetail(): JSX.Element {
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

                if (ct.includes('text/html')) {
                    const html = await res.text()
                    const snippet = html.slice(0, 500)
                    throw new Error(
                        'Received HTML response instead of JSON. This usually means the request hit the frontend dev server or a wrong URL. Response snippet: ' +
                            snippet
                    )
                }

                try {
                    return await res.json()
                } catch (jsonErr) {
                    const raw = await res.text()
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

            {!loading && !error && readings && (
                <div>
                    <p className='mb-2'>
                        Showing {readings.length} readings (up to 300).
                    </p>
                    <div className='overflow-auto max-h-[60vh] bg-white border rounded p-3'>
                        <pre className='text-sm'>
                            {JSON.stringify(readings, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {!loading && !error && !readings && (
                <div>No readings returned.</div>
            )}
        </div>
    )
}
