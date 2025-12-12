import { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
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
  _id: string; 
  machine_name: string;
  issue_summary: string;
  suggested_fix: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimated_time_to_address: string;
  status: string; 
  created_at: string;
  source?: string;
}

export default function TicketSimulation() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    machine_name: '',
    priority: 'Medium',
    issue_summary: '',
    suggested_fix: '',
    estimated_time_to_address: ''
  });

  const API_BASE_URL =
        (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("No access token found");

      // Gunakan API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/tickets-machine`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create ticket');
        } else {
            const text = await response.text();
            throw new Error(`Server Error (${response.status}): ${text.substring(0, 50)}...`);
        }
      }

      const data = await response.json();

      setFormData({
        machine_name: '',
        priority: 'Medium',
        issue_summary: '',
        suggested_fix: '',
        estimated_time_to_address: ''
      });
      
      await fetchTickets();

    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'closed') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'in progress') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Maintenance Tickets</h2>
          <p className="text-slate-500">Create and manage repair tickets</p>
        </div>
        <Button variant="outline" onClick={fetchTickets} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1">
        {/* Form Create Ticket */}
        <Card className="lg:col-span-1 h-fit mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              New Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Machine Name / ID</Label>
                <Input
                  required
                  placeholder="e.g. CNC-Lathe-01"
                  value={formData.machine_name}
                  onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Issue Summary</Label>
                <Textarea
                  required
                  placeholder="Describe the problem..."
                  className="h-24"
                  value={formData.issue_summary}
                  onChange={(e) => setFormData({ ...formData, issue_summary: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Suggested Fix</Label>
                <Input
                  required
                  placeholder="e.g. Replace bearing"
                  value={formData.suggested_fix}
                  onChange={(e) => setFormData({ ...formData, suggested_fix: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Estimated Time</Label>
                <Input
                  required
                  placeholder="e.g. 2 hours"
                  value={formData.estimated_time_to_address}
                  onChange={(e) => setFormData({ ...formData, estimated_time_to_address: e.target.value })}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Active Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && tickets.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Loading tickets...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Machine</TableHead>
                      <TableHead>Issue & Fix</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Est. Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          No tickets found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tickets.map((ticket) => (
                        <TableRow key={ticket._id}>
                          <TableCell className="font-medium">
                            {ticket.machine_name}
                            {ticket.source?.includes('Auto') && (
                              <Badge variant="secondary" className="ml-2 text-[10px] bg-purple-100 text-purple-700 border-purple-200">
                                Auto
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="font-medium truncate" title={ticket.issue_summary}>
                              {ticket.issue_summary}
                            </div>
                            <div className="text-xs text-slate-500 truncate mt-1" title={ticket.suggested_fix}>
                              Fix: {ticket.suggested_fix}
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
                            <div className="flex items-center gap-1 text-slate-600 text-sm">
                              <Calendar className="w-3 h-3" />
                              {ticket.estimated_time_to_address}
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
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(ticket.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}