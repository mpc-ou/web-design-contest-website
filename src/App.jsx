import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="contests/:contestId" element={<ContestDetailPage />} />
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
          <Route path="contests/:contestId/register" element={<ContestRegistrationPage />} />
        </Route>
        
        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;