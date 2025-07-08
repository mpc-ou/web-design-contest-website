import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const RegisterPage = () => {
  const { currentUser, userInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get contestId from location state (if navigated from ContestInfoPage)
  const initialContestId = location.state?.contestId || '';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contests, setContests] = useState([]);
  const [formData, setFormData] = useState({
    contestId: initialContestId,
    teamName: '',
    table: '',
    memberEmails: [] 
  });
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
    }
  }, [currentUser, navigate, location]);
  
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await apiService.getContests();
        const availableContests = response.data.filter(contest => {
          const now = new Date();
          const regStart = new Date(contest.registrationStart);
          const regEnd = new Date(contest.registrationEnd);
          return contest.status === 'register' && now >= regStart && now <= regEnd;
        });
        setContests(availableContests);
      } catch (err) {
        console.error('Error fetching contests:', err);
        setError('Failed to load available contests. Please try again later.');
      }
    };
    
    fetchContests();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberEmailChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      memberEmails: prev.memberEmails.map((email, i) => i === index ? value : email)
    }));
  };

  const addMemberEmail = () => {
    setFormData(prev => ({
      ...prev,
      memberEmails: [...prev.memberEmails, '']
    }));
  };

  const removeMemberEmail = (index) => {
    setFormData(prev => ({
      ...prev,
      memberEmails: prev.memberEmails.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const allEmails = [currentUser?.email, ...formData.memberEmails].filter(Boolean);
      // if (allEmails.length < 2) {
      //   setError('At least 2 team members are required.');
      //   setLoading(false);
      //   return;
      // }
      const registrationData = {
        contestId: formData.contestId,
        teamName: formData.teamName,
        table: formData.table,
        memberEmails: formData.memberEmails
      };
      await apiService.registerForContest(registrationData);
      setSuccess('Team registered successfully! Redirecting to dashboard...');
      setFormData({
        contestId: '',
        teamName: '',
        table: '',
        memberEmails: []
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Failed to register team. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Register Your Team</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Contest Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contestId" className="block text-sm font-medium mb-1">
                Contest <span className="text-red-500">*</span>
              </label>
              <select
                id="contestId"
                name="contestId"
                value={formData.contestId}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select a contest</option>
                {contests.map(contest => (
                  <option key={contest._id} value={contest._id}>
                    {contest.name} ({contest.code})
                  </option>
                ))}
              </select>
            </div>
            
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
                placeholder="Enter your team name"
              />
            </div>
            
            <div>
              <label htmlFor="table" className="block text-sm font-medium mb-1">
                Table Number/Letter <span className="text-red-500">*</span>
              </label>
              <select
                id="table"
                name="table"
                value={formData.table}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select a table</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Team Members</h2>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Leader (You)</label>
            <input
              type="email"
              value={userInfo?.email || currentUser?.email || ''}
              readOnly
              className="input bg-gray-100 cursor-not-allowed"
            />
            <div className="text-xs text-gray-500 mt-1">
              {userInfo?.firstName || userInfo?.displayName || 'Leader'}
              {userInfo?.lastName ? ' ' + userInfo.lastName : ''}
              {userInfo?.role === 'admin' && ' (Admin)'}
            </div>
          </div>
          <div className="mb-2 font-medium">Members</div>
          {formData.memberEmails.map((email, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="email"
                value={email}
                onChange={e => handleMemberEmailChange(index, e.target.value)}
                placeholder={`Member ${index + 2} email`}
                className="input flex-1"
                required
              />
              <button
                type="button"
                onClick={() => removeMemberEmail(index)}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                aria-label="Remove member"
              >Remove</button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMemberEmail}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-2"
          >
            + Add Another Member
          </button>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
