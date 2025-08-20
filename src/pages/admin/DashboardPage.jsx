import { useEffect, useState } from 'react';
import { Users, Trophy, UserCheck, Building2, TrendingUp, Eye } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import StatsCard from '../../components/admin/ui/StatsCard';
import LoadingCard from '../../components/admin/ui/LoadingCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '../../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch real data from API
        const overviewResponse = await apiService.getAdminStatsOverview();
        const overview = overviewResponse.data;
        
        // Process overview data to match our dashboard structure
        const processedStats = {
          users: {
            totalUsers: overview.overview?.totalUsers || 0,
            monthlyGrowth: calculateMonthlyGrowth(overview.registrationsByMonth),
            activeUsers: overview.overview?.totalUsers || 0,
          },
          contests: {
            totalContests: overview.overview?.totalContests || 0,
            monthlyGrowth: 0,
            activeContests: overview.contestsByStatus?.find(c => c._id === 'active')?.count || 0,
            newSubmissions: overview.overview?.totalSubmissions || 0,
          },
          teams: {
            totalTeams: overview.overview?.totalTeams || 0,
            monthlyGrowth: calculateMonthlyGrowth(overview.registrationsByMonth),
            newRegistrations: overview.teamsByStatus?.find(t => t._id === 'registered')?.count || 0,
          },
          sponsors: {
            totalActiveSponsors: overview.overview?.totalSponsors || 0,
          },
          analytics: {
            pageViews: overview.overview?.totalUsers ? overview.overview.totalUsers * 5 : 0,
          }
        };
        
        setStats(processedStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty stats if API fails
        setStats({
          users: { totalUsers: 0, monthlyGrowth: 0, activeUsers: 0 },
          contests: { totalContests: 0, monthlyGrowth: 0, activeContests: 0, newSubmissions: 0 },
          teams: { totalTeams: 0, monthlyGrowth: 0, newRegistrations: 0 },
          sponsors: { totalActiveSponsors: 0 },
          analytics: { pageViews: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateMonthlyGrowth = (monthlyData) => {
    if (!monthlyData || monthlyData.length < 2) return 0;
    
    const lastMonth = monthlyData[monthlyData.length - 1]?.count || 0;
    const prevMonth = monthlyData[monthlyData.length - 2]?.count || 1;
    
    return prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;
  };

  const statsCards = [
    {
      title: 'Tổng người dùng',
      value: stats?.users?.totalUsers || 0,
      change: stats?.users?.monthlyGrowth,
      changeType: stats?.users?.monthlyGrowth > 0 ? 'positive' : 'negative',
      icon: Users,
      description: '',
    },
    {
      title: 'Cuộc thi',
      value: stats?.contests?.totalContests || 0,
      change: stats?.contests?.monthlyGrowth,
      changeType: stats?.contests?.monthlyGrowth > 0 ? 'positive' : 'negative',
      icon: Trophy,
      badge: {
        text: `${stats?.contests?.activeContests || 0} đang diễn ra`,
        variant: 'secondary',
      },
    },
    {
      title: 'Đội thi',
      value: stats?.teams?.totalTeams || 0,
      change: stats?.teams?.monthlyGrowth,
      changeType: stats?.teams?.monthlyGrowth > 0 ? 'positive' : 'negative',
      icon: UserCheck,
      description: '',
    },
    {
      title: 'Nhà tài trợ',
      value: stats?.sponsors?.totalActiveSponsors || 0,
      icon: Building2,
      description: 'Đối tác tài trợ hiện tại',
    },
  ];

  return (
    <div className="space-y-6 max-h-full overflow-auto">
      <PageHeader
        title="Dashboard"
        description="Tổng quan hệ thống quản lý cuộc thi thiết kế web"
        badge={{
          text: 'Admin',
          variant: 'outline',
        }}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <LoadingCard key={i} showHeader={false} contentHeight="h-20" />
          ))
        ) : (
          statsCards.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              description={stat.description}
              badge={stat.badge}
              loading={loading}
            />
          ))
        )}
      </div>

      {/* Additional Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pb-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các hoạt động mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Chức năng sẽ được phát triển
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
            <CardDescription>
              Số liệu quan trọng trong tháng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Đăng ký mới</span>
                    <span className="font-medium">{stats?.teams?.newRegistrations || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Bài nộp</span>
                    <span className="font-medium">{stats?.contests?.newSubmissions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Người dùng hoạt động</span>
                    <span className="font-medium">{stats?.users?.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Lượt truy cập</span>
                    <span className="font-medium">{stats?.analytics?.pageViews || 0}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;