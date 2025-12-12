import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Bell,
  FileText,
  User,
  Building2,
  Bot,
  Upload,
} from "lucide-react";
import NotificationBell, { NotificationItem } from "./NotificationBell";
// keep styling consistent with nav items for Copilot
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Toaster, toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
  onOpenCopilot?: () => void;
  onOpenUpload?: () => void;
}

export default function DashboardLayout({
  children,
  onOpenCopilot,
  onOpenUpload,
}: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const API_BASE =
      (import.meta as any)?.env?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
    const eventSource = new EventSource(
      `${API_BASE}/notifications/stream?token=${token}`
    );

    eventSource.onopen = () => {
      setConnectionStatus("connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const newNotification: NotificationItem = {
            id: Date.now().toString(),
            title: data.title || 'System Alert',
            description: data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            type: data.type === 'CRITICAL_ALERT' ? 'alert' : 'success'
        };

        setNotifications(prev => [newNotification, ...prev]);

        if (data.type === "CRITICAL_ALERT") {
          toast.error(data.title, {
            description: data.message,
            duration: 8000,
            action: {
              label: "Lihat Tiket",
              onClick: () => navigate("/tickets"),
            },
          });
        } else if (data.type === "NEW_DATA") {
          toast.success(data.title, {
            description: data.message,
          });
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [navigate]);

  const navigation = [
    { name: "Fleet", href: "/fleet", icon: LayoutGrid },
    { name: "Tickets", href: "/tickets", icon: FileText },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white">PM Copilot</h2>
              <p className="text-slate-400">Maintenance</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
                {item.name === "Tickets" && (
                  <>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => onOpenCopilot && onOpenCopilot()}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-slate-300 hover:bg-slate-800 hover:text-white text-left"
                      >
                        <Bot className="w-4 h-4" />
                        <span>Ask Copilot</span>
                      </button>
                    </div>
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => onOpenUpload && onOpenUpload()}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-slate-300 hover:bg-slate-800 hover:text-white text-left"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Data</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-slate-900">
            {navigation.find((item) => isActive(item.href))?.name ||
              "Dashboard"}
          </h1>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                connectionStatus === "connected"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    : "bg-red-500"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  connectionStatus === "connected"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {connectionStatus === "connected"
                  ? "System Listening"
                  : "Listener Offline"}
              </span>
            </div>
            <NotificationBell 
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onClearAll={handleClearAll}
            />
            <Avatar>
              <AvatarFallback className="bg-blue-100 text-blue-700">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
