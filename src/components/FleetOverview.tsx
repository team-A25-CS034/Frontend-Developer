import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlignLeft, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

// Mock data
const machines = [
  {
    id: 'M001',
    name: 'Pump Station A-12',
    status: 'Normal',
    riskScore: 12,
    location: 'Building A, Floor 2',
    lastMaintenance: '2025-10-15',
  },
  {
    id: 'M002',
    name: 'Compressor B-04',
    status: 'Watch',
    riskScore: 58,
    location: 'Building B, Floor 1',
    lastMaintenance: '2025-09-20',
  },
  {
    id: 'M003',
    name: 'Motor Drive C-33',
    status: 'Risk',
    riskScore: 87,
    location: 'Building C, Floor 3',
    lastMaintenance: '2025-08-10',
  },
  {
    id: 'M004',
    name: 'Turbine D-21',
    status: 'Normal',
    riskScore: 24,
    location: 'Building D, Floor 1',
    lastMaintenance: '2025-11-01',
  },
  {
    id: 'M005',
    name: 'Generator E-15',
    status: 'Watch',
    riskScore: 64,
    location: 'Building E, Floor 2',
    lastMaintenance: '2025-09-15',
  },
  {
    id: 'M006',
    name: 'Cooling Unit F-08',
    status: 'Normal',
    riskScore: 18,
    location: 'Building F, Floor 1',
    lastMaintenance: '2025-10-28',
  },
  {
    id: 'M007',
    name: 'Hydraulic Press G-02',
    status: 'Watch',
    riskScore: 52,
    location: 'Building G, Floor 1',
    lastMaintenance: '2025-09-05',
  },
  {
    id: 'M008',
    name: 'Conveyor H-10',
    status: 'Normal',
    riskScore: 21,
    location: 'Building H, Floor 2',
    lastMaintenance: '2025-10-12',
  },
  {
    id: 'M009',
    name: 'Boiler I-01',
    status: 'Risk',
    riskScore: 90,
    location: 'Building I, Basement',
    lastMaintenance: '2025-07-30',
  },
  {
    id: 'M010',
    name: 'Chiller J-04',
    status: 'Watch',
    riskScore: 63,
    location: 'Building J, Roof',
    lastMaintenance: '2025-09-18',
  },
  {
    id: 'M011',
    name: 'Packaging Line K-07',
    status: 'Normal',
    riskScore: 28,
    location: 'Building K, Floor 1',
    lastMaintenance: '2025-10-08',
  },
  {
    id: 'M012',
    name: 'Mixer L-03',
    status: 'Watch',
    riskScore: 55,
    location: 'Building L, Floor 2',
    lastMaintenance: '2025-09-02',
  },
  {
    id: 'M013',
    name: 'Furnace M-09',
    status: 'Risk',
    riskScore: 94,
    location: 'Building M, Floor 1',
    lastMaintenance: '2025-08-20',
  },
  {
    id: 'M014',
    name: 'Water Pump N-05',
    status: 'Normal',
    riskScore: 16,
    location: 'Building N, Basement',
    lastMaintenance: '2025-11-03',
  },
  {
    id: 'M015',
    name: 'Lathe O-11',
    status: 'Watch',
    riskScore: 47,
    location: 'Building O, Floor 1',
    lastMaintenance: '2025-09-25',
  },
  {
    id: 'M016',
    name: 'CNC Router P-06',
    status: 'Normal',
    riskScore: 23,
    location: 'Building P, Floor 2',
    lastMaintenance: '2025-10-02',
  },
  {
    id: 'M017',
    name: 'Extruder Q-08',
    status: 'Risk',
    riskScore: 81,
    location: 'Building Q, Floor 1',
    lastMaintenance: '2025-08-05',
  },
  {
    id: 'M018',
    name: 'Oven R-02',
    status: 'Watch',
    riskScore: 59,
    location: 'Building R, Floor 1',
    lastMaintenance: '2025-09-12',
  },
  {
    id: 'M019',
    name: 'Press S-14',
    status: 'Normal',
    riskScore: 31,
    location: 'Building S, Floor 2',
    lastMaintenance: '2025-10-18',
  },
  {
    id: 'M020',
    name: 'Lift T-03',
    status: 'Watch',
    riskScore: 50,
    location: 'Building T, Floor 3',
    lastMaintenance: '2025-09-28',
  },
  {
    id: 'M021',
    name: 'Compressor U-12',
    status: 'Risk',
    riskScore: 76,
    location: 'Building U, Floor 1',
    lastMaintenance: '2025-08-22',
  },
  {
    id: 'M022',
    name: 'Pump V-01',
    status: 'Normal',
    riskScore: 19,
    location: 'Building V, Basement',
    lastMaintenance: '2025-11-06',
  },
  {
    id: 'M023',
    name: 'Motor W-15',
    status: 'Watch',
    riskScore: 57,
    location: 'Building W, Floor 2',
    lastMaintenance: '2025-09-09',
  },
  {
    id: 'M024',
    name: 'Fan X-05',
    status: 'Normal',
    riskScore: 14,
    location: 'Building X, Floor 1',
    lastMaintenance: '2025-10-26',
  },
  {
    id: 'M025',
    name: 'Generator Y-07',
    status: 'Risk',
    riskScore: 82,
    location: 'Building Y, Roof',
    lastMaintenance: '2025-08-12',
  },
  {
    id: 'M026',
    name: 'Filter Z-03',
    status: 'Watch',
    riskScore: 46,
    location: 'Building Z, Floor 1',
    lastMaintenance: '2025-09-16',
  },
];

