import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, BookOpen, AlertCircle, ShieldAlert } from 'lucide-react';

export default function SubjectsTab({ subjects, sections, teachers, onRefresh }) {
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Theory',
    sectionId: '',
    teacherId: '',
    weeklySessions: 3,
    durationPeriods: 1,
    requiredRoomType: '',
    notes: ''
  });

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.code.toLowerCase().includes(search.toLowerCase());
    const matchesSection = !sectionFilter || s.sectionId?._id === sectionFilter || s.sectionId === sectionFilter;
    const matchesType = !typeFilter || s.type === typeFilter;
    return matchesSearch && matchesSection && matchesType;
  });

  const openCreateModal = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      type: 'Theory',
      sectionId: sections[0]?._id || '',
      teacherId: '',
      weeklySessions: 3,
      durationPeriods: 1,
      requiredRoomType: '',
      notes: ''
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      type: sub.type,
      sectionId: sub.sectionId?._id || sub.sectionId || '',
      teacherId: sub.teacherId?._id || sub.teacherId || '',
      weeklySessions: sub.weeklySessions,
      durationPeriods: sub.durationPeriods,
      requiredRoomType: sub.requiredRoomType || '',
      notes: sub.notes || ''
    });
    setError(null);
    setModalOpen(true);
  };

  const handleTypeChange = (newType) => {
    const newDuration = newType === 'Theory' ? 1 : 2;
    setFormData({
      ...formData,
      type: newType,
      durationPeriods: newDuration
    });
  };

  // Filter teachers per rule A4: only offer qualified teachers for the entered subject code
  const currentSubjectCode = formData.code.trim().toUpperCase();
  const qualifiedTeachers = teachers.filter(t => {
    if (!t.teachableSubjectCodes || t.teachableSubjectCodes.length === 0) {
      return true; // No restriction
    }
    return !currentSubjectCode || t.teachableSubjectCodes.includes(currentSubjectCode);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: formData.name,
      code: formData.code.trim().toUpperCase(),
      type: formData.type,
      sectionId: formData.sectionId,
      teacherId: formData.teacherId,
      weeklySessions: parseInt(formData.weeklySessions, 10),
      durationPeriods: parseInt(formData.durationPeriods, 10),
      requiredRoomType: formData.requiredRoomType || null,
      notes: formData.notes
    };

    try {
      if (editingSubject) {
        await axios.put(`/api/subjects/${editingSubject._id}`, payload);
      } else {
        await axios.post('/api/subjects', payload);
      }
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sub) => {
    setError(null);
    try {
      await axios.delete(`/api/subjects/${sub._id}`);
      setDeleteConfirm(null);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    }
  };

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
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code or subject name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-700"
          >
            <option value="">All Sections</option>
            {sections.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-700"
          >
            <option value="">All Types</option>
            <option value="Theory">Theory</option>
            <option value="Practical">Practical</option>
            <option value="Lab">Lab</option>
          </select>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          disabled={sections.length === 0 || teachers.length === 0}
          className="inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Subject
        </button>
      </div>

      {sections.length === 0 || teachers.length === 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            Please register at least one Section and one Faculty member before adding subjects.
          </span>
        </div>
      ) : null}

      {/* Subjects Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Subject Name</th>
              <th className="px-4 py-3 text-left">Section</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Faculty Assigned</th>
              <th className="px-4 py-3 text-left">Load (Sessions &times; Periods)</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredSubjects.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                  No subjects found. Add a subject to get started.
                </td>
              </tr>
            ) : (
              filteredSubjects.map((sub) => (
                <tr key={sub._id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900 font-mono">{sub.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{sub.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="font-medium text-slate-800">{sub.sectionId?.name || 'Unknown'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      sub.type === 'Lab' || sub.type === 'Practical'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {sub.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {sub.teacherId ? (
                      <span className="font-medium text-slate-800">
                        {sub.teacherId.name} ({sub.teacherId.teacherCode})
                      </span>
                    ) : (
                      <span className="text-rose-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="text-xs font-semibold text-slate-800">
                      {sub.weeklySessions} &times; {sub.durationPeriods}p
                    </span>{' '}
                    <span className="text-xs text-slate-500">
                      ({sub.weeklySessions * sub.durationPeriods} total/wk)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="p-1 text-slate-500 hover:text-sky-600 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(sub)}
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
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS201"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures & Algorithms"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section (A3 Ownership) *</label>
                  <select
                    required
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">Select Section</option>
                    {sections.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.department})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Theory">Theory (Lectures)</option>
                    <option value="Practical">Practical</option>
                    <option value="Lab">Lab (Multi-Period Consecutive)</option>
                  </select>
                </div>
              </div>

              {/* Faculty Selector filtered per Rule A4 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Faculty (Enforcing Rule A4: Qualified Only) *
                </label>
                <select
                  required
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="">Select Qualified Faculty</option>
                  {qualifiedTeachers.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.teacherCode})
                      {t.teachableSubjectCodes && t.teachableSubjectCodes.length > 0
                        ? ` [Qualified: ${t.teachableSubjectCodes.join(', ')}]`
                        : ' [Unrestricted]'}
                    </option>
                  ))}
                </select>
                {currentSubjectCode && qualifiedTeachers.length === 0 && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>No faculty members are qualified to teach subject code &apos;{currentSubjectCode}&apos;.</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weekly Sessions (A2) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.weeklySessions}
                    onChange={(e) => setFormData({ ...formData, weeklySessions: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Periods) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.durationPeriods}
                    onChange={(e) => setFormData({ ...formData, durationPeriods: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400">1 for lecture, 2+ for lab</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Required Room Type (A7)</label>
                  <select
                    value={formData.requiredRoomType}
                    onChange={(e) => setFormData({ ...formData, requiredRoomType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">Default ({formData.type === 'Theory' ? 'Classroom' : 'Laboratory'})</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Laboratory">Laboratory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Additional context or requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
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
                  disabled={saving || (currentSubjectCode && qualifiedTeachers.length === 0)}
                  className="px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
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
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Subject?</h3>
            <p className="text-xs text-slate-600 mb-6">
              Are you sure you want to delete <strong className="text-slate-800">{deleteConfirm.code} - {deleteConfirm.name}</strong>?
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
