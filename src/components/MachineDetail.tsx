import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Activity, Zap, Clock, TrendingUp, Calendar } from 'lucide-react'
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
import { Button } from './ui/button'

interface SensorData {
    _id?: string
    timestamp?: string
    machine_id?: string
    machine_type?: string
    air_temperature: number
    process_temperature: number
    rotational_speed: number
    torque: number
    tool_wear: number
    [key: string]: any
}

interface TimelineResponse {
    last_readings: SensorData[]
    forecast_minutes: number
    forecast_data: SensorData[]
    created_at: string
}

interface MachineStatusItem {
    machine_id: string
    status: string
    prediction: string
    confidence: number[]
    last_updated: string
}

interface MachineStatusResponse {
    count: number
    machines: MachineStatusItem[]
}

interface PredictResponse {
    prediction_numeric: number
    prediction_label: string
    probabilities: number[]
}

const maintenanceHistory = [
    { month: 'Mei', count: 2 },
    { month: 'Jun', count: 1 },
    { month: 'Jul', count: 3 },
    { month: 'Agu', count: 1 },
    { month: 'Sep', count: 2 },
    { month: 'Okt', count: 1 },
]

export default function MachineDetail() {
    const { id } = useParams()
    const machineId = id ?? ''
    const navigate = useNavigate()
    
    const [readings, setReadings] = useState<SensorData[]>([])
    const [forecast, setForecast] = useState<SensorData[]>([])
    const [classification, setClassification] = useState<PredictResponse | null>(null)
    const [lastUpdated, setLastUpdated] = useState<string>('-')
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

     const API_BASE =
        (import.meta as any)?.env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

    const fetchData = async () => {
        if (!machineId) return
        setLoading(true)
        setError(null)
        
        try {
            const token = localStorage.getItem('access_token')
            const headers = { 
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}) 
            }

            const [timelineRes, statusRes] = await Promise.all([
                fetch(`${API_BASE}/timeline?limit=50&forecast_minutes=100`, { headers }),
                fetch(`${API_BASE}/machine-status`, { headers })
            ])

            if (!timelineRes.ok) throw new Error('Gagal mengambil data timeline')
            
            const timelineData: TimelineResponse = await timelineRes.json()
            
            let historical = timelineData.last_readings || []
            if (historical.length > 0 && historical[0].machine_id) {
                historical = historical.filter(r => r.machine_id === machineId)
            }
            if (historical.length === 0) {
                const readingsRes = await fetch(`${API_BASE}/readings?machine_id=${machineId}&limit=50`, { headers })
                if (readingsRes.ok) {
                    const readingsData = await readingsRes.json()
                    historical = readingsData.readings || []
                }
            }
            historical.sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime())
            setReadings(historical)

            const rawForecast = timelineData.forecast_data || []
            let lastTime = historical.length > 0 
                ? new Date(historical[historical.length - 1].timestamp!).getTime()
                : Date.now()

            const processedForecast = rawForecast.map((item) => {
                lastTime += 60000 
                return {
                    ...item,
                    timestamp: new Date(lastTime).toISOString(),
                    machine_id: machineId,
                    air_temperature: item.air_temperature ?? 0,
                    process_temperature: item.process_temperature ?? 0,
                    rotational_speed: item.rotational_speed ?? 0,
                    torque: item.torque ?? 0,
                    tool_wear: item.tool_wear ?? 0
                }
            })
            setForecast(processedForecast)

            if (statusRes.ok) {
                const statusData: MachineStatusResponse = await statusRes.json()
                const currentMachine = statusData.machines.find(m => m.machine_id === machineId)
                
                if (currentMachine) {
                    setClassification({
                        prediction_label: currentMachine.prediction,
                        probabilities: currentMachine.confidence,
                        prediction_numeric: currentMachine.prediction === 'No Failure' ? 0 : 1
                    })
                    setLastUpdated(currentMachine.last_updated)
                }
            }

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Terjadi kesalahan saat memuat data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [machineId])

    const latest = readings.length > 0 ? readings[readings.length - 1] : null

    const healthScore = useMemo(() => {
        if (!classification) return 0
        const maxConf = Math.max(...classification.probabilities)
        if (classification.prediction_label === 'No Failure') {
            return Math.round(maxConf * 100)
        } else {
            return Math.round((1 - maxConf) * 100)
        }
    }, [classification])

    const powerUsage = useMemo(() => {
        if (!latest) return 0
        const p = (latest.torque * latest.rotational_speed) / 9550
        return p.toFixed(2)
    }, [latest])

    const efficiency = useMemo(() => {
        if (!latest) return 0
        const diff = latest.process_temperature - latest.air_temperature
        let eff = 100 - Math.max(0, (diff - 8)) 
        return Math.min(100, Math.max(0, Math.round(eff)))
    }, [latest])

    const chartData = useMemo(() => {
        const histMapped = readings.map(r => ({
            time: new Date(r.timestamp!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            obs_process: r.process_temperature,
            obs_air: r.air_temperature,
            obs_torque: r.torque,
            obs_rpm: r.rotational_speed,
            obs_wear: r.tool_wear,
        }))

        const foreMapped = forecast.map(r => ({
            time: new Date(r.timestamp!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            fc_process: r.process_temperature,
            fc_air: r.air_temperature,
            fc_torque: r.torque,
            fc_rpm: r.rotational_speed,
            fc_wear: r.tool_wear,
        }))

        return [...histMapped, ...foreMapped]
    }, [readings, forecast])

    const getDomain = (keys: string[]) => {
        const values: number[] = []
        readings.forEach(r => keys.forEach(k => values.push(r[k as keyof SensorData] as number)))
        forecast.forEach(r => keys.forEach(k => values.push(r[k as keyof SensorData] as number)))
        
        if (values.length === 0) return ['auto', 'auto']
        const min = Math.min(...values)
        const max = Math.max(...values)
        const padding = (max - min) * 0.1
        return [Math.floor(min - padding), Math.ceil(max + padding)]
    }

    return (
        <div className='p-6 max-w-7xl mx-auto space-y-6'>
            <div className='flex justify-between items-center'>
                <div className='flex items-center gap-4'>
                    <button
                        onClick={() => navigate(-1)}
                        className='p-2 rounded-full hover:bg-slate-100 transition-colors'
                        title='Kembali'
                    >
                        <ArrowLeft className='w-6 h-6 text-slate-600' />
                    </button>
                    <div>
                        <h1 className='text-2xl font-bold text-slate-900'>
                            Detail Mesin: {machineId}
                        </h1>
                        <p className='text-slate-500 text-sm'>
                            Pemantauan Real-time & Prediksi AI
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Machine Statistics
                </h3>
                <div className="grid grid-cols-5 gap-4">
                    <CardItem 
                        icon={<Clock className="w-5 h-5 text-blue-600" />}
                        label="Operations Hours"
                        value="1,240 Jam" 
                        subtext="Since last service"
                    />
                    <CardItem 
                        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                        label="Efisiensi"
                        value={`${efficiency}%`}
                        subtext="Optimal"
                    />
                    <CardItem 
                        icon={<Activity className={`w-5 h-5 ${healthScore > 80 ? 'text-green-600' : 'text-red-600'}`} />}
                        label="Health Score"
                        value={`${healthScore}/100`}
                        subtext={classification?.prediction_label}
                        highlight={healthScore < 70}
                    />
                    <CardItem 
                        icon={<Zap className="w-5 h-5 text-yellow-600" />}
                        label="Power Usage"
                        value={`${powerUsage} kW`}
                        subtext="Calculated Load"
                    />
                    <CardItem 
                        icon={<Calendar className="w-5 h-5 text-slate-600" />}
                        label="Last Maintenance"
                        value={lastUpdated !== '-' ? new Date(lastUpdated).toLocaleDateString() : '-'}
                        subtext="Check Log"
                    />
                    
                    <CardItem 
                        label="Air Temperature"
                        value={latest?.air_temperature ?? '-'}
                        unit=" K"
                        subtext="Ambient"
                    />
                    <CardItem 
                        label="Process Temp"
                        value={latest?.process_temperature ?? '-'}
                        unit=" K"
                        subtext="Operational"
                    />
                    <CardItem 
                        label="Rotational Speed"
                        value={latest?.rotational_speed ?? '-'}
                        unit=" RPM"
                        subtext="Motor Speed"
                    />
                    <CardItem 
                        label="Torque"
                        value={latest?.torque ?? '-'}
                        unit=" Nm"
                        subtext="Force"
                    />
                    <CardItem 
                        label="Tool Wear"
                        value={latest?.tool_wear ?? '-'}
                        unit=" Min"
                        subtext="Cumulative"
                        highlight={(latest?.tool_wear || 0) > 200}
                    />
                </div>
            </div>

            {readings.length > 0 && (
                <div className='space-y-6'>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        Grafik Analisis
                    </h3>

                    <ChartSection title="Process Temperature Analysis">
                        <ResponsiveContainer width='100%' height={250}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                                <XAxis dataKey='time' fontSize={12} />
                                <YAxis domain={getDomain(['obs_process', 'fc_process'])} fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Line type='monotone' dataKey='obs_process' name='Observed' stroke='#2563eb' strokeWidth={2} dot={false} />
                                <Line type='monotone' dataKey='fc_process' name='Forecast' stroke='#93c5fd' strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartSection>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <ChartSection title="Torque Dynamics">
                            <ResponsiveContainer width='100%' height={200}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='time' fontSize={10} />
                                    <YAxis domain={getDomain(['obs_torque'])} fontSize={10} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type='monotone' dataKey='obs_torque' name='Torque' stroke='#d97706' strokeWidth={2} dot={false} />
                                    <Line type='monotone' dataKey='fc_torque' name='Forecast' stroke='#fcd34d' strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartSection>

                        <ChartSection title="Air Temperature">
                            <ResponsiveContainer width='100%' height={200}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='time' fontSize={10} />
                                    <YAxis domain={getDomain(['obs_air'])} fontSize={10} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type='monotone' dataKey='obs_air' name='Air Temp' stroke='#16a34a' strokeWidth={2} dot={false} />
                                    <Line type='monotone' dataKey='fc_air' name='Forecast' stroke='#86efac' strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartSection>

                        <ChartSection title="Tool Wear Status">
                            <ResponsiveContainer width='100%' height={200}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='time' fontSize={10} />
                                    <YAxis domain={getDomain(['obs_wear'])} fontSize={10} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type='monotone' dataKey='obs_wear' name='Wear (Min)' stroke='#dc2626' strokeWidth={2} dot={false} />
                                    <Line type='monotone' dataKey='fc_wear' name='Forecast' stroke='#fca5a5' strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartSection>

                        <ChartSection title="Rotational Speed (RPM)">
                            <ResponsiveContainer width='100%' height={200}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='time' fontSize={10} />
                                    <YAxis domain={getDomain(['obs_rpm'])} fontSize={10} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type='monotone' dataKey='obs_rpm' name='RPM' stroke='#9333ea' strokeWidth={2} dot={false} />
                                    <Line type='monotone' dataKey='fc_rpm' name='Forecast' stroke='#d8b4fe' strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartSection>
                        
                         <ChartSection title="Maintenance History">
                            <ResponsiveContainer width='100%' height={200}>
                                <BarChart data={maintenanceHistory}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='month' fontSize={10} />
                                    <YAxis fontSize={10} />
                                    <Tooltip />
                                    <Bar dataKey='count' fill='#475569' name='Intervention' radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartSection>
                    </div>
                </div>
            )}
        </div>
    )
}

function CardItem({ 
    label, value, subtext, icon, unit = '', highlight = false 
}: { 
    label: string, value: string | number, subtext?: string, icon?: React.ReactNode, unit?: string, highlight?: boolean 
}) {
    return (
        <div className={`p-4 bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${highlight ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase">{label}</span>
                {icon}
            </div>
            <div className={`text-xl font-bold ${highlight ? 'text-red-700' : 'text-slate-900'}`}>
                {value}<span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
            </div>
            {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
        </div>
    )
}

function ChartSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className='bg-white p-4 rounded-xl border border-slate-200 shadow-sm'>
            <h4 className='font-bold text-slate-700 mb-4 text-sm'>{title}</h4>
            {children}
        </div>
    )
}