export default function FleetOverview() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Watch':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Risk':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Normal':
        return <CheckCircle className="w-4 h-4" />;
      case 'Watch':
      case 'Risk':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredMachines = useMemo(() => {
    const res = machines.filter((machine) => {
      const matchesSearch = machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            machine.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return res;
  }, [searchQuery, statusFilter]);

  const statusOrder: Record<string, number> = {
    Normal: 0,
    Watch: 1,
    Risk: 2,
  };

  const sortedMachines = useMemo(() => {
    const arr = [...filteredMachines].sort((a, b) => {
    if (!sortBy) return 0;

    let va: any = (a as any)[sortBy];
    let vb: any = (b as any)[sortBy];

    // special handling for machine ID: sort by numeric suffix when present (M001 -> 1)
    if (sortBy === 'id') {
      const numA = String(va).match(/(\d+)$/)?.[1];
      const numB = String(vb).match(/(\d+)$/)?.[1];
      if (numA && numB) {
        const nA = Number(numA);
        const nB = Number(numB);
        return sortDir === 'asc' ? nA - nB : nB - nA;
      }
      // fallback to string compare below if numeric suffix not present
    }

    // special handling for certain columns
    if (sortBy === 'riskScore') {
      va = Number(va);
      vb = Number(vb);
    }

    if (sortBy === 'lastMaintenance') {
      va = new Date(va).getTime();
      vb = new Date(vb).getTime();
    }

    if (sortBy === 'status') {
      va = statusOrder[va] ?? 99;
      vb = statusOrder[vb] ?? 99;
    }

    // string compare (case-insensitive)
    if (typeof va === 'string' && typeof vb === 'string') {
      const res = va.localeCompare(vb, undefined, { sensitivity: 'base' });
      return sortDir === 'asc' ? res : -res;
    }

    // numeric compare
    if (typeof va === 'number' && typeof vb === 'number') {
      return sortDir === 'asc' ? va - vb : vb - va;
    }

    // fallback
      const res = String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? res : -res;
    });
    return arr;
  }, [filteredMachines, sortBy, sortDir]);

  // Pagination derived data
  const totalItems = sortedMachines.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedMachines = sortedMachines.slice(startIdx, endIdx);

  useEffect(() => {
    // reset to first page when filters or search change
    setPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    // clamp page when data shrinks
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSort = (column: string) => {
    // Cycle: asc -> desc -> none -> asc
    if (sortBy === column) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') {
        setSortBy(null);
        setSortDir('asc');
      }
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const stats = {
    total: machines.length,
    normal: machines.filter(m => m.status === 'Normal').length,
    watch: machines.filter(m => m.status === 'Watch').length,
    risk: machines.filter(m => m.status === 'Risk').length,
  };

  return (
    <div className="p-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600">Total Machines</p>
          <p className="text-slate-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600">Normal</p>
          <p className="text-green-600 mt-2">{stats.normal}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600">Watch</p>
          <p className="text-yellow-600 mt-2">{stats.watch}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600">At Risk</p>
          <p className="text-red-600 mt-2">{stats.risk}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search machines by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Watch">Watch</SelectItem>
              <SelectItem value="Risk">Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Machines Table */}
      <div className="bg-white rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Machine ID</span>
                    {sortBy === 'id' && (sortDir === 'asc' ? <span>▲</span> : <span>▼</span>)}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSort('id')}
                    aria-label="Sort by Machine ID"
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Machine Name</span>
                    {sortBy === 'name' && (sortDir === 'asc' ? <span>▲</span> : <span>▼</span>)}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSort('name')}
                    aria-label="Sort by Machine Name"
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Status</span>
                    {sortBy === 'status' && (sortDir === 'asc' ? <span>▲</span> : <span>▼</span>)}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSort('status')}
                    aria-label="Sort by Status"
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Risk Score</span>
                    {sortBy === 'riskScore' && (sortDir === 'asc' ? <span>▲</span> : <span>▼</span>)}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSort('riskScore')}
                    aria-label="Sort by Risk Score"
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Last Maintenance</span>
                    {sortBy === 'lastMaintenance' && (sortDir === 'asc' ? <span>▲</span> : <span>▼</span>)}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSort('lastMaintenance')}
                    aria-label="Sort by Last Maintenance"
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedMachines.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell>{machine.id}</TableCell>
                <TableCell>{machine.name}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 w-fit ${getStatusColor(machine.status)}`}
                  >
                    {getStatusIcon(machine.status)}
                    {machine.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={getRiskColor(machine.riskScore)}>
                    {machine.riskScore}
                  </span>
                </TableCell>
                <TableCell>{machine.lastMaintenance}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/machine/${machine.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
        <div>
          {totalItems === 0
            ? 'No results'
            : `${startIdx + 1}-${Math.min(endIdx, totalItems)} of ${totalItems}`}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || totalItems === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
