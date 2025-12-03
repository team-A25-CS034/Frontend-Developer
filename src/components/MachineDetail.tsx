import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, MapPin, Bot, FileText, Activity, Clock, Wrench, Zap, Gauge, ThermometerSun, Radio } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { useCopilot } from '../contexts/CopilotContext';

// Mock sensor data (renamed to reflect new metrics)
// Air temperature values converted to Kelvin (approx.) from previous mock Fahrenheit
const airTempData = [
  { time: '00:00', value: 293 },
  { time: '04:00', value: 295 },
  { time: '08:00', value: 303 },
  { time: '12:00', value: 306 },
  { time: '16:00', value: 304 },
  { time: '20:00', value: 297 },
  { time: '24:00', value: 294 },
];

// Process temperature (Kelvin) - derived/mock values
const processTempData = [
  { time: '00:00', value: 318 },
  { time: '04:00', value: 321 },
  { time: '08:00', value: 335 },
  { time: '12:00', value: 341 },
  { time: '16:00', value: 338 },
  { time: '20:00', value: 325 },
  { time: '24:00', value: 320 },
];

// Rotational speed (RPM) - mock values
const rotationalSpeedData = [
  { time: '00:00', value: 1000 },
  { time: '04:00', value: 1200 },
  { time: '08:00', value: 1500 },
  { time: '12:00', value: 1600 },
  { time: '16:00', value: 1400 },
  { time: '20:00', value: 1100 },
  { time: '24:00', value: 1000 },
];

// Torque (Nm) - mock values
const torqueData = [
  { time: '00:00', value: 10 },
  { time: '04:00', value: 12 },
  { time: '08:00', value: 15 },
  { time: '12:00', value: 13 },
  { time: '16:00', value: 14 },
  { time: '20:00', value: 11 },
  { time: '24:00', value: 9 },
];

// Tool wear (minutes) - mock values
const toolWearData = [
  { time: '00:00', value: 30 },
  { time: '04:00', value: 45 },
  { time: '08:00', value: 60 },
  { time: '12:00', value: 75 },
  { time: '16:00', value: 90 },
  { time: '20:00', value: 105 },
  { time: '24:00', value: 120 },
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
    // New metric fields
    airTempK: 294,
    processTempK: 318,
    rotationalSpeed: 1500,
    torque: 10,
    toolWearMin: 120,
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
    airTempK: 306,
    processTempK: 341,
    rotationalSpeed: 1600,
    torque: 13,
    toolWearMin: 90,
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
    airTempK: 378,
    processTempK: 374,
    rotationalSpeed: 1400,
    torque: 15,
    toolWearMin: 150,
  },
};

export default function MachineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openCopilot } = useCopilot();

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

          <div className="flex items-center gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 flex items-center gap-3 shadow-sm">
              <div className="relative w-28 h-16">
                <svg viewBox="0 0 200 120" className="w-full h-full">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={healthData[0].fill} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${(machine.healthScore / 100) * 251.2} 251.2`} />
                  <text x="100" y="86" textAnchor="middle" className="text-base font-bold" fill={healthData[0].fill}>{machine.healthScore}%</text>
                </svg>
              </div>
              <div className="ml-2 text-left">
                <p className="text-slate-300 text-sm">Overall Health</p>
              </div>
            </div>

            <div className="bg-white/18 backdrop-blur rounded-lg p-4 flex flex-col items-end min-w-[88px] shadow-sm">
              <p className="text-slate-300 mb-1 text-sm">Risk Score</p>
              <p className={`text-3xl ${getRiskColor(machine.riskScore)}`}>{machine.riskScore}</p>
            </div>
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

      {/* Overall Health moved into header beside Risk Score */}
      

      {/* Five metric cards (single row) placed right after Overall Health */}
      <div className="grid grid-cols-5 gap-4 mb-6 items-stretch">
        <div className="col-span-1">
          <Card className="h-32 md:h-36">
            <CardContent className="pt-6 pb-6 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <ThermometerSun className="w-5 h-5 text-orange-500" />
                <span className="text-slate-700">Air Temperature [K]</span>
              </div>
              <p className="text-slate-900">{machine.airTempK} K</p>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="h-32 md:h-36">
            <CardContent className="pt-6 pb-6 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <ThermometerSun className="w-5 h-5 text-red-500" />
                <span className="text-slate-700">Process Temperature [K]</span>
              </div>
              <p className="text-slate-900">{machine.processTempK} K</p>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="h-32 md:h-36">
            <CardContent className="pt-6 pb-6 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-5 h-5 text-purple-500" />
                <span className="text-slate-700">Rotational Speed (RPM)</span>
              </div>
              <p className="text-slate-900">{machine.rotationalSpeed} RPM</p>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="h-32 md:h-36">
            <CardContent className="pt-6 pb-6 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Torque [Nm]</span>
              </div>
              <p className="text-slate-900">{machine.torque} Nm</p>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="h-32 md:h-36">
            <CardContent className="pt-6 pb-6 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-5 h-5 text-orange-600" />
                <span className="text-slate-700">ToolWear [min]</span>
              </div>
              <p className="text-slate-900">{machine.toolWearMin} min</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sensor Graphs */}
      <div className="mb-6">
        <h2 className="text-slate-900 mb-4">Sensor Data (Last 24 Hours)</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Air Temperature Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5 text-orange-500" />
                Air Temperature [K]
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={airTempData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#f97316" fill="#fed7aa" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Process Temperature Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5 text-red-500" />
                Process Temperature [K]
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={processTempData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rotational Speed Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-500" />
                Rotational Speed (RPM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={rotationalSpeedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#a855f7" fill="#f3e8ff" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Torque Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-green-500" />
                Torque [Nm]
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={torqueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ToolWear Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-600" />
                ToolWear [min]
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={toolWearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#fff4e6" />
                </AreaChart>
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
          onClick={() => openCopilot()}
        >
          <Bot className="w-5 h-5 mr-2" />
          Ask Copilot
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
      {/* Copilot modal is provided at app-level via CopilotProvider */}
    </div>
  );
}