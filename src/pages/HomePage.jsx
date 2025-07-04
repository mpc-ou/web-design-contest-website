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

      <section className="py-12 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Contests</h2>
        
        {loading ? (
          <div className="text-center">Loading contests...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : contests.length === 0 ? (
          <div className="text-center">No contests available right now. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map(contest => (
              <div key={contest._id} className="card">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{contest.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{contest.description}</p>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Registration: {new Date(contest.registrationStart).toLocaleDateString()} - {new Date(contest.registrationEnd).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Contest: {new Date(contest.startTime).toLocaleDateString()} - {new Date(contest.endTime).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    to={`/contest/${contest._id}`}
                    className="text-blue-500 hover:text-blue-700 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="py-12 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h3 className="text-xl font-semibold mb-2">Register</h3>
            <p className="text-gray-600 dark:text-gray-300">Create an account and register your team for the competition</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h3 className="text-xl font-semibold mb-2">Compete</h3>
            <p className="text-gray-600 dark:text-gray-300">Design and develop websites based on the given requirements</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h3 className="text-xl font-semibold mb-2">Win</h3>
            <p className="text-gray-600 dark:text-gray-300">Submit your work and get a chance to win exciting prizes</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
