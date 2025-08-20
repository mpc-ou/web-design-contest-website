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
    <div className="min-h-screen w-full flex flex-col">
      <SidebarProvider>
        <div className="flex-1 flex min-h-0">
          <AdminSidebar />
          <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <AdminHeader />
            <main className="flex-1 overflow-auto">
              <div className="p-4 max-w-full">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
