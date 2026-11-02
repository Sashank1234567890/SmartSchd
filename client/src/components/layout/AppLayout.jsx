import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Calendar, 
  Cpu, 
  Table, 
  BarChart3, 
  ShieldCheck 
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/data', label: 'Data Management', icon: Database },
  { to: '/settings', label: 'Calendar & Settings', icon: Calendar },
  { to: '/generate', label: 'Generation Lab', icon: Cpu },
  { to: '/timetables', label: 'Timetable Viewer', icon: Table },
  { to: '/comparisons', label: 'Algorithm Comparison', icon: BarChart3 }
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-16 px-6 flex items-center border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 p-2 rounded-lg text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">SmartSched</h1>
              <p className="text-[10px] text-slate-500 font-medium">DAA &bull; NIT Delhi &bull; CSBB 202</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Database: Connected</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-400 bg-white">
          SmartSched &bull; Design and Analysis of Algorithms Course Project &bull; National Institute of Technology Delhi
        </footer>
      </div>
    </div>
  );
}
