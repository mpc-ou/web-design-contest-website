import { Outlet } from 'react-router-dom';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
  return (
    <div className="h-screen">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="flex flex-col h-full">
          <AdminHeader />
          <div className="flex-1 overflow-auto p-4 min-h-0">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
