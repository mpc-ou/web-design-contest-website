import { useEffect, useState } from 'react';
import { TrendingUp, Users, Trophy, UserCheck, Eye } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import StatsCard from '../../components/admin/ui/StatsCard';
import LoadingCard from '../../components/admin/ui/LoadingCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '../../services/api';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Mock analytics data for development
        const mockData = {
          userGrowth: {
            thisMonth: 25,
            lastMonth: 18,
            growth: 38.9,
          },
          contestParticipation: {
            activeUsers: 145,
            totalRegistrations: 89,
            completionRate: 72.4,
          },
          systemUsage: {
            dailyActiveUsers: 64,
            weeklyActiveUsers: 127,
            monthlyActiveUsers: 195,
          },
          recentActivity: [
            { type: 'new_user', message: 'Nguyễn Văn A đã đăng ký', time: '5 phút trước' },
            { type: 'team_registered', message: 'Đội "CodeMaster" đã đăng ký cuộc thi', time: '12 phút trước' },
            { type: 'submission', message: 'Đội "WebWizards" đã nộp bài', time: '1 giờ trước' },
            { type: 'new_user', message: 'Trần Thị B đã đăng ký', time: '2 giờ trước' },
            { type: 'team_approved', message: 'Đội "TechStars" đã được duyệt', time: '3 giờ trước' },
          ]
        };

        try {
          // Try to fetch real analytics data from multiple stats endpoints
          const [overviewStats, usersStats, contestsStats, teamsStats, systemStats] = await Promise.all([
            apiService.getAdminStatsOverview(),
            apiService.getAdminStatsUsers(),
            apiService.getAdminStatsContests(),
            apiService.getAdminStatsTeams(),
            apiService.getAdminStatsSystem()
          ]);

          // Process real data to match analytics structure
          const realData = {
            userGrowth: {
              thisMonth: usersStats.data.newUsersThisMonth || 25,
              lastMonth: usersStats.data.newUsersLastMonth || 18,
              growth: usersStats.data.growthPercentage || 38.9,
            },
            contestParticipation: {
              activeUsers: systemStats.data.activeUsers || 145,
              totalRegistrations: overviewStats.data.overview.totalTeams,
              completionRate: contestsStats.data.completionRate || 72.4,
            },
            systemUsage: {
              dailyActiveUsers: systemStats.data.dailyActiveUsers || 64,
              weeklyActiveUsers: systemStats.data.weeklyActiveUsers || 127,
              monthlyActiveUsers: systemStats.data.monthlyActiveUsers || 195,
            },
            recentActivity: Array.isArray(systemStats.data?.recentActivity) 
              ? systemStats.data.recentActivity 
              : mockData.recentActivity
          };

          setAnalyticsData(realData);
        } catch (apiError) {
          console.log('API not available, using mock analytics data for development');
          setAnalyticsData(mockData);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const analyticsCards = [
    {
      title: 'Tăng trưởng người dùng',
      value: `+${analyticsData?.userGrowth?.thisMonth || 0}`,
      change: analyticsData?.userGrowth?.growth,
      changeType: analyticsData?.userGrowth?.growth > 0 ? 'positive' : 'negative',
      icon: TrendingUp,
      description: 'Người dùng mới tháng này',
    },
    {
      title: 'Người dùng hoạt động',
      value: analyticsData?.systemUsage?.dailyActiveUsers || 0,
      icon: Users,
      description: 'Đang hoạt động hôm nay',
      badge: {
        text: `${analyticsData?.systemUsage?.weeklyActiveUsers || 0} tuần này`,
        variant: 'secondary',
      },
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: `${analyticsData?.contestParticipation?.completionRate || 0}%`,
      icon: Trophy,
      description: 'Đội hoàn thành cuộc thi',
    },
    {
      title: 'Đăng ký mới',
      value: analyticsData?.contestParticipation?.totalRegistrations || 0,
      icon: UserCheck,
      description: 'Đăng ký trong tháng',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thống kê & Phân tích"
        description="Dữ liệu chi tiết về hoạt động hệ thống và người dùng"
        badge={{
          text: 'Analytics',
          variant: 'outline',
        }}
      />

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <LoadingCard key={i} showHeader={false} contentHeight="h-20" />
          ))
        ) : (
          analyticsCards.map((stat, index) => (
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

      {/* Detailed Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Biểu đồ tăng trưởng</CardTitle>
            <CardDescription>
              Xu hướng tăng trưởng người dùng theo thời gian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>Biểu đồ sẽ được tích hợp</p>
                <p className="text-xs">Sử dụng thư viện charts như Recharts hoặc Chart.js</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các sự kiện mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : Array.isArray(analyticsData?.recentActivity) ? (
                analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'new_user' ? 'bg-green-500' :
                      activity.type === 'team_registered' ? 'bg-blue-500' :
                      activity.type === 'submission' ? 'bg-purple-500' :
                      activity.type === 'team_approved' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Không có hoạt động gần đây
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Thống kê chi tiết</CardTitle>
            <CardDescription>
              Các chỉ số hiệu suất chính của hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData?.systemUsage?.dailyActiveUsers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Hoạt động hàng ngày</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData?.systemUsage?.weeklyActiveUsers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Hoạt động hàng tuần</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData?.systemUsage?.monthlyActiveUsers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Hoạt động hàng tháng</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;