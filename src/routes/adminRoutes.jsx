import { Route } from 'react-router-dom';
import AdminProtectedRoute from '../components/auth/AdminProtectedRoute';
import AdminLayout from '../components/admin/AdminLayout';

// Admin Main Pages
import AdminPage from '../pages/admin/AdminPage';
import DashboardPage from '../pages/admin/DashboardPage';
import UsersPage from '../pages/admin/UsersPage';
import AdminContestsPage from '../pages/admin/ContestsPage';
import RegistrationsPage from '../pages/admin/RegistrationsPage';
import AdminTeamsPage from '../pages/admin/TeamsPage';
import SubmissionsPage from '../pages/admin/SubmissionsPage';
import AdminExhibitionsPage from '../pages/admin/AdminExhibitionsPage';
import AdminMinigamesPage from '../pages/admin/AdminMinigamesPage';
import AdminSponsorsPage from '../pages/admin/AdminSponsorsPage';
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage';
import AdminFAQsPage from '../pages/admin/AdminFAQsPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import ReportsPage from '../pages/admin/ReportsPage';

// Users Management
import AdminUserDetailPage from '../pages/admin/users/UserDetailPage';
import AdminUserEditPage from '../pages/admin/users/UserEditPage';

// Contests Management
import AdminContestDetailPage from '../pages/admin/contests/ContestDetailPage';
import AdminContestCreatePage from '../pages/admin/contests/ContestCreatePage';
import AdminContestEditPage from '../pages/admin/contests/ContestEditPage';

// Registrations Management
import AdminRegistrationDetailPage from '../pages/admin/registrations/RegistrationDetailPage';

// Teams Management
import AdminTeamDetailPage from '../pages/admin/teams/TeamDetailPage';
import AdminTeamCreatePage from '../pages/admin/teams/TeamCreatePage';
import AdminTeamEditPage from '../pages/admin/teams/TeamEditPage';

// Submissions Management
import AdminSubmissionDetailPage from '../pages/admin/submissions/SubmissionDetailPage';

// Exhibitions Management
import AdminExhibitionDetailPage from '../pages/admin/exhibitions/ExhibitionDetailPage';
import AdminExhibitionCreatePage from '../pages/admin/exhibitions/ExhibitionCreatePage';
import AdminExhibitionEditPage from '../pages/admin/exhibitions/ExhibitionEditPage';

// Minigames Management
import AdminMinigameDetailPage from '../pages/admin/minigames/MinigameDetailPage';
import AdminMinigameCreatePage from '../pages/admin/minigames/MinigameCreatePage';
import AdminMinigameEditPage from '../pages/admin/minigames/MinigameEditPage';
import AdminMinigameWinnersPage from '../pages/admin/minigames/MinigameWinnersPage';

// Sponsors Management
import AdminSponsorDetailPage from '../pages/admin/sponsors/SponsorDetailPage';
import AdminSponsorCreatePage from '../pages/admin/sponsors/SponsorCreatePage';
import AdminSponsorEditPage from '../pages/admin/sponsors/SponsorEditPage';
import AdminSponsorHistoryPage from '../pages/admin/sponsors/SponsorHistoryPage';

// Notifications Management (stub pages for now)
import AdminNotificationDetailPage from '../pages/admin/notifications/NotificationDetailPage';
import AdminNotificationCreatePage from '../pages/admin/notifications/NotificationCreatePage';
import AdminNotificationEditPage from '../pages/admin/notifications/NotificationEditPage';

// FAQs Management (stub pages for now)
import AdminFAQDetailPage from '../pages/admin/faqs/FAQDetailPage';
import AdminFAQCreatePage from '../pages/admin/faqs/FAQCreatePage';
import AdminFAQEditPage from '../pages/admin/faqs/FAQEditPage';

import ItemCreatePage from '../pages/admin/exhibitions/items/ItemCreatePage';
import ItemDetailPage from '../pages/admin/exhibitions/items/ItemDetailPage';
import ItemEditPage from '../pages/admin/exhibitions/items/ItemEditPage';

