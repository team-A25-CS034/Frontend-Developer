import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
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
];

export default function FleetOverview() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

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

  const filteredMachines = machines.filter((machine) => {
    const matchesSearch = machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          machine.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusOrder: Record<string, number> = {
    Normal: 0,
    Watch: 1,
    Risk: 2,
  };

  const sortedMachines = [...filteredMachines].sort((a, b) => {
    if (!sortBy) return 0;

    let va: any = (a as any)[sortBy];
    let vb: any = (b as any)[sortBy];

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

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
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
                <button
                  type="button"
                  onClick={() => toggleSort('id')}
                  className="flex items-center gap-2"
                >
                  <span>Machine ID</span>
                  {sortBy === 'id' && (sortDir === 'asc' ? <span>▲</span> : <span>▼</span>)}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort('name')}
                  className="flex items-center gap-2"
                >
                  <span>Machine Name</span>
                  {sortBy === 'name' && (sortDir === 'asc' ? <span>▲</span> : <span>▼</span>)}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort('status')}
                  className="flex items-center gap-2"
                >
                  <span>Status</span>
                  {sortBy === 'status' && (sortDir === 'asc' ? <span>▲</span> : <span>▼</span>)}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort('riskScore')}
                  className="flex items-center gap-2"
                >
                  <span>Risk Score</span>
                  {sortBy === 'riskScore' && (sortDir === 'asc' ? <span>▲</span> : <span>▼</span>)}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort('lastMaintenance')}
                  className="flex items-center gap-2"
                >
                  <span>Last Maintenance</span>
                  {sortBy === 'lastMaintenance' && (sortDir === 'asc' ? <span>▲</span> : <span>▼</span>)}
                </button>
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
    </div>
  );
}
