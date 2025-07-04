import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  DocumentTextIcon, 
  LinkIcon, 
  EyeIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const AdminSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterContest, setFilterContest] = useState('');
  const [filterRound, setFilterRound] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [submissionsResponse, teamsResponse, contestsResponse] = await Promise.all([
        apiService.getSubmissions(),
        apiService.getAllTeams(),
        apiService.getContests()
      ]);
      setSubmissions(submissionsResponse.data);
      setTeams(teamsResponse.data);
      setContests(contestsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t._id === teamId);
    return team ? team.teamName : 'Unknown Team';
  };

  const getContestName = (contestId) => {
    const contest = contests.find(c => c._id === contestId);
    return contest ? contest.name : 'Unknown Contest';
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesContest = !filterContest || submission.contestId === filterContest;
    const matchesRound = !filterRound || submission.round === filterRound;
    return matchesContest && matchesRound;
  });

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
        <h1 className="text-3xl font-bold">Project Submissions</h1>
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
          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
            className="input"
          >
            <option value="">All Rounds</option>
            <option value="round1">Round 1</option>
            <option value="final">Final Round</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
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
                  Round
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubmissions.map(submission => (
                <tr key={submission._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{getTeamName(submission.teamId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getContestName(submission.contestId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      submission.round === 'final' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {submission.round === 'round1' ? 'Round 1' : 'Final Round'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <a
                      href={submission.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Submission Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Team
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{getTeamName(selectedSubmission.teamId)}</p>
              </div>
              
              <div>
                <h3 className="font-medium flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Contest
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{getContestName(selectedSubmission.contestId)}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Round</h3>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  selectedSubmission.round === 'final' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {selectedSubmission.round === 'round1' ? 'Round 1' : 'Final Round'}
                </span>
              </div>
              
              <div>
                <h3 className="font-medium flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  GitHub Repository
                </h3>
                <a 
                  href={selectedSubmission.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 break-all"
                >
                  {selectedSubmission.githubLink}
                </a>
              </div>
              
              {selectedSubmission.comments && (
                <div>
                  <h3 className="font-medium">Comments</h3>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedSubmission.comments}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="font-medium">Submission Date</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <a
                href={selectedSubmission.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex items-center"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                View Repository
              </a>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubmissionsPage;