// Export admin routes để sử dụng trực tiếp trong App.jsx
export const getAdminRoutes = () => (
  <Route path="/admin" element={<AdminProtectedRoute />}>
    <Route element={<AdminLayout />}>
      <Route index element={<AdminPage />} />
      <Route path="dashboard" element={<DashboardPage />} />
    
      {/* Users Management */}
      <Route path="users" element={<UsersPage />} />
      {/* Removed user create route - third-party login only */}
      <Route path="users/:id" element={<AdminUserDetailPage />} />
      <Route path="users/:id/edit" element={<AdminUserEditPage />} />
      
      {/* Contests Management */}
      <Route path="contests" element={<AdminContestsPage />} />
      <Route path="contests/create" element={<AdminContestCreatePage />} />
      <Route path="contests/:code" element={<AdminContestDetailPage />} />
      <Route path="contests/:code/edit" element={<AdminContestEditPage />} />
      
      {/* Registrations Management */}
      <Route path="registrations" element={<RegistrationsPage />} />
      <Route path="registrations/:id" element={<AdminRegistrationDetailPage />} />
      
      {/* Teams Management */}
      <Route path="teams" element={<AdminTeamsPage />} />
      <Route path="teams/create" element={<AdminTeamCreatePage />} />
      <Route path="teams/:id" element={<AdminTeamDetailPage />} />
      <Route path="teams/:id/edit" element={<AdminTeamEditPage />} />
      
      {/* Submissions Management */}
      <Route path="submissions" element={<SubmissionsPage />} />
      <Route path="submissions/:id" element={<AdminSubmissionDetailPage />} />
      
      {/* Exhibitions Management */}
      <Route path="exhibitions" element={<AdminExhibitionsPage />} />
      <Route path="exhibitions/create" element={<AdminExhibitionCreatePage />} />
      <Route path="exhibitions/:id" element={<AdminExhibitionDetailPage />} />
      <Route path="exhibitions/:id/edit" element={<AdminExhibitionEditPage />} />
      <Route path="exhibitions/:id/items/create" element={<ItemCreatePage />} />
      <Route path="exhibitions/:id/items/:itemId" element={<ItemDetailPage />} />
      <Route path="exhibitions/:id/items/:itemId/edit" element={<ItemEditPage />} />

      {/* Minigames Management */}
      <Route path="minigames" element={<AdminMinigamesPage />} />
      <Route path="minigames/create" element={<AdminMinigameCreatePage />} />
      <Route path="minigames/:id" element={<AdminMinigameDetailPage />} />
      <Route path="minigames/:id/edit" element={<AdminMinigameEditPage />} />
      <Route path="minigames/:id/winners" element={<AdminMinigameWinnersPage />} />
      
      {/* Sponsors Management */}
      <Route path="sponsors" element={<AdminSponsorsPage />} />
      <Route path="sponsors/create" element={<AdminSponsorCreatePage />} />
      <Route path="sponsors/:id" element={<AdminSponsorDetailPage />} />
      <Route path="sponsors/:id/edit" element={<AdminSponsorEditPage />} />
      <Route path="sponsors/:id/history" element={<AdminSponsorHistoryPage />} />
      
      {/* Notifications Management */}
      <Route path="notifications" element={<AdminNotificationsPage />} />
      <Route path="notifications/create" element={<AdminNotificationCreatePage />} />
      <Route path="notifications/:id" element={<AdminNotificationDetailPage />} />
      <Route path="notifications/:id/edit" element={<AdminNotificationEditPage />} />
      
      {/* FAQs Management */}
      <Route path="faqs" element={<AdminFAQsPage />} />
      <Route path="faqs/create" element={<AdminFAQCreatePage />} />
      <Route path="faqs/:id" element={<AdminFAQDetailPage />} />
      <Route path="faqs/:id/edit" element={<AdminFAQEditPage />} />
      
      {/* Analytics & Reports */}
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="reports" element={<ReportsPage />} />
    </Route>
  </Route>
);