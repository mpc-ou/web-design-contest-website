import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const ExhibitionPage = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await apiService.getExhibitions();
        setExhibitions(response.data);
      } catch (err) {
        console.error('Error fetching exhibitions:', err);
        setError('Failed to load exhibitions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  // Filter exhibitions by search term and active tab
  const filteredExhibitions = exhibitions.filter(exhibition => {
    const matchesSearch = exhibition.team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exhibition.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    
    // Add more filters based on your exhibition data structure
    // For example, if exhibitions have a 'category' field:
    // return matchesSearch && exhibition.category === activeTab;
    
    return matchesSearch;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Project Exhibition</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore amazing web design projects created by our talented contestants
        </p>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex overflow-x-auto py-2 space-x-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setActiveTab('winners')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'winners'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Winners
            </button>
            <button
              onClick={() => setActiveTab('finalists')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'finalists'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Finalists
            </button>
          </div>
          
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">
          <p>{error}</p>
        </div>
      ) : filteredExhibitions.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">No projects found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try a different search term' : 'There are no projects to display at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExhibitions.map((exhibition) => (
            <div key={exhibition._id} className="card overflow-hidden">
              <div className="relative pb-[56.25%]">
                {exhibition.images && exhibition.images.length > 0 ? (
                  <img
                    src={exhibition.images[0]}
                    alt={`${exhibition.team.teamName} project`}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">No image available</span>
                  </div>
                )}
                
                {exhibition.award && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {exhibition.award}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{exhibition.team.teamName}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {exhibition.description.length > 100
                    ? `${exhibition.description.substring(0, 100)}...`
                    : exhibition.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(exhibition.createdAt).toLocaleDateString()}
                  </span>
                  
                  <button
                    onClick={() => window.open(exhibition.projectUrl, '_blank')}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    disabled={!exhibition.projectUrl}
                  >
                    View Project →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExhibitionPage;
