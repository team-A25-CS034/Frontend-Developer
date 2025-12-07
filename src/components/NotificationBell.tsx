import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Bell } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  read: boolean;
}

interface NotificationBellProps {
  notifications?: NotificationItem[];
  onClickNotification?: (id: string) => void;
  /** show local test control to add mock notifications (default: false) */
  showTestControls?: boolean;
}

const defaultNotifications: NotificationItem[] = [
  { id: 'n1', title: 'New alert: Motor Drive C-33', description: 'Vibration increased 40%', time: '5m', read: false },
  { id: 'n2', title: 'Maintenance scheduled', description: 'M002 scheduled for 2025-11-05', time: '1h', read: true },
  { id: 'n3', title: 'Ticket #842 assigned', description: 'Review maintenance plan for line 4', time: '2h', read: true },
  { id: 'n4', title: 'Firmware update available', description: 'Drive C-33 pending update v1.2.8', time: '4h', read: false },
  { id: 'n5', title: 'Energy usage spike detected', description: 'Plant 2 conveyor energy draw +18%', time: '6h', read: false },
];

export default function NotificationBell({
  notifications = defaultNotifications,
  onClickNotification,
  showTestControls = false,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(notifications);
  const [hasNew, setHasNew] = useState(false); // indicates newly arrived notifications
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties | undefined>(undefined);

  // keep previous notifications id set to detect newly arrived items
  const prevIdsRef = useRef<Set<string>>(new Set(notifications.map((n) => n.id)));

  // Update items when prop changes, detect new unread items and set hasNew
  useEffect(() => {
    const prevIds = prevIdsRef.current;
    const newUnread = notifications.some((n) => !n.read && !prevIds.has(n.id));
    prevIdsRef.current = new Set(notifications.map((n) => n.id));

    if (newUnread) setHasNew(true);
    setItems(notifications);
  }, [notifications]);

  const unreadCount = items.filter((n) => !n.read).length;

  // outside-click & escape handling
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!wrapperRef.current) return;
      const target = e.target as Node | null;
      if (dropdownRef.current && target && dropdownRef.current.contains(target)) return;
      if (target && wrapperRef.current.contains(target)) return;
      if (isOpen) {
        setIsOpen(false);
        setHasNew(false);
        console.log('notifications dropdown closed (outside click)');
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setHasNew(false);
        console.log('notifications dropdown closed (escape)');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  // compute dropdown position when opening (stable while open)
  useEffect(() => {
    if (!isOpen) {
      setDropdownStyle(undefined);
      return;
    }

    function compute() {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const btn = wrapper.querySelector('[data-notif-toggle]') as HTMLElement | null;
      if (!btn) return;
      const btnRect = btn.getBoundingClientRect();

      const dropdownWidth = 320; // w-80
      const margin = 8;

      // preferred horizontal placement centered on button
      const preferredLeft = btnRect.left + btnRect.width / 2 - dropdownWidth / 2;
      let left = Math.min(Math.max(preferredLeft, margin), window.innerWidth - dropdownWidth - margin);
      if (left < margin) left = margin;

      let top = btnRect.bottom + 8;
      const maxBelow = window.innerHeight - top - margin;
      let maxHeight = maxBelow;

      if (maxBelow < 140) {
        if (btnRect.top > 200) {
          const approxHeight = Math.min(360, btnRect.top - margin - 16);
          top = Math.max(margin, btnRect.top - approxHeight - 8);
          maxHeight = btnRect.top - margin - 8;
        } else {
          maxHeight = Math.max(120, maxBelow);
        }
      }

      // === New logic to cap visible items to 6 rows ===
      // approximate item height (px). Adjust if your item padding/font differs.
      const ITEM_HEIGHT = 56; // ~ px per notification row
      const visibleRows = 6;
      const maxByRows = ITEM_HEIGHT * visibleRows;
      // final maxHeight cannot exceed maxByRows (so only 6 shown), but also cannot exceed space available
      const finalMaxHeight = Math.max(120, Math.min(maxHeight, maxByRows));

      setDropdownStyle({
        position: 'fixed',
        left: Math.round(left),
        top: Math.round(top),
        width: dropdownWidth,
        maxHeight: finalMaxHeight,
        zIndex: 9999,
      });
    }

    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('orientationchange', compute);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('orientationchange', compute);
    };
  }, [isOpen, items.length]);

  // toggle (open/close) - opening/closing clears hasNew per requirement
  const toggle = () => {
    setIsOpen((v) => {
      const next = !v;
      console.log('notifications toggled', next ? 'open' : 'close');
      setHasNew(false);
      return next;
    });
  };

  // Clicking a notification marks it read but does NOT close dropdown (avoids jump)
  const handleClickNotification = (id: string, e?: React.MouseEvent) => {
    if (e && e.currentTarget instanceof HTMLElement) e.currentTarget.blur();
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, read: true } : p)));
    console.log('notif clicked', id);
    if (onClickNotification) onClickNotification(id);
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((p) => ({ ...p, read: true })));
    setHasNew(false);
    console.log('mark all read');
  };

  // === Helper: add mock notification (for testing) ===
  // Adds new unread notification to top and sets hasNew/unread indicator.
  // This will NOT call external props; it updates internal state only (for local testing).
  const addMockNotification = (opts?: { title?: string; description?: string }) => {
    const id = `m${Date.now()}`;
    const newItem: NotificationItem = {
      id,
      title: opts?.title ?? `Mock alert ${items.length + 1}`,
      description: opts?.description ?? 'Auto-generated test notification',
      time: 'now',
      read: false,
    };
    // prepend item so newest at top
    setItems((prev) => [newItem, ...prev]);
    // mark "new" indicator visible
    setHasNew(true);
    // update prevIdsRef so next prop update won't mistake it as remote new
    prevIdsRef.current.add(id);
    console.log('mock notif added', id);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        data-notif-toggle="true"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={toggle}
        title="Notifications"
        className="inline-flex items-center justify-center p-2 rounded-md border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 relative"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {(unreadCount > 0 || hasNew) && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {/* Optional test controls rendered inline near the bell when showTestControls is true */}
      {showTestControls && (
        <div className="absolute -right-0 top-full mt-2 w-44 p-2 bg-white rounded shadow-sm border border-slate-100 text-xs z-40">
          <button
            type="button"
            onClick={() => addMockNotification()}
            className="w-full text-left px-2 py-1 rounded hover:bg-slate-50"
          >
            Add mock notification
          </button>
          <button
            type="button"
            onClick={() => {
              // add a few notifications quickly
              for (let i = 0; i < 3; i++) addMockNotification({ title: `Batch mock ${i + 1}` });
            }}
            className="w-full text-left px-2 py-1 mt-1 rounded hover:bg-slate-50"
          >
            Add 3 mocks
          </button>
        </div>
      )}

      {isOpen && dropdownStyle &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            role="menu"
            aria-hidden={false}
            className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden transform transition duration-150 ease-out"
            style={dropdownStyle}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <div className="text-sm font-medium">Notifications</div>
              <div className="text-xs text-slate-500">{ Math.max(unreadCount, 0) } unread</div>
            </div>

            {/* The container will scroll when items > visible area (we set maxHeight in style) */}
              <div className="overflow-auto" style={{ maxHeight: '13.5rem' }}>
              {items.length === 0 && (
                <div className="px-3 py-4 text-sm text-slate-500">No notifications</div>
              )}

              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={(e) => handleClickNotification(n.id, e)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    {!n.read ? (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
                    ) : (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-transparent" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`truncate ${!n.read ? 'font-medium text-slate-900' : 'text-slate-800'}`}>{n.title}</div>
                    {n.description && <div className="text-xs text-slate-500 truncate">{n.description}</div>}
                  </div>

                  {n.time && <div className="ml-3 text-xs text-slate-400 flex-shrink-0">{n.time}</div>}
                </button>
              ))}
            </div>

            <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between">
              <button type="button" onClick={markAllRead} className="text-sm text-slate-600 hover:text-slate-800">
                Mark all as read
              </button>
              <button type="button" onClick={() => { setIsOpen(false); setHasNew(false); }} className="text-sm text-slate-600 hover:text-slate-800">
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
