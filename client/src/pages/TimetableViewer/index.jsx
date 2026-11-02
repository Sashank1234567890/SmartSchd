import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Table2, Download, FileText, Loader2, RefreshCw, Eye, Building, User, DoorOpen, 
  ArrowLeftRight, CheckCircle2, AlertTriangle, Undo2, History, Clock, Files, Printer
} from 'lucide-react';
import { API } from '../../config/api';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ALGS = [
  { value: 'combined', label: 'Combined (Graph + Backtracking)' },
  { value: 'greedy', label: 'Greedy' },
  { value: 'backtracking', label: 'Backtracking' },
  { value: 'graph-coloring', label: 'Graph Coloring' },
];

const WED_PERIOD_TIMES = [
  '09:30 – 10:15',
  '10:15 – 11:00',
  '11:00 – 11:45',
  '11:45 – 12:30',
  '13:15 – 14:00',
  '14:00 – 14:45',
  '3:30 PM Dismissal',
  '3:30 PM Dismissal',
  '3:30 PM Dismissal'
];

export default function TimetableViewer() {
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [targetScope, setTargetScope] = useState('ALL'); // 'ALL' = Whole College
  const [algorithm, setAlgorithm] = useState('greedy');

  // Filter views for display:
  const [viewMode, setViewMode] = useState('section'); // 'section' | 'teacher' | 'room'
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const [loading, setLoading] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [originalAssignments, setOriginalAssignments] = useState(null);
  const [error, setError] = useState(null);
  const [numDays, setNumDays] = useState(5);
  const [periodLabels, setPeriodLabels] = useState([]);
  const [dayTimings, setDayTimings] = useState([]);

  // Saved runs history
  const [savedRuns, setSavedRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState('');

  // Interactive Swap & Live Validation states
  const [selectedSlot, setSelectedSlot] = useState(null); // { period, day, assignment }
  const [swapAlert, setSwapAlert] = useState(null); // { type: 'success' | 'error' | 'info', message }
  const [validatingSwap, setValidatingSwap] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/sections`),
      axios.get(`${API}/api/teachers`),
      axios.get(`${API}/api/subjects`),
      axios.get(`${API}/api/rooms`),
      axios.get(`${API}/api/settings`),
      axios.get(`${API}/api/timetables/runs`)
    ]).then(([secR, teaR, subR, rmR, setR, runR]) => {
      const secs = secR.data.data || [];
      const teas = teaR.data.data || [];
      const rms = rmR.data.data || [];
      const runs = runR.data.data || [];

      setSections(secs);
      setTeachers(teas);
      setSubjects(subR.data.data || []);
      setRooms(rms);
      setSavedRuns(runs);

      if (secs.length > 0) setSelectedBranchId(secs[0]._id);
      if (teas.length > 0) setSelectedTeacherId(teas[0]._id);
      if (rms.length > 0) setSelectedRoomId(rms[0]._id);

      const s = setR.data.data;
      if (s?.workingDays) setNumDays(s.workingDays.length);
      if (s?.dayTimings) setDayTimings(s.dayTimings);
      if (s?.periods) {
        setPeriodLabels(s.periods.map((p, i) => ({
          label: p.label || `Period ${i + 1}`,
          start: p.start || '',
          end: p.end || '',
          timeRange: p.start && p.end ? `${p.start} – ${p.end}` : '',
          isBreak: !!p.isBreak,
          breakType: p.breakType
        })));
      }

      // If there are existing runs with assignments, load the most recent one automatically!
      const validRuns = runs.filter(r => r.assignments && r.assignments.length > 0);
      if (validRuns.length > 0) {
        const latest = validRuns[0];
        setSelectedRunId(latest._id);
        setSchedule({
          schedule: { assignments: latest.assignments, unscheduled: latest.unscheduled || [] },
          validation: { validationStatus: latest.validationStatus }
        });
        setOriginalAssignments(JSON.parse(JSON.stringify(latest.assignments)));
      }
    }).catch(() => {});
  }, []);

  const handleLoadSavedRun = (runId) => {
    setSelectedRunId(runId);
    setSelectedSlot(null);
    setSwapAlert(null);
    const run = savedRuns.find(r => r._id === runId);
    if (run && run.assignments) {
      setSchedule({
        schedule: { assignments: run.assignments, unscheduled: run.unscheduled || [] },
        validation: { validationStatus: run.validationStatus }
      });
      setOriginalAssignments(JSON.parse(JSON.stringify(run.assignments)));
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSelectedSlot(null);
    setSwapAlert(null);
    try {
      const sectionIds = targetScope === 'ALL' ? [] : [targetScope];
      const res = await axios.post(`${API}/api/generate/${algorithm}`, {
        sectionIds,
        params: { timeLimitMs: 25000 }
      });
      setSchedule(res.data.data);
      setOriginalAssignments(JSON.parse(JSON.stringify(res.data.data.schedule?.assignments || [])));

      // Refresh runs list
      const runR = await axios.get(`${API}/api/timetables/runs`);
      setSavedRuns(runR.data.data || []);
      if (res.data.data.algorithmRunId) {
        setSelectedRunId(res.data.data.algorithmRunId);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lookup maps
  const subjectMap = useMemo(() => {
    const m = {};
    subjects.forEach(s => { m[s._id] = s; });
    return m;
  }, [subjects]);

  const teacherMap = useMemo(() => {
    const m = {};
    teachers.forEach(t => { m[t._id] = t; });
    return m;
  }, [teachers]);

  const roomMap = useMemo(() => {
    const m = {};
    rooms.forEach(r => { m[r._id] = r; });
    return m;
  }, [rooms]);

  const sectionMap = useMemo(() => {
    const m = {};
    sections.forEach(s => { m[s._id] = s; });
    return m;
  }, [sections]);

  const dayTimingMap = useMemo(() => {
    const m = {};
    dayTimings.forEach(d => { m[d.day] = d; });
    return m;
  }, [dayTimings]);

  // Group sections by department for structured navigation
  const groupedSections = useMemo(() => {
    const g = {};
    sections.forEach(s => {
      const dept = s.department || 'Other';
      if (!g[dept]) g[dept] = [];
      g[dept].push(s);
    });
    return g;
  }, [sections]);

  // Current view title / context
  const currentViewTitle = useMemo(() => {
    if (viewMode === 'section') {
      const sec = sectionMap[selectedBranchId];
      return sec ? `${sec.name} (${sec.department})` : 'Branch Timetable';
    }
    if (viewMode === 'teacher') {
      const tea = teacherMap[selectedTeacherId];
      return tea ? `${tea.name} (${tea.teacherCode}) - Teaching Schedule` : 'Teacher Timetable';
    }
    if (viewMode === 'room') {
      const rm = roomMap[selectedRoomId];
      return rm ? `${rm.name} (${rm.roomNumber || rm.type}) - Room Schedule` : 'Room Timetable';
    }
    return 'Timetable';
  }, [viewMode, selectedBranchId, selectedTeacherId, selectedRoomId, sectionMap, teacherMap, roomMap]);

  // Determine lunch shift for currently viewed section
  const isShift1 = useMemo(() => {
    if (viewMode !== 'section' || !selectedBranchId) return null;
    const sec = sectionMap[selectedBranchId];
    if (!sec) return null;
    const name = sec.name || '';
    const dept = sec.department || '';
    return name.includes('CSE') || name.includes('CS') || name.includes('IT') || name.includes('AIDS') || dept.includes('Computer') || dept.includes('Information');
  }, [viewMode, selectedBranchId, sectionMap]);

  const sectionLunchPeriod = isShift1 === null ? null : (isShift1 ? 3 : 4);

  // Filter assignments based on view
  const filteredAssignments = useMemo(() => {
    if (!schedule?.schedule?.assignments) return [];
    const assgn = schedule.schedule.assignments;
    if (viewMode === 'section') {
      return selectedBranchId ? assgn.filter(a => a.sectionId === selectedBranchId) : assgn;
    }
    if (viewMode === 'teacher') {
      return selectedTeacherId ? assgn.filter(a => a.teacherId === selectedTeacherId) : assgn;
    }
    if (viewMode === 'room') {
      return selectedRoomId ? assgn.filter(a => a.roomId === selectedRoomId) : assgn;
    }
    return assgn;
  }, [schedule, viewMode, selectedBranchId, selectedTeacherId, selectedRoomId]);

  // Build grid: grid[period][day] = cell object
  const maxPeriods = periodLabels.length || 9;
  const grid = useMemo(() => {
    const g = Array.from({ length: maxPeriods }, () => Array.from({ length: numDays }, () => null));

    filteredAssignments.forEach(a => {
      const startP = a.startPeriod !== undefined ? a.startPeriod : a.period;
      for (let off = 0; off < a.durationPeriods; off++) {
        const p = startP + off;
        const d = a.day;
        if (p < maxPeriods && d < numDays) {
          const sub = subjectMap[a.subjectId];
          const tea = teacherMap[a.teacherId];
          const rm = roomMap[a.roomId];
          const sec = sectionMap[a.sectionId];

          const isSports = sub?.code === 'SPORTS';
          const isLab = (sub?.type === 'Lab' || a.durationPeriods === 2) && !isSports;

          g[p][d] = {
            rawAssignment: a,
            code: sub?.code || a.subjectId?.slice(-6),
            name: sub?.name || 'Subject',
            type: isSports ? 'Sports' : isLab ? 'Lab' : 'Theory',
            teacher: tea?.name || a.teacherId?.slice(-6),
            room: rm?.name || a.roomId?.slice(-6),
            section: sec?.name || 'Section',
            isFirst: off === 0,
            duration: a.durationPeriods,
            periodOffset: off,
            startPeriod: startP,
            day: d
          };
        }
      }
    });

    return g;
  }, [filteredAssignments, maxPeriods, numDays, subjectMap, teacherMap, roomMap, sectionMap]);

  // Interactive Slot Click Handler: Select & Swap with Live C++ Validator
  const handleCellClick = async (pi, di, cell, isAfterCutoff) => {
    if (isAfterCutoff) return; // Blocked cutoff periods (e.g. Wednesday after 3:30 PM)
    const isBreak = periodLabels[pi]?.isBreak;
    if (isBreak) return;

    // Case 1: Nothing selected yet
    if (!selectedSlot) {
      if (cell) {
        setSelectedSlot({
          period: pi,
          day: di,
          assignment: cell.rawAssignment,
          cellInfo: cell
        });
        setSwapAlert({
          type: 'info',
          message: `Selected [${cell.code} - ${cell.name}]. Now click target slot to move or swap.`
        });
      }
      return;
    }

    // Case 2: Clicked the same slot -> unselect
    if (selectedSlot.period === pi && selectedSlot.day === di) {
      setSelectedSlot(null);
      setSwapAlert(null);
      return;
    }

    // Case 3: Clicked a different slot -> Execute Swap & Run Live Validator
    setValidatingSwap(true);
    setSwapAlert({ type: 'info', message: 'Validating move against H1-H11 hard constraints...' });

    try {
      const currentAssignments = [...(schedule?.schedule?.assignments || [])];
      const sourceAssignment = selectedSlot.assignment;
      const targetCell = cell;

      const newAssignments = currentAssignments.map(a => {
        if (a === sourceAssignment || (a.sectionId === sourceAssignment.sectionId && a.subjectId === sourceAssignment.subjectId && a.day === sourceAssignment.day && (a.startPeriod === sourceAssignment.startPeriod || a.period === sourceAssignment.period))) {
          return {
            ...a,
            day: di,
            startPeriod: pi,
            period: pi
          };
        }
        if (targetCell?.rawAssignment && (a === targetCell.rawAssignment || (a.sectionId === targetCell.rawAssignment.sectionId && a.subjectId === targetCell.rawAssignment.subjectId && a.day === targetCell.rawAssignment.day && (a.startPeriod === targetCell.rawAssignment.startPeriod || a.period === targetCell.rawAssignment.period)))) {
          return {
            ...a,
            day: selectedSlot.day,
            startPeriod: selectedSlot.period,
            period: selectedSlot.period
          };
        }
        return a;
      });

      // Call independent C++ validator
      const valRes = await axios.post(`${API}/api/validate/schedule`, {
        assignments: newAssignments,
        unscheduled: schedule?.schedule?.unscheduled || []
      });

      const valData = valRes.data.data;
      if (valData.validationStatus === 'VALID_COMPLETE' || valData.validationStatus === 'VALID_PARTIAL' || valData.violations?.length === 0) {
        setSchedule(prev => ({
          ...prev,
          schedule: {
            ...prev.schedule,
            assignments: newAssignments
          },
          validation: valData
        }));
        setSelectedSlot(null);
        setSwapAlert({
          type: 'success',
          message: `✓ Move successful! H1-H11 constraints verified with 0 hard collisions.`
        });
      } else {
        const firstViol = valData.violations[0];
        setSwapAlert({
          type: 'error',
          message: `⚠ Conflict (${firstViol.rule}): ${firstViol.message}. Move rejected.`
        });
      }
    } catch (err) {
      setSwapAlert({
        type: 'error',
        message: `Validation failed: ${err.response?.data?.error?.message || err.message}`
      });
    } finally {
      setValidatingSwap(false);
    }
  };

  const handleRevert = () => {
    if (originalAssignments) {
      setSchedule(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          assignments: JSON.parse(JSON.stringify(originalAssignments))
        }
      }));
      setSelectedSlot(null);
      setSwapAlert({ type: 'info', message: 'Reverted schedule back to original state.' });
    }
  };

  // CSV Export with exact Period Times
  const exportCSV = () => {
    const dayHeaders = DAYS.slice(0, numDays).map(d => {
      const dt = dayTimingMap[d];
      if (d === 'Wed') {
        return 'Wed (09:30-15:30 [45m Classes])';
      }
      return dt ? `${d} (${dt.start}-${dt.end})` : d;
    });
    const rows = [['Period & Time (Standard vs Wed)', ...dayHeaders]];
    grid.forEach((row, pi) => {
      const isBreak = periodLabels[pi]?.isBreak;
      const label = periodLabels[pi]?.label || `Period ${pi + 1}`;
      const timeStr = periodLabels[pi]?.timeRange ? ` [Standard: ${periodLabels[pi].timeRange}]` : '';
      const wedTimeStr = WED_PERIOD_TIMES[pi] ? ` [Wed: ${WED_PERIOD_TIMES[pi]}]` : '';
      const rowLabel = `${label}${timeStr}${wedTimeStr}`;

      if (isBreak) {
        rows.push([rowLabel, ...dayHeaders.map(() => '(Break)')]);
      } else {
        rows.push([rowLabel, ...row.map((cell, di) => {
          const dName = DAYS[di];
          const dt = dayTimingMap[dName];
          const isWedCutoff = dName === 'Wed' && pi >= 6;
          if (isWedCutoff || (dt && dt.maxPeriodIndex !== undefined && pi >= dt.maxPeriodIndex)) {
            return '(Early Wrap-up 3:30 PM)';
          }
          if (viewMode === 'section' && sectionLunchPeriod !== null && pi === sectionLunchPeriod) {
            return isShift1 ? '(Shift 1 Lunch 12:30-13:15)' : '(Shift 2 Lunch 13:15-14:00)';
          }
          if (!cell) return '';
          if (!cell.isFirst) return `(Continued: ${cell.code})`;
          const durBadge = cell.duration === 2 ? (dName === 'Wed' ? ' [1.5h Lab]' : ' [2h Lab/Sports]') : '';
          return `${cell.code}${durBadge} - ${cell.name} [${cell.section}] (${cell.teacher}, ${cell.room})`;
        })]);
      }
    });
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Timetable_${currentViewTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${algorithm}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF Export for CURRENT view
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    
    // Header Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`SmartSched: ${currentViewTitle}`, 14, 9);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Algorithm: ${algorithm.toUpperCase()} | Timings: Mon-Fri 09:30 - 17:30 (Wed 09:30 - 15:30 Early Dismissal) | Total: ${schedule?.schedule?.assignments?.length || 0} Sessions`, 14, 16);

    const dayHeaders = DAYS.slice(0, numDays).map(d => {
      const dt = dayTimingMap[d];
      if (d === 'Wed') {
        return 'Wed (45m classes)\n09:30 - 15:30\n(3:30 Dismissal)';
      }
      return dt ? `${d}\n(${dt.start} - ${dt.end})` : d;
    });
    const head = [['Period / Times', ...dayHeaders]];
    const body = grid.map((row, pi) => {
      const isBreak = periodLabels[pi]?.isBreak;
      const label = periodLabels[pi]?.label || `Period ${pi + 1}`;
      const timeStr = periodLabels[pi]?.timeRange ? `\nStd: ${periodLabels[pi].timeRange}` : '';
      const wedTimeStr = WED_PERIOD_TIMES[pi] ? `\nWed: ${WED_PERIOD_TIMES[pi]}` : '';
      const firstCol = `${label}${timeStr}${wedTimeStr}`;

      if (isBreak) {
        return [firstCol, ...dayHeaders.map(() => '(Break)')];
      }
      return [firstCol, ...row.map((cell, di) => {
        const dName = DAYS[di];
        const dt = dayTimingMap[dName];
        const isWedCutoff = dName === 'Wed' && pi >= 6;
        if (isWedCutoff || (dt && dt.maxPeriodIndex !== undefined && pi >= dt.maxPeriodIndex)) {
          return '🕒 Early Wrap-Up\n(3:30 PM)';
        }
        if (viewMode === 'section' && sectionLunchPeriod !== null && pi === sectionLunchPeriod) {
          return isShift1 ? 'Shift 1 Lunch\n(12:30 - 1:15 PM)' : 'Shift 2 Lunch\n(1:15 - 2:00 PM)';
        }
        if (!cell) return '—';
        if (!cell.isFirst) return `↳ ${cell.code} (cont.)`;
        const durLabel = cell.duration === 2 ? (dName === 'Wed' ? ' [1.5h]' : ' [2h]') : '';
        return `${cell.code}${durLabel}\n${cell.name}\n${cell.teacher}\n${cell.room}`;
      })];
    });

    autoTable(doc, {
      head,
      body,
      startY: 24,
      styles: { fontSize: 7.5, cellPadding: 2.5, halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { fontStyle: 'bold', halign: 'left', fillColor: [248, 250, 252], cellWidth: 32 } },
      didParseCell: (data) => {
        if (data.row.index >= 0 && data.section === 'body') {
          const raw = data.cell.raw;
          if (raw && typeof raw === 'string') {
            if (raw.includes('Lab') || raw.includes('L-G') || raw.includes('(2h)')) {
              data.cell.styles.fillColor = [254, 243, 199];
              data.cell.styles.textColor = [146, 64, 14];
            } else if (raw.includes('SPORTS') || raw.includes('Sports')) {
              data.cell.styles.fillColor = [209, 250, 229];
              data.cell.styles.textColor = [6, 95, 70];
            } else if (raw.includes('Lunch')) {
              data.cell.styles.fillColor = [241, 245, 249];
            } else if (raw.includes('Early Wrap-Up')) {
              data.cell.styles.fillColor = [248, 250, 252];
              data.cell.styles.textColor = [148, 163, 184];
            } else if (raw !== '—') {
              data.cell.styles.fillColor = [240, 249, 255];
              data.cell.styles.textColor = [3, 105, 161];
            }
          }
        }
      }
    });

    doc.save(`Timetable_${currentViewTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${algorithm}.pdf`);
  };

  // EXPORT ALL BATCHES PDF AS ONCE (Multi-Page Master College Timetable)
  const exportAllBatchesPDF = async () => {
    if (!schedule?.schedule?.assignments || sections.length === 0) return;
    setExportingAll(true);

    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      const allAssignments = schedule.schedule.assignments;

      sections.forEach((sec, sIdx) => {
        if (sIdx > 0) doc.addPage();

        // 1. Header Banner
        doc.setFillColor(15, 23, 42); // Slate 900
        doc.rect(0, 0, 297, 22, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('NATIONAL INSTITUTE OF TECHNOLOGY DELHI', 14, 9);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`Department: ${sec.department}   |   Batch: ${sec.name} (${sec.studentCount} Students)   |   Algorithm: ${algorithm.toUpperCase()}`, 14, 16);
        doc.text(`College Hours: Mon-Fri 09:30–17:30 (Wed 09:30–15:30 Early Dismissal)`, 175, 16);

        // 2. Build grid for this batch
        const secAssignments = allAssignments.filter(a => a.sectionId === sec._id);
        const secGrid = Array.from({ length: maxPeriods }, () => Array.from({ length: numDays }, () => null));

        secAssignments.forEach(a => {
          const startP = a.startPeriod !== undefined ? a.startPeriod : a.period;
          for (let off = 0; off < a.durationPeriods; off++) {
            const p = startP + off;
            const d = a.day;
            if (p < maxPeriods && d < numDays) {
              const sub = subjectMap[a.subjectId];
              const tea = teacherMap[a.teacherId];
              const rm = roomMap[a.roomId];
              const isSports = sub?.code === 'SPORTS';
              const isLab = (sub?.type === 'Lab' || a.durationPeriods === 2) && !isSports;

              secGrid[p][d] = {
                code: sub?.code || a.subjectId?.slice(-6),
                name: sub?.name || 'Subject',
                type: isSports ? 'Sports' : isLab ? 'Lab' : 'Theory',
                teacher: tea?.name || a.teacherId?.slice(-6),
                room: rm?.name || a.roomId?.slice(-6),
                isFirst: off === 0,
                duration: a.durationPeriods
              };
            }
          }
        });

        // 3. Headers & Batch Lunch Slot
        const secIsShift1 = sec.name.includes('CSE') || sec.name.includes('CS') || sec.name.includes('IT') || sec.name.includes('AIDS') || (sec.department || '').includes('Computer') || (sec.department || '').includes('Information');
        const secLunchSlot = secIsShift1 ? 3 : 4;

        const dayHeaders = DAYS.slice(0, numDays).map(d => {
          const dt = dayTimingMap[d];
          if (d === 'Wed') {
            return 'Wed (45m classes)\n09:30 - 15:30\n(3:30 Dismissal)';
          }
          return dt ? `${d}\n(${dt.start} - ${dt.end})` : d;
        });
        const head = [['Period / Times', ...dayHeaders]];

        // 4. Body
        const body = secGrid.map((row, pi) => {
          const isBreak = periodLabels[pi]?.isBreak;
          const pLabel = periodLabels[pi]?.label || `Period ${pi + 1}`;
          const pTime = periodLabels[pi]?.timeRange ? `\nStd: ${periodLabels[pi].timeRange}` : '';
          const wedTimeStr = WED_PERIOD_TIMES[pi] ? `\nWed: ${WED_PERIOD_TIMES[pi]}` : '';
          const firstCol = `${pLabel}${pTime}${wedTimeStr}`;

          if (isBreak) {
            return [firstCol, ...dayHeaders.map(() => '(Break)')];
          }

          return [
            firstCol,
            ...row.map((cell, di) => {
              const dName = DAYS[di];
              const dt = dayTimingMap[dName];
              const isWedCutoff = dName === 'Wed' && pi >= 6;
              if (isWedCutoff || (dt && dt.maxPeriodIndex !== undefined && pi >= dt.maxPeriodIndex)) {
                return '🕒 Early Wrap-Up\n(3:30 PM)';
              }
              if (pi === secLunchSlot) {
                return secIsShift1 ? 'Shift 1 Lunch\n(12:30 - 1:15 PM)' : 'Shift 2 Lunch\n(1:15 - 2:00 PM)';
              }
              if (!cell) return '—';
              if (!cell.isFirst) return `↳ ${cell.code} (cont.)`;
              const durBadge = cell.duration === 2 ? (dName === 'Wed' ? ' [1.5h Lab]' : ' [2h]') : '';
              return `${cell.code}${durBadge}: ${cell.name}\n${cell.teacher}\n${cell.room}`;
            })
          ];
        });

        // 5. Render AutoTable
        autoTable(doc, {
          head,
          body,
          startY: 25,
          margin: { left: 10, right: 10 },
          styles: { fontSize: 7, cellPadding: 2.2, halign: 'center', valign: 'middle', overflow: 'linebreak' },
          headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
          columnStyles: { 0: { fontStyle: 'bold', halign: 'left', fillColor: [248, 250, 252], cellWidth: 32 } },
          didParseCell: (data) => {
            if (data.row.index >= 0 && data.section === 'body') {
              const raw = data.cell.raw;
              if (raw && typeof raw === 'string') {
                if (raw.includes('Lab') || raw.includes('L-G') || raw.includes('(2h)')) {
                  data.cell.styles.fillColor = [254, 243, 199];
                  data.cell.styles.textColor = [146, 64, 14];
                } else if (raw.includes('SPORTS') || raw.includes('Sports')) {
                  data.cell.styles.fillColor = [209, 250, 229];
                  data.cell.styles.textColor = [6, 95, 70];
                } else if (raw.includes('Lunch') || raw.includes('Break')) {
                  data.cell.styles.fillColor = [241, 245, 249];
                  data.cell.styles.textColor = [100, 116, 139];
                } else if (raw.includes('Early Wrap-Up')) {
                  data.cell.styles.fillColor = [248, 250, 252];
                  data.cell.styles.textColor = [148, 163, 184];
                } else if (raw !== '—') {
                  data.cell.styles.fillColor = [240, 249, 255];
                  data.cell.styles.textColor = [3, 105, 161];
                }
              }
            }
          }
        });

        // 6. Page Footer
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${sIdx + 1} of ${sections.length}  •  SmartSched Master College Timetable  •  NIT Delhi`, 14, 204);
      });

      doc.save(`SmartSched_Master_All_Batches_Timetable.pdf`);
    } catch (err) {
      console.error('Master PDF export error:', err);
      setError('Failed to export Master PDF: ' + err.message);
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Generation Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                <Table2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">University Timetable Studio</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active operating hours: <strong>09:30 AM – 05:30 PM</strong> &bull; <strong>Wednesday: 09:30 AM – 03:30 PM</strong> early wrap-up.
            </p>
          </div>

          {/* Saved Schedules Quick Loader */}
          {savedRuns.length > 0 && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">Saved Run:</span>
              <select
                value={selectedRunId}
                onChange={e => handleLoadSavedRun(e.target.value)}
                className="text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 focus:outline-hidden"
              >
                {savedRuns.map((r, i) => (
                  <option key={r._id} value={r._id}>
                    {r.algorithm?.toUpperCase()} &bull; {r.assignments?.length || 0} sessions &bull; {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Generator Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700">Target:</span>
            <select
              value={targetScope}
              onChange={e => setTargetScope(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="ALL">🏫 Whole College (All 25 Batches &bull; 7 Branches)</option>
              {Object.entries(groupedSections).map(([dept, secs]) => (
                <optgroup key={dept} label={`── ${dept} ──`}>
                  {secs.map(s => <option key={s._id} value={s._id}>{s.name} ({s.department})</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700">Algorithm:</span>
            <select
              value={algorithm}
              onChange={e => setAlgorithm(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 bg-white"
            >
              {ALGS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{loading ? 'Generating College Schedule...' : 'Generate New Schedule'}</span>
          </button>

          {schedule && (
            <div className="ml-auto flex items-center flex-wrap gap-2">
              <button
                onClick={handleRevert}
                title="Reset any manual slot adjustments"
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg transition border border-slate-200 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Current PDF</span>
              </button>
              {/* MASTER PDF EXPORT FOR ALL 25 BATCHES AT ONCE */}
              <button
                onClick={exportAllBatchesPDF}
                disabled={exportingAll}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg transition shadow-xs cursor-pointer"
              >
                {exportingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling {sections.length} Batches...</span>
                  </>
                ) : (
                  <>
                    <Files className="w-3.5 h-3.5" />
                    <span>Export All Batches PDF (Master)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* View Switcher Bar */}
        {schedule && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('section')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${viewMode === 'section' ? 'bg-white text-sky-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Branch / Section</span>
              </button>
              <button
                onClick={() => setViewMode('teacher')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${viewMode === 'teacher' ? 'bg-white text-sky-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Teacher View</span>
              </button>
              <button
                onClick={() => setViewMode('room')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${viewMode === 'room' ? 'bg-white text-sky-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Room View</span>
              </button>
            </div>

            {/* Sub-selector based on View Mode */}
            {viewMode === 'section' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-500">Filter Branch / Batch:</span>
                <select
                  value={selectedBranchId}
                  onChange={e => setSelectedBranchId(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white"
                >
                  {Object.entries(groupedSections).map(([dept, secs]) => (
                    <optgroup key={dept} label={`── ${dept} ──`}>
                      {secs.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentCount} students)</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {viewMode === 'teacher' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-500">Filter Teacher:</span>
                <select
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white"
                >
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.teacherCode})</option>)}
                </select>
              </div>
            )}

            {viewMode === 'room' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-500">Filter Room:</span>
                <select
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white"
                >
                  {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.roomNumber || r.type})</option>)}
                </select>
              </div>
            )}

            {/* Legend */}
            <div className="ml-auto flex items-center space-x-3 text-[11px] text-slate-600">
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded bg-sky-200 border border-sky-400"></span><span>Theory (1h)</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded bg-amber-200 border border-amber-400"></span><span>Lab (2h)</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-400"></span><span>Sports (2h)</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded bg-slate-200 border border-slate-300"></span><span>Wed Wrap-up (3:30)</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Swap Alert Banner */}
      {swapAlert && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
          swapAlert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          swapAlert.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-sky-50 border-sky-200 text-sky-800'
        }`}>
          <div className="flex items-center space-x-2">
            {swapAlert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {swapAlert.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            {swapAlert.type === 'info' && <ArrowLeftRight className="w-4 h-4 text-sky-600 shrink-0" />}
            <span className="font-medium">{swapAlert.message}</span>
          </div>
          {selectedSlot && (
            <button
              onClick={() => { setSelectedSlot(null); setSwapAlert(null); }}
              className="text-xs underline font-semibold cursor-pointer hover:opacity-75"
            >
              Cancel Selection
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700">{error}</div>
      )}

      {/* Active View Header */}
      {schedule && (
        <div className="flex items-center justify-between bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{currentViewTitle}</h3>
            <p className="text-[11px] text-slate-500">
              Showing {filteredAssignments.length} scheduled periods &bull; Schedule timings: 09:30–17:30 (Wed: 09:30–15:30) &bull; Click any cell to move/swap
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              {schedule.validation?.validationStatus || 'VALID_COMPLETE'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Whole College: {schedule.schedule?.assignments?.length} sessions
            </span>
          </div>
        </div>
      )}

      {/* Grid with Exact Time Display */}
      {schedule && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 text-left w-44 border-r border-slate-700">
                    <div>Period Schedule</div>
                    <div className="text-[10px] text-amber-300 font-normal mt-0.5">Mon-Fri vs Wed (45m)</div>
                  </th>
                  {DAYS.slice(0, numDays).map((d) => {
                    const dt = dayTimingMap[d];
                    const isWed = d === 'Wed';
                    return (
                      <th key={d} className={`text-white text-xs font-semibold px-3 py-2 text-center border-r border-slate-700 ${isWed ? 'bg-amber-950/90 border-amber-400' : 'bg-slate-800'}`}>
                        <div className={`font-bold ${isWed ? 'text-amber-300 text-sm' : ''}`}>{d}</div>
                        {dt && (
                          <div className={`text-[10px] font-mono mt-0.5 ${isWed ? 'text-amber-200 font-semibold' : 'text-slate-300 font-normal'}`}>
                            {dt.start} – {dt.end} {isWed ? '(45-min classes)' : ''}
                          </div>
                        )}
                        {isWed && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] bg-amber-400 text-slate-950 font-extrabold shadow-xs">
                            3:30 PM Early Dismissal
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {grid.map((row, pi) => {
                  const pLabel = periodLabels[pi]?.label || `Period ${pi + 1}`;
                  const pTime = periodLabels[pi]?.timeRange;
                  const isBreak = periodLabels[pi]?.isBreak;

                  return (
                    <tr key={pi} className={isBreak ? 'bg-slate-100' : 'bg-white'}>
                      <td className={`text-xs px-3 py-2.5 border-r border-slate-200 ${isBreak ? 'text-slate-400 italic bg-slate-100' : 'text-slate-700 bg-slate-50'}`}>
                        <div className="font-bold text-slate-900">{pLabel}</div>
                        {pTime && (
                          <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                            <span className="font-semibold text-slate-700">Mon-Fri:</span> {pTime}
                          </div>
                        )}
                        {WED_PERIOD_TIMES[pi] && (
                          <div className="text-[9.5px] font-mono mt-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-medium inline-block">
                            <span className="font-bold text-amber-950">Wed (45m):</span> {WED_PERIOD_TIMES[pi]}
                          </div>
                        )}
                      </td>
                      {row.map((cell, di) => {
                        const dName = DAYS[di];
                        const dt = dayTimingMap[dName];
                        const isWedCutoff = dName === 'Wed' && pi >= 6;
                        const isAfterCutoff = isWedCutoff || (dt && dt.maxPeriodIndex !== undefined && pi >= dt.maxPeriodIndex);
                        const isSelected = selectedSlot && selectedSlot.period === pi && selectedSlot.day === di;
                        const isSectionLunch = viewMode === 'section' && sectionLunchPeriod !== null && pi === sectionLunchPeriod;

                        if (isAfterCutoff) {
                          return (
                            <td key={di} className="border-r border-slate-200 px-2 py-3 text-center align-middle bg-slate-100/80 text-slate-400 select-none">
                              <div className="flex flex-col items-center justify-center space-y-1">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span className="text-[10.5px] font-bold text-slate-700">Early Wrap-Up</span>
                                <span className="text-[9px] text-amber-800 font-mono font-bold bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">3:30 PM Dismissal</span>
                                <span className="text-[8px] text-slate-400 font-medium">No classes after 15:30</span>
                              </div>
                            </td>
                          );
                        }

                        if (isSectionLunch && !cell) {
                          return (
                            <td key={di} className="border-r border-slate-200 px-2 py-2 text-center align-middle bg-amber-50/70 border-l-2 border-l-amber-400 select-none">
                              <div className="py-2.5 px-1 rounded text-center">
                                <div className="text-[11px] font-bold text-amber-900">
                                  Shift {isShift1 ? '1' : '2'} Lunch Break
                                </div>
                                <div className="text-[10px] text-amber-700 font-mono mt-0.5 font-semibold">
                                  {isShift1 ? '12:30 – 1:15 PM' : '1:15 – 2:00 PM'}
                                </div>
                                {dName === 'Wed' && (
                                  <div className="text-[8.5px] text-amber-600 font-medium mt-0.5">
                                    (Wed 45-min Break)
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={di}
                            onClick={() => handleCellClick(pi, di, cell, isAfterCutoff)}
                            className={`border-r border-slate-200 px-2 py-2 text-center align-top min-w-[135px] transition cursor-pointer select-none ${
                              isBreak ? 'bg-slate-100 cursor-not-allowed' :
                              isSelected ? 'bg-sky-200/90 ring-2 ring-sky-600 ring-inset shadow-inner' :
                              cell?.type === 'Sports' ? 'bg-emerald-50/70 border-l-2 border-l-emerald-400 hover:bg-emerald-100/70' :
                              cell?.type === 'Lab' ? 'bg-amber-50/70 border-l-2 border-l-amber-400 hover:bg-amber-100/70' :
                              cell ? 'bg-sky-50/70 border-l-2 border-l-sky-400 hover:bg-sky-100/70' : 
                              'hover:bg-slate-50'
                            }`}
                          >
                            {isBreak ? (
                              <div className="py-2 text-[10px] text-slate-400 italic font-semibold">
                                {pLabel}
                              </div>
                            ) : cell ? (
                              cell.isFirst ? (
                                <div className="space-y-0.5">
                                  {dName === 'Wed' && (
                                    <div className="text-[8.5px] font-mono font-bold text-amber-900 bg-amber-100/90 border border-amber-300/80 rounded px-1.5 py-0.2 inline-block mb-0.5">
                                      🕒 Wed: {WED_PERIOD_TIMES[pi]}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900">{cell.code}</span>
                                    {cell.duration === 2 && (
                                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs ${cell.type === 'Sports' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                                        {dName === 'Wed' ? '1.5h (Wed 45m x 2)' : '2 hrs'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] font-medium text-slate-700 leading-tight">{cell.name}</div>
                                  {viewMode !== 'section' && (
                                    <div className="text-[10px] font-bold text-sky-800">{cell.section}</div>
                                  )}
                                  <div className="text-[10px] text-slate-500">{cell.teacher}</div>
                                  <div className="text-[10px] text-sky-600 font-mono font-medium">{cell.room}</div>
                                </div>
                              ) : (
                                <div className="py-2 text-[10px] font-semibold text-slate-400 italic flex items-center justify-center space-x-1">
                                  <span>↳ {cell.code} (Continued)</span>
                                </div>
                              )
                            ) : (
                              <div className="py-3 text-[10px] text-slate-300 hover:text-sky-500">
                                {selectedSlot ? '+ Place here' : '—'}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!schedule && !loading && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Ready to View Timetable</h3>
          <p className="text-xs text-slate-400 mt-1">Select a saved run or click "Generate New Schedule" to create a timetable for the whole college.</p>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <Loader2 className="w-10 h-10 text-sky-500 mx-auto mb-3 animate-spin" />
          <h3 className="text-sm font-semibold text-slate-700">Computing College Timetable...</h3>
          <p className="text-xs text-slate-400 mt-1">Harmonizing schedules across all {sections.length} sections, {rooms.length} rooms, and {teachers.length} professors.</p>
        </div>
      )}
    </div>
  );
}
