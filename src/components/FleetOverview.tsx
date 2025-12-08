import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    AlignLeft,
    AlertTriangle,
    CheckCircle,
    Eye,
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

// Default mock data for fallback
const defaultMachines = [
    {
        id: 'M001',
        name: 'Pump Station A-12',
        status: 'Normal',
        failureType: 'Unknown',
        riskScore: 12,
        location: 'Building A, Floor 2',
        lastMaintenance: '2025-10-15',
    },
    {
        id: 'M002',
        name: 'Compressor B-04',
        status: 'Watch',
        failureType: 'Unknown',
        riskScore: 58,
        location: 'Building B, Floor 1',
        lastMaintenance: '2025-09-20',
    },
    {
        id: 'M003',
        name: 'Motor Drive C-33',
        status: 'Risk',
        failureType: 'Unknown',
        riskScore: 87,
        location: 'Building C, Floor 3',
        lastMaintenance: '2025-08-10',
    },
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

    useEffect(() => {
        const fetchMachineIds = async () => {
            try {
                // Get token from localStorage
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
                        const machineList = machinesResp.map((m: any) => {
                            const label = m.prediction_label ?? 'Unknown'
                            const status =
                                label === 'No Failure' ? 'Normal' : 'Risk'
                            return {
                                id: m.machine_id ?? 'Unknown',
                                name: `Machine ${m.machine_id ?? 'Unknown'}`,
                                status,
                                failureType: label,
                                riskScore: Math.floor(Math.random() * 100),
                                location: 'TBD',
                                lastMaintenance: '2025-12-01',
                            }
                        })
                        setMachines(machineList)
                    }
                } else {
                    console.error('Failed to fetch machine IDs')
                }
            } catch (error) {
                console.error('Error fetching machine IDs:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMachineIds()
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
        if (score >= 70) return 'text-red-600'
        if (score >= 50) return 'text-yellow-600'
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

        // special handling for machine ID: sort by numeric suffix when present (machine_01 -> 1)
        if (sortBy === 'id') {
            const numA = String(va).match(/(\d+)$/)?.[1]
            const numB = String(vb).match(/(\d+)$/)?.[1]
            if (numA && numB) {
                const nA = Number(numA)
                const nB = Number(numB)
                return sortDir === 'asc' ? nA - nB : nB - nA
            }
            // fallback to string compare below if numeric suffix not present
        }

        // special handling for certain columns
        if (sortBy === 'riskScore') {
            va = Number(va)
            vb = Number(vb)
        }

        if (sortBy === 'lastMaintenance') {
            va = new Date(va).getTime()
            vb = new Date(vb).getTime()
        }

        if (sortBy === 'status') {
            va = statusOrder[va] ?? 99
            vb = statusOrder[vb] ?? 99
        }

        // string compare (case-insensitive)
        if (typeof va === 'string' && typeof vb === 'string') {
            const res = va.localeCompare(vb, undefined, { sensitivity: 'base' })
            return sortDir === 'asc' ? res : -res
        }

        // numeric compare
        if (typeof va === 'number' && typeof vb === 'number') {
            return sortDir === 'asc' ? va - vb : vb - va
        }

        // fallback
        const res = String(va).localeCompare(String(vb))
        return sortDir === 'asc' ? res : -res
    })

    const toggleSort = (column: string) => {
        // Cycle: asc -> desc -> none -> asc
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
            {/* Stats Cards */}
            <div className='grid grid-cols-4 gap-6 mb-8'>
                <div className='bg-white rounded-lg p-6 border border-slate-200'>
                    <p className='text-slate-600'>Total Machines</p>
                    <p className='text-slate-900 mt-2'>{stats.total}</p>
                </div>
                <div className='bg-white rounded-lg p-6 border border-slate-200'>
                    <p className='text-slate-600'>Normal</p>
                    <p className='text-green-600 mt-2'>{stats.normal}</p>
                </div>
                <div className='bg-white rounded-lg p-6 border border-slate-200'>
                    <p className='text-slate-600'>Watch</p>
                    <p className='text-yellow-600 mt-2'>{stats.watch}</p>
                </div>
                <div className='bg-white rounded-lg p-6 border border-slate-200'>
                    <p className='text-slate-600'>At Risk</p>
                    <p className='text-red-600 mt-2'>{stats.risk}</p>
                </div>
            </div>

            {/* Filters */}
            <div className='bg-white rounded-lg border border-slate-200 p-6 mb-6'>
                <div className='flex gap-4 items-center'>
                    <div className='flex-1 relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400' />
                        <Input
                            placeholder='Search machines by name or ID...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-10'
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className='w-48'>
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

            {/* Machines Table */}
            <div className='bg-white rounded-lg border border-slate-200'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <span>Machine ID</span>
                                        {sortBy === 'id' &&
                                            (sortDir === 'asc' ? (
                                                <span>▲</span>
                                            ) : (
                                                <span>▼</span>
                                            ))}
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => toggleSort('id')}
                                        aria-label='Sort by Machine ID'
                                        className='p-1 hover:bg-slate-100 rounded'
                                    >
                                        <AlignLeft className='w-4 h-4 text-slate-500' />
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <span>Machine Name</span>
                                        {sortBy === 'name' &&
                                            (sortDir === 'asc' ? (
                                                <span>▲</span>
                                            ) : (
                                                <span>▼</span>
                                            ))}
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => toggleSort('name')}
                                        aria-label='Sort by Machine Name'
                                        className='p-1 hover:bg-slate-100 rounded'
                                    >
                                        <AlignLeft className='w-4 h-4 text-slate-500' />
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <span>Status</span>
                                        {sortBy === 'status' &&
                                            (sortDir === 'asc' ? (
                                                <span>▲</span>
                                            ) : (
                                                <span>▼</span>
                                            ))}
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => toggleSort('status')}
                                        aria-label='Sort by Status'
                                        className='p-1 hover:bg-slate-100 rounded'
                                    >
                                        <AlignLeft className='w-4 h-4 text-slate-500' />
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>Failure Type</TableHead>
                            <TableHead>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <span>Risk Score</span>
                                        {sortBy === 'riskScore' &&
                                            (sortDir === 'asc' ? (
                                                <span>▲</span>
                                            ) : (
                                                <span>▼</span>
                                            ))}
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => toggleSort('riskScore')}
                                        aria-label='Sort by Risk Score'
                                        className='p-1 hover:bg-slate-100 rounded'
                                    >
                                        <AlignLeft className='w-4 h-4 text-slate-500' />
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <span>Last Maintenance</span>
                                        {sortBy === 'lastMaintenance' &&
                                            (sortDir === 'asc' ? (
                                                <span>▲</span>
                                            ) : (
                                                <span>▼</span>
                                            ))}
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            toggleSort('lastMaintenance')
                                        }
                                        aria-label='Sort by Last Maintenance'
                                        className='p-1 hover:bg-slate-100 rounded'
                                    >
                                        <AlignLeft className='w-4 h-4 text-slate-500' />
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedMachines.map((machine) => (
                            <TableRow key={machine.id}>
                                <TableCell>{machine.id}</TableCell>
                                <TableCell>{machine.name}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant='outline'
                                        className={`flex items-center gap-1 w-fit ${getStatusColor(
                                            machine.status
                                        )}`}
                                    >
                                        {getStatusIcon(machine.status)}
                                        {machine.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {loading ? (
                                        <span className='text-slate-400 text-sm'>
                                            Loading...
                                        </span>
                                    ) : (
                                        machine.failureType ?? 'Unknown'
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={getRiskColor(
                                            machine.riskScore
                                        )}
                                    >
                                        {machine.riskScore}
                                    </span>
                                </TableCell>
                                <TableCell>{machine.lastMaintenance}</TableCell>
                                <TableCell>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                            navigate(`/machine/${machine.id}`)
                                        }
                                    >
                                        <Eye className='w-4 h-4 mr-2' />
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
