import { Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileEditPage from "./pages/ProfileEditPage";
import ContestDetailPage from "./pages/ContestDetailPage";
import ContestRegistrationPage from "./pages/ContestRegistrationPage";
import ExhibitionsPage from "./pages/ExhibitionsPage";
import ContestsPage from "./pages/ContestsPage";
import TeamsPage from "./pages/TeamsPage";
import MinigamesPage from "./pages/MinigamesPage";
import MinigameDetail from "./components/minigame/MinigameDetail";
import FAQPage from "./pages/FAQPage";
import SponsorsPage from "./pages/SponsorsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MyRegistrationsPage from "./pages/MyRegistrationsPage";

// Admin Routes
import { getAdminRoutes } from "./routes/adminRoutes";

function App() {
  return (
    <>
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
            <Route
              path="profile/registrations"
              element={<MyRegistrationsPage />}
            />
            <Route
              path="contests/:contestCode/register"
              element={<ContestRegistrationPage />}
            />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Routes */}
        {getAdminRoutes()}
      </Routes>
      
      {/* Toast Notification */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
    </>
  );
}

export default App;
