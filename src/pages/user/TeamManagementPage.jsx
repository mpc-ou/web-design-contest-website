import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { 
  UserGroupIcon, 
  PencilSquareIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const TeamManagementPage = () => {
  const [teams, setTeams] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    teamName: '',
    table: '',
    member1: { fullName: '', studentId: '', email: '' },
    member2: { fullName: '', studentId: '', email: '' }
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const teamIdFromLocation = location.state?.teamId;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch user's teams
        const teamsResponse = await apiService.getMyTeams();
        setTeams(teamsResponse.data);
        
        // Fetch contests for reference
        const contestsResponse = await apiService.getContests();
        setContests(contestsResponse.data);
        
        // If team ID is provided in location state, set it as the editing team
        if (teamIdFromLocation) {
          const team = teamsResponse.data.find(t => t._id === teamIdFromLocation);
          if (team) {
            handleEditClick(team);
          }
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load your teams. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [teamIdFromLocation]);
  
  const handleEditClick = (team) => {
    setEditingTeam(team);
    
    // Format the team data for the form
    setFormData({
      teamName: team.teamName,
      table: team.table,
      member1: {
        fullName: team.members[0]?.fullName || '',
        studentId: team.members[0]?.studentId || '',
        email: team.members[0]?.email || ''
      },
      member2: {
        fullName: team.members[1]?.fullName || '',
        studentId: team.members[1]?.studentId || '',
        email: team.members[1]?.email || ''
      }
    });
    
    // Scroll to edit form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeleteClick = (teamId) => {
    setDeleteConfirm(teamId);
  };
  
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };
  
  const handleConfirmDelete = async (teamId) => {
    try {
      await apiService.deleteTeam(teamId);
      
      // Update local state
      setTeams(teams.filter(team => team._id !== teamId));
      setDeleteConfirm(null);
      
      // Show success message
      alert('Team deleted successfully!');
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Failed to delete team. Please try again.');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedTeam = await apiService.updateTeam(editingTeam._id, formData);
      
      // Update local state
      setTeams(teams.map(team => 
        team._id === editingTeam._id ? updatedTeam.data : team
      ));
      
      // Reset form
      setEditingTeam(null);
      setFormData({
        teamName: '',
        table: '',
        member1: { fullName: '', studentId: '', email: '' },
        member2: { fullName: '', studentId: '', email: '' }
      });
      
      // Show success message
      alert('Team updated successfully!');
    } catch (err) {
      console.error('Error updating team:', err);
      alert('Failed to update team. Please try again.');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingTeam(null);
    setFormData({
      teamName: '',
      table: '',
      member1: { fullName: '', studentId: '', email: '' },
      member2: { fullName: '', studentId: '', email: '' }
    });
  };
  
  // Helper function to get contest name by ID
  const getContestName = (contestId) => {
    const contest = contests.find(c => c._id === contestId);
    return contest ? contest.name : 'Unknown Contest';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Team Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Edit Team Form */}
      {editingTeam && (
        <div className="card mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Team: {editingTeam.teamName}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium mb-1">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
              
              <div>
                <label htmlFor="table" className="block text-sm font-medium mb-1">
                  Table Number/Letter <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="table"
                  name="table"
                  value={formData.table}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-3">Team Leader (Member 1)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="member1.fullName" className="block text-sm font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="member1.fullName"
                  name="member1.fullName"
                  value={formData.member1.fullName}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
              
              <div>
                <label htmlFor="member1.studentId" className="block text-sm font-medium mb-1">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="member1.studentId"
                  name="member1.studentId"
                  value={formData.member1.studentId}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="member1.email" className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="member1.email"
                  name="member1.email"
                  value={formData.member1.email}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-3">Team Member 2 (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="member2.fullName" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="member2.fullName"
                  name="member2.fullName"
                  value={formData.member2.fullName}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              
              <div>
                <label htmlFor="member2.studentId" className="block text-sm font-medium mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  id="member2.studentId"
                  name="member2.studentId"
                  value={formData.member2.studentId}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="member2.email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="member2.email"
                  name="member2.email"
                  value={formData.member2.email}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Teams List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Teams</h2>
          <button
            onClick={() => navigate('/register')}
            className="btn btn-sm btn-primary"
          >
            Register New Team
          </button>
        </div>
        
        {teams.length === 0 ? (
          <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded">
            <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Teams Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't registered any teams yet.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="btn btn-primary"
            >
              Register Your First Team
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map(team => (
              <div 
                key={team._id}
                className="card p-6"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold mb-1">{team.teamName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Contest: {getContestName(team.contest)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Table: {team.table}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Registered: {new Date(team.registeredAt).toLocaleDateString()}
                    </p>
                    
                    <div className="mt-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        team.status === 'registered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        team.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleEditClick(team)}
                      className="btn btn-sm btn-secondary flex items-center justify-center"
                    >
                      <PencilSquareIcon className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => navigate('/submission', { state: { teamId: team._id } })}
                      className="btn btn-sm btn-primary flex items-center justify-center"
                    >
                      Submit Project
                    </button>
                    <button
                      onClick={() => handleDeleteClick(team._id)}
                      className="btn btn-sm btn-danger flex items-center justify-center"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Team Members */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-2">Team Members:</h4>
                  <ul className="space-y-3">
                    {team.members.map((member, idx) => (
                      <li key={idx} className="text-sm flex items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center mr-2 flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium">{member.fullName}</div>
                          <div className="text-gray-600 dark:text-gray-400">
                            ID: {member.studentId} | {member.email}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Delete Confirmation */}
                {deleteConfirm === team._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded">
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Are you sure you want to delete this team? This action cannot be undone.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleConfirmDelete(team._id)}
                          className="btn btn-sm btn-danger flex items-center"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Yes, Delete
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="btn btn-sm btn-secondary flex items-center"
                        >
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagementPage;
