import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Mic,
  Download,
  Trash2,
  Bot,
  Minus,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Gauge,
  Terminal,
  Thermometer,
  Zap,
  RotateCw,
  Clock,
  Sparkles,
  StopCircle
} from "lucide-react";
import { useCopilot } from "../contexts/CopilotContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface InjectionResponse {
  is_malicious: boolean;
  classification?: { label: string; confidence: number };
}

interface ClassifierResponse {
  classification?: { label: string; confidence: number };
}

interface PosEntity {
  word: string;
  entity: string;
}

interface POSResponse {
  entities: PosEntity[];
}

interface ForecastItem {
  air_temperature: number;
  process_temperature: number;
  rotational_speed: number;
  torque: number;
  tool_wear: number;
  timestamp?: string;
  [key: string]: any;
}

interface ForecastResponse {
  forecast_data?: ForecastItem[];
  detail?: string;
}

interface PredictResponse {
  prediction_label?: string;
  probabilities?: number[];
  detail?: string;
}

interface AskGeminiResponse {
  status: string;
  original_query: string;
  explanation: string;
}

interface AnalysisData {
  machineId: string;
  status: string;
  probability: number;
  isSafe: boolean;
  recommendation: string;
  peakTimeOffset?: number;

  showTable: boolean;
  allFeatures?: { name: string; value: number; unit: string }[];

  targetMetricLabel?: string;
  targetMetricValue?: number;
  targetMetricUnit?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "analysis" | "gemini";
  steps?: string[];
  isError?: boolean;
  analysisData?: AnalysisData;
}

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const SimpleMarkdown = ({ content }: { content: string }) => {
  if (!content) return null;
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-700">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;
        const isList =
          trimmed.startsWith("* ") ||
          trimmed.startsWith("- ") ||
          (trimmed.startsWith("*") && trimmed[1] !== "*");
        const cleanLine = isList ? trimmed.replace(/^[\*\-]\s*/, "") : trimmed;
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g).map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**"))
            return (
              <strong key={i} className="font-bold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          return part;
        });
        if (isList)
          return (
            <div key={idx} className="flex gap-2 items-start pl-2">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
              <div>{parts}</div>
            </div>
          );
        return <p key={idx}>{parts}</p>;
      })}
    </div>
  );
};

