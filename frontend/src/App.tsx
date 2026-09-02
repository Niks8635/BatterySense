import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import BatteryPage from './pages/BatteryPage';
import PerformancePage from './pages/PerformancePage';
import SystemPage from './pages/SystemPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BatteryReportPage from './pages/BatteryReportPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="battery" element={<BatteryPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="system" element={<SystemPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="report" element={<BatteryReportPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
    </Routes>
  );
}

export default App;
