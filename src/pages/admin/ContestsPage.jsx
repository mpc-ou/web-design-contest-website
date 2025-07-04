import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminContestsPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContest, setEditingContest] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    registrationStart: '',
    registrationEnd: '',
    round1Start: '',
    round1End: '',
    finalStart: '',
    finalEnd: ''
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await apiService.getContests();
      setContests(response.data);
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContest) {
        await apiService.updateContest(editingContest._id, formData);
        setSuccess('Contest updated successfully');
      } else {
        await apiService.createContest(formData);
        setSuccess('Contest created successfully');
      }
      
      resetForm();
      fetchContests();
    } catch (err) {
      console.error('Error saving contest:', err);
      setError(err.response?.data?.error || 'Failed to save contest');
    }
  };

  const handleEdit = (contest) => {
    setEditingContest(contest);
    setFormData({
      code: contest.code,
      name: contest.name,
      description: contest.description,
      startTime: new Date(contest.startTime).toISOString().slice(0, 16),
      endTime: new Date(contest.endTime).toISOString().slice(0, 16),
      registrationStart: new Date(contest.registrationStart).toISOString().slice(0, 16),
      registrationEnd: new Date(contest.registrationEnd).toISOString().slice(0, 16),
      round1Start: new Date(contest.round1Start).toISOString().slice(0, 16),
      round1End: new Date(contest.round1End).toISOString().slice(0, 16),
      finalStart: new Date(contest.finalStart).toISOString().slice(0, 16),
      finalEnd: new Date(contest.finalEnd).toISOString().slice(0, 16)
    });
    setShowForm(true);
  };

  const handleDelete = async (contestId) => {
    try {
      await apiService.deleteContest(contestId);
      setContests(contests.filter(c => c._id !== contestId));
      setDeleteConfirm(null);
      setSuccess('Contest deleted successfully');
    } catch (err) {
      console.error('Error deleting contest:', err);
      setError('Failed to delete contest');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '', name: '', description: '', startTime: '', endTime: '',
      registrationStart: '', registrationEnd: '', round1Start: '', round1End: '',
      finalStart: '', finalEnd: ''
    });
    setEditingContest(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <h1 className="text-3xl font-bold">Manage Contests</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Contest
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

      {/* Contest Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingContest ? 'Edit Contest' : 'Create Contest'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contest Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contest Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Registration Start</label>
                  <input
                    type="datetime-local"
                    name="registrationStart"
                    value={formData.registrationStart}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Registration End</label>
                  <input
                    type="datetime-local"
                    name="registrationEnd"
                    value={formData.registrationEnd}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contest Start</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contest End</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Round 1 Start</label>
                  <input
                    type="datetime-local"
                    name="round1Start"
                    value={formData.round1Start}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Round 1 End</label>
                  <input
                    type="datetime-local"
                    name="round1End"
                    value={formData.round1End}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Final Start</label>
                  <input
                    type="datetime-local"
                    name="finalStart"
                    value={formData.finalStart}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Final End</label>
                  <input
                    type="datetime-local"
                    name="finalEnd"
                    value={formData.finalEnd}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn btn-primary">
                  {editingContest ? 'Update' : 'Create'} Contest
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

      {/* Contests Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Registration Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contest Period
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
              {contests.map(contest => {
                const now = new Date();
                const regStart = new Date(contest.registrationStart);
                const regEnd = new Date(contest.registrationEnd);
                const contestEnd = new Date(contest.endTime);
                
                let status = 'upcoming';
                if (now >= regStart && now <= regEnd) status = 'registration';
                else if (now > regEnd && now <= contestEnd) status = 'active';
                else if (now > contestEnd) status = 'completed';

                return (
                  <tr key={contest._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">{contest.name}</div>
                        <div className="text-sm text-gray-500">Code: {contest.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contest.registrationStart).toLocaleDateString()} -
                      {new Date(contest.registrationEnd).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contest.startTime).toLocaleDateString()} -
                      {new Date(contest.endTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        status === 'registration' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(contest)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(contest._id)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this contest? This action cannot be undone.
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

export default AdminContestsPage;