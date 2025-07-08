import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  PuzzlePieceIcon,
  TicketIcon,
  ArrowPathIcon,
  GiftIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const MinigamePage = () => {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState('');
  const [minigames, setMinigames] = useState([]);
  const [selectedMinigame, setSelectedMinigame] = useState(null);
  const [minigameData, setMinigameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const minigamesResponse = await apiService.getMinigames();
        setMinigames(minigamesResponse.data);
      } catch (err) {
        console.error('Error fetching minigames:', err);
        setError('Failed to load minigames. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedMinigame(null);
    setMinigameData(null);
    setSelectedNumber(null);
    setError('');
    setSuccess('');
  }, []);

  useEffect(() => {
    if (selectedMinigame) {
      fetchMinigameData(selectedMinigame._id);
    } else {
      setMinigameData(null);
    }
  }, [selectedMinigame]);
  
  const fetchMinigames = async (contestId) => {
    try {
      setLoading(true);
      const response = await apiService.getMinigamesByContest(contestId);
      setMinigames(response.data);
      // Auto-select first active minigame
      const activeMinigame = response.data.find(mg => isMinigameActive(mg));
      if (activeMinigame) {
        setSelectedMinigame(activeMinigame);
      } else {
        setSelectedMinigame(null);
      }
    } catch (err) {
      console.error('Error fetching minigames:', err);
      setError('Failed to load minigames. Please try again later.');
      setMinigames([]);
      setSelectedMinigame(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMinigameData = async (minigameId) => {
    try {
      const response = await apiService.getMinigameTicketInfo(minigameId);
      setMinigameData(response.data);
    } catch (err) {
      console.error('Error fetching minigame data:', err);
      setError('Failed to load minigame data.');
      setMinigameData(null);
    }
  };
  
  const handleContestChange = (e) => {
    setSelectedContest(e.target.value);
    setSelectedMinigame(null);
    setMinigameData(null);
    setSelectedNumber(null);
    setError('');
    setSuccess('');
  };
  
  const handleMinigameChange = (minigame) => {
    setSelectedMinigame(minigame);
    setSelectedNumber(null);
    setError('');
    setSuccess('');
  };

  const handleNumberSelect = (number) => {
    if (!minigameData || minigameData.ticketStats.takenNumbers.includes(number)) return;
    
    // Check if user already has a ticket for this minigame
    const userHasTicket = minigameData.userTickets && minigameData.userTickets.length > 0;
    
    if (userHasTicket) {
      setError('You already have a ticket for this minigame.');
      return;
    }
    
    setSelectedNumber(number);
    setError('');
  };
  
  const handleSubmit = async () => {
    if (!selectedMinigame || !selectedNumber) {
      setError('Please select a minigame and number');
      return;
    }
    
    setError('');
    setSuccess('');
    setRegistering(true);
    
    try {
      await apiService.registerLuckyTicket({
        minigameId: selectedMinigame._id,
        number: selectedNumber
      });
      
      setSelectedNumber(null);
      setSuccess('Lucky number registered successfully!');
      
      // Refresh minigame data
      await fetchMinigameData(selectedMinigame._id);
    } catch (err) {
      console.error('Error registering ticket:', err);
      setError(err.response?.data?.error || 'Failed to register number. Please try again.');
    } finally {
      setRegistering(false);
    }
  };
  
  const isMinigameActive = (minigame) => {
    const now = new Date();
    const startTime = new Date(minigame.startTime);
    const endTime = new Date(minigame.endTime);
    return now >= startTime && now <= endTime;
  };

  const renderNumberMatrix = () => {
    if (!selectedMinigame || !minigameData) return null;

    const { ticketStats, userTickets } = minigameData;
    const takenNumbers = ticketStats.takenNumbers || [];
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
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Your Lucky Number</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded mr-2"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 dark:bg-red-800 rounded mr-2"></div>
              <span>Taken</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
        
        <div className="grid gap-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 justify-center">
              {row.map(number => {
                const isTaken = takenNumbers.includes(number);
                const isSelected = selectedNumber === number;
                const userHasTicket = userTickets && userTickets.length > 0;
                
                return (
                  <button
                    key={number}
                    onClick={() => handleNumberSelect(number)}
                    disabled={isTaken || userHasTicket || !isMinigameActive(selectedMinigame)}
                    className={`
                      w-12 h-12 rounded-lg text-sm font-bold transition-all duration-200
                      ${isTaken 
                        ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 cursor-not-allowed' 
                        : isSelected
                        ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 hover:shadow-md'
                      }
                      ${userHasTicket ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {isTaken ? (
                      <XMarkIcon className="w-4 h-4 mx-auto" />
                    ) : (
                      number
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        
        {selectedNumber && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                  Selected Number: {selectedNumber}
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Confirm your selection to register this lucky number
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmit}
                  disabled={registering}
                  className="btn btn-primary flex items-center"
                >
                  {registering ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Confirm
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedNumber(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Lucky Number Minigame</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : minigames.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No minigames available.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Minigame Selection */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Available Minigames</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {minigames.map(minigame => {
                const isActive = isMinigameActive(minigame);
                const userHasTicket = minigameData?.userTickets && 
                  minigameData.userTickets.length > 0 && 
                  selectedMinigame?._id === minigame._id;
                return (
                  <div 
                    key={minigame._id}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedMinigame?._id === minigame._id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                      ${!isActive ? 'opacity-50' : ''}
                    `}
                    onClick={() => handleMinigameChange(minigame)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{minigame.name}</h3>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                        {userHasTicket && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Registered
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Numbers: 1 - {minigame.maxNumber}
                    </p>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                      <div>Start: {new Date(minigame.startTime).toLocaleString()}</div>
                      <div>End: {new Date(minigame.endTime).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Number Matrix */}
          {selectedMinigame && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedMinigame.name}</h2>
                <button
                  onClick={() => fetchMinigameData(selectedMinigame._id)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Refresh numbers"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
              </div>
              {renderNumberMatrix()}
            </div>
          )}

          {/* User's Tickets */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <GiftIcon className="h-6 w-6 text-purple-500 mr-2" />
                <h2 className="text-xl font-semibold">Your Tickets</h2>
              </div>
            </div>
            
            {!minigameData?.userTickets || minigameData.userTickets.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded">
                <TicketIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  No tickets registered yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {minigameData.userTickets.map(ticket => (
                  <div 
                    key={ticket._id}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg p-4 border border-purple-200 dark:border-purple-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-2xl text-purple-600 dark:text-purple-400">
                        #{ticket.number}
                      </div>
                      <TicketIcon className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedMinigame?.name || 'Unknown Minigame'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Registered: {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MinigamePage;
