/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  KeyIcon, 
  CubeIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ComputerDesktopIcon,
  CalendarIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

import CodeBlock from '../components/common/CodeBlock';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useNotification } from '../hooks/useNotification';
import { decodeJwt } from '../utils/jwtUtils';

const ProfilePage = () => {
  const { currentUser, userInfo, refreshUserInfo, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isDevMode = (import.meta.env?.VITE_DEVMODE === 'true') || false;
  const [firebaseToken, setFirebaseToken] = useState('');
  const [backendToken, setBackendToken] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFirebaseToken, setShowFirebaseToken] = useState(false);
  const [showBackendToken, setShowBackendToken] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();
  const { notification, showSuccess, showError } = useNotification();

  useEffect(() => {
    getTokens();
  }, [currentUser]);

  const getTokens = async () => {
    if (currentUser) {
      try {
        const idToken = await currentUser.getIdToken(true);
        setFirebaseToken(idToken);
      } catch {
        console.error('Error getting Firebase token');
      }
    }
    
    const storedBackendToken = localStorage.getItem('backendToken');
    if (storedBackendToken) {
      setBackendToken(storedBackendToken);
    }
  };

  const handleCopyToClipboard = (text, label = 'Text') => {
    const success = copyToClipboard(text);
    if (success) {
      showSuccess(`Đã sao chép ${label} vào clipboard!`);
    } else {
      showError(`Không thể sao chép ${label}. Vui lòng thử lại.`);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserInfo();
      await getTokens();
      showSuccess('Đã cập nhật thông tin thành công!');
    } catch (error) {
      showError('Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TokenDisplay = ({ token, show, onToggle, label }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
            >
              {show ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyToClipboard(token, label)}
              disabled={!token}
            >
              <CubeIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-3 bg-muted rounded-md font-mono text-xs break-all max-h-24 overflow-y-auto">
          {show ? token : '••••••••••••••••••••••••••••••••'}
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const decodedToken = firebaseToken ? decodeJwt(firebaseToken) : null;

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={userInfo?.avatar || currentUser.photoURL} />
            <AvatarFallback>
              {(userInfo?.firstName?.[0] || userInfo?.lastName?.[0]) || currentUser.displayName?.[0] || currentUser.email?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              {userInfo?.firstName || userInfo?.lastName
                ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim()
                : currentUser.displayName || 'Developer Profile'}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              {userInfo?.role === 'admin' && (
                <Badge variant="secondary" className="mr-2">
                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              {userInfo?.email || currentUser.email}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </div>

      {/* Quick Token Access (Dev only) */}
      {isDevMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="h-5 w-5" />
              Backend API Token
            </CardTitle>
            <CardDescription>
              Token để truy cập API backend (sử dụng trong development)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {backendToken ? (
              <TokenDisplay 
                token={backendToken}
                show={showBackendToken}
                onToggle={() => setShowBackendToken(!showBackendToken)}
                label="Backend Token"
              />
            ) : (
              <Alert>
                <AlertDescription>
                  Không tìm thấy backend token. Hãy đăng xuất và đăng nhập lại.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className={`grid w-full ${isDevMode ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
          {isDevMode && (
            <TabsTrigger value="dev" className="flex items-center gap-2">
              <ComputerDesktopIcon className="h-4 w-4" />
              Dev Zone
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                    <CardDescription>Thông tin cá nhân từ Firebase và Backend</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/profile/edit')}
                  >
                    Chỉnh sửa
                  </Button>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/admin">Trang admin</Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/profile/registrations')}
                    >
                      Form đăng ký
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon className="h-4 w-4" />
                    Tên hiển thị
                  </div>
                  <p className="font-medium">
                    {userInfo?.firstName || userInfo?.lastName
                      ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim()
                      : currentUser.displayName || 'Chưa đặt tên'}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <EnvelopeIcon className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium">{userInfo?.email || currentUser.email}</p>
                  <Badge variant={currentUser.emailVerified ? "default" : "destructive"} className="text-xs">
                    {currentUser.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DevicePhoneMobileIcon className="h-4 w-4" />
                    Số điện thoại
                  </div>
                  <p className="font-medium">{userInfo?.phone || 'Chưa cập nhật'}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    Tổ chức
                  </div>
                  <p className="font-medium">{userInfo?.organization || 'No organization'}</p>
                </div>

                {userInfo?.address && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPinIcon className="h-4 w-4" />
                        Địa chỉ
                      </div>
                      <p className="font-medium">{userInfo.address}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái tài khoản</CardTitle>
                <CardDescription>Thông tin đăng nhập và hoạt động</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    Lần đăng nhập cuối
                  </div>
                  <p className="font-medium">{formatDate(userInfo?.lastLoginAt)}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ComputerDesktopIcon className="h-4 w-4" />
                    Thiết bị đăng nhập cuối
                  </div>
                  <p className="text-sm">
                    {userInfo?.loginSessions?.[0]?.browser || 'N/A'} trên {userInfo?.loginSessions?.[0]?.os || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    IP: {userInfo?.lastLoginIp || 'N/A'}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Tổng số lần đăng nhập</div>
                  <p className="font-medium">{userInfo?.totalLogins || 0}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Trạng thái</div>
                  <Badge variant={userInfo?.isActive ? "default" : "destructive"}>
                    {userInfo?.isActive ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Ngày tạo tài khoản</div>
                  <p className="font-medium">{formatDate(userInfo?.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Backend Data (Dev only) */}
          {isDevMode && userInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Dữ liệu Backend đầy đủ</CardTitle>
                <CardDescription>Toàn bộ thông tin người dùng từ backend API</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock data={userInfo} height={400} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Phương thức đăng nhập</CardTitle>
                <CardDescription>Các nhà cung cấp xác thực bạn đã liên kết</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentUser.providerData.map((provider) => (
                  <div key={provider.providerId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{provider.providerId.replace('.com', '')}</p>
                      <p className="text-sm text-muted-foreground">{provider.email}</p>
                    </div>
                    <Badge variant="outline">Đã liên kết</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phiên đăng nhập</CardTitle>
                <CardDescription>Thông tin các phiên đăng nhập gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                {userInfo?.loginSessions?.length > 0 ? (
                  <div className="space-y-3">
                    {userInfo.loginSessions.slice(0, 3).map((session, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{session.browser}</span>
                          <Badge variant={session.isActive ? 'default' : 'secondary'} className="text-xs">
                            {session.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="flex items-center gap-2">
                            <ComputerDesktopIcon className="h-3 w-3" />
                            {session.os} - {session.device}
                          </p>
                          <p className="flex items-center gap-2">
                            <GlobeAltIcon className="h-3 w-3" />
                            IP: {session.ip}
                          </p>
                          <p className="flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3" />
                            Đăng nhập: {formatDate(session.loginAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Không có thông tin phiên đăng nhập</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dev Zone Tab */}
        {isDevMode && (
        <TabsContent value="dev" className="space-y-6">
          <Alert>
            <ComputerDesktopIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Developer Zone:</strong> Khu vực này chứa thông tin nhạy cảm chỉ dành cho developer. 
              Không chia sẻ các token này với bất kỳ ai.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Firebase Token */}
            <Card>
              <CardHeader>
                <CardTitle>Firebase ID Token</CardTitle>
                <CardDescription>Token xác thực Firebase để gọi API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TokenDisplay 
                  token={firebaseToken}
                  show={showFirebaseToken}
                  onToggle={() => setShowFirebaseToken(!showFirebaseToken)}
                  label="Firebase Token"
                />
                
                {firebaseToken && decodedToken && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Token Decoded:</h4>
                      <CodeBlock data={decodedToken} height={200} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Backend Token */}
            <Card>
              <CardHeader>
                <CardTitle>Backend API Token</CardTitle>
                <CardDescription>Token để truy cập trực tiếp backend API</CardDescription>
              </CardHeader>
              <CardContent>
                {backendToken ? (
                  <TokenDisplay 
                    token={backendToken}
                    show={showBackendToken}
                    onToggle={() => setShowBackendToken(!showBackendToken)}
                    label="Backend Token"
                  />
                ) : (
                  <Alert>
                    <AlertDescription>
                      Backend token không khả dụng. Hãy đăng xuất và đăng nhập lại.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* API Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn sử dụng API</CardTitle>
              <CardDescription>Ví dụ cách sử dụng token để gọi API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Lấy thông tin user hiện tại:</h4>
                <CodeBlock 
                  data={{
                    method: "GET",
                    url: "https://wd-mpc-server-production.up.railway.app/api/users/me",
                    headers: {
                      "Authorization": `Bearer ${backendToken || 'YOUR_BACKEND_TOKEN'}`,
                      "Content-Type": "application/json"
                    }
                  }} 
                  height={120}
                />
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Lấy danh sách cuộc thi:</h4>
                <CodeBlock 
                  data={{
                    method: "GET",
                    url: "https://wd-mpc-server-production.up.railway.app/api/contests",
                    headers: {
                      "Authorization": `Bearer ${backendToken || 'YOUR_BACKEND_TOKEN'}`,
                      "Content-Type": "application/json"
                    }
                  }} 
                  height={120}
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">3. Curl command example:</h4>
                <div className="p-3 bg-muted rounded-md font-mono text-xs overflow-x-auto">
                  {`curl -X GET "https://wd-mpc-server-production.up.railway.app/api/users/me" \\
  -H "Authorization: Bearer ${backendToken || 'YOUR_BACKEND_TOKEN'}" \\
  -H "Content-Type: application/json"`}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teams participated */}
          <Card>
            <CardHeader>
              <CardTitle>Đội đã tham gia</CardTitle>
              <CardDescription>Danh sách đội bạn đã tham gia các cuộc thi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(userInfo?.teams) && userInfo.teams.length > 0 ? (
                <div className="space-y-3">
                  {userInfo.teams.map((team) => (
                    <div key={team._id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{team.teamName} <span className="text-muted-foreground">({team.division})</span></div>
                        <div className="text-sm text-muted-foreground">Cuộc thi: {team.contest?.code} - {team.contest?.name}</div>
                        <div className="text-xs text-muted-foreground">Trạng thái: {team.status} • Ngày đăng ký: {new Date(team.registeredAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                      <div className="flex gap-2">
                        {isAdmin ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/teams/${team._id}`}>Xem đội</Link>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/teams">Xem đội</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Bạn chưa tham gia đội nào</div>
              )}
            </CardContent>
          </Card>

          {/* User Identifiers */}
          <Card>
            <CardHeader>
              <CardTitle>User Identifiers</CardTitle>
              <CardDescription>Các ID định danh của user trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Firebase UID:</label>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs">{currentUser.uid}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(currentUser.uid, 'Firebase UID')}
                  >
                    <CubeIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {userInfo?._id && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Backend User ID:</label>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-xs">{userInfo._id}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(userInfo._id, 'Backend User ID')}
                    >
                      <CubeIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}
      </Tabs>

      {/* Notification */}
      {notification.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert className={`${notification.severity === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;