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
    const matchesSearch = exhibition.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exhibition.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exhibition.team?.teamName?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search exhibitions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {/* Add more filter buttons as needed */}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : filteredExhibitions.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400">
          {searchTerm ? 'No exhibitions found matching your search.' : 'No exhibitions available at the moment.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExhibitions.map(exhibition => (
            <div key={exhibition._id} className="card overflow-hidden">
              {/* Exhibition Images */}
              {exhibition.images && exhibition.images.length > 0 && (
                <div className="h-48 bg-gray-200 dark:bg-gray-700">
                  <img 
                    src={exhibition.images[0]} 
                    alt={exhibition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">{exhibition.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    by <span className="font-medium">{exhibition.team?.teamName}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Contest: {exhibition.contest?.name}
                  </p>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {exhibition.description}
                </p>
                
                {/* Links */}
                <div className="space-y-2">
                  {exhibition.githubUrl && (
                    <a
                      href={exhibition.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      View on GitHub →
                    </a>
                  )}
                  
                  {exhibition.websiteUrl && (
                    <a
                      href={exhibition.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Visit Website →
                    </a>
                  )}
                  
                  {exhibition.videoUrl && (
                    <a
                      href={exhibition.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Watch Demo Video →
                    </a>
                  )}
                </div>
                
                {/* Additional Images */}
                {exhibition.images && exhibition.images.length > 1 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      More Images ({exhibition.images.length - 1})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {exhibition.images.slice(1, 4).map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                          <img 
                            src={image} 
                            alt={`${exhibition.title} image ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Created: {new Date(exhibition.createdAt).toLocaleDateString()}
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
