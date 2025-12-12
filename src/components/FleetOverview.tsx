import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    AlignLeft,
    AlertTriangle,
    CheckCircle,
    Eye,
    RefreshCw,
} from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table'

interface MachineAPIResponse {
    machine_id: string
    status: string
    prediction: string
    confidence: number[]
    last_updated: string
}

const defaultMachines = [
    {
        id: 'M001',
        name: 'Pump Station A-12',
        status: 'Normal',
        failureType: 'No Failure',
        riskScore: 12,
        location: 'Building A, Floor 2',
        lastMaintenance: '2025-10-15',
    }
]

export default function FleetOverview() {
    const navigate = useNavigate()

    const API_BASE =
        (import.meta as any)?.env?.VITE_API_BASE_URL ?? 'http://localhost:8000'

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState<string | null>(null)
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
    const [machines, setMachines] = useState(defaultMachines)
    const [loading, setLoading] = useState(true)

    const fetchMachineStatus = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('No access token found')
                setLoading(false)
                return
            }

            const response = await fetch(`${API_BASE}/machine-status`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                const machinesResp = data?.machines ?? []

                if (Array.isArray(machinesResp)) {
                    const machineList = machinesResp.map((m: MachineAPIResponse) => {
                        const isNormal = m.prediction === 'No Failure'

                        const uiStatus = isNormal ? 'Normal' : 'Risk'

                        const calculatedRisk = isNormal
                            ? Math.floor((1 - (m.confidence[0] || 0.9)) * 100) 
                            : Math.floor((Math.max(...m.confidence.slice(1)) || 0.8) * 100)

                        const formattedName = m.machine_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

                        return {
                            id: m.machine_id,
                            name: formattedName,
                            status: uiStatus,
                            failureType: m.prediction,
                            riskScore: Math.max(0, Math.min(100, calculatedRisk)), 
                            location: 'Factory Floor 1', 
                            lastMaintenance: new Date(m.last_updated).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            }),
                        }
                    })

                    if (machineList.length > 0) {
                        setMachines(machineList)
                    }
                }
            } else {
                console.error('Failed to fetch machine status')
                if (response.status === 401) {
                    localStorage.removeItem('access_token')
                    navigate('/login')
                }
            }
        } catch (error) {
            console.error('Error fetching machine status:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMachineStatus()

        const interval = setInterval(fetchMachineStatus, 30000)
        return () => clearInterval(interval)
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Normal':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'Watch':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'Risk':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Normal':
                return <CheckCircle className='w-4 h-4' />
            case 'Watch':
            case 'Risk':
                return <AlertTriangle className='w-4 h-4' />
            default:
                return null
        }
    }

    const getRiskColor = (score: number) => {
        if (score >= 70) return 'text-red-600 font-bold'
        if (score >= 30) return 'text-yellow-600 font-medium'
        return 'text-green-600'
    }

    const filteredMachines = machines.filter((machine) => {
        const matchesSearch =
            machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            machine.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus =
            statusFilter === 'all' || machine.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const statusOrder: Record<string, number> = {
        Normal: 0,
        Watch: 1,
        Risk: 2,
    }

    const sortedMachines = [...filteredMachines].sort((a, b) => {
        if (!sortBy) return 0

        let va: any = (a as any)[sortBy]
        let vb: any = (b as any)[sortBy]

        if (sortBy === 'id') {
            const numA = String(va).match(/(\d+)$/)?.[1]
            const numB = String(vb).match(/(\d+)$/)?.[1]
            if (numA && numB) {
                return sortDir === 'asc' ? Number(numA) - Number(numB) : Number(numB) - Number(numA)
            }
        }

        if (sortBy === 'status') {
            va = statusOrder[va] ?? 99
            vb = statusOrder[vb] ?? 99
        }

        if (typeof va === 'string' && typeof vb === 'string') {
            return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
        }

        if (typeof va === 'number' && typeof vb === 'number') {
            return sortDir === 'asc' ? va - vb : vb - va
        }

        return 0
    })

    const toggleSort = (column: string) => {
        if (sortBy === column) {
            if (sortDir === 'asc') setSortDir('desc')
            else if (sortDir === 'desc') {
                setSortBy(null)
                setSortDir('asc')
            }
        } else {
            setSortBy(column)
            setSortDir('asc')
        }
    }

    const stats = {
        total: machines.length,
        normal: machines.filter((m) => m.status === 'Normal').length,
        watch: machines.filter((m) => m.status === 'Watch').length,
        risk: machines.filter((m) => m.status === 'Risk').length,
    }

    return (
        <div className='p-8'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className="text-2xl font-bold text-slate-900">Fleet Overview</h1>
                <Button variant="outline" size="sm" onClick={fetchMachineStatus} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>

            <div className='grid grid-cols-4 gap-6 mb-8'>
                <div className='bg-white rounded-lg p-6 border border-slate-200 shadow-sm'>
                    <p className='text-slate-600 text-sm font-medium'>Total Machines</p>
                    <p className='text-slate-900 mt-2 text-3xl font-bold'>{stats.total}</p>
                </div>
                <div className='bg-white rounded-lg p-6 border border-slate-200 shadow-sm'>
                    <p className='text-slate-600 text-sm font-medium'>Normal Operation</p>
                    <p className='text-green-600 mt-2 text-3xl font-bold'>{stats.normal}</p>
                </div>
                <div className='bg-white rounded-lg p-6 border border-slate-200 shadow-sm'>
                    <p className='text-slate-600 text-sm font-medium'>Watch List</p>
                    <p className='text-yellow-600 mt-2 text-3xl font-bold'>{stats.watch}</p>
                </div>
                <div className='bg-white rounded-lg p-6 border border-slate-200 shadow-sm'>
                    <p className='text-slate-600 text-sm font-medium'>Critical Risk</p>
                    <p className='text-red-600 mt-2 text-3xl font-bold'>{stats.risk}</p>
                </div>
            </div>

            <div className='bg-white rounded-lg border border-slate-200 p-4 mb-6 shadow-sm'>
                <div className='flex flex-row gap-4 items-center'>
                    <div className='relative w-full'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                        <Input
                            placeholder='Search machines...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-9'
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className='w-full md:w-48'>
                            <SelectValue placeholder='Filter by status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Statuses</SelectItem>
                            <SelectItem value='Normal'>Normal</SelectItem>
                            <SelectItem value='Watch'>Watch</SelectItem>
                            <SelectItem value='Risk'>Risk</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className='bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden'>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[150px]">
                                <button onClick={() => toggleSort('id')} className="flex items-center gap-2 font-semibold text-slate-900">
                                    Machine ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button onClick={() => toggleSort('name')} className="flex items-center gap-2 font-semibold text-slate-900">
                                    Name {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button onClick={() => toggleSort('status')} className="flex items-center gap-2 font-semibold text-slate-900">
                                    Status {sortBy === 'status' && (sortDir === 'asc' ? '▲' : '▼')}
                                </button>
                            </TableHead>
                            <TableHead className="font-semibold text-slate-900">Diagnosis</TableHead>
                            <TableHead>
                                <button onClick={() => toggleSort('riskScore')} className="flex items-center gap-2 font-semibold text-slate-900">
                                    Risk Score {sortBy === 'riskScore' && (sortDir === 'asc' ? '▲' : '▼')}
                                </button>
                            </TableHead>
                            <TableHead className="font-semibold text-slate-900">Last Update</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && machines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    Loading fleet data...
                                </TableCell>
                            </TableRow>
                        ) : sortedMachines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    No machines found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedMachines.map((machine) => (
                                <TableRow key={machine.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-medium">{machine.id}</TableCell>
                                    <TableCell>{machine.name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant='outline'
                                            className={`flex items-center gap-1 w-fit px-2 py-1 ${getStatusColor(
                                                machine.status
                                            )}`}
                                        >
                                            {getStatusIcon(machine.status)}
                                            {machine.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={machine.failureType !== 'No Failure' ? 'text-red-600 font-medium' : 'text-slate-600'}>
                                            {machine.failureType}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={getRiskColor(machine.riskScore)}>
                                                {machine.riskScore}%
                                            </span>
                                            {/* Visual Bar for Risk */}
                                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${machine.riskScore > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                                    style={{ width: `${machine.riskScore}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">{machine.lastMaintenance}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => navigate(`/machine/${machine.id}`)}
                                            className="hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <Eye className='w-4 h-4 mr-2' />
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}