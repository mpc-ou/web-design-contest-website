import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import Layout from './components/layout/Layout';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ContestInfoPage from './pages/ContestInfoPage';
import ExhibitionPage from './pages/ExhibitionPage';
import RegisterPage from './pages/RegisterPage';

// User pages
import DashboardPage from './pages/user/DashboardPage';
import TeamManagementPage from './pages/user/TeamManagementPage';
import SubmissionPage from './pages/user/SubmissionPage';
import MinigamePage from './pages/user/MinigamePage';

// Admin pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminContestsPage from './pages/admin/ContestsPage';
import AdminTeamsPage from './pages/admin/TeamsPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminSubmissionsPage from './pages/admin/SubmissionsPage';
import AdminExhibitionsPage from './pages/admin/ExhibitionsPage';
import AdminMinigamesPage from './pages/admin/MinigamesPage';
import AdminMinigameResultsPage from './pages/admin/MinigameResultsPage';
import AdminLuckyTicketsPage from './pages/admin/LuckyTicketsPage';
import AdminLuckyDrawPage from './pages/admin/LuckyDrawPage';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="contest/:contestId" element={<ContestInfoPage />} />
          <Route path="exhibition" element={<ExhibitionPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="teams" element={<TeamManagementPage />} />
            <Route path="submission" element={<SubmissionPage />} />
            <Route path="minigame" element={<MinigamePage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="contests" element={<AdminContestsPage />} />
            <Route path="teams" element={<AdminTeamsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="submissions" element={<AdminSubmissionsPage />} />
            <Route path="exhibitions" element={<AdminExhibitionsPage />} />
            <Route path="minigames" element={<AdminMinigamesPage />} />
            <Route path="minigame-results" element={<AdminMinigameResultsPage />} />
            <Route path="lucky-tickets" element={<AdminLuckyTicketsPage />} />
            <Route path="lucky-draw" element={<AdminLuckyDrawPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
