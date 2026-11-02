import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, GraduationCap, AlertCircle, Tag, Star } from 'lucide-react';
import AvailabilityGrid from '../../components/AvailabilityGrid';

export default function TeachersTab({ teachers, settings, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    teacherCode: '',
    teachableSubjectCodesStr: '',
    maxWeeklyPeriods: 18,
    availability: [],
    preferredSlots: []
  });

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.teacherCode.toLowerCase().includes(search.toLowerCase()) ||
    (t.teachableSubjectCodes && t.teachableSubjectCodes.some(c => c.toLowerCase().includes(search.toLowerCase())))
  );

  const openCreateModal = () => {
    setEditingTeacher(null);
    const D = settings?.workingDays?.length || 5;
    const P = settings?.periods?.length || 9;
    setFormData({
      name: '',
      teacherCode: '',
      teachableSubjectCodesStr: '',
      maxWeeklyPeriods: 18,
      availability: Array.from({ length: D }, () => Array(P).fill(true)),
      preferredSlots: []
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      teacherCode: teacher.teacherCode,
      teachableSubjectCodesStr: (teacher.teachableSubjectCodes || []).join(', '),
      maxWeeklyPeriods: teacher.maxWeeklyPeriods || 18,
      availability: teacher.availability || [],
      preferredSlots: teacher.preferredSlots || []
    });
    setError(null);
    setModalOpen(true);
  };

  const togglePreferredSlot = (dayIdx, periodIdx) => {
    const exists = formData.preferredSlots.some(s => s.day === dayIdx && s.period === periodIdx);
    if (exists) {
      setFormData({
        ...formData,
        preferredSlots: formData.preferredSlots.filter(s => !(s.day === dayIdx && s.period === periodIdx))
      });
    } else {
      setFormData({
        ...formData,
        preferredSlots: [...formData.preferredSlots, { day: dayIdx, period: periodIdx }]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const codes = formData.teachableSubjectCodesStr
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(Boolean);

    const payload = {
      name: formData.name,
      teacherCode: formData.teacherCode.trim().toUpperCase(),
      teachableSubjectCodes: codes,
      maxWeeklyPeriods: formData.maxWeeklyPeriods,
      availability: formData.availability,
      preferredSlots: formData.preferredSlots
    };

    try {
      if (editingTeacher) {
        await axios.put(`/api/teachers/${editingTeacher._id}`, payload);
      } else {
        await axios.post('/api/teachers', payload);
      }
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (teacher) => {
    setError(null);
    try {
      await axios.delete(`/api/teachers/${teacher._id}`);
      setDeleteConfirm(null);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    }
  };

  const days = settings?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = settings?.periods || [];

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search teacher code, name, or subject code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          />
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Faculty
        </button>
      </div>

      {/* Faculty Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Teachable Subjects (A4)</th>
              <th className="px-4 py-3 text-left">Max Load</th>
              <th className="px-4 py-3 text-left">Preferred Slots</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                  No faculty members found. Add faculty to get started.
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">{teacher.teacherCode}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{teacher.name}</td>
                  <td className="px-4 py-3">
                    {teacher.teachableSubjectCodes && teacher.teachableSubjectCodes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {teacher.teachableSubjectCodes.map((code) => (
                          <span
                            key={code}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Any (No restriction)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="font-medium text-slate-800">{teacher.maxWeeklyPeriods} periods/wk</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center text-xs text-amber-700">
                      <Star className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" />
                      {teacher.preferredSlots?.length || 0} slots
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(teacher)}
                      className="p-1 text-slate-500 hover:text-sky-600 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(teacher)}
                      className="p-1 text-slate-500 hover:text-rose-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingTeacher ? 'Edit Faculty Member' : 'Add New Faculty Member'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T01"
                    value={formData.teacherCode}
                    onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Rao"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Weekly Teaching Periods *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.maxWeeklyPeriods}
                    onChange={(e) => setFormData({ ...formData, maxWeeklyPeriods: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teachable Subject Codes (Comma-separated)
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. CS201, CS202, CS203 (Leave empty for no restriction per A4)"
                    value={formData.teachableSubjectCodesStr}
                    onChange={(e) => setFormData({ ...formData, teachableSubjectCodesStr: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase font-mono text-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Per rule A4: If specified, this teacher can only be assigned to subjects whose code is listed above.
                </p>
              </div>

              {/* Availability Grid */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Faculty Availability Matrix (D &times; P)
                </label>
                <AvailabilityGrid
                  days={days}
                  periods={periods}
                  availability={formData.availability}
                  onChange={(newAvail) => setFormData({ ...formData, availability: newAvail })}
                />
              </div>

              {/* Preferred Slots Picker */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Teaching Slots (Soft Constraint S4)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Sessions assigned to non-preferred slots incur soft penalty S4. Click to toggle preferred slots (highlighted with gold stars):
                </p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-center text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-1.5 text-left font-semibold text-slate-700">Day</th>
                        {periods.map((p, pIdx) => (
                          <th key={pIdx} className="px-1.5 py-1.5 font-semibold text-slate-700">
                            {p.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {days.map((day, dIdx) => (
                        <tr key={day}>
                          <td className="px-3 py-1 text-left font-medium text-slate-800 bg-slate-50">{day}</td>
                          {periods.map((p, pIdx) => {
                            if (p.isBreak) {
                              return <td key={pIdx} className="bg-slate-100 text-slate-400 text-[10px]">-</td>;
                            }
                            const isPreferred = formData.preferredSlots.some(s => s.day === dIdx && s.period === pIdx);
                            return (
                              <td key={pIdx} className="p-1">
                                <button
                                  type="button"
                                  onClick={() => togglePreferredSlot(dIdx, pIdx)}
                                  className={`w-full py-1 rounded text-xs transition ${
                                    isPreferred
                                      ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                                      : 'hover:bg-slate-100 text-slate-400 border border-transparent'
                                  }`}
                                  title={`${day} ${p.label}: ${isPreferred ? 'Preferred' : 'Not preferred'}`}
                                >
                                  {isPreferred ? '★' : '☆'}
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

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                  {error}
                </p>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingTeacher ? 'Update Faculty' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Faculty Member?</h3>
            <p className="text-xs text-slate-600 mb-6">
              Are you sure you want to delete <strong className="text-slate-800">{deleteConfirm.name} ({deleteConfirm.teacherCode})</strong>? Deletion will be rejected with HTTP 409 if assigned to any subject.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
