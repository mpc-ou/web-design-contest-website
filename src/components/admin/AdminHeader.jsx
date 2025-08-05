import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';

const getBreadcrumbFromPath = (pathname) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbMap = {
    admin: 'Admin',
    users: 'Người dùng',
    contests: 'Cuộc thi',
    registrations: 'Đăng ký',
    teams: 'Đội thi',
    exhibitions: 'Triển lãm',
    minigames: 'Minigames',
    sponsors: 'Nhà tài trợ',
    notifications: 'Thông báo',
    reports: 'Báo cáo',
    analytics: 'Thống kê',
    settings: 'Cài đặt',
  };

  const breadcrumbs = pathSegments.map(segment => breadcrumbMap[segment] || segment);
  
  return breadcrumbs;
};

const AdminHeader = () => {
  const location = useLocation();
  const { userInfo, signOut } = useAuth();
  const breadcrumbs = getBreadcrumbFromPath(location.pathname);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href="#">{breadcrumb}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                <AvatarFallback>
                  {userInfo?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userInfo?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userInfo?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Hồ sơ</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;