import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import ContestDetailPage from './pages/ContestDetailPage';
import ContestRegistrationPage from './pages/ContestRegistrationPage';
import ExhibitionsPage from './pages/ExhibitionsPage';
import ContestsPage from './pages/ContestsPage';
import TeamsPage from './pages/TeamsPage';
import MinigamesPage from './pages/MinigamesPage';
import MinigameDetail from './components/minigame/MinigameDetail';
import FAQPage from './pages/FAQPage';
import SponsorsPage from './pages/SponsorsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin imports
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminPage from './pages/admin/AdminPage';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import AdminContestsPage from './pages/admin/ContestsPage';
import AdminTeamsPage from './pages/admin/TeamsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import RegistrationsPage from './pages/admin/RegistrationsPage';
import SubmissionsPage from './pages/admin/SubmissionsPage';
import AdminExhibitionsPage from './pages/admin/AdminExhibitionsPage';
import AdminSponsorsPage from './pages/admin/AdminSponsorsPage';
import AdminMinigamesPage from './pages/admin/AdminMinigamesPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminFAQsPage from './pages/admin/AdminFAQsPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';

// Admin Routes
import { getAdminRoutes } from './routes/adminRoutes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="contests/:contestCode" element={<ContestDetailPage />} />
        <Route path="exhibitions" element={<ExhibitionsPage />} />
        <Route path="contests" element={<ContestsPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="minigames" element={<MinigamesPage />} />
        <Route path="minigames/:minigameId" element={<MinigameDetail />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="sponsors" element={<SponsorsPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<ProfileEditPage />} />
          <Route path="profile/registrations" element={<MyRegistrationsPage />} />
          <Route path="contests/:contestId/register" element={<ContestRegistrationPage />} />
        </Route>
        
        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Routes */}
      {getAdminRoutes()}
    </Routes>
  );
}

export default App;