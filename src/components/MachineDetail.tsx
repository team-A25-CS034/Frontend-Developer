import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Activity,
  Zap,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "./ui/button"; // Pastikan path ini sesuai dengan struktur project Anda

// --- TYPEDEFS (Gabungan untuk mengakomodasi struktur data lama & kebutuhan UI baru) ---

interface SensorData {
  timestamp?: string | number;
  machine_id?: string;
  process_temperature: number;
  torque: number;
  air_temperature: number;
  tool_wear: number;
  rotational_speed: number;
  [key: string]: any;
}

interface PredictResponse {
  prediction_numeric: number;
  prediction_label: string;
  probabilities: number[];
  error?: string;
}

// Data statis untuk UI (dari code baru)
const maintenanceHistory = [
  { month: "Mei", count: 2 },
  { month: "Jun", count: 1 },
  { month: "Jul", count: 3 },
  { month: "Agu", count: 1 },
  { month: "Sep", count: 2 },
  { month: "Okt", count: 1 },
];

export default function MachineDetail() {
  // --- ROUTING & STATE ---
  const { id } = useParams();
  const machineId = id ?? "";
  const navigate = useNavigate();

  const [readings, setReadings] = useState<SensorData[]>([]);
  const [forecast, setForecast] = useState<SensorData[]>([]);
  const [classification, setClassification] = useState<PredictResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

  // --- SYSTEM LOGIC (Dari Code Lama) ---

  // 1. Helper Fetch (Penting untuk handling error dari backend lama)
  const fetchJson = async (input: RequestInfo, init?: RequestInit) => {
    const res = await fetch(input, init);
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const raw = await res.text();
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText} ${raw}`);
    }
    if (ct.includes("text/html")) {
      throw new Error(
        "Received HTML response instead of JSON. Check API base."
      );
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      throw new Error("Invalid JSON response: " + raw.slice(0, 1000));
    }
  };

  // 2. Main Data Fetching (Readings & Forecast)
  const loadData = () => {
    if (!machineId) {
      setError("No machine id provided.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("access_token");
    const readingsUrl = `${API_BASE}/readings?machine_id=${encodeURIComponent(
      machineId
    )}&limit=300`;
    const forecastUrl = `${API_BASE}/forecast`;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchJson(readingsUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }),
      fetchJson(forecastUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          machine_id: machineId,
          forecast_minutes: 300,
        }),
      }),
    ])
      .then(([readingsResp, forecastResp]) => {
        const currentTime = Date.now();

        // --- NORMALISASI READINGS ---
        const arr = Array.isArray(readingsResp)
          ? readingsResp
          : readingsResp?.readings ?? readingsResp;
        const normalizedReadings = (Array.isArray(arr) ? arr : [])
          .slice(0, 300)
          .map((r: any, idx: number) => {
            // Cek berbagai kemungkinan nama key dari MongoDB / API
            return {
              // Jika tidak ada timestamp, buat timestamp mundur per menit agar chart tetap muncul
              timestamp:
                r.timestamp ??
                r.ts ??
                r.time ??
                currentTime - (300 - idx) * 60000,

              machine_id:
                r.machine_id ?? r.machineId ?? r["Machine ID"] ?? machineId,

              // Mapping key standard vs key raw MongoDB
              process_temperature:
                r.process_temperature ??
                r.processTemperature ??
                r["Process temperature [K]"] ??
                0,
              torque: r.torque ?? r["Torque [Nm]"] ?? 0,
              air_temperature:
                r.air_temperature ??
                r.airTemperature ??
                r["Air temperature [K]"] ??
                0,
              tool_wear: r.tool_wear ?? r.toolWear ?? r["Tool wear [min]"] ?? 0,
              rotational_speed:
                r.rotational_speed ??
                r.rotationalSpeed ??
                r["Rotational speed [rpm]"] ??
                0,
            };
          });

        // --- NORMALISASI FORECAST ---
        const farr = Array.isArray(forecastResp)
          ? forecastResp
          : forecastResp?.forecast_data ?? forecastResp?.forecast ?? [];

        const lastReadingTime =
          normalizedReadings.length > 0
            ? new Date(
                normalizedReadings[normalizedReadings.length - 1].timestamp
              ).getTime()
            : currentTime;

        const normalizedForecast = (Array.isArray(farr) ? farr : [])
          .slice(0, 300)
          .map((r: any, idx: number) => ({
            // Forecast lanjut 1 menit setelah data terakhir
            timestamp:
              r.timestamp ??
              r.ts ??
              r.time ??
              lastReadingTime + (idx + 1) * 60000,

            machine_id: r.machine_id ?? r.machineId ?? machineId,
            process_temperature:
              r.process_temperature ??
              r.processTemperature ??
              r["Process temperature [K]"] ??
              0,
            torque: r.torque ?? r["Torque [Nm]"] ?? 0,
            air_temperature:
              r.air_temperature ??
              r.airTemperature ??
              r["Air temperature [K]"] ??
              0,
            tool_wear: r.tool_wear ?? r.toolWear ?? r["Tool wear [min]"] ?? 0,
            rotational_speed:
              r.rotational_speed ??
              r.rotationalSpeed ??
              r["Rotational speed [rpm]"] ??
              0,
          }));

        console.log("Readings loaded:", normalizedReadings.length); // Debugging di Console
        setReadings(normalizedReadings);
        setForecast(normalizedForecast);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setError(String(err));
        setLoading(false);
      });
  };

  // Effect untuk load data awal
  useEffect(() => {
    loadData();
  }, [machineId, API_BASE]);

  // 3. Logic Prediction (Logic Code Lama: dipanggil setelah readings tersedia)
  useEffect(() => {
    if (!readings || readings.length === 0) {
      setClassification(null);
      return;
    }

    // Cari data terbaru berdasarkan timestamp
    const latest = readings.reduce((best: any, cur: any) => {
      const tbest = best?.timestamp
        ? new Date(best.timestamp).getTime()
        : Number.NaN;
      const tcur = cur?.timestamp
        ? new Date(cur.timestamp).getTime()
        : Number.NaN;
      if (Number.isNaN(tbest) && !Number.isNaN(tcur)) return cur;
      if (!Number.isNaN(tbest) && Number.isNaN(tcur)) return best;
      return tcur > tbest ? cur : best;
    }, readings[0]);

    const token = localStorage.getItem("access_token");
    const payload = {
      Air_temperature: latest.air_temperature,
      Process_temperature: latest.process_temperature,
      Rotational_speed: latest.rotational_speed,
      Torque: latest.torque,
      Tool_wear: latest.tool_wear,
      Type: (latest.machine_type ?? latest.machine_id)
        ?.toString()
        ?.startsWith("H")
        ? "H"
        : "M",
    };

    fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const txt = await res.text();
        if (!res.ok) throw new Error(txt);
        return JSON.parse(txt);
      })
      .then((data) => {
        // Mapping hasil predict lama ke format yang bisa dibaca UI
        setClassification({
          prediction_label: data.prediction_label ?? data.label,
          prediction_numeric: data.prediction_numeric ?? data.code,
          probabilities: data.probabilities ?? [],
        });
      })
      .catch((err) => {
        setClassification({
          prediction_label: "Error",
          prediction_numeric: -1,
          probabilities: [],
          error: String(err),
        });
      });
  }, [readings, API_BASE]);

  // --- DATA PROCESSING FOR UI (Menggunakan data dari logic lama untuk UI baru) ---

  const latest = readings.length > 0 ? readings[readings.length - 1] : null;

  // Hitung Health Score berdasarkan probabilitas dari endpoint /predict (Code Lama)
  const healthScore = useMemo(() => {
    if (
      !classification ||
      !classification.probabilities ||
      classification.probabilities.length === 0
    )
      return 0;

    // Asumsi: probabilities[0] = No Failure, probabilities[1] = Failure
    // Logika ini menyesuaikan dengan output model Anda.
    // Jika prediksi "No Failure", score tinggi.

    const isSafe = classification.prediction_label === "No Failure";
    const maxConf = Math.max(...classification.probabilities);

    if (isSafe) {
      return Math.round(maxConf * 100);
    } else {
      // Jika Failure, health score adalah sisa dari confidence kegagalan
      return Math.round((1 - maxConf) * 100);
    }
  }, [classification]);

  const powerUsage = useMemo(() => {
    if (!latest) return 0;
    // Rumus estimasi: (Torque * RPM) / 9550
    const p = (latest.torque * latest.rotational_speed) / 9550;
    return p.toFixed(2);
  }, [latest]);

  const efficiency = useMemo(() => {
    if (!latest) return 0;
    const diff = latest.process_temperature - latest.air_temperature;
    let eff = 100 - Math.max(0, diff - 8);
    return Math.min(100, Math.max(0, Math.round(eff)));
  }, [latest]);

  // Gabungkan Data untuk Chart (Merge Observed + Forecast)
 const chartData = useMemo(() => {
        const sortByTime = (a: any, b: any) => {
            const ta = new Date(a.timestamp).getTime();
            const tb = new Date(b.timestamp).getTime();
            return ta - tb;
        }
        
        // Hapus .filter() yang sebelumnya membuang data tanpa timestamp valid
        // Karena kita sudah generate timestamp dummy di loadData
        const obs = [...readings].sort(sortByTime)
        const fcd = [...forecast].sort(sortByTime)

        const histMapped = obs.map(r => ({
            time: new Date(r.timestamp!).getTime(),
            obs_process: r.process_temperature,
            obs_air: r.air_temperature,
            obs_torque: r.torque,
            obs_rpm: r.rotational_speed,
            obs_wear: r.tool_wear,
        }))

        const foreMapped = fcd.map(r => ({
            time: new Date(r.timestamp!).getTime(),
            fc_process: r.process_temperature,
            fc_air: r.air_temperature,
            fc_torque: r.torque,
            fc_rpm: r.rotational_speed,
            fc_wear: r.tool_wear,
        }))

        return [...histMapped, ...foreMapped]
    }, [readings, forecast])

  const getDomain = (keys: string[]) => {
    const values: number[] = [];
    readings.forEach((r) =>
      keys.forEach((k) => {
        // Mapping keys UI baru ke keys data lama
        const dataKey = k.includes("process")
          ? "process_temperature"
          : k.includes("air")
          ? "air_temperature"
          : k.includes("torque")
          ? "torque"
          : k.includes("wear")
          ? "tool_wear"
          : k.includes("rpm")
          ? "rotational_speed"
          : "";
        if (dataKey && r[dataKey] !== undefined)
          values.push(r[dataKey] as number);
      })
    );

    if (values.length === 0) return ["auto", "auto"];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  };

  // --- RENDER (UI Code Baru) ---

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Detail Mesin: {machineId}
            </h1>
            <p className="text-slate-500 text-sm">
              Pemantauan Real-time & Prediksi AI
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Classification Error specific */}
      {classification?.error && (
        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm">
          Warning: Prediction service unavailable ({classification.error})
        </div>
      )}

      {/* Stats Cards */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Machine Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <CardItem
            icon={<Clock className="w-5 h-5 text-blue-600" />}
            label="Data Points"
            value={readings.length}
            subtext="Observed frames"
          />
          <CardItem
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            label="Efisiensi"
            value={`${efficiency}%`}
            subtext="Estimasi Termal"
          />
          <CardItem
            icon={
              <Activity
                className={`w-5 h-5 ${
                  healthScore > 80 ? "text-green-600" : "text-red-600"
                }`}
              />
            }
            label="Health Score"
            value={classification ? `${healthScore}/100` : "Calculating..."}
            subtext={classification?.prediction_label ?? "Waiting..."}
            highlight={healthScore < 70 && classification !== null}
          />
          <CardItem
            icon={<Zap className="w-5 h-5 text-yellow-600" />}
            label="Power Usage"
            value={`${powerUsage} kW`}
            subtext="Calculated Load"
          />
          <CardItem
            icon={<Calendar className="w-5 h-5 text-slate-600" />}
            label="Last Reading"
            value={
              latest?.timestamp
                ? new Date(latest.timestamp).toLocaleTimeString()
                : "-"
            }
            subtext={
              latest?.timestamp
                ? new Date(latest.timestamp).toLocaleDateString()
                : ""
            }
          />

          {/* Sensor Cards */}
          <CardItem
            label="Air Temperature"
            value={latest?.air_temperature?.toFixed(1) ?? "-"}
            unit=" K"
            subtext="Ambient"
          />
          <CardItem
            label="Process Temp"
            value={latest?.process_temperature?.toFixed(1) ?? "-"}
            unit=" K"
            subtext="Operational"
          />
          <CardItem
            label="Rotational Speed"
            value={latest?.rotational_speed ?? "-"}
            unit=" RPM"
            subtext="Motor Speed"
          />
          <CardItem
            label="Torque"
            value={latest?.torque ?? "-"}
            unit=" Nm"
            subtext="Force"
          />
          <CardItem
            label="Tool Wear"
            value={latest?.tool_wear ?? "-"}
            unit=" Min"
            subtext="Cumulative"
            highlight={(latest?.tool_wear || 0) > 200}
          />
        </div>
      </div>

      {/* Charts Grid */}
      {!loading && chartData.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Grafik Analisis
          </h3>

          <ChartSection title="Process Temperature Analysis">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" fontSize={12} minTickGap={30} />
                <YAxis
                  domain={getDomain(["obs_process", "fc_process"])}
                  fontSize={12}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="obs_process"
                  name="Observed"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="fc_process"
                  name="Forecast"
                  stroke="#93c5fd"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartSection title="Torque Dynamics">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" fontSize={10} minTickGap={30} />
                  <YAxis domain={getDomain(["obs_torque"])} fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="obs_torque"
                    name="Torque"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="fc_torque"
                    name="Forecast"
                    stroke="#fcd34d"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="Air Temperature">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" fontSize={10} minTickGap={30} />
                  <YAxis domain={getDomain(["obs_air"])} fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="obs_air"
                    name="Air Temp"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="fc_air"
                    name="Forecast"
                    stroke="#86efac"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="Tool Wear Status">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" fontSize={10} minTickGap={30} />
                  <YAxis domain={getDomain(["obs_wear"])} fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="obs_wear"
                    name="Wear (Min)"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="fc_wear"
                    name="Forecast"
                    stroke="#fca5a5"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="Rotational Speed (RPM)">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" fontSize={10} minTickGap={30} />
                  <YAxis domain={getDomain(["obs_rpm"])} fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="obs_rpm"
                    name="RPM"
                    stroke="#9333ea"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="fc_rpm"
                    name="Forecast"
                    stroke="#d8b4fe"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection title="Maintenance History (Static)">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={maintenanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#475569"
                    name="Intervention"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>
          </div>
        </div>
      )}

      {!loading && chartData.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
          No readings returned from the system.
        </div>
      )}
    </div>
  );
}

// --- UI COMPONENTS ---

function CardItem({
  label,
  value,
  subtext,
  icon,
  unit = "",
  highlight = false,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${
        highlight ? "border-red-200 bg-red-50" : "border-slate-200"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase">
          {label}
        </span>
        {icon}
      </div>
      <div
        className={`text-xl font-bold ${
          highlight ? "text-red-700" : "text-slate-900"
        }`}
      >
        {value}
        <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
      </div>
      {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
    </div>
  );
}

function ChartSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h4 className="font-bold text-slate-700 mb-4 text-sm">{title}</h4>
      {children}
    </div>
  );
}
