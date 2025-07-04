import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { 
  LinkIcon, 
  DocumentTextIcon, 
  CloudArrowUpIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const SubmissionPage = () => {
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const teamIdFromLocation = location.state?.teamId;
  
  const [formData, setFormData] = useState({
    teamId: teamIdFromLocation || '',
    round: 'round1',
    githubLink: '',
    comments: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's teams
        const teamsResponse = await apiService.getMyTeams();
        setTeams(teamsResponse.data);
        
        // Set default team if provided in location state
        if (teamIdFromLocation && formData.teamId === '') {
          setFormData(prev => ({ ...prev, teamId: teamIdFromLocation }));
        } else if (teamsResponse.data.length > 0 && formData.teamId === '') {
          setFormData(prev => ({ ...prev, teamId: teamsResponse.data[0]._id }));
        }
        
        // Fetch user's previous submissions (assuming an endpoint exists)
        try {
          const submissionsResponse = await apiService.getSubmissions();
          setSubmissions(submissionsResponse.data);
        } catch (subErr) {
          console.error('Error fetching submissions:', subErr);
          // Non-critical error, continue without submissions data
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.teamId) {
      setError('Please select a team');
      return;
    }
    
    if (!formData.githubLink) {
      setError('GitHub link is required');
      return;
    }
    
    // Simple validation for GitHub link
    if (!formData.githubLink.includes('github.com')) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }
    
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      // Get contest ID from the selected team
      const team = teams.find(t => t._id === formData.teamId);
      if (!team) {
        throw new Error('Selected team not found');
      }
      
      const submissionData = {
        contestId: team.contest,
        teamId: formData.teamId,
        round: formData.round,
        githubLink: formData.githubLink,
        comments: formData.comments
      };
      
      const response = await apiService.submitProject(submissionData);
      
      // Update local submissions list
      setSubmissions(prev => [response.data, ...prev]);
      
      // Clear form
      setFormData({
        teamId: formData.teamId, // Keep selected team
        round: 'round1',
        githubLink: '',
        comments: ''
      });
      
      setSuccess('Project submitted successfully!');
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting project:', err);
      setError(err.response?.data?.error || 'Failed to submit project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Helper function to get the team name
  const getTeamName = (teamId) => {
    const team = teams.find(t => t._id === teamId);
    return team ? team.teamName : 'Unknown Team';
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If no teams found, prompt user to register
  if (teams.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Submit Project</h1>
        <div className="card p-8">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Teams Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to register a team before you can submit a project.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="btn btn-primary"
          >
            Register a Team
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Submit Project</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
          <ExclamationCircleIcon className="w-5 h-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Submit Your Project</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="teamId" className="block text-sm font-medium mb-1">
                  Team <span className="text-red-500">*</span>
                </label>
                <select
                  id="teamId"
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select a team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.teamName} (Table: {team.table})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="round" className="block text-sm font-medium mb-1">
                  Round <span className="text-red-500">*</span>
                </label>
                <select
                  id="round"
                  name="round"
                  value={formData.round}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="round1">Round 1</option>
                  <option value="final">Final Round</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="githubLink" className="block text-sm font-medium mb-1">
                  GitHub Repository URL <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    <LinkIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="url"
                    id="githubLink"
                    name="githubLink"
                    value={formData.githubLink}
                    onChange={handleChange}
                    placeholder="https://github.com/username/repository"
                    required
                    className="input rounded-l-none"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Make sure your repository is public so judges can access it
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="comments" className="block text-sm font-medium mb-1">
                  Additional Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows="4"
                  className="input"
                  placeholder="Any special instructions or notes for the judges"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full py-3 flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                    Submit Project
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Previous Submissions */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Previous Submissions</h2>
            
            {submissions.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No previous submissions found
              </p>
            ) : (
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div key={submission._id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{getTeamName(submission.teamId)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {submission.round === 'round1' ? 'Round 1' : 'Final Round'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <a 
                        href={submission.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        View Repository
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPage;
