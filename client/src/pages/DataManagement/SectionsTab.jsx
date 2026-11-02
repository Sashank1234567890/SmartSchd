import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Users, AlertCircle } from 'lucide-react';

export default function SectionsTab({ sections, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({ name: '', department: '', studentCount: 60 });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const filteredSections = sections.filter(sec => 
    sec.name.toLowerCase().includes(search.toLowerCase()) ||
    sec.department.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingSection(null);
    setFormData({ name: '', department: '', studentCount: 60 });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (sec) => {
    setEditingSection(sec);
    setFormData({ name: sec.name, department: sec.department, studentCount: sec.studentCount });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingSection) {
        await axios.put(`/api/sections/${editingSection._id}`, formData);
      } else {
        await axios.post('/api/sections', formData);
      }
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sec) => {
    setError(null);
    try {
      await axios.delete(`/api/sections/${sec._id}`);
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
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search sections or departments..."
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
          <Plus className="w-4 h-4 mr-1.5" /> Add Section
        </button>
      </div>

      {/* Sections Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Section Name</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Student Count</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredSections.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                  No sections found. Add a section to get started.
                </td>
              </tr>
            ) : (
              filteredSections.map((sec) => (
                <tr key={sec._id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">{sec.name}</td>
                  <td className="px-4 py-3 text-slate-600">{sec.department}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      <Users className="w-3 h-3 mr-1 text-slate-500" />
                      {sec.studentCount} students
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(sec)}
                      className="p-1 text-slate-500 hover:text-sky-600 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(sec)}
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingSection ? 'Edit Section' : 'Add New Section'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Count *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.studentCount}
                  onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value, 10) || 1 })}
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
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingSection ? 'Update Section' : 'Create Section'}
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
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Section?</h3>
            <p className="text-xs text-slate-600 mb-6">
              Are you sure you want to delete <strong className="text-slate-800">{deleteConfirm.name}</strong>? If any subjects are attached to it, deletion will be rejected to protect data integrity.
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
