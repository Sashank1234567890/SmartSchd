import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Building, 
  GraduationCap, 
  BookOpen, 
  RefreshCw, 
  AlertCircle,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  X,
  Trash2,
  Sparkles,
  Database,
  Layers,
  Library,
  Check,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

import SectionsTab from './SectionsTab';
import RoomsTab from './RoomsTab';
import TeachersTab from './TeachersTab';
import SubjectsTab from './SubjectsTab';

const PRESET_LIST = [
  {
    id: 'preset_1_nit_delhi',
    title: 'NIT Comprehensive (Engineering & Tech)',
    category: 'Engineering & Technology',
    badge: '60 Sections • 61 Rooms • 328 Subjects',
    desc: 'Full national university dataset: 7 engineering branches (CSE, IT, AIDS, ECE, EE, ME, CE) with 4-year B.Tech, 2-year M.Tech, and 2-year Ph.D. Minimum 5 subjects per section with specialized hardware & software labs.',
    tagColor: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    id: 'preset_2_iit_tech',
    title: 'IIT Advanced Tech & Research',
    category: 'Deep Tech & Science',
    badge: '54 Sections • 54 Rooms • 270 Subjects',
    desc: 'Tier-1 Indian Institute of Technology dataset: High-Performance Computing, Robotics, VLSI Microelectronics, Aerospace, Quantum Systems, and Nano-materials with supercomputing clusters and cleanroom fab labs.',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    id: 'preset_3_delhi_university',
    title: 'Central Multidisciplinary University',
    category: 'Sciences & Humanities',
    badge: '49 Sections • 53 Rooms • 245 Subjects',
    desc: 'Multi-faculty Central University: Mathematical Sciences, Computer Applications, Physical Sciences, Chemical Sciences, Economics & Public Policy, Commerce, and Humanities with dedicated science and language labs.',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'preset_4_aiims_medical',
    title: 'AIIMS Medical & Healthcare Sciences',
    category: 'Medicine & Healthcare',
    badge: '40 Sections • 49 Rooms • 200 Subjects',
    desc: 'National Institute of Medical Sciences: MBBS (Phases 1-3), MD/MS Postgraduates, B.Sc Nursing, Medical Biotech, Anatomy Dissection halls, Histopathology labs, and hospital clinical case theatres.',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  {
    id: 'preset_5_nlu_law',
    title: 'National Law University (Legal Studies)',
    category: 'Law & Public Policy',
    badge: '32 Sections • 45 Rooms • 160 Subjects',
    desc: 'Premier National Law University: B.A. LL.B (5-year integrated), B.B.A. LL.B, Constitutional Law, Corporate & Commercial Law, Criminal Justice, Cyber Law, and Moot Courtrooms.',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    id: 'preset_6_nid_architecture',
    title: 'Institute of Design & Architecture',
    category: 'Architecture & Design',
    badge: '35 Sections • 46 Rooms • 175 Subjects',
    desc: 'Premier Institute of Architecture & Design: B.Arch (5-year studio), Industrial & Product Design, Visual Communication, UI/UX Interaction, and Textile Innovation with drafting halls & 3D CNC fab labs.',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'preset_7_iim_management',
    title: 'Indian Institute of Management',
    category: 'Management & Business',
    badge: '33 Sections • 44 Rooms • 165 Subjects',
    desc: 'Top-tier IIM Business School: MBA/PGP Core, Quantitative Finance, Marketing Analytics, Global Logistics, Strategic Management, and FinTech with tiered case amphitheaters and Bloomberg financial labs.',
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200'
  }
];

const SAMPLE_IMPORT_JSON = JSON.stringify({
  sections: [
    { name: "CS-A", department: "Computer Science", studentCount: 60 },
    { name: "CS-B", department: "Computer Science", studentCount: 55 }
  ],
  rooms: [
    { name: "Main Hall 1", roomNumber: "LH-101", type: "Classroom", capacity: 70 },
    { name: "Hardware Lab", roomNumber: "LAB-1", type: "Laboratory", capacity: 60 }
  ],
  teachers: [
    { name: "Dr. Ramesh Rao", teacherCode: "T01", teachableSubjectCodes: ["CS201", "CS202"], maxWeeklyPeriods: 18 },
    { name: "Prof. Sunita Sharma", teacherCode: "T02", teachableSubjectCodes: ["CS203", "CS204"], maxWeeklyPeriods: 16 }
  ],
  subjects: [
    { name: "Data Structures", code: "CS201", type: "Theory", sectionName: "CS-A", teacherCode: "T01", weeklySessions: 3, durationPeriods: 1 },
    { name: "Data Structures Lab", code: "CS202", type: "Lab", sectionName: "CS-A", teacherCode: "T01", weeklySessions: 1, durationPeriods: 2 },
    { name: "Discrete Math", code: "CS203", type: "Theory", sectionName: "CS-B", teacherCode: "T02", weeklySessions: 3, durationPeriods: 1 }
  ]
}, null, 2);

export default function DataManagement() {
  const [activeTab, setActiveTab] = useState('sections');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sections, setSections] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState(null);

  // Preset Modal state
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [loadingPresetId, setLoadingPresetId] = useState(null);
  const [cleanBeforeLoad, setCleanBeforeLoad] = useState(true);
  const [presetFeedback, setPresetFeedback] = useState(null);

  // Clear Data Modal state
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearTarget, setClearTarget] = useState('timetables'); // 'timetables' | 'college' | 'all'
  const [clearing, setClearing] = useState(false);
  const [clearFeedback, setClearFeedback] = useState(null);

  // Import Modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState(SAMPLE_IMPORT_JSON);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [secRes, roomRes, teachRes, subRes, setRes] = await Promise.all([
        axios.get('/api/sections'),
        axios.get('/api/rooms'),
        axios.get('/api/teachers'),
        axios.get('/api/subjects'),
        axios.get('/api/settings')
      ]);

      setSections(secRes.data.data || []);
      setRooms(roomRes.data.data || []);
      setTeachers(teachRes.data.data || []);
      setSubjects(subRes.data.data || []);
      setSettings(setRes.data.data || null);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load scheduling data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoadPreset = async (presetId) => {
    setLoadingPresetId(presetId);
    setPresetFeedback(null);
    try {
      const res = await axios.post(`/api/dev/preset/${presetId}?clean=${cleanBeforeLoad}`);
      setPresetFeedback({
        success: true,
        message: `Successfully loaded '${res.data.data.title || presetId}'!`,
        details: res.data.data
      });
      await fetchData();
    } catch (err) {
      setPresetFeedback({
        success: false,
        message: err.response?.data?.error?.message || err.message || 'Failed to load preset'
      });
    } finally {
      setLoadingPresetId(null);
    }
  };

  const handleExecuteClear = async () => {
    setClearing(true);
    setClearFeedback(null);
    try {
      let endpoint = '/api/dev/timetables';
      if (clearTarget === 'college') endpoint = '/api/dev/college-data';
      if (clearTarget === 'all') endpoint = '/api/dev/all';

      const res = await axios.delete(endpoint);
      setClearFeedback({
        success: true,
        message: res.data.data?.message || 'Data cleared successfully!'
      });
      await fetchData();
    } catch (err) {
      setClearFeedback({
        success: false,
        message: err.response?.data?.error?.message || err.message || 'Failed to clear data'
      });
    } finally {
      setClearing(false);
    }
  };

  const handleExportJson = async () => {
    try {
      const res = await axios.get('/api/dev/export-json');
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smartsched-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export data: ' + err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportJsonText(event.target?.result || '');
    };
    reader.readAsText(file);
  };

  const executeImport = async () => {
    setImporting(true);
    setImportError(null);
    setImportResult(null);

    let parsed;
    try {
      parsed = JSON.parse(importJsonText);
    } catch (parseErr) {
      setImportError('Invalid JSON format: ' + parseErr.message);
      setImporting(false);
      return;
    }

    try {
      const res = await axios.post('/api/dev/import-json', parsed);
      setImportResult(res.data.data);
      await fetchData();
    } catch (err) {
      setImportError(err.response?.data?.error?.message || err.message);
    } finally {
      setImporting(false);
    }
  };

  const tabs = [
    { id: 'sections', label: 'Sections', count: sections.length, icon: Users },
    { id: 'rooms', label: 'Rooms & Labs', count: rooms.length, icon: Building },
    { id: 'teachers', label: 'Faculty', count: teachers.length, icon: GraduationCap },
    { id: 'subjects', label: 'Course Offerings', count: subjects.length, icon: BookOpen }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Data Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage student sections, rooms, faculty availability matrices, and course sessions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Load Presets Button */}
          <button
            onClick={() => {
              setPresetFeedback(null);
              setPresetModalOpen(true);
            }}
            className="inline-flex items-center px-3 py-1.5 border border-purple-300 text-xs font-semibold rounded-lg text-purple-900 bg-purple-50 hover:bg-purple-100 shadow-xs transition group"
            title="Load 1 of 7 comprehensive dummy university datasets"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-600 group-hover:scale-110 transition-transform" />
            Load Preset Data (7 Types)
          </button>

          {/* Clear Old Data Button */}
          <button
            onClick={() => {
              setClearFeedback(null);
              setClearModalOpen(true);
            }}
            className="inline-flex items-center px-3 py-1.5 border border-rose-300 text-xs font-semibold rounded-lg text-rose-800 bg-rose-50 hover:bg-rose-100 shadow-xs transition"
            title="Delete old generated timetables or clear database"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
            Clear Data
          </button>

          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 border border-sky-300 text-xs font-semibold rounded-lg text-sky-800 bg-sky-50 hover:bg-sky-100 shadow-xs transition"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Import JSON
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export JSON
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
          <div>
            <h4 className="font-semibold">Failed to fetch data</h4>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto pb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  isActive
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="py-12 flex justify-center items-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading data...</span>
        </div>
      ) : (
        <div>
          {activeTab === 'sections' && (
            <SectionsTab sections={sections} onRefresh={fetchData} />
          )}
          {activeTab === 'rooms' && (
            <RoomsTab rooms={rooms} settings={settings} onRefresh={fetchData} />
          )}
          {activeTab === 'teachers' && (
            <TeachersTab teachers={teachers} settings={settings} onRefresh={fetchData} />
          )}
          {activeTab === 'subjects' && (
            <SubjectsTab subjects={subjects} sections={sections} teachers={teachers} onRefresh={fetchData} />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PRESET DATASETS MODAL (7 Realistic Archetypes) */}
      {/* ========================================================================= */}
      {presetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 my-8 space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">7 University Dummy Datasets</h3>
                  <p className="text-xs text-slate-500">
                    Select any institutional archetype with realistic departments, courses, faculty, and room configurations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPresetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clean option switch */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-800">Clean Previous College Data:</span>
                <span className="text-slate-500">
                  {cleanBeforeLoad ? 'Wipes existing sections/rooms before loading (recommended)' : 'Appends/merges into current database'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleanBeforeLoad}
                  onChange={(e) => setCleanBeforeLoad(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Feedback alert */}
            {presetFeedback && (
              <div className={`p-3.5 rounded-xl text-xs flex items-start space-x-2.5 ${
                presetFeedback.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}>
                {presetFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="font-bold">{presetFeedback.message}</div>
                  {presetFeedback.details && (
                    <div className="mt-1 text-[11px] text-emerald-800 flex items-center space-x-3">
                      <span>• Sections: {presetFeedback.details.sectionsImported}</span>
                      <span>• Rooms: {presetFeedback.details.roomsImported}</span>
                      <span>• Faculty: {presetFeedback.details.teachersImported}</span>
                      <span>• Courses: {presetFeedback.details.subjectsImported}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7 Preset Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {PRESET_LIST.map((preset) => {
                const isCurrentLoading = loadingPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${preset.tagColor}`}>
                          {preset.category}
                        </span>
                        <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {preset.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition">
                        {preset.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Min. 5 subjects / section
                      </span>
                      <button
                        onClick={() => handleLoadPreset(preset.id)}
                        disabled={loadingPresetId !== null}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg shadow-xs transition disabled:opacity-50"
                      >
                        {isCurrentLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <span>Load Preset</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPresetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CLEAR OLD DATA MODAL */}
      {/* ========================================================================= */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Clear Data & Reset</h3>
                  <p className="text-xs text-slate-500">
                    Delete old generated schedules or reset the database.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClearModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clear Target Selection Options */}
            <div className="space-y-2.5">
              <label
                onClick={() => setClearTarget('timetables')}
                className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${
                  clearTarget === 'timetables'
                    ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="clearOption"
                  checked={clearTarget === 'timetables'}
                  onChange={() => setClearTarget('timetables')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div className="ml-3">
                  <div className="text-xs font-bold text-slate-900">
                    Clear Generated Timetables Only (Recommended)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Deletes all previously generated timetables and algorithm comparison benchmark runs. Keeps your sections, rooms, teachers, and subjects intact.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setClearTarget('college')}
                className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${
                  clearTarget === 'college'
                    ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="clearOption"
                  checked={clearTarget === 'college'}
                  onChange={() => setClearTarget('college')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div className="ml-3">
                  <div className="text-xs font-bold text-slate-900">
                    Clear College Academic Data
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Wipes all sections, rooms, faculty, and subjects. Use this when you want to load a completely new university preset.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setClearTarget('all')}
                className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${
                  clearTarget === 'all'
                    ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="clearOption"
                  checked={clearTarget === 'all'}
                  onChange={() => setClearTarget('all')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div className="ml-3">
                  <div className="text-xs font-bold text-rose-950 flex items-center space-x-1.5">
                    <span>Factory Reset Everything</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="text-[11px] text-rose-700/80 mt-0.5 leading-relaxed">
                    Completely resets the database: clears all academic records and all generated timetables.
                  </div>
                </div>
              </label>
            </div>

            {/* Clear Result Feedback */}
            {clearFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                clearFeedback.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {clearFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{clearFeedback.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteClear}
                disabled={clearing}
                className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs transition disabled:opacity-50"
              >
                {clearing && <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {clearing ? 'Clearing Data...' : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. IMPORT JSON DATASET MODAL */}
      {/* ========================================================================= */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-bold text-slate-900">Import Complete JSON Dataset</h3>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Upload a <code>.json</code> file or paste a JSON object containing <code>sections</code>, <code>rooms</code>, <code>teachers</code>, and <code>subjects</code>. Entities will be created or updated directly in the system database.
            </p>

            {/* File Upload Option */}
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Select .json file from disk
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setImportJsonText(SAMPLE_IMPORT_JSON)}
                className="text-xs text-sky-600 hover:text-sky-800 underline"
              >
                Load Sample Template
              </button>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                rows={12}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 text-slate-800"
                placeholder="Paste JSON here..."
              />
            </div>

            {/* Results feedback */}
            {importResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs space-y-1">
                <div className="flex items-center font-bold space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Import Completed Successfully!</span>
                </div>
                <p>
                  &bull; Sections: {importResult.sectionsImported} | Rooms: {importResult.roomsImported} | Faculty: {importResult.teachersImported} | Courses: {importResult.subjectsImported}
                </p>
                {importResult.warnings && importResult.warnings.length > 0 && (
                  <p className="text-amber-700 mt-1">Warnings: {importResult.warnings.join(' ')}</p>
                )}
              </div>
            )}

            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                {importError}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={executeImport}
                disabled={importing || !importJsonText.trim()}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {importing && <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {importing ? 'Importing Data...' : 'Import to Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
