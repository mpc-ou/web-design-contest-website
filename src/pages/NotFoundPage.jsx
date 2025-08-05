import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  HomeIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Error Icon and Numbers */}
        <div className="space-y-4">
          <ExclamationTriangleIcon className="h-24 w-24 mx-auto text-destructive" />
          <div className="space-y-2">
            <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
            <h2 className="text-3xl md:text-4xl font-bold">Trang không tìm thấy</h2>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
          <p className="text-sm text-muted-foreground">
            Có thể đường dẫn đã bị thay đổi hoặc bạn đã nhập sai địa chỉ.
          </p>
        </div>

        {/* Action Buttons */}
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Về trang chủ
                </Link>
              </Button>
              
              <Button variant="outline" onClick={() => window.history.back()} className="w-full">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Quay lại trang trước
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Nếu bạn cho rằng đây là lỗi, vui lòng{' '}
            <Link 
              to="/contact" 
              className="text-primary hover:underline font-medium"
            >
              liên hệ với chúng tôi
            </Link>
            {' '}để được hỗ trợ.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
          <Button variant="ghost" asChild className="h-auto p-4 flex-col space-y-2">
            <Link to="/">
              <HomeIcon className="h-6 w-6" />
              <span className="text-xs">Trang chủ</span>
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className="h-auto p-4 flex-col space-y-2">
            <Link to="/contests">
              <ExclamationTriangleIcon className="h-6 w-6" />
              <span className="text-xs">Cuộc thi</span>
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className="h-auto p-4 flex-col space-y-2">
            <Link to="/profile">
              <HomeIcon className="h-6 w-6" />
              <span className="text-xs">Hồ sơ</span>
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className="h-auto p-4 flex-col space-y-2">
            <Link to="/login">
              <HomeIcon className="h-6 w-6" />
              <span className="text-xs">Đăng nhập</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;