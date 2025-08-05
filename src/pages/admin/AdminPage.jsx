import { Navigate } from 'react-router-dom';

const AdminPage = () => {
  // Redirect to dashboard
  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminPage;
