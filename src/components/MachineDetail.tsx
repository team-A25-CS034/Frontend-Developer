import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, Bot, Bell, FileText, TrendingUp, Activity, Clock, Wrench, Zap, Gauge, ThermometerSun, Radio } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

// Mock sensor data
const temperatureData = [
  { time: '00:00', value: 68 },
  { time: '04:00', value: 72 },
  { time: '08:00', value: 85 },
  { time: '12:00', value: 92 },
  { time: '16:00', value: 88 },
  { time: '20:00', value: 75 },
  { time: '24:00', value: 70 },
];

const vibrationData = [
  { time: '00:00', value: 2.1 },
  { time: '04:00', value: 2.3 },
  { time: '08:00', value: 3.8 },
  { time: '12:00', value: 4.2 },
  { time: '16:00', value: 3.9 },
  { time: '20:00', value: 2.8 },
  { time: '24:00', value: 2.2 },
];

const currentData = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 48 },
  { time: '08:00', value: 62 },
  { time: '12:00', value: 68 },
  { time: '16:00', value: 65 },
  { time: '20:00', value: 52 },
  { time: '24:00', value: 47 },
];

const pressureData = [
  { time: '00:00', value: 85 },
  { time: '04:00', value: 87 },
  { time: '08:00', value: 92 },
  { time: '12:00', value: 95 },
  { time: '16:00', value: 93 },
  { time: '20:00', value: 89 },
  { time: '24:00', value: 86 },
];

const maintenanceHistory = [
  { month: 'May', count: 2 },
  { month: 'Jun', count: 1 },
  { month: 'Jul', count: 3 },
  { month: 'Aug', count: 1 },
  { month: 'Sep', count: 2 },
  { month: 'Oct', count: 1 },
];

// Mock machine details
const machineDetails: Record<string, any> = {
  M001: {
    name: 'Pump Station A-12',
    site: 'Plant North',
    status: 'Normal',
    riskScore: 12,
    location: 'Building A, Floor 2',
    model: 'Grundfos CR 64-4',
    serialNumber: 'GF-2023-8842',
    installedDate: '2023-03-15',
    operationalHours: 8450,
    efficiency: 94,
    healthScore: 88,
    lastMaintenance: '2025-10-15',
    nextMaintenance: '2025-12-15',
    powerConsumption: 45.2,
    avgTemperature: 70,
    avgVibration: 2.2,
    avgCurrent: 47,
    topFeatures: [
      { name: 'Temperature', value: 70, unit: '°F', impact: 'Low' },
      { name: 'Vibration', value: 2.2, unit: 'mm/s', impact: 'Low' },
      { name: 'Current', value: 47, unit: 'A', impact: 'Low' },
    ],
  },
  M002: {
    name: 'Compressor B-04',
    site: 'Plant South',
    status: 'Watch',
    riskScore: 58,
    location: 'Building B, Floor 1',
    model: 'Atlas Copco GA 55',
    serialNumber: 'AC-2022-5521',
    installedDate: '2022-07-20',
    operationalHours: 12340,
    efficiency: 78,
    healthScore: 62,
    lastMaintenance: '2025-09-20',
    nextMaintenance: '2025-11-20',
    powerConsumption: 68.5,
    avgTemperature: 92,
    avgVibration: 4.2,
    avgCurrent: 68,
    topFeatures: [
      { name: 'Temperature', value: 92, unit: '°F', impact: 'Medium' },
      { name: 'Vibration', value: 4.2, unit: 'mm/s', impact: 'High' },
      { name: 'Current', value: 68, unit: 'A', impact: 'Medium' },
    ],
  },
  M003: {
    name: 'Motor Drive C-33',
    site: 'Plant North',
    status: 'Risk',
    riskScore: 87,
    location: 'Building C, Floor 3',
    model: 'Siemens SINAMICS G120',
    serialNumber: 'SM-2021-3321',
    installedDate: '2021-05-10',
    operationalHours: 18720,
    efficiency: 65,
    healthScore: 35,
    lastMaintenance: '2025-08-10',
    nextMaintenance: '2025-11-10',
    powerConsumption: 82.7,
    avgTemperature: 105,
    avgVibration: 6.8,
    avgCurrent: 82,
    topFeatures: [
      { name: 'Temperature', value: 105, unit: '°F', impact: 'High' },
      { name: 'Vibration', value: 6.8, unit: 'mm/s', impact: 'High' },
      { name: 'Current', value: 82, unit: 'A', impact: 'High' },
    ],
  },
};

