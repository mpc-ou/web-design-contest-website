import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const RegisterPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get contestId and contestCode from location state (if navigated from ContestInfoPage)
  const initialContestCode = location.state?.contestCode || '';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contests, setContests] = useState([]);
  const [formData, setFormData] = useState({
    contestCode: initialContestCode,
    teamName: '',
    table: '',
    member1: {
      fullName: '',
      studentId: '',
      email: currentUser?.email || ''
    },
    member2: {
      fullName: '',
      studentId: '',
      email: ''
    }
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
    }
  }, [currentUser, navigate, location]);
  
  // Fetch available contests
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await apiService.getContests();
        // Filter only contests that are currently in registration period
        const availableContests = response.data.filter(contest => {
          const now = new Date();
          const regStart = new Date(contest.registrationStart);
          const regEnd = new Date(contest.registrationEnd);
          return now >= regStart && now <= regEnd;
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
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await apiService.registerTeam(formData);
      setSuccess('Team registered successfully! Redirecting to dashboard...');
      
      // Reset form
      setFormData({
        contestCode: '',
        teamName: '',
        table: '',
        member1: {
          fullName: '',
          studentId: '',
          email: currentUser?.email || ''
        },
        member2: {
          fullName: '',
          studentId: '',
          email: ''
        }
      });
      
      // Redirect after a short delay
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
              <label htmlFor="contestCode" className="block text-sm font-medium mb-1">
                Contest Code <span className="text-red-500">*</span>
              </label>
              <select
                id="contestCode"
                name="contestCode"
                value={formData.contestCode}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select a contest</option>
                {contests.map(contest => (
                  <option key={contest._id} value={contest.code}>
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
              <input
                type="text"
                id="table"
                name="table"
                value={formData.table}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., A12, B5, etc."
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Team Leader (Member 1)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Enter full name"
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
                placeholder="Enter student ID"
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
                placeholder="Enter email"
                readOnly={!!currentUser?.email}
              />
              {currentUser?.email && (
                <p className="text-xs text-gray-500 mt-1">
                  This is your logged-in email and cannot be changed.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Team Member 2 (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Enter full name"
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
                placeholder="Enter student ID"
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
                placeholder="Enter email"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            By registering, you agree to abide by the contest rules and guidelines.
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3"
          >
            {loading ? 'Registering...' : 'Register Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
