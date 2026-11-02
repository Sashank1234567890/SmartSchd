import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cpu, Play, CheckCircle, XCircle, Loader2, RefreshCw, Building } from 'lucide-react';

const API = 'http://localhost:3001';
const ALGORITHMS = [
  { value: 'combined', label: 'Combined / Hybrid (Graph + Backtracking)', desc: 'DSATUR graph conflict coloring + symmetry-breaking backtracking allotment (Recommended)' },
  { value: 'greedy', label: 'Greedy Heuristic', desc: 'Fast heuristic, distributes classes evenly across days' },
  { value: 'backtracking', label: 'Constraint Backtracking', desc: 'Forward checking constraint solver with symmetry breaking' },
  { value: 'graph-coloring', label: 'Graph Coloring', desc: 'DSATUR chromatic graph conflict scheduling' },
];

export default function GenerationLab() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('ALL'); // 'ALL' = Whole College
  const [algorithm, setAlgorithm] = useState('greedy');
  const [params, setParams] = useState({ nodeLimit: 100000, timeLimitMs: 25000 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/sections`).then(r => {
      const list = r.data.data || [];
      setSections(list);
    }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const sectionIds = selectedSection === 'ALL' ? [] : [selectedSection];
      const body = { sectionIds, params: algorithm === 'backtracking' ? params : {} };
      const res = await axios.post(`${API}/api/generate/${algorithm}`, body);
      setResult(res.data.data);
      setHistory(prev => [{ ...res.data.data, algorithm, targetName: selectedSection === 'ALL' ? 'Whole College' : sections.find(s => s._id === selectedSection)?.name, ts: new Date().toISOString() }, ...prev].slice(0, 10));
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const sectionNameMap = sections.reduce((acc, s) => { acc[s._id] = s.name; return acc; }, {});

  const groupedSections = React.useMemo(() => {
    const g = {};
    sections.forEach(s => {
      const dept = s.department || 'Other';
      if (!g[dept]) g[dept] = [];
      g[dept].push(s);
    });
    return g;
  }, [sections]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-sky-600 p-2.5 rounded-lg text-white shadow"><Cpu className="w-5 h-5" /></div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Generation Laboratory</h2>
          <p className="text-xs text-slate-500">Run scheduling algorithms for the entire college or specific branches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
              <Building className="w-4 h-4 text-sky-600" />
              <span>1. Target Scope</span>
            </h3>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
            >
              <option value="ALL">🏛 Whole College (All 25 Batches / 7 Branches)</option>
              {Object.entries(groupedSections).map(([dept, secs]) => (
                <optgroup key={dept} label={`── ${dept} ──`}>
                  {secs.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.studentCount} students)</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              {selectedSection === 'ALL'
                ? 'Schedules CSE-A, CSE-B, ECE-A, and ME-A simultaneously, handling shared professors and 2-hr labs/sports.'
                : 'Schedules only this specific branch/section.'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">2. Choose Algorithm</h3>
            {ALGORITHMS.map(a => (
              <label key={a.value} className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition ${algorithm === a.value ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name="algorithm" value={a.value} checked={algorithm === a.value}
                  onChange={() => setAlgorithm(a.value)} className="mt-0.5 accent-sky-600" />
                <div>
                  <div className="text-sm font-medium text-slate-800">{a.label}</div>
                  <div className="text-xs text-slate-500">{a.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {algorithm === 'backtracking' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Backtracking Parameters</h3>
              <label className="block text-xs text-slate-600">
                Node Limit
                <input type="number" value={params.nodeLimit}
                  onChange={e => setParams(p => ({ ...p, nodeLimit: +e.target.value }))}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </label>
              <label className="block text-xs text-slate-600">
                Time Limit (ms)
                <input type="number" value={params.timeLimitMs}
                  onChange={e => setParams(p => ({ ...p, timeLimitMs: +e.target.value }))}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </label>
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-xl transition shadow">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{loading ? 'Generating...' : selectedSection === 'ALL' ? 'Generate Whole College Timetable' : 'Generate Timetable'}</span>
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div><h4 className="text-sm font-semibold text-red-800">Generation Failed</h4><p className="text-xs text-red-600 mt-1">{error}</p></div>
            </div>
          )}

          {result && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Latest Generation Output</h3>
                  <p className="text-[11px] text-slate-500">{selectedSection === 'ALL' ? 'Whole College (All Sections)' : sectionNameMap[selectedSection]}</p>
                </div>
                <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  result.validation?.validationStatus === 'VALID_COMPLETE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {result.validation?.validationStatus === 'VALID_COMPLETE'
                    ? <><CheckCircle className="w-3.5 h-3.5" /><span>VALID_COMPLETE</span></>
                    : <><XCircle className="w-3.5 h-3.5" /><span>{result.validation?.validationStatus}</span></>}
                </span>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50">
                <Stat label="Algorithm" value={result.schedule?.algorithm} />
                <Stat label="Status" value={result.schedule?.searchStatus} />
                <Stat label="Total Scheduled" value={result.schedule?.assignments?.length} highlight />
                <Stat label="Unscheduled" value={result.schedule?.unscheduled?.length} warn={result.schedule?.unscheduled?.length > 0} />
                <Stat label="Compute Time" value={`${result.schedule?.metrics?.algorithmTimeMs?.toFixed(1)} ms`} />
                <Stat label="Total Sessions" value={result.schedule?.metrics?.totalSessions ?? '—'} />
                <Stat label="Search Nodes" value={result.schedule?.metrics?.searchNodes ?? '—'} />
                <Stat label="Colors Used" value={result.schedule?.metrics?.colorsUsed ?? '—'} />
              </div>

              {result.schedule?.assignments?.length > 0 && (
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-700">Scheduled Sessions Sample ({result.schedule.assignments.length} total)</h4>
                    <span className="text-[11px] text-slate-500">Includes 2-hr Labs, 2-hr Sports, and 1-hr Theory</span>
                  </div>
                  <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-slate-100 text-left text-slate-700 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 font-medium">Section</th>
                          <th className="px-3 py-2 font-medium">Session</th>
                          <th className="px-3 py-2 font-medium">Day</th>
                          <th className="px-3 py-2 font-medium">Period</th>
                          <th className="px-3 py-2 font-medium">Duration</th>
                          <th className="px-3 py-2 font-medium">Room</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.schedule.assignments.slice(0, 40).map((a, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 font-semibold text-slate-900">{sectionNameMap[a.sectionId] || a.sectionId?.slice(-6)}</td>
                            <td className="px-3 py-1.5 font-mono text-slate-600">{a.sessionId}</td>
                            <td className="px-3 py-1.5 font-medium">{['Mon','Tue','Wed','Thu','Fri','Sat'][a.day] || a.day}</td>
                            <td className="px-3 py-1.5">{a.startPeriod + 1}</td>
                            <td className="px-3 py-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${a.durationPeriods === 2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                                {a.durationPeriods === 2 ? '2 Hours' : '1 Hour'}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 font-mono text-sky-700">{a.roomId?.slice(-6)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.schedule?.unscheduled?.length > 0 && (
                <div className="px-5 pb-5">
                  <h4 className="text-xs font-semibold text-amber-700 mb-2">Unscheduled Sessions</h4>
                  {result.schedule.unscheduled.map((u, i) => (
                    <div key={i} className="bg-amber-50 text-xs text-amber-800 px-3 py-2 rounded-lg mb-1">
                      <span className="font-mono">{u.sessionId}</span> — {u.reasonCode}: {u.detail}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-slate-400" /><span>Run History (This Session)</span>
              </h3>
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2 mb-1.5">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-slate-800">{h.targetName || 'Whole College'}</span>
                    <span className="capitalize text-slate-600 font-medium">({h.algorithm})</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      h.validation?.validationStatus === 'VALID_COMPLETE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>{h.validation?.validationStatus}</span>
                  </div>
                  <span className="text-slate-500 font-mono">{h.schedule?.assignments?.length} scheduled · {h.schedule?.metrics?.algorithmTimeMs?.toFixed(0)}ms</span>
                </div>
              ))}
            </div>
          )}

          {!result && !error && !loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-600">Ready to Generate College Timetable</h3>
              <p className="text-xs text-slate-400 mt-1">Select Whole College or a specific branch, choose an algorithm, and click Generate.</p>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Loader2 className="w-10 h-10 text-sky-500 mx-auto mb-3 animate-spin" />
              <h3 className="text-sm font-semibold text-slate-700">Solving Timetable with {algorithm.toUpperCase()}...</h3>
              <p className="text-xs text-slate-400 mt-1">Enforcing hard constraints H1-H11, 2-hour labs, and day distribution across college.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight, warn }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      <div className={`text-base font-bold ${warn ? 'text-amber-600' : highlight ? 'text-sky-700' : 'text-slate-800'}`}>{value ?? '—'}</div>
    </div>
  );
}
