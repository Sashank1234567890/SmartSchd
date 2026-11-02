import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  Sliders, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle 
} from 'lucide-react';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HARD_CONSTRAINTS = [
  { code: 'H1', name: 'Teacher Clash', desc: 'No teacher may be assigned to more than one session at any period.' },
  { code: 'H2', name: 'Section Clash', desc: 'No section may attend more than one session at any period.' },
  { code: 'H3', name: 'Room Clash', desc: 'No room may host more than one session at any period.' },
  { code: 'H4', name: 'Room Capacity', desc: 'Room capacity must be greater than or equal to section student count.' },
  { code: 'H5', name: 'Room Type Match', desc: 'Session room requirement (Classroom vs Laboratory) must strictly match room type.' },
  { code: 'H6', name: 'Availability', desc: 'Teacher and room must be marked available in their respective D×P matrices.' },
  { code: 'H7', name: 'Completeness', desc: 'Every required session must appear exactly once in assignments or unscheduled.' },
  { code: 'H8', name: 'Consecutive Multi-Period', desc: 'Multi-period sessions (e.g. 2-period labs) must occupy consecutive periods in the same room.' },
  { code: 'H9', name: 'No Break Overlap', desc: 'Sessions must never overlap or straddle configured short or lunch break periods.' },
  { code: 'H10', name: 'Teaching Periods Only', desc: 'Sessions may only be placed inside valid configured teaching period indices.' },
  { code: 'H11', name: 'Teacher Workload Cap', desc: 'Total assigned teaching periods for any teacher must not exceed maxWeeklyPeriods.' }
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [periods, setPeriods] = useState([]);
  const [dayTimings, setDayTimings] = useState([
    { day: 'Mon', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' },
    { day: 'Tue', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' },
    { day: 'Wed', start: '09:30', end: '15:30', maxPeriodIndex: 6, note: 'Early Wrap-Up (9:30 AM - 3:30 PM)' },
    { day: 'Thu', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' },
    { day: 'Fri', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' }
  ]);

  const [weights, setWeights] = useState({
    gaps: 1,
    workloadBalance: 1,
    consecutiveTeaching: 1,
    preferredSlots: 1,
    distribution: 1,
    earlyLate: 1
  });
  const [maxConsecutivePeriods, setMaxConsecutivePeriods] = useState(3);
  const [engineDefaults, setEngineDefaults] = useState({
    backtrackingTimeLimitMs: 10000,
    backtrackingNodeLimit: 5000000
  });

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/settings');
      const data = res.data.data;
      if (data) {
        setWorkingDays(data.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
        setPeriods(data.periods || []);
        if (data.dayTimings && Array.isArray(data.dayTimings) && data.dayTimings.length > 0) {
          setDayTimings(data.dayTimings);
        }
        if (data.constraintConfig?.weights) {
          setWeights(data.constraintConfig.weights);
        }
        if (data.constraintConfig?.maxConsecutivePeriods !== undefined) {
          setMaxConsecutivePeriods(data.constraintConfig.maxConsecutivePeriods);
        }
        if (data.engineDefaults) {
          setEngineDefaults(data.engineDefaults);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleDay = (day) => {
    if (workingDays.includes(day)) {
      if (workingDays.length <= 1) return; // Prevent 0 days
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      const nextDays = ALL_DAYS.filter(d => workingDays.includes(d) || d === day);
      setWorkingDays(nextDays);
    }
  };

  const updatePeriod = (index, field, value) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'isBreak' && !value) {
      updated[index].breakType = null;
    } else if (field === 'isBreak' && value && !updated[index].breakType) {
      updated[index].breakType = 'short';
    }
    setPeriods(updated);
  };

  const addPeriod = () => {
    const newIdx = periods.length;
    const newPeriod = {
      index: newIdx,
      label: `P${newIdx + 1}`,
      start: '16:00',
      end: '16:50',
      isBreak: false,
      breakType: null
    };
    setPeriods([...periods, newPeriod]);
  };

  const removePeriod = (idx) => {
    if (periods.length <= 1) return;
    const updated = periods.filter((_, i) => i !== idx).map((p, i) => ({ ...p, index: i }));
    setPeriods(updated);
  };

  const updateDayTiming = (dayName, field, value) => {
    setDayTimings(prev => {
      const exists = prev.find(d => d.day === dayName);
      if (exists) {
        return prev.map(d => d.day === dayName ? { ...d, [field]: value } : d);
      } else {
        return [...prev, { day: dayName, start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day', [field]: value }];
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = {
      workingDays,
      periods,
      dayTimings,
      constraintConfig: {
        weights,
        maxConsecutivePeriods: parseInt(maxConsecutivePeriods, 10) || 3
      },
      engineDefaults: {
        backtrackingTimeLimitMs: parseInt(engineDefaults.backtrackingTimeLimitMs, 10) || 10000,
        backtrackingNodeLimit: parseInt(engineDefaults.backtrackingNodeLimit, 10) || 5000000
      }
    };

    try {
      await axios.put('/api/settings', payload);
      setMessage('Calendar configuration and day-wise timings saved successfully!');
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setWorkingDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setDayTimings([
      { day: 'Mon', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' },
      { day: 'Tue', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' },
      { day: 'Wed', start: '09:30', end: '15:30', maxPeriodIndex: 6, note: 'Early Wrap-Up (9:30 AM - 3:30 PM)' },
      { day: 'Thu', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' },
      { day: 'Fri', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' }
    ]);
    setWeights({
      gaps: 1,
      workloadBalance: 1,
      consecutiveTeaching: 1,
      preferredSlots: 1,
      distribution: 1,
      earlyLate: 1
    });
    setMaxConsecutivePeriods(3);
    setEngineDefaults({
      backtrackingTimeLimitMs: 10000,
      backtrackingNodeLimit: 5000000
    });
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading calendar configuration...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar & Schedule Configuration</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure working days, college timing (09:30 - 17:30), Wednesday early wrap-up (15:30), breaks, and optimization weights.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Section 1: Working Days Selection */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">Working Days</h3>
        </div>
        <p className="text-xs text-slate-500">
          Select active teaching days of the week.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {ALL_DAYS.map((day) => {
            const isSelected = workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Day-Wise College Operating Hours */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">Day-Wise College Operating Hours</h3>
          </div>
          <span className="text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md font-semibold border border-sky-200">
            Wed Early Dismissal (3:30 PM) Active
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Configure start and end times per day. Standard college hours are 09:30 AM to 05:30 PM, with Wednesdays concluding early at 03:30 PM.
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold text-xs">
              <tr>
                <th className="px-3 py-2.5 text-left w-28">Day</th>
                <th className="px-3 py-2.5 text-left w-36">College Start</th>
                <th className="px-3 py-2.5 text-left w-36">College End</th>
                <th className="px-3 py-2.5 text-left w-36">Cutoff Period</th>
                <th className="px-3 py-2.5 text-left">Schedule Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {workingDays.map((day) => {
                const dt = dayTimings.find(d => d.day === day) || {
                  day,
                  start: '09:30',
                  end: day === 'Wed' ? '15:30' : '17:30',
                  maxPeriodIndex: day === 'Wed' ? 6 : 9,
                  note: day === 'Wed' ? 'Early Wrap-Up (9:30 AM - 3:30 PM)' : 'Full Day (9:30 AM - 5:30 PM)'
                };
                return (
                  <tr key={day} className={day === 'Wed' ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'}>
                    <td className="px-3 py-2.5 font-bold text-xs text-slate-900">
                      {day}
                      {day === 'Wed' && (
                        <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                          3:30 PM Wrap-up
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="time"
                        value={dt.start}
                        onChange={(e) => updateDayTiming(day, 'start', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="time"
                        value={dt.end}
                        onChange={(e) => updateDayTiming(day, 'end', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={dt.maxPeriodIndex ?? 9}
                        onChange={(e) => updateDayTiming(day, 'maxPeriodIndex', parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value={7}>P6 (Until 3:30 PM)</option>
                        <option value={8}>P7 (Until 4:35 PM)</option>
                        <option value={9}>P8 (Until 5:30 PM Full Day)</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        value={dt.note}
                        placeholder="e.g. Regular Day or Early Wrap-Up"
                        onChange={(e) => updateDayTiming(day, 'note', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Period Timetable Grid & Breaks */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">Period Slot Schedule & Breaks (09:30 – 17:30)</h3>
          </div>
          <button
            type="button"
            onClick={addPeriod}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Period
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Configure start/end times and break indicators for each period slot. Multi-period sessions never straddle break periods.
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold text-xs">
              <tr>
                <th className="px-3 py-2.5 text-center w-12">#</th>
                <th className="px-3 py-2.5 text-left w-36">Label</th>
                <th className="px-3 py-2.5 text-left w-32">Start Time</th>
                <th className="px-3 py-2.5 text-left w-32">End Time</th>
                <th className="px-3 py-2.5 text-center w-28">Is Break?</th>
                <th className="px-3 py-2.5 text-left w-36">Break Type</th>
                <th className="px-3 py-2.5 text-right w-16">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {periods.map((p, idx) => (
                <tr key={idx} className={p.isBreak ? 'bg-amber-50/40' : 'bg-white'}>
                  <td className="px-3 py-2 text-center text-xs font-mono text-slate-500">{idx}</td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={p.label}
                      onChange={(e) => updatePeriod(idx, 'label', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      value={p.start}
                      onChange={(e) => updatePeriod(idx, 'start', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      value={p.end}
                      onChange={(e) => updatePeriod(idx, 'end', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={p.isBreak}
                      onChange={(e) => updatePeriod(idx, 'isBreak', e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    {p.isBreak ? (
                      <select
                        value={p.breakType || 'short'}
                        onChange={(e) => updatePeriod(idx, 'breakType', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="short">Short Break</option>
                        <option value="lunch">Lunch Break</option>
                      </select>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Teaching</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      disabled={periods.length <= 1}
                      onClick={() => removePeriod(idx)}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Soft Constraint Penalties & Weights */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">Soft Constraint Weights (Optimization Penalties)</h3>
        </div>
        <p className="text-xs text-slate-500">
          Fine-tune the penalty coefficients applied to soft constraint deviations during scheduling.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {Object.entries(weights).map(([key, val]) => (
            <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-xs font-mono font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">{val}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={val}
                onChange={(e) => setWeights({ ...weights, [key]: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Hard Constraints Reference */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">Hard Constraints Catalog (H1 – H11)</h3>
        </div>
        <p className="text-xs text-slate-500">
          Non-negotiable constraints verified by the C++ engine validator binary on every generated schedule.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {HARD_CONSTRAINTS.map((hc) => (
            <div key={hc.code} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start space-x-2.5">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-white shrink-0">
                {hc.code}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{hc.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{hc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
