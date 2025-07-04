import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  UserGroupIcon, 
  PencilSquareIcon, 
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterContest, setFilterContest] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsResponse, contestsResponse] = await Promise.all([
        apiService.getAllTeams(),
        apiService.getContests()
      ]);
      setTeams(teamsResponse.data);
      setContests(contestsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teamId) => {
    try {
      await apiService.deleteTeam(teamId);
      setTeams(teams.filter(t => t._id !== teamId));
      setDeleteConfirm(null);
      setSuccess('Team deleted successfully');
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team');
    }
  };

  const getContestName = (contestId) => {
    const contest = contests.find(c => c._id === contestId);
    return contest ? contest.name : 'Unknown Contest';
  };

  const filteredTeams = filterContest 
    ? teams.filter(team => team.contest === filterContest)
    : teams;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Teams</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filterContest}
            onChange={(e) => setFilterContest(e.target.value)}
            className="input"
          >
            <option value="">All Contests</option>
            {contests.map(contest => (
              <option key={contest._id} value={contest._id}>
                {contest.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTeams.map(team => (
                <tr key={team._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium">{team.teamName}</div>
                      <div className="text-sm text-gray-500">Table: {team.table}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getContestName(team.contest)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      team.status === 'registered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      team.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedTeam(team)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(team._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedTeam.teamName}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Contest</h3>
                <p className="text-gray-600 dark:text-gray-400">{getContestName(selectedTeam.contest)}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Table</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedTeam.table}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Status</h3>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  selectedTeam.status === 'registered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  selectedTeam.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {selectedTeam.status.charAt(0).toUpperCase() + selectedTeam.status.slice(1)}
                </span>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Team Members</h3>
                <div className="space-y-2">
                  {selectedTeam.members.map((member, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <div className="font-medium">{member.fullName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {member.studentId} | Email: {member.email}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Registration Date</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(selectedTeam.registeredAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedTeam(null)}
              className="mt-6 btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this team? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn btn-danger flex items-center"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary flex items-center"
              >
                <XCircleIcon className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeamsPage;