export default function MachineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const machine = machineDetails[id || 'M001'] || machineDetails.M001;

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

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const healthData = [
    {
      name: 'Health',
      value: machine.healthScore,
      fill: machine.healthScore >= 70 ? '#22c55e' : machine.healthScore >= 40 ? '#eab308' : '#ef4444',
    },
  ];

  return (
    <div className="p-8 pb-24">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/fleet')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Fleet
      </Button>

      {/* Machine Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-6 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-white">{machine.name}</h1>
              <Badge 
                variant="outline" 
                className={getStatusColor(machine.status)}
              >
                {machine.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{machine.location}</span>
              </div>
              <div>
                <span>Model: {machine.model}</span>
              </div>
              <div>
                <span>Serial: {machine.serialNumber}</span>
              </div>
            </div>
          </div>

          <div className="text-right bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-slate-300 mb-2">Risk Score</p>
            <p className={`text-4xl ${getRiskColor(machine.riskScore)}`}>
              {machine.riskScore}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-slate-600 mb-1">Operational Hours</p>
            <p className="text-slate-900">{machine.operationalHours.toLocaleString()} hrs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-slate-600 mb-1">Efficiency</p>
            <p className="text-slate-900">{machine.efficiency}%</p>
            <Progress value={machine.efficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-slate-600 mb-1">Health Score</p>
            <p className={getHealthColor(machine.healthScore)}>{machine.healthScore}%</p>
            <Progress value={machine.healthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-slate-600 mb-1">Power Usage</p>
            <p className="text-slate-900">{machine.powerConsumption} kW</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-slate-600 mb-1">Last Maintenance</p>
            <p className="text-slate-900">{machine.lastMaintenance}</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Visualization and Contributing Features */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {/* Health Score Radial */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-700">Overall Health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-40 h-24 mb-4">
              <svg viewBox="0 0 200 120" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={healthData[0].fill}
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={`${(machine.healthScore / 100) * 251.2} 251.2`}
                />
                {/* Center text */}
                <text
                  x="100"
                  y="90"
                  textAnchor="middle"
                  className="text-3xl font-bold"
                  fill={healthData[0].fill}
                >
                  {machine.healthScore}%
                </text>
              </svg>
            </div>
            <p className="text-slate-600 text-center">
              Next maintenance: {machine.nextMaintenance}
            </p>
          </CardContent>
        </Card>

        {/* Temperature */}
        <Card className="bg-white">
          <CardContent className="pt-6 pb-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <ThermometerSun className="w-5 h-5 text-orange-500" />
              <span className="text-slate-700">Temperature</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-slate-900 mb-3">
                {machine.topFeatures[0].value} {machine.topFeatures[0].unit}
              </p>
              <Badge 
                variant="outline" 
                className={`w-fit ${getImpactColor(machine.topFeatures[0].impact)}`}
              >
                {machine.topFeatures[0].impact} Impact
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vibration */}
        <Card className="bg-white">
          <CardContent className="pt-6 pb-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <Radio className="w-5 h-5 text-purple-500" />
              <span className="text-slate-700">Vibration</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-slate-900 mb-3">
                {machine.topFeatures[1].value} {machine.topFeatures[1].unit}
              </p>
              <Badge 
                variant="outline" 
                className={`w-fit ${getImpactColor(machine.topFeatures[1].impact)}`}
              >
                {machine.topFeatures[1].impact} Impact
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Current */}
        <Card className="bg-white">
          <CardContent className="pt-6 pb-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="text-slate-700">Current</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-slate-900 mb-3">
                {machine.topFeatures[2].value} {machine.topFeatures[2].unit}
              </p>
              <Badge 
                variant="outline" 
                className={`w-fit ${getImpactColor(machine.topFeatures[2].impact)}`}
              >
                {machine.topFeatures[2].impact} Impact
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Graphs */}
      <div className="mb-6">
        <h2 className="text-slate-900 mb-4">Sensor Data (Last 24 Hours)</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5 text-orange-500" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f97316" 
                    fill="#fed7aa" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vibration Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-500" />
                Vibration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={vibrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Current Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Current
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    fill="#bfdbfe" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pressure Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-green-500" />
                Pressure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={pressureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Maintenance History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Maintenance History (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={maintenanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <Button 
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
        >
          <Bot className="w-5 h-5 mr-2" />
          Ask Copilot
        </Button>
        <Button 
          size="lg"
          variant="outline" 
          className="bg-white shadow-lg"
          onClick={() => navigate('/alerts')}
        >
          <Bell className="w-5 h-5 mr-2" />
          Set Alert
        </Button>
        <Button 
          size="lg"
          variant="outline" 
          className="bg-white shadow-lg"
          onClick={() => navigate('/tickets')}
        >
          <FileText className="w-5 h-5 mr-2" />
          Create Ticket
        </Button>
      </div>
    </div>
  );
}