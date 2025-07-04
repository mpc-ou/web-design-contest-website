import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, ClockIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const ContestInfoPage = () => {
  const { contestId } = useParams();
  const { currentUser } = useAuth();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        // Since the API doesn't have a specific endpoint for a single contest,
        // we'll fetch all contests and filter
        const response = await apiService.getContests();
        const foundContest = response.data.find(c => c._id === contestId);
        
        if (foundContest) {
          setContest(foundContest);
        } else {
          setError('Contest not found');
        }
      } catch (err) {
        console.error('Error fetching contest details:', err);
        setError('Failed to load contest details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContestDetails();
  }, [contestId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Error</h2>
        <p className="mt-2">{error}</p>
        <Link to="/" className="mt-4 inline-block text-blue-500 hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h2 className="text-xl font-semibold">Contest Not Found</h2>
        <p className="mt-2">The contest you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="mt-4 inline-block text-blue-500 hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  // Format dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isRegistrationOpen = () => {
    const now = new Date();
    const regStart = new Date(contest.registrationStart);
    const regEnd = new Date(contest.registrationEnd);
    return now >= regStart && now <= regEnd;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="text-blue-500 hover:underline flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{contest.name}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{contest.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Details</h2>
              
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Registration Period</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(contest.registrationStart)} - {formatDate(contest.registrationEnd)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Contest Period</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(contest.startTime)} - {formatDate(contest.endTime)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <UserGroupIcon className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Team Size</h3>
                  <p className="text-gray-600 dark:text-gray-400">Maximum 2 members per team</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Schedule</h2>
              
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium">Round 1</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(contest.round1Start)} - {formatDate(contest.round1End)}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Final Round</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(contest.finalStart)} - {formatDate(contest.finalEnd)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold mb-4">Rules & Guidelines</h2>
            <div className="prose dark:prose-invert max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>All team members must be registered students.</li>
                <li>Teams can have up to 2 members.</li>
                <li>Submissions must be original work created during the contest period.</li>
                <li>Use of external libraries and frameworks is allowed, but must be disclosed.</li>
                <li>Submitted websites must be responsive and work on modern browsers.</li>
                <li>Code must be submitted to the provided GitHub repository by the deadline.</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {isRegistrationOpen() ? (
              <Link 
                to="/register" 
                className="btn btn-primary"
                state={{ contestId: contestId, contestCode: contest.code }}
              >
                Register for this Contest
              </Link>
            ) : (
              <button 
                disabled 
                className="btn bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              >
                Registration {new Date() < new Date(contest.registrationStart) ? 'Not Yet Open' : 'Closed'}
              </button>
            )}
            
            {currentUser && (
              <Link to="/dashboard" className="btn btn-secondary">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestInfoPage;
