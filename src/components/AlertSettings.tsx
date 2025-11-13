import { useState } from 'react';
import { Plus, Bell, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
import { Switch } from './ui/switch';

interface Alert {
  id: string;
  name: string;
  machine: string;
  metric: string;
  threshold: number;
  enabled: boolean;
  createdDate: string;
}

const initialAlerts: Alert[] = [
  {
    id: '1',
    name: 'High Temperature Warning',
    machine: 'Compressor B-04',
    metric: 'Temperature',
    threshold: 90,
    enabled: true,
    createdDate: '2025-11-01',
  },
  {
    id: '2',
    name: 'Critical Vibration',
    machine: 'Motor Drive C-33',
    metric: 'Vibration',
    threshold: 5.0,
    enabled: true,
    createdDate: '2025-10-28',
  },
  {
    id: '3',
    name: 'Current Overload',
    machine: 'Generator E-15',
    metric: 'Current',
    threshold: 75,
    enabled: false,
    createdDate: '2025-10-15',
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

const metrics = [
  'Temperature',
  'Vibration',
  'Current',
  'Pressure',
  'RPM',
  'Power Consumption',
];

export default function AlertSettings() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [alertName, setAlertName] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [threshold, setThreshold] = useState('');

  const handleCreateAlert = () => {
    if (!alertName || !selectedMachine || !selectedMetric || !threshold) {
      alert('Please fill in all fields');
      return;
    }

    const newAlert: Alert = {
      id: Date.now().toString(),
      name: alertName,
      machine: selectedMachine,
      metric: selectedMetric,
      threshold: parseFloat(threshold),
      enabled: true,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setAlerts([newAlert, ...alerts]);
    
    // Reset form
    setAlertName('');
    setSelectedMachine('');
    setSelectedMetric('');
    setThreshold('');
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className="p-8">
      {/* Create Alert Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="alert-name">Alert Name</Label>
              <Input
                id="alert-name"
                placeholder="e.g., High Temperature Warning"
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="machine">Select Machine</Label>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger id="machine">
                  <SelectValue placeholder="Choose a machine" />
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
              <Label htmlFor="metric">Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger id="metric">
                  <SelectValue placeholder="Choose a metric" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((metric) => (
                    <SelectItem key={metric} value={metric}>
                      {metric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold Value</Label>
              <Input
                id="threshold"
                type="number"
                placeholder="e.g., 90"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleCreateAlert}
            className="mt-6 bg-blue-600 hover:bg-blue-700"
          >
            <Bell className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </CardContent>
      </Card>

      {/* Active Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert Name</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>{alert.name}</TableCell>
                  <TableCell>{alert.machine}</TableCell>
                  <TableCell>{alert.metric}</TableCell>
                  <TableCell>{alert.threshold}</TableCell>
                  <TableCell>{alert.createdDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={() => handleToggleAlert(alert.id)}
                      />
                      <span className={alert.enabled ? 'text-green-600' : 'text-slate-400'}>
                        {alert.enabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
