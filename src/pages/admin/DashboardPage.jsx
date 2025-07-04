import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { 
  UserGroupIcon, 
  ClipboardDocumentCheckIcon, 
  TrophyIcon,
  UsersIcon,
  CalendarIcon,
  PuzzlePieceIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalSubmissions: 0,
    totalContests: 0,
    totalExhibitions: 0,
    totalMinigames: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, teams, submissions, contests, exhibitions, minigames] = await Promise.all([
          apiService.getUsers(),
          apiService.getAllTeams(),
          apiService.getSubmissions(),
          apiService.getContests(),
          apiService.getExhibitions(),
          apiService.getAllMinigames()
        ]);

        setStats({
          totalUsers: users.data.length,
          totalTeams: teams.data.length,
          totalSubmissions: submissions.data.length,
          totalContests: contests.data.length,
          totalExhibitions: exhibitions.data.length,
          totalMinigames: minigames.data.length
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage contests, teams, and submissions
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <UsersIcon className="w-8 h-8 text-blue-500 mr-3" />
            <h2 className="text-xl font-bold">Users</h2>
          </div>
          <p className="text-3xl font-bold text-blue-500 mb-2">{stats.totalUsers}</p>
          <Link to="/admin/users" className="text-blue-500 hover:text-blue-700 text-sm font-medium">
            Manage Users →
          </Link>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-xl font-bold">Teams</h2>
          </div>
          <p className="text-3xl font-bold text-green-500 mb-2">{stats.totalTeams}</p>
          <Link to="/admin/teams" className="text-green-500 hover:text-green-700 text-sm font-medium">
            Manage Teams →
          </Link>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-purple-500 mr-3" />
            <h2 className="text-xl font-bold">Submissions</h2>
          </div>
          <p className="text-3xl font-bold text-purple-500 mb-2">{stats.totalSubmissions}</p>
          <Link to="/admin/submissions" className="text-purple-500 hover:text-purple-700 text-sm font-medium">
            View Submissions →
          </Link>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <CalendarIcon className="w-8 h-8 text-orange-500 mr-3" />
            <h2 className="text-xl font-bold">Contests</h2>
          </div>
          <p className="text-3xl font-bold text-orange-500 mb-2">{stats.totalContests}</p>
          <Link to="/admin/contests" className="text-orange-500 hover:text-orange-700 text-sm font-medium">
            Manage Contests →
          </Link>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <TrophyIcon className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold">Exhibitions</h2>
          </div>
          <p className="text-3xl font-bold text-red-500 mb-2">{stats.totalExhibitions}</p>
          <Link to="/admin/exhibitions" className="text-red-500 hover:text-red-700 text-sm font-medium">
            Manage Exhibitions →
          </Link>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <PuzzlePieceIcon className="w-8 h-8 text-indigo-500 mr-3" />
            <h2 className="text-xl font-bold">Minigames</h2>
          </div>
          <p className="text-3xl font-bold text-indigo-500 mb-2">{stats.totalMinigames}</p>
          <div className="space-y-1">
            <Link to="/admin/minigames" className="block text-indigo-500 hover:text-indigo-700 text-sm font-medium">
              Manage Minigames →
            </Link>
            <Link to="/admin/minigame-results" className="block text-indigo-500 hover:text-indigo-700 text-sm font-medium">
              View Results →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/admin/contests" 
              className="block w-full btn btn-primary text-left"
            >
              Create New Contest
            </Link>
            <Link 
              to="/admin/minigames" 
              className="block w-full btn btn-secondary text-left"
            >
              Create New Minigame
            </Link>
            <Link 
              to="/admin/lucky-draw" 
              className="block w-full btn btn-outline text-left flex items-center"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              Lucky Draw
            </Link>
            <Link 
              to="/admin/minigame-results" 
              className="block w-full btn btn-outline text-left"
            >
              View Minigame Results
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>API Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-sm">
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-sm">
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Storage</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-sm">
                75% Used
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
