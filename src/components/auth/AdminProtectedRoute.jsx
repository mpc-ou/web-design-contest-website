import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminProtectedRoute = () => {
  const { currentUser, userInfo, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập vào khu vực quản trị.</p>
          <Navigate to="/" />
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminProtectedRoute;