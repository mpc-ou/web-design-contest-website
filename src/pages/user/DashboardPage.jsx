import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { 
  UserCircleIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { userInfo } = useAuth();
  const [teams, setTeams] = useState([]);
  const [contests, setContests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's teams
        const teamsResponse = await apiService.getMyTeams();
        setTeams(teamsResponse.data);

        // Fetch contests
        const contestsResponse = await apiService.getContests();
        setContests(contestsResponse.data);

        // Submissions would normally be fetched via a specific API endpoint
        // For now, we'll assume we get them from the teams data or contest data
        // setSubmissions(submissionsResponse.data);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {userInfo?.displayName || 'User'}!
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* User Info Card */}
        <div className="card p-6">
          <div className="flex flex-col items-center">
            <UserCircleIcon className="w-16 h-16 text-blue-500 mb-4" />
            <h2 className="text-xl font-bold mb-1">{userInfo?.displayName}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{userInfo?.email}</p>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
              {userInfo?.role === 'admin' ? 'Administrator' : 'Contestant'}
            </span>
          </div>
        </div>

        {/* Teams Card */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="w-6 h-6 text-violet-500 mr-2" />
            <h2 className="text-xl font-bold">My Teams</h2>
          </div>
          <p className="text-3xl font-bold text-violet-500 mb-4">{teams.length}</p>
          <Link to="/teams" className="text-violet-500 hover:text-violet-700 text-sm font-medium">
            Manage Teams →
          </Link>
        </div>

        {/* Submissions Card */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <ClipboardDocumentCheckIcon className="w-6 h-6 text-green-500 mr-2" />
            <h2 className="text-xl font-bold">Submissions</h2>
          </div>
          <p className="text-3xl font-bold text-green-500 mb-4">{submissions.length}</p>
          <Link to="/submission" className="text-green-500 hover:text-green-700 text-sm font-medium">
            View Submissions →
          </Link>
        </div>

        {/* Contests Card */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <CalendarIcon className="w-6 h-6 text-orange-500 mr-2" />
            <h2 className="text-xl font-bold">Active Contests</h2>
          </div>
          <p className="text-3xl font-bold text-orange-500 mb-4">
            {contests.filter(c => new Date(c.endTime) >= new Date()).length}
          </p>
          <Link to="/" className="text-orange-500 hover:text-orange-700 text-sm font-medium">
            Browse Contests →
          </Link>
        </div>
      </div>

      {/* My Teams Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">My Teams</h2>
        
        {teams.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't registered any teams yet.</p>
            <Link to="/register" className="btn btn-primary">
              Register a Team
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map(team => {
              // Find the contest this team is registered for
              const contest = contests.find(c => c._id === team.contest);
              
              return (
                <div key={team._id} className="card overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{team.teamName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        team.status === 'registered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        team.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium">Contest:</span> {contest?.name || 'Unknown Contest'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium">Table:</span> {team.table}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Registered:</span> {new Date(team.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Team Members:</h4>
                      <ul className="space-y-2">
                        {team.members.map((member, idx) => (
                          <li key={idx} className="text-sm">
                            {member.fullName} ({member.studentId})
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        to="/submission" 
                        state={{ teamId: team._id }}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Submit Project
                      </Link>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <Link 
                        to="/teams" 
                        state={{ teamId: team._id }}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Manage Team
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Contests */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Upcoming Contests</h2>
        
        {contests.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">No upcoming contests at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contest Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Registration Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contest Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {contests.map(contest => {
                  const now = new Date();
                  const regStart = new Date(contest.registrationStart);
                  const regEnd = new Date(contest.registrationEnd);
                  const contestStart = new Date(contest.startTime);
                  const contestEnd = new Date(contest.endTime);
                  
                  let status;
                  if (now < regStart) {
                    status = "Registration not open";
                  } else if (now >= regStart && now <= regEnd) {
                    status = "Registration open";
                  } else if (now > regEnd && now < contestStart) {
                    status = "Registration closed";
                  } else if (now >= contestStart && now <= contestEnd) {
                    status = "In progress";
                  } else {
                    status = "Completed";
                  }
                  
                  // Check if user is registered for this contest
                  const isRegistered = teams.some(team => team.contest === contest._id);
                  
                  return (
                    <tr key={contest._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{contest.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Code: {contest.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {new Date(contest.registrationStart).toLocaleDateString()} - {new Date(contest.registrationEnd).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {new Date(contest.startTime).toLocaleDateString()} - {new Date(contest.endTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          status === "Registration open" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          status === "In progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                          status === "Completed" ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isRegistered ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">Registered</span>
                        ) : status === "Registration open" ? (
                          <Link 
                            to="/register" 
                            state={{ contestId: contest._id, contestCode: contest.code }}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Register
                          </Link>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            {status === "Registration not open" ? "Not open yet" : "Closed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
