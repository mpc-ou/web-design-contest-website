import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  TrophyIcon, 
  TicketIcon,
  UserIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

const AdminLuckyDrawPage = () => {
  const [minigames, setMinigames] = useState([]);
  const [selectedMinigame, setSelectedMinigame] = useState(null);
  const [minigameData, setMinigameData] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [lastWinner, setLastWinner] = useState(null);

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

  const fetchMinigameData = async (minigameId) => {
    try {
      const [ticketResponse, winnersResponse] = await Promise.all([
        apiService.getMinigameTicketInfo(minigameId),
        apiService.getWinners(minigameId)
      ]);
      setMinigameData(ticketResponse.data);
      setWinners(winnersResponse.data);
    } catch (err) {
      console.error('Error fetching minigame data:', err);
      setError('Failed to load minigame data');
    }
  };

  const handleMinigameSelect = (minigame) => {
    setSelectedMinigame(minigame);
    setError('');
    setSuccess('');
    setLastWinner(null);
    fetchMinigameData(minigame._id);
  };

  const handleDrawWinner = async () => {
    if (!selectedMinigame) return;

    setDrawing(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.drawWinner(selectedMinigame._id);
      setLastWinner(response.data.winner);
      setSuccess(`Winner drawn! Lucky number ${response.data.winner.number} - ${response.data.winner.user.displayName}`);
      
      // Refresh data
      await fetchMinigameData(selectedMinigame._id);
    } catch (err) {
      console.error('Error drawing winner:', err);
      setError(err.response?.data?.error || 'Failed to draw winner');
    } finally {
      setDrawing(false);
    }
  };

  const handleResetWinners = async () => {
    if (!selectedMinigame) return;

    setResetting(true);
    setError('');
    setSuccess('');

    try {
      await apiService.resetWinners(selectedMinigame._id);
      setSuccess('All winners have been reset successfully');
      setWinners([]);
      setLastWinner(null);
      setShowResetConfirm(false);
      
      // Refresh data
      await fetchMinigameData(selectedMinigame._id);
    } catch (err) {
      console.error('Error resetting winners:', err);
      setError(err.response?.data?.error || 'Failed to reset winners');
    } finally {
      setResetting(false);
    }
  };

  const renderNumberMatrix = () => {
    if (!selectedMinigame || !minigameData) return null;

    const { tickets, ticketStats } = minigameData;
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
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Registered</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span>Winner</span>
            </div>
          </div>
        </div>
        
        <div className="grid gap-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 justify-center">
              {row.map(number => {
                const ticket = tickets.find(t => t.number === number);
                const isWinner = winners.some(w => w.number === number);
                const isLastWinner = lastWinner && lastWinner.number === number;
                
                return (
                  <div
                    key={number}
                    className={`
                      w-12 h-12 rounded-lg text-sm font-bold flex items-center justify-center
                      transition-all duration-200 relative
                      ${isWinner 
                        ? 'bg-yellow-500 text-white shadow-lg' 
                        : ticket
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                      }
                      ${isLastWinner ? 'animate-pulse ring-4 ring-yellow-300' : ''}
                    `}
                    title={
                      isWinner ? `Winner: ${ticket?.user?.displayName}` :
                      ticket ? `Registered by ${ticket.user?.displayName}` : 
                      'Available'
                    }
                  >
                    {number}
                    {isWinner && (
                      <TrophyIcon className="absolute -top-1 -right-1 w-4 h-4 text-yellow-600" />
                    )}
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
      <h1 className="text-3xl font-bold mb-6">Lucky Draw Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {success}
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
              {/* Controls */}
              <div className="card p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedMinigame.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">Lucky Draw Controls</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDrawWinner}
                      disabled={drawing || minigameData.ticketStats.takenTickets === 0}
                      className="btn btn-primary flex items-center"
                    >
                      {drawing ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Drawing...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5 mr-2" />
                          Draw Winner
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      disabled={winners.length === 0}
                      className="btn btn-danger flex items-center"
                    >
                      <ArrowPathIcon className="w-5 h-5 mr-2" />
                      Reset Winners
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <GiftIcon className="w-8 h-8 text-yellow-500 mr-3" />
                    <div>
                      <div className="text-2xl font-bold">{winners.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Winners</div>
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

              {/* Last Winner Display */}
              {lastWinner && (
                <div className="card p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">🎉 Winner Drawn! 🎉</h3>
                      <div className="bg-yellow-500 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold">{lastWinner.number}</span>
                      </div>
                      <div className="text-lg font-semibold">{lastWinner.user.displayName}</div>
                      <div className="text-gray-600 dark:text-gray-400">{lastWinner.user.email}</div>
                      <div className="text-sm text-gray-500 mt-2">
                        Drawn at {new Date(lastWinner.drawnAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Number Matrix */}
              <div className="card p-6">
                {renderNumberMatrix()}
              </div>

              {/* Winners List */}
              {winners.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Winners List</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {winners.map((winner, index) => (
                      <div key={winner._id} className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Winner #{index + 1}
                          </span>
                          <TrophyIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                            #{winner.number}
                          </div>
                          <div className="font-medium">{winner.user.displayName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{winner.user.email}</div>
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(winner.drawnAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center">
              <SparklesIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Minigame</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a minigame from the left to start the lucky draw.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-2" />
              Confirm Reset
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to reset all winners for this minigame? This action cannot be undone and will allow all tickets to be eligible for drawing again.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={handleResetWinners}
                disabled={resetting}
                className="btn btn-danger flex items-center"
              >
                {resetting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Yes, Reset
                  </>
                )}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn btn-secondary flex items-center"
              >
                <XCircleIcon className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLuckyDrawPage;
