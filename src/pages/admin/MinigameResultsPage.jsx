import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  TrophyIcon, 
  TicketIcon,
  UserIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const AdminMinigameResultsPage = () => {
  const [minigames, setMinigames] = useState([]);
  const [selectedMinigame, setSelectedMinigame] = useState(null);
  const [minigameData, setMinigameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);

  useEffect(() => {
    fetchMinigames();
  }, []);

  const fetchMinigames = async () => {
    try {
      const response = await apiService.getAllMinigames();
      setMinigames(response.data);
    } catch (err) {
      console.error('Error fetching minigames:', err);
      setError('Failed to load minigames');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketsForMinigame = async (minigameId) => {
    try {
      const response = await apiService.getMinigameTicketInfo(minigameId);
      setMinigameData(response.data);
    } catch (err) {
      console.error('Error fetching ticket info:', err);
      setError('Failed to load tickets for this minigame');
    }
  };

  const handleMinigameSelect = (minigame) => {
    setSelectedMinigame(minigame);
    fetchTicketsForMinigame(minigame._id);
  };

  const renderNumberMatrix = () => {
    if (!selectedMinigame || !minigameData) return null;

    const { tickets, ticketStats } = minigameData;
    const takenNumbers = ticketStats.takenNumbers;
    const numbers = [];
    const cols = 10;
    const maxNumber = selectedMinigame.maxNumber;
    
    for (let i = 1; i <= maxNumber; i++) {
      numbers.push(i);
    }

    const rows = [];
    for (let i = 0; i < numbers.length; i += cols) {
      rows.push(numbers.slice(i, i + cols));
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Number Selection Overview</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded mr-2"></div>
              <span>Available ({ticketStats.availableTickets})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Taken ({ticketStats.takenTickets})</span>
            </div>
          </div>
        </div>
        
        <div className="grid gap-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 justify-center">
              {row.map(number => {
                const ticket = tickets.find(t => t.number === number);
                const isTaken = takenNumbers.includes(number);
                
                return (
                  <div
                    key={number}
                    onClick={() => ticket && setSelectedTicketDetails(ticket)}
                    className={`
                      w-12 h-12 rounded-lg text-sm font-bold flex items-center justify-center
                      transition-all duration-200
                      ${isTaken 
                        ? 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600 hover:shadow-lg' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                      }
                    `}
                    title={ticket ? `Taken by ${ticket.user?.displayName}` : 'Available'}
                  >
                    {number}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Minigame Results & Analytics</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Minigame List */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Select Minigame</h2>
            <div className="space-y-2">
              {minigames.map(minigame => {
                const isActive = new Date() >= new Date(minigame.startTime) && new Date() <= new Date(minigame.endTime);
                
                return (
                  <div
                    key={minigame._id}
                    onClick={() => handleMinigameSelect(minigame)}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedMinigame?._id === minigame._id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <h3 className="font-medium">{minigame.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">Max: {minigame.maxNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedMinigame && minigameData ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-4">
                  <div className="flex items-center">
                    <TicketIcon className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <div className="text-2xl font-bold">{minigameData.ticketStats.takenTickets}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</div>
                    </div>
                  </div>
                </div>
                
                <div className="card p-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.round((minigameData.ticketStats.takenTickets / selectedMinigame.maxNumber) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Fill Rate</div>
                    </div>
                  </div>
                </div>
                
                <div className="card p-4">
                  <div className="flex items-center">
                    <UserIcon className="w-8 h-8 text-purple-500 mr-3" />
                    <div>
                      <div className="text-2xl font-bold">
                        {new Set(minigameData.tickets.map(t => t.user?._id)).size}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Unique Users</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Number Matrix */}
              <div className="card p-6">
                {renderNumberMatrix()}
              </div>

              {/* Participants List */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Participants</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Registered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {minigameData.tickets.map(ticket => (
                        <tr key={ticket._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {ticket.user?.photoURL ? (
                                <img 
                                  src={ticket.user.photoURL} 
                                  alt={ticket.user.displayName}
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                  <UserIcon className="w-4 h-4 text-gray-600" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium">{ticket.user?.displayName}</div>
                                <div className="text-sm text-gray-500">{ticket.user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-bold">
                              {ticket.number}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(ticket.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedTicketDetails(ticket)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-12 text-center">
              <TrophyIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Minigame</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a minigame from the left to view its results and analytics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicketDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ticket Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    #{selectedTicketDetails.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lucky Number</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">User Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="flex items-center mb-2">
                    {selectedTicketDetails.user?.photoURL ? (
                      <img 
                        src={selectedTicketDetails.user.photoURL} 
                        alt={selectedTicketDetails.user.displayName}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{selectedTicketDetails.user?.displayName}</div>
                      <div className="text-sm text-gray-500">{selectedTicketDetails.user?.email}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Registration Time</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(selectedTicketDetails.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedTicketDetails(null)}
              className="mt-6 btn btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMinigameResultsPage;
