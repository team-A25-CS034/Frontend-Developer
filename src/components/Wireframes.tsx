import { ArrowRight, ArrowDown } from 'lucide-react';

export default function Wireframes() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-slate-900 mb-2">Predictive Maintenance Copilot</h1>
          <h2 className="text-slate-700">Low-Fidelity Wireframes & Architecture Flow</h2>
        </div>

        {/* Login Page Wireframe */}
        <div className="mb-16">
          <div className="bg-white border-4 border-slate-900 p-8 max-w-md mx-auto">
            <h3 className="text-center mb-8 text-slate-900">1. LOGIN PAGE</h3>
            
            <div className="space-y-4">
              {/* Logo placeholder */}
              <div className="w-16 h-16 border-4 border-slate-400 mx-auto"></div>
              <div className="h-8 border-2 border-slate-400 bg-slate-100 text-center flex items-center justify-center">
                App Title
              </div>
              
              {/* Email input */}
              <div className="space-y-2">
                <div className="h-4 w-20 bg-slate-300"></div>
                <div className="h-10 border-2 border-slate-400"></div>
              </div>
              
              {/* Password input */}
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-300"></div>
                <div className="h-10 border-2 border-slate-400"></div>
              </div>
              
              {/* Forgot password */}
              <div className="h-4 w-32 bg-slate-200 ml-auto"></div>
              
              {/* Login button */}
              <div className="h-12 border-4 border-slate-900 bg-slate-300 text-center flex items-center justify-center">
                LOGIN BUTTON
              </div>
            </div>
          </div>
          
          {/* Arrow to next page */}
          <div className="flex justify-center my-6">
            <ArrowDown className="w-8 h-8 text-slate-900" />
          </div>
        </div>

        {/* Fleet Overview Wireframe */}
        <div className="mb-16">
          <div className="bg-white border-4 border-slate-900 p-6">
            <h3 className="text-center mb-6 text-slate-900">2. FLEET OVERVIEW PAGE</h3>
            
            <div className="flex gap-4 mb-6">
              {/* Sidebar */}
              <div className="w-48 border-2 border-slate-400 p-4 space-y-3">
                <div className="h-8 bg-slate-300 border-2 border-slate-900"></div>
                <div className="h-6 bg-slate-200"></div>
                <div className="h-6 bg-slate-200"></div>
                <div className="h-6 bg-slate-200"></div>
                <div className="h-6 bg-slate-200"></div>
                <div className="mt-auto pt-8">
                  <div className="h-10 bg-slate-900 text-white text-center flex items-center justify-center text-xs">
                    ASK COPILOT
                  </div>
                </div>
              </div>
              
              {/* Main content */}
              <div className="flex-1 space-y-4">
                {/* Header */}
                <div className="h-12 border-2 border-slate-400 flex items-center px-4 gap-4">
                  <div className="h-6 w-32 bg-slate-300"></div>
                  <div className="ml-auto h-8 w-8 rounded-full border-2 border-slate-400"></div>
                </div>
                
                {/* Stats cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="border-2 border-slate-400 p-4">
                    <div className="h-4 w-20 bg-slate-200 mb-2"></div>
                    <div className="h-8 w-12 bg-slate-300"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-4">
                    <div className="h-4 w-20 bg-slate-200 mb-2"></div>
                    <div className="h-8 w-12 bg-slate-300"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-4">
                    <div className="h-4 w-20 bg-slate-200 mb-2"></div>
                    <div className="h-8 w-12 bg-slate-300"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-4">
                    <div className="h-4 w-20 bg-slate-200 mb-2"></div>
                    <div className="h-8 w-12 bg-slate-300"></div>
                  </div>
                </div>
                
                {/* Search and filters */}
                <div className="border-2 border-slate-400 p-4 flex gap-3">
                  <div className="flex-1 h-10 border-2 border-slate-400 bg-slate-50"></div>
                  <div className="w-40 h-10 border-2 border-slate-400"></div>
                  <div className="w-40 h-10 border-2 border-slate-400"></div>
                </div>
                
                {/* Table */}
                <div className="border-2 border-slate-400">
                  {/* Table header */}
                  <div className="h-10 bg-slate-200 border-b-2 border-slate-400"></div>
                  {/* Table rows */}
                  <div className="h-12 border-b border-slate-300"></div>
                  <div className="h-12 border-b border-slate-300"></div>
                  <div className="h-12 border-b border-slate-300"></div>
                  <div className="h-12 border-b border-slate-300"></div>
                  <div className="h-12"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center my-6">
            <ArrowDown className="w-8 h-8 text-slate-900" />
          </div>
        </div>

        {/* Machine Detail Wireframe */}
        <div className="mb-16">
          <div className="bg-white border-4 border-slate-900 p-6">
            <h3 className="text-center mb-6 text-slate-900">3. MACHINE DETAIL PAGE</h3>
            
            <div className="flex gap-4">
              {/* Sidebar */}
              <div className="w-48 border-2 border-slate-400 p-4 space-y-3">
                <div className="h-8 bg-slate-300"></div>
                <div className="h-6 bg-slate-200"></div>
                <div className="h-6 bg-slate-200"></div>
                <div className="h-6 bg-slate-200"></div>
              </div>
              
              {/* Main content */}
              <div className="flex-1 space-y-4">
                {/* Back button */}
                <div className="h-8 w-32 border-2 border-slate-400"></div>
                
                {/* Machine header */}
                <div className="border-2 border-slate-900 bg-slate-800 text-white p-4">
                  <div className="flex justify-between mb-3">
                    <div className="h-6 w-48 bg-slate-600"></div>
                    <div className="h-12 w-24 border-2 border-white"></div>
                  </div>
                  <div className="flex gap-8">
                    <div className="h-4 w-32 bg-slate-600"></div>
                    <div className="h-4 w-32 bg-slate-600"></div>
                    <div className="h-4 w-32 bg-slate-600"></div>
                  </div>
                </div>
                
                {/* Stats cards row */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="border-2 border-slate-400 p-3">
                    <div className="h-6 w-6 bg-slate-300 mb-2"></div>
                    <div className="h-3 w-16 bg-slate-200 mb-1"></div>
                    <div className="h-4 w-12 bg-slate-300"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-3">
                    <div className="h-6 w-6 bg-slate-300 mb-2"></div>
                    <div className="h-3 w-16 bg-slate-200 mb-1"></div>
                    <div className="h-4 w-12 bg-slate-300"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-3">
                    <div className="h-6 w-6 bg-slate-300 mb-2"></div>
                    <div className="h-3 w-16 bg-slate-200 mb-1"></div>
                    <div className="h-4 w-12 bg-slate-300"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-3">
                    <div className="h-6 w-6 bg-slate-300 mb-2"></div>
                    <div className="h-3 w-16 bg-slate-200 mb-1"></div>
                    <div className="h-4 w-12 bg-slate-300"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-3">
                    <div className="h-6 w-6 bg-slate-300 mb-2"></div>
                    <div className="h-3 w-16 bg-slate-200 mb-1"></div>
                    <div className="h-4 w-12 bg-slate-300"></div>
                  </div>
                </div>
                
                {/* Feature cards */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="border-2 border-slate-400 p-3">
                    <div className="h-24 bg-slate-100 mb-2"></div>
                    <div className="h-4 w-20 bg-slate-200"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-3">
                    <div className="h-4 w-24 bg-slate-300 mb-2"></div>
                    <div className="h-6 w-16 bg-slate-200"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-3">
                    <div className="h-4 w-24 bg-slate-300 mb-2"></div>
                    <div className="h-6 w-16 bg-slate-200"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-3">
                    <div className="h-4 w-24 bg-slate-300 mb-2"></div>
                    <div className="h-6 w-16 bg-slate-200"></div>
                  </div>
                </div>
                
                {/* Sensor graphs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border-2 border-slate-400 p-4">
                    <div className="h-4 w-32 bg-slate-300 mb-3"></div>
                    <div className="h-32 bg-slate-100 border border-slate-300"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-4">
                    <div className="h-4 w-32 bg-slate-300 mb-3"></div>
                    <div className="h-32 bg-slate-100 border border-slate-300"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-4">
                    <div className="h-4 w-32 bg-slate-300 mb-3"></div>
                    <div className="h-32 bg-slate-100 border border-slate-300"></div>
                  </div>
                  <div className="border-2 border-slate-400 p-4">
                    <div className="h-4 w-32 bg-slate-300 mb-3"></div>
                    <div className="h-32 bg-slate-100 border border-slate-300"></div>
                  </div>
                </div>
                
                {/* Floating action buttons */}
                <div className="absolute bottom-8 right-8 space-y-2">
                  <div className="h-12 w-40 bg-slate-900 text-white text-center flex items-center justify-center text-xs">
                    ASK COPILOT
                  </div>
                  <div className="h-10 w-40 border-2 border-slate-400 text-center flex items-center justify-center text-xs">
                    SET ALERT
                  </div>
                  <div className="h-10 w-40 border-2 border-slate-400 text-center flex items-center justify-center text-xs">
                    CREATE TICKET
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center my-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <ArrowDown className="w-8 h-8 text-slate-900" />
                <span className="text-xs text-slate-600 mt-1">Click Copilot</span>
              </div>
              <div className="flex flex-col items-center">
                <ArrowDown className="w-8 h-8 text-slate-900" />
                <span className="text-xs text-slate-600 mt-1">Set Alert</span>
              </div>
              <div className="flex flex-col items-center">
                <ArrowDown className="w-8 h-8 text-slate-900" />
                <span className="text-xs text-slate-600 mt-1">Create Ticket</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower section - 3 columns */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          {/* Copilot Modal Wireframe */}
          <div>
            <div className="bg-white border-4 border-slate-900 p-4">
              <h3 className="text-center mb-4 text-slate-900 text-sm">4. COPILOT MODAL</h3>
              
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-center pb-3 border-b-2 border-slate-400">
                  <div className="h-6 w-32 bg-slate-300"></div>
                  <div className="h-6 w-6 border-2 border-slate-400"></div>
                </div>
                
                {/* Chat messages */}
                <div className="space-y-2">
                  <div className="h-12 bg-slate-200 border-2 border-slate-400 rounded-lg"></div>
                  <div className="h-16 bg-slate-100 border-2 border-slate-400 rounded-lg ml-8"></div>
                  <div className="h-12 bg-slate-200 border-2 border-slate-400 rounded-lg"></div>
                </div>
                
                {/* Table response */}
                <div className="border-2 border-slate-400 p-2">
                  <div className="h-6 bg-slate-300 mb-1"></div>
                  <div className="h-4 bg-slate-100 mb-1"></div>
                  <div className="h-4 bg-slate-100"></div>
                </div>
                
                {/* Example prompts */}
                <div className="pt-3 border-t-2 border-slate-400">
                  <div className="h-3 w-24 bg-slate-200 mb-2"></div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="h-6 w-20 bg-slate-100 border border-slate-300"></div>
                    <div className="h-6 w-24 bg-slate-100 border border-slate-300"></div>
                    <div className="h-6 w-20 bg-slate-100 border border-slate-300"></div>
                  </div>
                </div>
                
                {/* Input */}
                <div className="flex gap-2 pt-3 border-t-2 border-slate-400">
                  <div className="flex-1 h-10 border-2 border-slate-400"></div>
                  <div className="h-10 w-10 border-2 border-slate-400"></div>
                  <div className="h-10 w-16 bg-slate-900"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Page Wireframe */}
          <div>
            <div className="bg-white border-4 border-slate-900 p-4">
              <h3 className="text-center mb-4 text-slate-900 text-sm">5. ALERT SETTINGS</h3>
              
              <div className="space-y-3">
                {/* Create form */}
                <div className="border-2 border-slate-400 p-3">
                  <div className="h-4 w-32 bg-slate-300 mb-3"></div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="h-8 border border-slate-300"></div>
                    <div className="h-8 border border-slate-300"></div>
                    <div className="h-8 border border-slate-300"></div>
                    <div className="h-8 border border-slate-300"></div>
                  </div>
                  <div className="h-10 bg-slate-900 mt-3"></div>
                </div>
                
                {/* Table */}
                <div className="border-2 border-slate-400">
                  <div className="h-4 w-32 bg-slate-300 m-2"></div>
                  <div className="h-8 bg-slate-200 border-b-2 border-slate-400"></div>
                  <div className="h-8 border-b border-slate-300"></div>
                  <div className="h-8 border-b border-slate-300"></div>
                  <div className="h-8 border-b border-slate-300"></div>
                  <div className="h-8"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Page Wireframe */}
          <div>
            <div className="bg-white border-4 border-slate-900 p-4">
              <h3 className="text-center mb-4 text-slate-900 text-sm">6. TICKET SIMULATION</h3>
              
              <div className="space-y-3">
                {/* Create form */}
                <div className="border-2 border-slate-400 p-3">
                  <div className="h-4 w-32 bg-slate-300 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-8 border border-slate-300"></div>
                    <div className="h-16 border border-slate-300"></div>
                    <div className="h-16 border border-slate-300"></div>
                    <div className="h-8 border border-slate-300"></div>
                  </div>
                  <div className="h-10 bg-slate-900 mt-3"></div>
                </div>
                
                {/* Table */}
                <div className="border-2 border-slate-400">
                  <div className="h-4 w-32 bg-slate-300 m-2"></div>
                  <div className="h-8 bg-slate-200 border-b-2 border-slate-400"></div>
                  <div className="h-8 border-b border-slate-300"></div>
                  <div className="h-8 border-b border-slate-300"></div>
                  <div className="h-8"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Page Wireframe */}
        <div className="mb-16">
          <div className="bg-white border-4 border-slate-900 p-6 max-w-2xl mx-auto">
            <h3 className="text-center mb-6 text-slate-900">7. PROFILE / SETTINGS</h3>
            
            <div className="space-y-4">
              {/* Profile header */}
              <div className="border-2 border-slate-400 p-4 flex gap-4">
                <div className="w-20 h-20 rounded-full border-2 border-slate-400"></div>
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-slate-300"></div>
                  <div className="h-4 w-48 bg-slate-200"></div>
                  <div className="h-4 w-40 bg-slate-200"></div>
                </div>
              </div>
              
              {/* Profile info */}
              <div className="border-2 border-slate-400 p-4">
                <div className="h-5 w-40 bg-slate-300 mb-3"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-10 border border-slate-300"></div>
                  <div className="h-10 border border-slate-300"></div>
                  <div className="h-10 border border-slate-300"></div>
                  <div className="h-10 border border-slate-300"></div>
                </div>
                <div className="h-10 w-32 bg-slate-900 mt-4"></div>
              </div>
              
              {/* Password section */}
              <div className="border-2 border-slate-400 p-4">
                <div className="h-5 w-40 bg-slate-300 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-10 border border-slate-300"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 border border-slate-300"></div>
                    <div className="h-10 border border-slate-300"></div>
                  </div>
                </div>
                <div className="h-10 w-40 border-2 border-slate-400 mt-4"></div>
              </div>
              
              {/* Logout */}
              <div className="border-2 border-slate-400 p-4">
                <div className="h-12 bg-red-100 border-2 border-red-400 text-center flex items-center justify-center">
                  LOGOUT BUTTON
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Flow Diagram */}
        <div className="mt-16 pt-8 border-t-4 border-slate-900">
          <h2 className="text-center text-slate-900 mb-8">Navigation Flow Architecture</h2>
          
          <div className="bg-white border-2 border-slate-900 p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Login */}
              <div className="h-16 w-48 border-4 border-slate-900 bg-slate-200 flex items-center justify-center">
                Login
              </div>
              
              <ArrowDown className="w-6 h-6 text-slate-900" />
              
              {/* Fleet Overview */}
              <div className="h-16 w-48 border-4 border-blue-600 bg-blue-100 flex items-center justify-center">
                Fleet Overview
              </div>
              
              <ArrowDown className="w-6 h-6 text-slate-900" />
              
              {/* Machine Detail */}
              <div className="h-16 w-48 border-4 border-blue-600 bg-blue-100 flex items-center justify-center">
                Machine Detail
              </div>
              
              <div className="flex gap-8 mt-4">
                <div className="flex flex-col items-center">
                  <ArrowDown className="w-6 h-6 text-slate-900" />
                  <div className="h-16 w-40 border-4 border-purple-600 bg-purple-100 flex items-center justify-center mt-4">
                    Copilot
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <ArrowDown className="w-6 h-6 text-slate-900" />
                  <div className="h-16 w-40 border-4 border-green-600 bg-green-100 flex items-center justify-center mt-4">
                    Alerts
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <ArrowDown className="w-6 h-6 text-slate-900" />
                  <div className="h-16 w-40 border-4 border-orange-600 bg-orange-100 flex items-center justify-center mt-4">
                    Tickets
                  </div>
                </div>
              </div>
              
              {/* Sidebar navigation note */}
              <div className="mt-8 p-4 bg-slate-100 border-2 border-slate-400 rounded max-w-xl text-center">
                <p className="text-slate-700">
                  <span className="font-bold">Sidebar Navigation:</span> Fleet | Alerts | Tickets | Profile accessible from all pages after login
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 border-4 border-slate-900"></div>
            <span className="text-slate-600">Entry Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 border-4 border-blue-600 bg-blue-100"></div>
            <span className="text-slate-600">Main Pages</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 border-4 border-purple-600 bg-purple-100"></div>
            <span className="text-slate-600">Modal/Overlay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 border-4 border-green-600 bg-green-100"></div>
            <span className="text-slate-600">Feature Page</span>
          </div>
        </div>
      </div>
    </div>
  );
}
