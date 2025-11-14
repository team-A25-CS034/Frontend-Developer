import { useState } from 'react';
import { Plus, FileText, Calendar, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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

interface Ticket {
  id: string;
  machine: string;
  issue: string;
  suggestedFix: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  eta: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdDate: string;
}

const initialTickets: Ticket[] = [
  {
    id: 'T001',
    machine: 'Motor Drive C-33',
    issue: 'High vibration levels detected - bearing misalignment suspected',
    suggestedFix: 'Inspect and realign bearings, check lubrication system',
    priority: 'Critical',
    eta: '3-5 days',
    status: 'Pending',
    createdDate: '2025-11-10',
  },
  {
    id: 'T002',
    machine: 'Compressor B-04',
    issue: 'Temperature exceeding normal operating range',
    suggestedFix: 'Clean cooling system, check for blockages',
    priority: 'High',
    eta: '7-10 days',
    status: 'In Progress',
    createdDate: '2025-11-08',
  },
  {
    id: 'T003',
    machine: 'Pump Station A-12',
    issue: 'Routine maintenance due',
    suggestedFix: 'Standard inspection and lubrication',
    priority: 'Low',
    eta: '14-21 days',
    status: 'Completed',
    createdDate: '2025-10-25',
  },
];

const machines = [
  'Pump Station A-12',
  'Compressor B-04',
  'Motor Drive C-33',
  'Turbine D-21',
  'Generator E-15',
  'Cooling Unit F-08',
];

export default function TicketSimulation() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [machineName, setMachineName] = useState('');
  const [issue, setIssue] = useState('');
  const [suggestedFix, setSuggestedFix] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [eta, setEta] = useState('');

  const handleCreateTicket = () => {
    if (!machineName || !issue || !suggestedFix || !eta) {
      alert('Please fill in all fields');
      return;
    }

    const newTicket: Ticket = {
      id: `T${String(tickets.length + 1).padStart(3, '0')}`,
      machine: machineName,
      issue,
      suggestedFix,
      priority,
      eta,
      status: 'Pending',
      createdDate: new Date().toISOString().split('T')[0],
    };

    setTickets([newTicket, ...tickets]);
    
    // Reset form
    setMachineName('');
    setIssue('');
    setSuggestedFix('');
    setPriority('Medium');
    setEta('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-8">
      {/* Create Ticket Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Simulate Maintenance Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="machine-name">Machine Name</Label>
                <Select value={machineName} onValueChange={setMachineName}>
                  <SelectTrigger id="machine-name">
                    <SelectValue placeholder="Select a machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((machine) => (
                      <SelectItem key={machine} value={machine}>
                        {machine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={priority} 
                  onValueChange={(value) => setPriority(value as any)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue">Issue Summary</Label>
              <Textarea
                id="issue"
                placeholder="Describe the issue detected..."
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggested-fix">Suggested Fix</Label>
              <Textarea
                id="suggested-fix"
                placeholder="Recommended maintenance actions..."
                value={suggestedFix}
                onChange={(e) => setSuggestedFix(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eta">Estimated Time to Address</Label>
              <Input
                id="eta"
                placeholder="e.g., 3-5 days"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleCreateTicket}
            className="mt-6 bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Suggested Fix</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.machine}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={ticket.issue}>
                      {ticket.issue}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={ticket.suggestedFix}>
                      {ticket.suggestedFix}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(ticket.priority)}
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      {ticket.eta}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(ticket.status)}
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.createdDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
