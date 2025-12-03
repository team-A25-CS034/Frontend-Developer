// copilotmodal.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  X, Send, Mic, Download, Trash2, Bot, Minus,
  ThumbsUp, ThumbsDown
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

function TableWithSort({ data }: { data: any[] }) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortBy) return 0;
    const va = a[sortBy];
    const vb = b[sortBy];

    if (typeof va === "number" && typeof vb === "number")
      return sortDir === "asc" ? va - vb : vb - va;

    return sortDir === "asc"
      ? String(va).localeCompare(String(vb), undefined, { sensitivity: "base" })
      : String(vb).localeCompare(String(va), undefined, {
          sensitivity: "base",
        });
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {[
            "machine",
            "risk",
            "issue",
            "eta",
            "location",
            "confidence",
          ].map((col) => (
            <TableHead key={col}>
              <button
                type="button"
                className="flex items-center gap-2"
                onClick={() => toggleSort(col)}
              >
                <span>{col.charAt(0).toUpperCase() + col.slice(1)}</span>
                {sortBy === col &&
                  (sortDir === "asc" ? <span>▲</span> : <span>▼</span>)}
              </button>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {sorted.map((row, idx) => (
          <TableRow key={idx}>
            <TableCell>{row.machine}</TableCell>
            <TableCell>
              <span
                className={
                  row.risk >= 70 ? "text-red-600" : "text-yellow-600"
                }
              >
                {row.risk}
              </span>
            </TableCell>
            <TableCell>{row.issue}</TableCell>
            <TableCell>{row.eta}</TableCell>
            <TableCell>{row.location}</TableCell>
            <TableCell>
              {row.confidence != null ? `${row.confidence}%` : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "table";
  tableData?: any[];
}

const examplePrompts = [
  "Which machines need immediate attention?",
  "Show me maintenance history for M003",
  "What are the top risk factors this week?",
  "Predict failures in the next 30 days",
];

const mockTableResponse = [
  {
    machine: "Motor Drive C-33",
    risk: 87,
    issue: "High vibration",
    eta: "3-5 days",
    location: "Building C, Floor 3",
    confidence: 73,
  },
  {
    machine: "Compressor B-04",
    risk: 58,
    issue: "Temperature rising",
    eta: "7-10 days",
    location: "Building B, Floor 1",
    confidence: 61,
  },
  {
    machine: "Turbine D-21",
    risk: 24,
    issue: "Oil level low",
    eta: "14-21 days",
    location: "Building D, Floor 1",
    confidence: 45,
  },
  {
    machine: "Generator E-15",
    risk: 64,
    issue: "Bearing wear",
    eta: "7-14 days",
    location: "Building E, Floor 2",
    confidence: 59,
  },
];

export default function CopilotModal({ isOpen, onClose }: CopilotModalProps) {
  const copilot = useCopilot();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your Predictive Maintenance Copilot. I can help you analyze machine conditions, predict failures, and provide maintenance recommendations. How can I assist you today?",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const isTableQuery =
        inputValue.toLowerCase().includes("which") ||
        inputValue.toLowerCase().includes("show") ||
        inputValue.toLowerCase().includes("list");

      let assistantMessage: Message;

      if (isTableQuery) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Based on current sensor data and predictive models, here are the machines requiring attention:",
          type: "table",
          tableData: mockTableResponse,
        };
      } else {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Based on the analysis of your fleet, I recommend prioritizing Motor Drive C-33 for maintenance. The vibration levels have increased 40% over the past week, and the predictive model indicates a 73% probability of failure within the next 7 days. I suggest scheduling an inspection to check the bearing alignment and lubrication system.",
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);

    setInputValue("");
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your Predictive Maintenance Copilot. I can help you analyze machine conditions, predict failures, and provide maintenance recommendations. How can I assist you today?",
      },
    ]);
  };

  const handleExportChat = () => {
    const chatText = messages
      .map(
        (m) => `${m.role === "user" ? "You" : "Copilot"}: ${m.content}`
      )
      .join("\n\n");

    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `copilot-chat-${Date.now()}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-slate-900">AI Copilot</h2>
              <p className="text-slate-600">
                Predictive Maintenance Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportChat}
              title="Export chat"
            >
              <Download className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                copilot.minimizeCopilot();
              }}
              title="Minimize chat"
            >
              <Minus className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 p-6 overflow-auto overscroll-contain">
          <div className="flex flex-col gap-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>

                  {message.type === "table" && message.tableData && (
                    <div className="mt-4 bg-white rounded border border-slate-200 overflow-auto">
                      <TableWithSort data={message.tableData} />
                    </div>
                  )}

                  {/* --- AI Message Feedback Icons --- */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-3 mt-3 text-slate-500">
                      <Bot className="w-4 h-4 cursor-pointer hover:text-slate-700" />
                      <ThumbsUp className="w-4 h-4 cursor-pointer hover:text-green-600" />
                      <ThumbsDown className="w-4 h-4 cursor-pointer hover:text-red-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Example Prompts */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-slate-600 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(prompt)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about machines, predictions, or maintenance..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />

            <Button variant="outline" size="icon" title="Voice input">
              <Mic className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