const AnalysisCard = ({ data }: { data: AnalysisData }) => {
  const statusColor = data.isSafe
    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
    : "text-rose-600 bg-rose-50 border-rose-100";

  const getMetricIcon = (label: string = "") => {
    const l = label.toLowerCase();
    if (l.includes("suhu") || l.includes("temp"))
      return <Thermometer className="w-3.5 h-3.5" />;
    if (l.includes("rotasi") || l.includes("speed"))
      return <RotateCw className="w-3.5 h-3.5" />;
    if (l.includes("torsi") || l.includes("torque"))
      return <Zap className="w-3.5 h-3.5" />;
    return <Gauge className="w-3.5 h-3.5" />;
  };

  return (
    <div className="flex flex-col w-full mt-3 overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-sm text-slate-700 capitalize tracking-tight">
            {data.machineId.replace(/_/g, " ")}
          </span>
        </div>
        <div
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusColor}`}
        >
          {data.status}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {data.showTable && data.allFeatures ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Data pada puncak beban (Menit ke-{data.peakTimeOffset || "-"})
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-slate-50 border-slate-200">
                    <TableHead className="h-9 text-xs font-bold text-slate-700">
                      Parameter
                    </TableHead>
                    <TableHead className="h-9 text-xs font-bold text-slate-700 text-right">
                      Nilai
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.allFeatures.map((f, idx) => (
                    <TableRow
                      key={idx}
                      className="h-9 border-slate-100 hover:bg-slate-50/50"
                    >
                      <TableCell className="py-2 text-xs font-medium text-slate-600">
                        {f.name}
                      </TableCell>
                      <TableCell className="py-2 text-xs font-semibold text-slate-800 text-right font-mono">
                        {f.value}{" "}
                        <span className="text-slate-400 font-sans ml-0.5 text-[10px]">
                          {f.unit}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col justify-center p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  Confidence
                </span>
              </div>
              <div className="text-xl font-bold text-slate-800">
                {data.probability.toFixed(1)}
                <span className="text-sm font-medium text-slate-400">%</span>
              </div>
            </div>
            <div className="flex flex-col justify-center p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                {getMetricIcon(data.targetMetricLabel)}
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  {data.targetMetricLabel || "Sensor Value"}
                </span>
              </div>
              <div className="text-xl font-bold text-slate-800">
                {data.targetMetricValue?.toFixed(1)}{" "}
                <span className="text-sm font-medium text-slate-400">
                  {data.targetMetricUnit}
                </span>
              </div>
            </div>
          </div>
        )}

        <div
          className={`p-3.5 rounded-lg border flex gap-3 items-start ${
            data.isSafe
              ? "bg-emerald-50/30 border-emerald-100/50"
              : "bg-amber-50/50 border-amber-100"
          }`}
        >
          <div
            className={`mt-0.5 p-1 rounded-full ${
              data.isSafe
                ? "bg-emerald-100 text-emerald-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {data.isSafe ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
          </div>
          <div>
            <span
              className={`block text-[10px] font-bold uppercase mb-0.5 ${
                data.isSafe ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              Rekomendasi AI
            </span>
            <p
              className={`text-sm leading-relaxed ${
                data.isSafe ? "text-slate-700" : "text-slate-800"
              }`}
            >
              {data.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CopilotModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const copilot = useCopilot();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Halo! Saya Copilot Pemeliharaan Prediktif. Saya dapat membantu menganalisis kondisi mesin, memprediksi kegagalan, dan memberikan rekomendasi.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

  const examplePrompts = [
    "Cek suhu mesin 01 untuk 30 menit kedepan",
    "Analisis mesin M14860",
    "Apakah ada kerusakan pada mesin 2?",
    "Prediksi tool wear dalam 1 jam",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isProcessing]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const processUserQuery = async (text: string) => {
    setIsProcessing(true);
    const aiMsgId = generateId();

    setMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        role: "assistant",
        content: "",
        steps: ["Memulai analisis sistem..."],
      },
    ]);

    const updateStep = (step: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, steps: [...(m.steps || []), step] } : m
        )
      );
    };

    const finalizeMessage = (content: string, isError = false) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, content, isError, steps: undefined } : m
        )
      );
      setIsProcessing(false);
    };

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Sesi berakhir. Silakan login kembali.");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      updateStep("1/5 Memverifikasi keamanan prompt...");
      const injRes = await fetch(`${API_BASE}/predict/injection`, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: text }),
      });
      if (!injRes.ok) throw new Error("Layanan keamanan tidak merespons.");
      const injData: InjectionResponse = await injRes.json();
      if (injData.is_malicious)
        throw new Error(
          "Permintaan ditolak: Prompt terdeteksi berbahaya atau tidak relevan."
        );

      updateStep("2/5 Mengidentifikasi konteks...");
      const clsRes = await fetch(`${API_BASE}/predict/classifier`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text }),
      });
      if (!clsRes.ok) throw new Error("Gagal mengklasifikasikan konteks.");
      const clsData: ClassifierResponse = await clsRes.json();
      const detectedLabel = clsData.classification?.label || "unknown";

      const labelLower = detectedLabel.toLowerCase();
      if (labelLower === "error" || labelLower === "unknown") {
        finalizeMessage("Maaf, saya tidak dapat memahami pertanyaan Anda.");
        return;
      }

      updateStep("3/5 Mengekstrak parameter entitas...");
      const posRes = await fetch(`${API_BASE}/predict/pos`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text }),
      });
      const posData: POSResponse = await posRes.json();

      let machineId: string | null = null;
      let forecastMinutes = 60;
      let displayDuration = "60 menit";

      const entities = posData.entities || [];
      const nameEntityIndex = entities.findIndex(
        (e) => e.entity === "B-NAME" || e.entity === "I-NAME"
      );

      if (nameEntityIndex !== -1) {
        let rawId = entities[nameEntityIndex].word;
        const nextEntity = entities[nameEntityIndex + 1];
        if (
          nextEntity &&
          (nextEntity.entity === "CD" || nextEntity.entity === "I-NAME")
        ) {
          rawId = nextEntity.word;
        }
        if (!rawId.toLowerCase().startsWith("machine")) {
          const num = parseInt(rawId);
          rawId = !isNaN(num)
            ? `machine_${rawId.padStart(2, "0")}`
            : `machine_${rawId}`;
        }
        machineId = rawId;
      }

      if (!machineId) {
        const match = text.match(/(?:mesin|machine|alat)\s*([a-zA-Z0-9_\-]+)/i);
        if (match) {
          let raw = match[1];
          if (!raw.toLowerCase().startsWith("machine")) {
            const num = parseInt(raw);
            if (!isNaN(num) && String(num).length < 2)
              raw = `machine_${String(num).padStart(2, "0")}`;
            else if (!isNaN(num)) raw = `machine_${raw}`;
            else raw = `machine_${raw}`;
          }
          machineId = raw;
        }
      }

      const timeMatch = text.match(/(\d+)\s*(jam|menit|hour|minute|hari|day)/i);
      if (timeMatch) {
        const val = parseInt(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();

        if (unit.includes("jam") || unit.includes("hour")) {
          forecastMinutes = val * 60;
          displayDuration = `${val} jam`;
        } else if (unit.includes("hari") || unit.includes("day")) {
          forecastMinutes = val * 1440;
          displayDuration = `${val} hari`;
        } else {
          forecastMinutes = val;
          displayDuration = `${val} menit`;
        }
      }

      if (machineId) {
        updateStep("Memverifikasi ID mesin di database...");
        const machinesRes = await fetch(`${API_BASE}/machines`, {
          method: "GET",
          headers,
        });
        if (machinesRes.ok) {
          const machData = await machinesRes.json();
          const validIds = machData.machines.map((m: any) =>
            m.machine_id.toLowerCase()
          );

          if (!validIds.includes(machineId.toLowerCase())) {
            const simpleId = machineId.replace("machine_", "");
            const fuzzyMatch = validIds.find(
              (id: string) => id.endsWith(simpleId) || id === simpleId
            );

            if (fuzzyMatch) {
              machineId = fuzzyMatch;
            } else {
              finalizeMessage(
                `Maaf, mesin dengan ID **${machineId.replace(
                  "machine_",
                  ""
                )}** tidak ditemukan.`,
                true
              );
              return;
            }
          }
        }
      } else {
        if (detectedLabel !== "unknown" && detectedLabel !== "error") {
          machineId = "machine_01";
          updateStep("ID tidak spesifik, menggunakan default (machine_01)...");
        } else {
          finalizeMessage(
            "Maaf, saya tidak dapat menemukan ID mesin. Silakan sebutkan ID mesin secara spesifik."
          );
          return;
        }
      }

      updateStep(`4/5 Melakukan simulasi forecast (${displayDuration})...`);
      const fcPayload = {
        machine_id: machineId,
        forecast_minutes: forecastMinutes,
      };
      const fcRes = await fetch(`${API_BASE}/forecast`, {
        method: "POST",
        headers,
        body: JSON.stringify(fcPayload),
      });

      if (!fcRes.ok) {
        if (fcRes.status === 404 || fcRes.status === 500)
          throw new Error(`Data mesin '${machineId}' tidak ditemukan.`);
        throw new Error("Layanan forecasting gagal.");
      }

      const fcData: ForecastResponse = await fcRes.json();
      if (!fcData.forecast_data || fcData.forecast_data.length === 0)
        throw new Error(`Data forecast kosong untuk ${machineId}.`);

      if (labelLower.includes("saran") || labelLower.includes("perbaikan")) {
        updateStep("5/5 Menghubungi Generative AI...");
        const geminiPayload = {
          query: text,
          label: "saran perbaikan",
          context: {
            machine_id: machineId,
            forecast_minutes: forecastMinutes,
            forecast_data: fcData.forecast_data,
          },
        };
        const geminiRes = await fetch(`${API_BASE}/ask-gemini`, {
          method: "POST",
          headers,
          body: JSON.stringify(geminiPayload),
        });
        if (!geminiRes.ok) throw new Error("Gagal mendapatkan saran dari AI.");
        const geminiData: AskGeminiResponse = await geminiRes.json();

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: geminiData.explanation,
                  type: "gemini",
                  steps: undefined,
                }
              : m
          )
        );
      } else {
        updateStep("5/5 Menganalisis potensi kerusakan...");

        const criticalPoint = fcData.forecast_data.reduce((prev, current) => {
          if (current.tool_wear > prev.tool_wear) return current;
          return prev;
        });

        const criticalIndex = fcData.forecast_data.indexOf(criticalPoint);
        const peakTimeOffset = criticalIndex + 1;

        const predictPayload = {
          Air_temperature: criticalPoint.air_temperature,
          Process_temperature: criticalPoint.process_temperature,
          Rotational_speed: criticalPoint.rotational_speed,
          Torque: criticalPoint.torque,
          Tool_wear: criticalPoint.tool_wear,
          Type: "L",
        };

        const predRes = await fetch(`${API_BASE}/predict`, {
          method: "POST",
          headers,
          body: JSON.stringify(predictPayload),
        });
        const predData: PredictResponse = await predRes.json();

        const probability = predData.probabilities
          ? Math.max(...predData.probabilities)
          : 0;
        const isSafe = predData.prediction_label === "No Failure";

        const analysisData: AnalysisData = {
          machineId: machineId!,
          status: predData.prediction_label || "Unknown",
          probability: probability * 100,
          isSafe: isSafe,
          recommendation: isSafe
            ? "Mesin diprediksi beroperasi aman dalam periode ini."
            : "Terdeteksi potensi kegagalan. Segera jadwalkan pemeriksaan.",
          showTable: false,
          peakTimeOffset: peakTimeOffset,
        };

        if (labelLower === "semua fitur") {
          analysisData.showTable = true;
          analysisData.allFeatures = [
            {
              name: "Suhu Udara",
              value: parseFloat(criticalPoint.air_temperature.toFixed(1)),
              unit: "K",
            },
            {
              name: "Suhu Proses",
              value: parseFloat(criticalPoint.process_temperature.toFixed(1)),
              unit: "K",
            },
            {
              name: "Kecepatan Rotasi",
              value: parseFloat(criticalPoint.rotational_speed.toFixed(0)),
              unit: "RPM",
            },
            {
              name: "Torsi",
              value: parseFloat(criticalPoint.torque.toFixed(1)),
              unit: "Nm",
            },
            {
              name: "Tool Wear",
              value: parseFloat(criticalPoint.tool_wear.toFixed(0)),
              unit: "min",
            },
          ];
        } else {
          analysisData.targetMetricLabel = "Tool Wear";
          analysisData.targetMetricValue = criticalPoint.tool_wear;
          analysisData.targetMetricUnit = "min";

          if (labelLower.includes("suhu udara")) {
            analysisData.targetMetricLabel = "Suhu Udara";
            analysisData.targetMetricValue = criticalPoint.air_temperature;
            analysisData.targetMetricUnit = "K";
          } else if (labelLower.includes("suhu proses")) {
            analysisData.targetMetricLabel = "Suhu Proses";
            analysisData.targetMetricValue = criticalPoint.process_temperature;
            analysisData.targetMetricUnit = "K";
          } else if (labelLower.includes("rotasi")) {
            analysisData.targetMetricLabel = "Kecepatan Rotasi";
            analysisData.targetMetricValue = criticalPoint.rotational_speed;
            analysisData.targetMetricUnit = "RPM";
          } else if (labelLower.includes("torsi")) {
            analysisData.targetMetricLabel = "Torsi";
            analysisData.targetMetricValue = criticalPoint.torque;
            analysisData.targetMetricUnit = "Nm";
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: `Analisis selesai untuk **${machineId}**. Berdasarkan prediksi forecast **${displayDuration}** ke depan:`,
                  type: "analysis",
                  analysisData: analysisData,
                  steps: undefined,
                }
              : m
          )
        );
      }
    } catch (error: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: error.message, isError: true, steps: undefined }
            : m
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userText = inputValue;
    const userId = generateId();
    setInputValue("");
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: userText },
    ]);
    processUserQuery(userText);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "init-1",
        role: "assistant",
        content:
          "Halo! Saya Copilot Pemeliharaan Prediktif. Saya dapat membantu menganalisis kondisi mesin, memprediksi kegagalan, dan memberikan rekomendasi.",
      },
    ]);
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const formData = new FormData();
        formData.append("file", audioBlob, "voice_input.wav");

        setIsProcessing(true);
        try {
          const response = await fetch("http://localhost:8080/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Gagal transkripsi audio");

          const data = await response.json();

          if (data.transcription) {
            setInputValue((prev) =>
              prev ? prev + " " + data.transcription : data.transcription
            );
            processUserQuery(data.transcription);
          }
        } catch (error) {
          console.error("Voice Error:", error);
          alert(
            "Gagal memproses suara. Pastikan backend speech-to-text berjalan."
          );
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic Permission Error:", err);
      alert("Gagal mengakses mikrofon. Pastikan izin diberikan.");
    }
  };

  const handleExportChat = () => {
    const chatText = messages
      .map(
        (m) =>
          `[${m.role.toUpperCase()}] ${m.content} ${
            m.analysisData ? `(Status: ${m.analysisData.status})` : ""
          }`
      )
      .join("\n\n");
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `copilot-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-slate-900/5">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Copilot</h2>
              <p className="text-sm text-slate-500 font-medium">
                Predictive Maintenance Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportChat}
              className="text-slate-500 hover:text-slate-700"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copilot.minimizeCopilot}
              className="text-slate-500 hover:text-slate-700"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 p-6 overflow-y-auto overscroll-contain bg-slate-50/50 scroll-smooth"
        >
          <div className="flex flex-col gap-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : message.isError
                      ? "bg-red-50 border border-red-200 text-red-800 rounded-bl-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                  }`}
                >
                  {message.role === "assistant" && message.steps && (
                    <div className="mb-3 space-y-2 min-w-[240px]">
                      {message.steps.map((step, idx) => {
                        const isLast = idx === message.steps!.length - 1;
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 text-xs text-slate-500 font-medium animate-in fade-in"
                          >
                            {isLast ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            <span
                              className={
                                isLast ? "text-blue-600 font-semibold" : ""
                              }
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                    {message.type === "gemini" ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2 text-blue-600 font-semibold">
                          <Sparkles className="w-4 h-4" />
                          <span>Analisis AI Generator</span>
                        </div>
                        <SimpleMarkdown content={message.content} />
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>

                  {message.type === "analysis" && message.analysisData && (
                    <AnalysisCard data={message.analysisData} />
                  )}

                  {message.role === "assistant" &&
                    !message.steps &&
                    !message.isError && (
                      <div className="flex items-center gap-2 mt-3 pt-2 text-slate-400 border-t border-slate-100">
                        <button className="p-1.5 rounded-md hover:bg-slate-100 transition-colors">
                          <Bot className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-slate-100 hover:text-emerald-600 transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-slate-100 hover:text-rose-600 transition-colors">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {messages.length === 1 && (
          <div className="px-6 pb-4 bg-slate-50/50 shrink-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Coba tanyakan:
            </p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(prompt)}
                  className="px-3 py-2 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-600 text-sm rounded-lg transition-all shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 border-t border-slate-200 bg-white shrink-0">
          <div className="flex gap-3">
            <Input
              placeholder="Tanya kondisi mesin atau prediksi..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isProcessing && handleSend()
              }
              disabled={isProcessing}
              className="flex-1 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button 
              variant="outline" 
              size="icon" 
              className={`h-12 w-12 shrink-0 transition-colors ${
                isRecording 
                  ? "bg-red-100 border-red-500 text-red-600 hover:bg-red-200" 
                  : "text-slate-500"
              }`} 
              title={isRecording ? "Stop Recording" : "Voice Input"}
              onClick={handleVoiceInput}
              disabled={isProcessing && !isRecording}
            >
              {isRecording ? (
                <StopCircle className="w-5 h-5 animate-pulse" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
            <Button
              onClick={handleSend}
              disabled={isProcessing || !inputValue.trim()}
              className="h-12 w-12 shrink-0 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="text-center mt-3">
            <span className="text-[10px] text-slate-400">
              AI dapat membuat kesalahan. Verifikasi data kritis secara manual.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
