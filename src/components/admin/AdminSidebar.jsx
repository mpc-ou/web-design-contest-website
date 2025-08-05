import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Trophy,
  UserCheck,
  Users2,
  BarChart3,
  FileDown,
  Settings,
  Image,
  Gamepad2,
  Building2,
  Bell,
  Upload,
  HelpCircle,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Tổng quan',
    items: [
      {
        title: 'Dashboard',
        url: '/admin',
        icon: LayoutDashboard,
      },
      {
        title: 'Thống kê',
        url: '/admin/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Quản lý người dùng',
    items: [
      {
        title: 'Người dùng',
        url: '/admin/users',
        icon: Users,
      },
    ],
  },
  {
    title: 'Quản lý cuộc thi',
    items: [
      {
        title: 'Cuộc thi',
        url: '/admin/contests',
        icon: Trophy,
      },
      {
        title: 'Form đăng ký',
        url: '/admin/registrations',
        icon: UserCheck,
      },
      {
        title: 'Bài nộp',
        url: '/admin/submissions',
        icon: Upload,
      },
      {
        title: 'Đội thi',
        url: '/admin/teams',
        icon: Users2,
      },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      {
        title: 'Triển lãm',
        url: '/admin/exhibitions',
        icon: Image,
      },
      {
        title: 'Minigames',
        url: '/admin/minigames',
        icon: Gamepad2,
      },
      {
        title: 'Nhà tài trợ',
        url: '/admin/sponsors',
        icon: Building2,
      },
      {
        title: 'Thông báo',
        url: '/admin/notifications',
        icon: Bell,
      },
    ],
  },
  {
    title: 'Báo cáo',
    items: [
      {
        title: 'Xuất báo cáo',
        url: '/admin/reports',
        icon: FileDown,
      },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      {
        title: 'FAQ',
        url: '/admin/faqs',
        icon: HelpCircle,
      },
      {
        title: 'Cài đặt',
        url: '/admin/settings',
        icon: Settings,
      },
    ],
  },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-4">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Admin Panel</span>
            <span className="truncate text-xs text-muted-foreground">
              Web Design Contest
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <div className="p-4 text-xs text-muted-foreground">
          Admin Dashboard v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;