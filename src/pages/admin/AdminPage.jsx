import { Navigate } from 'react-router-dom';

import { useDocumentMeta } from '../../hooks/useDocumentMeta';
const AdminPage = () => {
   useDocumentMeta({
       title: "Admin Page",
       description: "Manage your application settings",
   });
  // Redirect to dashboard
  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminPage;
