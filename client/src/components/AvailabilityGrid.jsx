import React from 'react';
import { Check, X } from 'lucide-react';

export default function AvailabilityGrid({
  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  periods = [],
  availability = [],
  onChange,
  readOnly = false
}) {
  // Ensure availability matrix matches days.length x periods.length
  const matrix = days.map((_, dIdx) => {
    return periods.map((_, pIdx) => {
      if (availability[dIdx] && typeof availability[dIdx][pIdx] === 'boolean') {
        return availability[dIdx][pIdx];
      }
      return true;
    });
  });

  const toggleCell = (dIdx, pIdx) => {
    if (readOnly || !onChange) return;
    const newMatrix = matrix.map((row, r) =>
      row.map((val, c) => (r === dIdx && c === pIdx ? !val : val))
    );
    onChange(newMatrix);
  };

  const setAll = (val) => {
    if (readOnly || !onChange) return;
    const newMatrix = matrix.map(row => row.map(() => val));
    onChange(newMatrix);
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Click a slot to toggle availability</span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => setAll(true)}
              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 transition"
            >
              All Available
            </button>
            <button
              type="button"
              onClick={() => setAll(false)}
              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200 transition"
            >
              All Busy
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200 text-center text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 w-16">Day</th>
              {periods.map((p, idx) => (
                <th
                  key={idx}
                  className={`px-2 py-2 font-semibold ${
                    p.isBreak ? 'bg-amber-50 text-amber-800' : 'text-slate-700'
                  }`}
                >
                  <div>{p.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{p.start}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {days.map((day, dIdx) => (
              <tr key={day} className="hover:bg-slate-50/50">
                <td className="px-3 py-2 text-left font-medium text-slate-800 bg-slate-50/60">
                  {day}
                </td>
                {periods.map((period, pIdx) => {
                  const isAvailable = matrix[dIdx][pIdx];
                  if (period.isBreak) {
                    return (
                      <td key={pIdx} className="px-2 py-2 bg-amber-50/40 text-amber-700 font-medium text-[10px]">
                        Break
                      </td>
                    );
                  }
                  return (
                    <td key={pIdx} className="px-1 py-1">
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => toggleCell(dIdx, pIdx)}
                        className={`w-full py-1.5 px-2 rounded flex items-center justify-center transition ${
                          isAvailable
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                        } ${readOnly ? 'cursor-default' : 'cursor-pointer shadow-xs'}`}
                        title={`${day} ${period.label}: ${isAvailable ? 'Available' : 'Busy'}`}
                      >
                        {isAvailable ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
