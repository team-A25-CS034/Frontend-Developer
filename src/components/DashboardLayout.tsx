import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Bell, 
  FileText, 
  User, 
  Bot,
  Building2
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

interface DashboardLayoutProps {
  children: ReactNode;
  onOpenCopilot: () => void;
}

export default function DashboardLayout({ children, onOpenCopilot }: DashboardLayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Fleet', href: '/fleet', icon: LayoutGrid },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Tickets', href: '/tickets', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
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
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Copilot Button */}
        <div className="p-4 border-t border-slate-800">
          <Button
            onClick={onOpenCopilot}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Bot className="w-5 h-5 mr-2" />
            Ask Copilot
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-slate-900">
            {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
          </h1>
          
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback className="bg-blue-100 text-blue-700">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
