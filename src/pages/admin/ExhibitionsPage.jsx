import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  TrophyIcon, 
  PlusIcon,
  PencilSquareIcon, 
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminExhibitionsPage = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    teamId: '',
    projectUrl: '',
    description: '',
    award: '',
    images: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [exhibitionsResponse, teamsResponse] = await Promise.all([
        apiService.getExhibitions(),
        apiService.getAllTeams()
      ]);
      setExhibitions(exhibitionsResponse.data);
      setTeams(teamsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load exhibitions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExhibition) {
        await apiService.updateExhibition(editingExhibition._id, formData);
        setSuccess('Exhibition updated successfully');
      } else {
        await apiService.createExhibition(formData);
        setSuccess('Exhibition created successfully');
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving exhibition:', err);
      setError(err.response?.data?.error || 'Failed to save exhibition');
    }
  };

  const handleEdit = (exhibition) => {
    setEditingExhibition(exhibition);
    setFormData({
      teamId: exhibition.team._id,
      projectUrl: exhibition.projectUrl || '',
      description: exhibition.description || '',
      award: exhibition.award || '',
      images: exhibition.images || []
    });
    setShowForm(true);
  };

  const handleDelete = async (exhibitionId) => {
    try {
      await apiService.deleteExhibition(exhibitionId);
      setExhibitions(exhibitions.filter(e => e._id !== exhibitionId));
      setDeleteConfirm(null);
      setSuccess('Exhibition deleted successfully');
    } catch (err) {
      console.error('Error deleting exhibition:', err);
      setError('Failed to delete exhibition');
    }
  };

  const resetForm = () => {
    setFormData({
      teamId: '', projectUrl: '', description: '', award: '', images: []
    });
    setEditingExhibition(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getTeamName = (team) => {
    return team ? team.teamName : 'Unknown Team';
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
        <h1 className="text-3xl font-bold">Manage Exhibitions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Exhibition
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

      {/* Exhibition Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingExhibition ? 'Edit Exhibition' : 'Create Exhibition'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Team</label>
                <select
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select a team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.teamName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Project URL</label>
                <input
                  type="url"
                  name="projectUrl"
                  value={formData.projectUrl}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://example.com"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="input"
                  placeholder="Project description..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Award (optional)</label>
                <select
                  name="award"
                  value={formData.award}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">No award</option>
                  <option value="1st Place">1st Place</option>
                  <option value="2nd Place">2nd Place</option>
                  <option value="3rd Place">3rd Place</option>
                  <option value="Best Design">Best Design</option>
                  <option value="Best Innovation">Best Innovation</option>
                  <option value="People's Choice">People's Choice</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn btn-primary">
                  {editingExhibition ? 'Update' : 'Create'} Exhibition
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

      {/* Exhibitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exhibitions.map(exhibition => (
          <div key={exhibition._id} className="card overflow-hidden">
            <div className="relative pb-[56.25%]">
              {exhibition.images && exhibition.images.length > 0 ? (
                <img
                  src={exhibition.images[0]}
                  alt={`${getTeamName(exhibition.team)} project`}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">No image</span>
                </div>
              )}
              
              {exhibition.award && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                  {exhibition.award}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{getTeamName(exhibition.team)}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {exhibition.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(exhibition.createdAt).toLocaleDateString()}
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(exhibition)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(exhibition._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  {exhibition.projectUrl && (
                    <a
                      href={exhibition.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {exhibitions.length === 0 && (
        <div className="text-center py-10">
          <TrophyIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Exhibitions</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first exhibition to showcase contest projects.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this exhibition? This action cannot be undone.
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

export default AdminExhibitionsPage;
