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
  X
} from 'lucide-react';

import SectionsTab from './SectionsTab';
import RoomsTab from './RoomsTab';
import TeachersTab from './TeachersTab';
import SubjectsTab from './SubjectsTab';

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
          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 border border-sky-300 text-xs font-semibold rounded-lg text-sky-800 bg-sky-50 hover:bg-sky-100 shadow-xs transition"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Import JSON File
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

      {/* Import JSON Dataset Modal */}
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
