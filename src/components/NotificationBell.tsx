import { useEffect, useRef, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';

// Export interface agar bisa dipakai di DashboardLayout
export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  read: boolean;
  type?: 'alert' | 'info' | 'success'; // Tambahan tipe untuk styling
}

interface NotificationBellProps {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
}

export default function NotificationBell({
  notifications = [],
  onMarkAllRead,
  onClearAll
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hitung notifikasi yang belum dibaca
  const unreadCount = notifications.filter(n => !n.read).length;

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 hover:bg-slate-50 transition-colors relative group ${
                      !n.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        n.type === 'alert' ? 'bg-red-500' : 
                        n.type === 'success' ? 'bg-green-500' : 
                        !n.read ? 'bg-blue-500' : 'bg-slate-300'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                          {n.title}
                        </p>
                        {n.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {n.description}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                          {n.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex gap-2">
              <button
                onClick={onMarkAllRead}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
              <button
                onClick={onClearAll}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}