import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

const HomePage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await apiService.getContests();
        setContests(response.data);
      } catch (err) {
        console.error('Error fetching contests:', err);
        setError('Could not load contests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <section className="py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Web Design Contest</h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Showcase your creativity and technical skills in web design
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="btn btn-primary"
          >
            Register Now
          </Link>
          <Link
            to="/exhibition"
            className="btn btn-secondary"
          >
            View Exhibition
          </Link>
        </div>
      </section>

      {/* Active Contests Section */}
      <section className="py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Active Contests</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
            No active contests at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests
              .filter(contest => contest.active && (contest.status === 'register' || contest.status === 'round1' || contest.status === 'round2' || contest.status === 'final'))
              .slice(0, 6)
              .map(contest => (
                <div key={contest._id} className="card overflow-hidden">
                  {contest.thumbnail && (
                    <div className="h-48 bg-gray-200 dark:bg-gray-700">
                      <img 
                        src={contest.thumbnail} 
                        alt={contest.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{contest.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {contest.description}
                    </p>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium">Code:</span> {contest.code}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                          contest.status === 'register' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          contest.status === 'round1' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          contest.status === 'round2' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          contest.status === 'final' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Registration:</span> {new Date(contest.registrationStart).toLocaleDateString()} - {new Date(contest.registrationEnd).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Link 
                      to={`/contest/${contest._id}`}
                      className="btn btn-primary w-full"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
        
        {contests.length > 6 && (
          <div className="text-center mt-8">
            <Link to="/contests" className="btn btn-outline">
              View All Contests
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Why Participate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Showcase Creativity</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Display your innovative web design ideas and technical skills to a wider audience.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Team Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Work with talented teammates and learn from each other's expertise.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Win Prizes</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Compete for exciting prizes and recognition in the web design community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
