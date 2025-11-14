import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, AlertTriangle, CheckCircle, Eye } from 'lucide-react'
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

// Mock data (fallback)
const machines = [
    {
        id: 'M001',
        name: 'Pump Station A-12',
        site: 'Plant North',
        status: 'Normal',
        riskScore: 12,
        location: 'Building A, Floor 2',
        lastMaintenance: '2025-10-15',
    },
    {
        id: 'M002',
        name: 'Compressor B-04',
        site: 'Plant South',
        status: 'Watch',
        riskScore: 58,
        location: 'Building B, Floor 1',
        lastMaintenance: '2025-09-20',
    },
    {
        id: 'M003',
        name: 'Motor Drive C-33',
        site: 'Plant North',
        status: 'Risk',
        riskScore: 87,
        location: 'Building C, Floor 3',
        lastMaintenance: '2025-08-10',
    },
    {
        id: 'M004',
        name: 'Turbine D-21',
        site: 'Plant East',
        status: 'Normal',
        riskScore: 24,
        location: 'Building D, Floor 1',
        lastMaintenance: '2025-11-01',
    },
    {
        id: 'M005',
        name: 'Generator E-15',
        site: 'Plant South',
        status: 'Watch',
        riskScore: 64,
        location: 'Building E, Floor 2',
        lastMaintenance: '2025-09-15',
    },
    {
        id: 'M006',
        name: 'Cooling Unit F-08',
        site: 'Plant East',
        status: 'Normal',
        riskScore: 18,
        location: 'Building F, Floor 1',
        lastMaintenance: '2025-10-28',
    },
]

export default function FleetOverview() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [siteFilter, setSiteFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const API_BASE =
        import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

    // machinesData holds either the fetched machines list or the fallback mock
    const [machinesData, setMachinesData] = useState(machines)
    const [loadingMachines, setLoadingMachines] = useState(false)
    const [machinesError, setMachinesError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMachines = async () => {
            const token = localStorage.getItem('access_token')
            if (!token) return // Not logged in or no token yet

            setLoadingMachines(true)
            setMachinesError(null)
            try {
                const resp = await fetch(`${API_BASE}/machines`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!resp.ok) {
                    const err = await resp
                        .json()
                        .catch(() => ({ detail: resp.statusText }))
                    throw new Error(err.detail || 'Failed to fetch machines')
                }

                const data = await resp.json()
                if (Array.isArray(data?.machines)) {
                    // Map to the shape expected by the UI; use machine_id as fallback name
                    const mapped = data.machines.map((m: any, idx: number) => ({
                        id: m.machine_id,
                        name: m.machine_id,
                        site: 'Unknown',
                        status: 'Normal',
                        riskScore: 0,
                        location: '',
                        lastMaintenance: '',
                    }))
                    setMachinesData(mapped)
                } else {
                    throw new Error('Invalid machines payload')
                }
            } catch (err: any) {
                console.warn(
                    'Could not fetch machines from API, using mock data:',
                    err
                )
                setMachinesError(err?.message || String(err))
                setMachinesData(machines)
            } finally {
                setLoadingMachines(false)
            }
        }

        fetchMachines()
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

    const filteredMachines = machinesData.filter((machine) => {
        const matchesSearch =
            machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            machine.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesSite = siteFilter === 'all' || machine.site === siteFilter
        const matchesStatus =
            statusFilter === 'all' || machine.status === statusFilter

        return matchesSearch && matchesSite && matchesStatus
    })

    const stats = {
        total: machinesData.length,
        normal: machinesData.filter((m) => m.status === 'Normal').length,
        watch: machinesData.filter((m) => m.status === 'Watch').length,
        risk: machinesData.filter((m) => m.status === 'Risk').length,
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
                        value={siteFilter}
                        onValueChange={setSiteFilter}
                    >
                        <SelectTrigger className='w-48'>
                            <SelectValue placeholder='Filter by site' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Sites</SelectItem>
                            <SelectItem value='Plant North'>
                                Plant North
                            </SelectItem>
                            <SelectItem value='Plant South'>
                                Plant South
                            </SelectItem>
                            <SelectItem value='Plant East'>
                                Plant East
                            </SelectItem>
                        </SelectContent>
                    </Select>

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
                            <TableHead>Machine ID</TableHead>
                            <TableHead>Machine Name</TableHead>
                            <TableHead>Site</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Risk Score</TableHead>
                            <TableHead>Last Maintenance</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMachines.map((machine) => (
                            <TableRow key={machine.id}>
                                <TableCell>{machine.id}</TableCell>
                                <TableCell>{machine.name}</TableCell>
                                <TableCell>{machine.site}</TableCell>
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
