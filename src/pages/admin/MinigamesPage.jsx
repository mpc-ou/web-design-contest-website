import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  PuzzlePieceIcon, 
  PlusIcon,
  PencilSquareIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminMinigamesPage = () => {
  const [minigames, setMinigames] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMinigame, setEditingMinigame] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contest: '',
    startTime: '',
    endTime: '',
    maxNumber: 100
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [minigamesResponse, contestsResponse] = await Promise.all([
        apiService.getMinigames(),
        apiService.getContests()
      ]);
      setMinigames(minigamesResponse.data);
      setContests(contestsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load minigames');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMinigame) {
        await apiService.updateMinigame(editingMinigame._id, formData);
        setSuccess('Minigame updated successfully');
      } else {
        await apiService.createMinigame(formData);
        setSuccess('Minigame created successfully');
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving minigame:', err);
      setError(err.response?.data?.error || 'Failed to save minigame');
    }
  };

  const handleEdit = (minigame) => {
    setEditingMinigame(minigame);
    setFormData({
      name: minigame.name,
      contest: minigame.contest,
      startTime: new Date(minigame.startTime).toISOString().slice(0, 16),
      endTime: new Date(minigame.endTime).toISOString().slice(0, 16),
      maxNumber: minigame.maxNumber
    });
    setShowForm(true);
  };

  const handleDelete = async (minigameId) => {
    try {
      await apiService.deleteMinigame(minigameId);
      setMinigames(minigames.filter(m => m._id !== minigameId));
      setDeleteConfirm(null);
      setSuccess('Minigame deleted successfully');
    } catch (err) {
      console.error('Error deleting minigame:', err);
      setError('Failed to delete minigame');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', contest: '', startTime: '', endTime: '', maxNumber: 100
    });
    setEditingMinigame(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const value = e.target.name === 'maxNumber' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const getContestName = (contest) => {
    const contestObj = contests.find(c => c._id === contest);
    return contestObj ? contestObj.name : 'Unknown Contest';
  };

  const isMinigameActive = (minigame) => {
    const now = new Date();
    const startTime = new Date(minigame.startTime);
    const endTime = new Date(minigame.endTime);
    return now >= startTime && now <= endTime;
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Minigames</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Minigame
        </button>
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

      {/* Minigame Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMinigame ? 'Edit Minigame' : 'Create Minigame'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Minigame Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Lucky Number Draw"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Contest</label>
                <select
                  name="contest"
                  value={formData.contest}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select a contest</option>
                  {contests.map(contest => (
                    <option key={contest._id} value={contest._id}>
                      {contest.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Maximum Number</label>
                <input
                  type="number"
                  name="maxNumber"
                  value={formData.maxNumber}
                  onChange={handleChange}
                  required
                  min="1"
                  max="1000"
                  className="input"
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn btn-primary">
                  {editingMinigame ? 'Update' : 'Create'} Minigame
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Minigames Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Minigame
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {minigames.map(minigame => {
                const isActive = isMinigameActive(minigame);
                
                return (
                  <tr key={minigame._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{minigame.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getContestName(minigame.contest)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(minigame.startTime).toLocaleString()}</div>
                      <div>{new Date(minigame.endTime).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      1 - {minigame.maxNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(minigame)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(minigame._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {minigames.length === 0 && (
        <div className="text-center py-10">
          <PuzzlePieceIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Minigames</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first minigame to engage contest participants.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this minigame? This action cannot be undone and will also delete all associated lucky tickets.
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

export default AdminMinigamesPage;
