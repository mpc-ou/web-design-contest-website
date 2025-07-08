import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  TicketIcon, 
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';

const AdminLuckyTicketsPage = () => {
  const [luckyTickets, setLuckyTickets] = useState([]);
  const [minigames, setMinigames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterMinigame, setFilterMinigame] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsResponse, minigamesResponse] = await Promise.all([
        apiService.getLuckyTickets(),
        apiService.getMinigames()
      ]);
      setLuckyTickets(ticketsResponse.data);
      setMinigames(minigamesResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load lucky tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticketId) => {
    try {
      await apiService.deleteLuckyTicket(ticketId);
      setLuckyTickets(luckyTickets.filter(t => t._id !== ticketId));
      setDeleteConfirm(null);
      setSuccess('Lucky ticket deleted successfully');
    } catch (err) {
      console.error('Error deleting lucky ticket:', err);
      setError('Failed to delete lucky ticket');
    }
  };

  const getMinigameName = (minigameId) => {
    const minigame = minigames.find(m => m._id === minigameId);
    return minigame ? minigame.name : 'Unknown Minigame';
  };

  const filteredTickets = luckyTickets.filter(ticket => {
    const matchesMinigame = !filterMinigame || ticket.minigame === filterMinigame;
    const matchesSearch = !searchTerm || 
      ticket.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.number?.toString().includes(searchTerm);
    return matchesMinigame && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lucky Tickets</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-64"
          />
          <select
            value={filterMinigame}
            onChange={(e) => setFilterMinigame(e.target.value)}
            className="input"
          >
            <option value="">All Minigames</option>
            {minigames.map(minigame => (
              <option key={minigame._id} value={minigame._id}>
                {minigame.name}
              </option>
            ))}
          </select>
        </div>
      </div>

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

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Minigame
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lucky Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map(ticket => (
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
                        <div className="text-sm font-medium">{ticket.user?.displayName || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">{ticket.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getMinigameName(ticket.minigame)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-bold">
                      {ticket.number}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(ticket._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-10">
          <TicketIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Lucky Tickets</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterMinigame ? 'No tickets match your filters.' : 'No lucky tickets have been registered yet.'}
          </p>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Lucky Ticket Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  User Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded mt-2">
                  <div className="flex items-center mb-2">
                    {selectedTicket.user?.photoURL ? (
                      <img 
                        src={selectedTicket.user.photoURL} 
                        alt={selectedTicket.user.displayName}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{selectedTicket.user?.displayName || 'Unknown User'}</div>
                      <div className="text-sm text-gray-500">{selectedTicket.user?.email}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium flex items-center">
                  <HashtagIcon className="w-4 h-4 mr-2" />
                  Lucky Number
                </h3>
                <div className="mt-2">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg text-lg font-bold">
                    {selectedTicket.number}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Minigame</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {getMinigameName(selectedTicket.minigame)}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Registration Time
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedTicket(null)}
              className="mt-6 btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this lucky ticket? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn btn-danger flex items-center"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
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

export default AdminLuckyTicketsPage;
