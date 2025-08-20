import { useState } from 'react';
import { Download, FileText, Users, Trophy, UserCheck, Calendar } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const ReportsPage = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const reportTypes = [
    {
      id: 'users',
      title: 'Báo cáo người dùng',
      description: 'Xuất danh sách tất cả người dùng trong hệ thống',
      icon: Users,
      endpoint: '/admin/reports/users',
      filename: 'users_report',
      color: 'bg-blue-500',
    },
    {
      id: 'contests',
      title: 'Báo cáo cuộc thi',
      description: 'Xuất danh sách tất cả cuộc thi và thông tin',
      icon: Trophy,
      endpoint: '/admin/reports/contests',
      filename: 'contests_report',
      color: 'bg-yellow-500',
    },
    {
      id: 'teams',
      title: 'Báo cáo đội thi',
      description: 'Xuất danh sách đội thi và thông tin tham gia',
      icon: UserCheck,
      endpoint: '/admin/reports/teams',
      filename: 'teams_report',
      color: 'bg-green-500',
    },
    {
      id: 'registrations',
      title: 'Báo cáo đăng ký',
      description: 'Xuất danh sách form đăng ký và trạng thái',
      icon: FileText,
      endpoint: '/admin/reports/registration-forms',
      filename: 'registrations_report',
      color: 'bg-purple-500',
    },
    {
      id: 'submissions',
      title: 'Báo cáo bài nộp',
      description: 'Xuất danh sách tất cả bài nộp theo cuộc thi',
      icon: Calendar,
      endpoint: '/admin/reports/submissions',
      filename: 'submissions_report',
      color: 'bg-red-500',
    },
    {
      id: 'login-history',
      title: 'Báo cáo đăng nhập',
      description: 'Xuất lịch sử đăng nhập của người dùng',
      icon: Users,
      endpoint: '/admin/reports/login-history',
      filename: 'login_history_report',
      color: 'bg-indigo-500',
    },
    {
      id: 'sponsors',
      title: 'Báo cáo nhà tài trợ',
      description: 'Xuất danh sách nhà tài trợ và thông tin hợp tác',
      icon: Trophy,
      endpoint: '/admin/reports/sponsors',
      filename: 'sponsors_report',
      color: 'bg-orange-500',
    },
  ];

  const handleExport = async (report) => {
    try {
      setLoadingStates(prev => ({ ...prev, [report.id]: true }));
      
      // Map to correct API methods
      let response;
      switch (report.id) {
        case 'users':
          response = await apiService.exportUsersReport();
          break;
        case 'contests':
          response = await apiService.exportTeamsReport(); // Contest participants
          break;
        case 'teams':
          response = await apiService.exportTeamsReport();
          break;
        case 'registrations':
          response = await apiService.exportRegistrationFormsReport();
          break;
        case 'submissions':
          response = await apiService.exportSubmissionsReport();
          break;
        case 'login-history':
          response = await apiService.exportLoginHistoryReport();
          break;
        case 'sponsors':
          response = await apiService.exportSponsorsReport();
          break;
        default:
          response = await apiService.get(report.endpoint, { responseType: 'blob' });
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Xuất ${report.title.toLowerCase()} thành công`);
    } catch (error) {
      console.error(`Error exporting ${report.id}:`, error);
      toast.error(`Có lỗi khi xuất ${report.title.toLowerCase()}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [report.id]: false }));
    }
  };

  const handleExportAll = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, all: true }));
      
      // Xuất tất cả báo cáo
      const promises = reportTypes.map(async (report) => {
        let response;
        try {
          switch (report.id) {
            case 'users':
              response = await apiService.exportUsersReport();
              break;
            case 'contests':
              response = await apiService.exportTeamsReport();
              break;
            case 'teams':
              response = await apiService.exportTeamsReport();
              break;
            case 'registrations':
              response = await apiService.exportRegistrationFormsReport();
              break;
            case 'submissions':
              response = await apiService.exportSubmissionsReport();
              break;
            case 'login-history':
              response = await apiService.exportLoginHistoryReport();
              break;
            case 'sponsors':
              response = await apiService.exportSponsorsReport();
              break;
            default:
              response = await apiService.get(report.endpoint, { responseType: 'blob' });
          }
          return { report, data: response.data };
        } catch (error) {
          console.error(`Error exporting ${report.id}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      
      // Tải từng file (bỏ qua những file null)
      results.filter(result => result !== null).forEach(({ report, data }) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${report.filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
      
      toast.success('Xuất tất cả báo cáo thành công');
    } catch (error) {
      console.error('Error exporting all reports:', error);
      toast.error('Có lỗi khi xuất báo cáo');
    } finally {
      setLoadingStates(prev => ({ ...prev, all: false }));
    }
  };

  const pageActions = [
    {
      label: 'Xuất tất cả báo cáo',
      variant: 'default',
      icon: Download,
      onClick: handleExportAll,
      disabled: loadingStates.all,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo & Xuất dữ liệu"
        description="Xuất các báo cáo dữ liệu từ hệ thống dưới dạng file Excel"
        actions={pageActions}
        badge={{
          text: 'Admin',
          variant: 'outline',
        }}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          const isLoading = loadingStates[report.id];
          
          return (
            <Card key={report.id} className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {report.description}
                  </CardDescription>
                </div>
                <div className={`p-2 rounded-md ${report.color} text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Excel
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleExport(report)}
                    disabled={isLoading}
                    className="ml-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Đang xuất...
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-2" />
                        Xuất báo cáo
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn sử dụng</CardTitle>
          <CardDescription>
            Thông tin về việc xuất và sử dụng báo cáo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Tất cả báo cáo được xuất dưới định dạng Excel (.xlsx)</p>
            <p>• Dữ liệu được xuất theo thời gian thực tại thời điểm tạo báo cáo</p>
            <p>• File báo cáo sẽ được tự động tải về máy tính của bạn</p>
            <p>• Tên file bao gồm loại báo cáo và ngày xuất</p>
            <p>• Chỉ quản trị viên mới có quyền xuất báo cáo</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">
              📋 Lưu ý: Một số báo cáo có thể mất vài giây để tạo tùy theo lượng dữ liệu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;