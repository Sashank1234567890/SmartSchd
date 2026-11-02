import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw,
  Cpu
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    sections: [],
    rooms: [],
    teachers: [],
    subjects: [],
    settings: null,
    preflight: null
  });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [secRes, roomRes, teachRes, subRes, setRes] = await Promise.all([
        axios.get('/api/sections'),
        axios.get('/api/rooms'),
        axios.get('/api/teachers'),
        axios.get('/api/subjects'),
        axios.get('/api/settings')
      ]);

      const sections = secRes.data.data || [];
      const rooms = roomRes.data.data || [];
      const teachers = teachRes.data.data || [];
      const subjects = subRes.data.data || [];
      const settings = setRes.data.data || null;

      let preflight = null;
      if (sections.length > 0) {
        try {
          const pfRes = await axios.post('/api/validate/preflight', {
            sectionIds: sections.map(s => s._id)
          });
          preflight = pfRes.data.data;
        } catch (pfErr) {
          preflight = pfErr.response?.data?.data || null;
        }
      }

      setData({
        sections,
        rooms,
        teachers,
        subjects,
        settings,
        preflight
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalRequiredSessions = data.subjects.reduce((sum, s) => sum + (s.weeklySessions || 0), 0);
  const totalRequiredPeriods = data.subjects.reduce((sum, s) => sum + ((s.weeklySessions || 0) * (s.durationPeriods || 1)), 0);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading academic dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 to-sky-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/30 text-sky-100 border border-sky-400/30 mb-2">
            DAA Semester Project &bull; NIT Delhi &bull; CSBB 202
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">SmartSched Timetable Engine</h2>
          <p className="text-sm text-sky-100/80 mt-1 max-w-xl">
            Coupling native C++17 optimization algorithms (Greedy, Backtracking with MRV & Forward Checking, Graph Coloring) with real academic scheduling constraints.
          </p>
        </div>
        <Link
          to="/data"
          className="px-4 py-2 bg-white text-sky-900 rounded-lg text-xs font-bold hover:bg-sky-50 transition shadow-xs flex items-center shrink-0"
        >
          Manage Data <ArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-medium">Student Sections</span>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{data.sections.length}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-medium">Faculty Members</span>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{data.teachers.length}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Building className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-medium">Classrooms & Labs</span>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{data.rooms.length}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-medium">Weekly Sessions</span>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalRequiredSessions}</p>
          <span className="text-[11px] text-slate-400">{totalRequiredPeriods} teaching periods</span>
        </div>
      </div>

      {/* Pre-Flight Health & Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">Pre-Flight Readiness Status</h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            data.preflight?.isValid
              ? 'bg-emerald-100 text-emerald-800'
              : data.sections.length === 0
              ? 'bg-slate-100 text-slate-600'
              : 'bg-rose-100 text-rose-800'
          }`}>
            {data.preflight?.isValid
              ? 'Ready for Generation'
              : data.sections.length === 0
              ? 'No Data Registered'
              : 'Pre-Flight Issues Detected'}
          </span>
        </div>

        {data.sections.length === 0 ? (
          <p className="text-xs text-slate-500">
            No sections or courses registered yet. Navigate to <Link to="/data" className="text-sky-600 underline font-medium">Data Management</Link> to register sections, rooms, teachers, and subjects.
          </p>
        ) : (
          <div className="space-y-3">
            {data.preflight?.errors && data.preflight.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider">Blocking Errors (HTTP 422):</h4>
                {data.preflight.errors.map((err, i) => (
                  <div key={i} className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start space-x-2">
                    <span className="font-mono font-bold">{err.code}:</span>
                    <span>{err.message}</span>
                  </div>
                ))}
              </div>
            )}

            {data.preflight?.warnings && data.preflight.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Capacity & Workload Warnings:</h4>
                {data.preflight.warnings.map((warn, i) => (
                  <div key={i} className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-start space-x-2">
                    <span className="font-mono font-bold">{warn.code}:</span>
                    <span>{warn.message}</span>
                  </div>
                ))}
              </div>
            )}

            {data.preflight?.isValid && (!data.preflight.warnings || data.preflight.warnings.length === 0) && (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                All sections, faculty qualifications (A4), period durations (H8/H9), and room requirements are fully validated with zero conflicts.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
