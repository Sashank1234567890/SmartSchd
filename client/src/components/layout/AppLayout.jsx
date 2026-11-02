import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Calendar, 
  Cpu, 
  Table, 
  BarChart3, 
  ShieldCheck,
  Globe,
  Settings2,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../../config/api';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/data', label: 'Data Management', icon: Database },
  { to: '/settings', label: 'Calendar & Settings', icon: Calendar },
  { to: '/generate', label: 'Generation Lab', icon: Cpu },
  { to: '/timetables', label: 'Timetable Viewer', icon: Table },
  { to: '/comparisons', label: 'Algorithm Comparison', icon: BarChart3 }
];

export default function AppLayout() {
  const [currentApi, setCurrentApi] = useState(getApiBaseUrl());
  const [showModal, setShowModal] = useState(false);
  const [inputUrl, setInputUrl] = useState(getApiBaseUrl());
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const handleUrlChange = (e) => {
      setCurrentApi(e.detail || getApiBaseUrl());
    };
    window.addEventListener('smartsched:api_url_changed', handleUrlChange);
    return () => window.removeEventListener('smartsched:api_url_changed', handleUrlChange);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setApiBaseUrl(inputUrl);
    setCurrentApi(getApiBaseUrl());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowModal(false);
      window.location.reload();
    }, 600);
  };

  const handleReset = () => {
    setApiBaseUrl('');
    setInputUrl(getApiBaseUrl());
    setCurrentApi(getApiBaseUrl());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowModal(false);
      window.location.reload();
    }, 600);
  };

  const displayUrl = currentApi || (typeof window !== 'undefined' ? window.location.origin : 'Same-Origin / Local');

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

        {/* Footer info: DB status & Backend Link control for Vercel */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">Database: Connected</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-200/80">
            <button
              onClick={() => {
                setInputUrl(currentApi);
                setShowModal(true);
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 text-slate-600 transition group"
              title="Configure Backend API URL for Vercel / Cloud Deployment"
            >
              <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate text-left font-mono text-[10px] text-slate-700">
                  {displayUrl.replace(/^https?:\/\//, '')}
                </span>
              </div>
              <Settings2 className="w-3 h-3 text-slate-400 group-hover:text-sky-600 shrink-0" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backend API Link Modal for Vercel & Cloud Hosting */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Backend API Configuration</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Backend Server URL
                </label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://your-backend.railway.app or http://localhost:3001"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Enter your deployed backend address (e.g. on Vercel, Render, Railway, Fly.io, or VPS).
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Quick Set:</span>
                  <button
                    type="button"
                    onClick={() => setInputUrl('https://smartschd-server.vercel.app')}
                    className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
                  >
                    Vercel Backend
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputUrl('http://localhost:3001')}
                    className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
                  >
                    localhost:3001
                  </button>
                </div>
              </div>

              <div className="bg-sky-50/80 border border-sky-100 rounded-lg p-3 text-[11px] text-sky-900 space-y-1.5">
                <div className="font-bold text-sky-950 flex items-center space-x-1.5">
                  <span>Vercel Environment Variables:</span>
                </div>
                <p className="text-slate-600">
                  When deploying to Vercel, you can set either:
                </p>
                <div className="space-y-1 font-mono text-[10.5px]">
                  <div className="bg-white/80 px-2 py-1 rounded border border-sky-200 text-sky-800">
                    VITE_API_URL = https://your-backend-domain
                  </div>
                  <div className="bg-white/80 px-2 py-1 rounded border border-sky-200 text-sky-800">
                    VITEAPIURL = https://your-backend-domain
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  Reset to Default
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center space-x-1.5 transition"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved! Reloading...</span>
                      </>
                    ) : (
                      <span>Save & Apply</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
