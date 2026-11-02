import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import SettingsPage from './pages/Settings';
import GenerationLab from './pages/GenerationLab';
import TimetableViewer from './pages/TimetableViewer';
import AlgorithmComparison from './pages/AlgorithmComparison';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="data" element={<DataManagement />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="generate" element={<GenerationLab />} />
        <Route path="timetables" element={<TimetableViewer />} />
        <Route path="comparisons" element={<AlgorithmComparison />} />
      </Route>
    </Routes>
  );
}
