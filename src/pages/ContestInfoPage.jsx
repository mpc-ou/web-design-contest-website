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
        <h2 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">Contest Not Found</h2>
        <p className="mt-2">The contest you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="mt-4 inline-block text-blue-500 hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  const isRegistrationOpen = () => {
    const now = new Date();
    const regStart = new Date(contest.registrationStart);
    const regEnd = new Date(contest.registrationEnd);
    return contest.status === 'register' && now >= regStart && now <= regEnd;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'register':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'round1':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'round2':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'final':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Contest Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{contest.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contest.status)}`}>
            {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
          </span>
        </div>
        
        {contest.thumbnail && (
          <div className="mb-6">
            <img 
              src={contest.thumbnail} 
              alt={contest.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
        
        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
          {contest.description}
        </p>
      </div>

      {/* Contest Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Contest Schedule
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">Registration Period</h3>
              <p className="text-sm">
                {new Date(contest.registrationStart).toLocaleDateString()} - {new Date(contest.registrationEnd).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">Round 1</h3>
              <p className="text-sm">
                {new Date(contest.round1Start).toLocaleDateString()} - {new Date(contest.round1End).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">Round 2</h3>
              <p className="text-sm">
                {
                  contest.round2Start ?
                  `${new Date(contest.round2Start).toLocaleDateString()} - ${new Date(contest.round2End).toLocaleDateString()}`
                  : "Not yet"
                }
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">Final Round</h3>
              <p className="text-sm">
                {new Date(contest.finalStart).toLocaleDateString()} - {new Date(contest.finalEnd).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Contest Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">Contest Code</h3>
              <p className="text-lg font-mono">{contest.code}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">Created</h3>
              <p className="text-sm">{new Date(contest.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">Last Updated</h3>
              <p className="text-sm">{new Date(contest.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contest Images */}
      {contest.images && contest.images.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Contest Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contest.images.map((image, index) => (
              <div key={index} className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img 
                  src={image} 
                  alt={`Contest image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {currentUser ? (
          isRegistrationOpen() ? (
            <Link
              to="/register"
              state={{ contestId: contest._id }}
              className="btn btn-primary text-center"
            >
              Register for Contest
            </Link>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Registration is currently closed for this contest.
              </p>
              <Link to="/dashboard" className="btn btn-outline">
                Go to Dashboard
              </Link>
            </div>
          )
        ) : (
          <Link to="/login" className="btn btn-primary text-center">
            Login to Register
          </Link>
        )}
        
        <Link to="/" className="btn btn-outline text-center">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ContestInfoPage;
