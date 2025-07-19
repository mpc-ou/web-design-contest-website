import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Alert,
  Snackbar,
  Stack
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RefreshIcon from '@mui/icons-material/Refresh';

import CodeBlock from '../components/common/CodeBlock';
import TokenDisplay from '../components/profile/TokenDisplay';

import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useNotification } from '../hooks/useNotification';
import { decodeJwt } from '../utils/jwtUtils';

const ProfilePage = () => {
  const { currentUser, userInfo, refreshUserInfo } = useAuth();
  const [firebaseToken, setFirebaseToken] = useState('');
  const [backendToken, setBackendToken] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();
  const { notification, showSuccess, showError } = useNotification();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  const handleCopyToClipboard = (text) => {
    const success = copyToClipboard(text);
    if (success) {
      showSuccess('Đã sao chép vào clipboard!');
    } else {
      showError('Không thể sao chép. Vui lòng thử lại.');
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

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải thông tin người dùng...</Typography>
      </Container>
    );
  }

  // Giải mã JWT token
  const decodedToken = firebaseToken ? decodeJwt(firebaseToken) : null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Developer Profile
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />} 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
        </Button>
      </Box>

      {/* API Token Preview - Always visible at top */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardHeader 
          title="Backend API Token"
          titleTypographyProps={{ variant: 'h6' }}
          avatar={<VpnKeyIcon color="primary" />}
        />
        <CardContent>
          {backendToken ? (
            <TokenDisplay 
              token={backendToken}
              initialVisibility={false}
              onCopy={handleCopyToClipboard}
            />
          ) : (
            <Alert severity="warning">
              Không tìm thấy backend token. Hãy đăng xuất và đăng nhập lại.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="profile information tabs"
          variant="fullWidth"
        >
          <Tab icon={<AccountBoxIcon />} iconPosition="start" label="Thông tin người dùng" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Thông tin bảo mật" />
        </Tabs>
      </Box>

      {/* User Information Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader title="Thông tin cơ bản" titleTypographyProps={{ variant: 'h6' }} />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Tên hiển thị
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                      {currentUser.displayName || 'Chưa đặt tên'}
                    </Paper>
                  </Box>
                  
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Email
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                      {currentUser.email}
                    </Paper>
                  </Box>
                  
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Xác thực email
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                      <Chip 
                        label={currentUser.emailVerified ? "Đã xác thực" : "Chưa xác thực"} 
                        color={currentUser.emailVerified ? "success" : "error"}
                        size="small"
                      />
                    </Paper>
                  </Box>
                  
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      UID
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          backgroundColor: 'background.default', 
                          fontFamily: 'monospace', 
                          fontSize: '0.85rem',
                          flexGrow: 1
                        }}
                      >
                        {currentUser.uid}
                      </Paper>
                      <Tooltip title="Sao chép UID">
                        <IconButton 
                          onClick={() => handleCopyToClipboard(currentUser.uid)}
                          sx={{ ml: 1 }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {userInfo && (
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardHeader title="Thông tin backend" titleTypographyProps={{ variant: 'h6' }} />
                <CardContent>
                  <CodeBlock data={userInfo} height={300} />
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {/* Security Information Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader 
                title="Firebase ID Token" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent>
                <TokenDisplay 
                  token={firebaseToken}
                  initialVisibility={false}
                  onCopy={handleCopyToClipboard}
                />
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Thông tin token (decoded)
                </Typography>
                
                {firebaseToken ? (
                  <CodeBlock data={decodedToken} height={240} />
                ) : (
                  <Typography color="text.secondary">
                    Đang tải token...
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader title="Thông tin đăng nhập" titleTypographyProps={{ variant: 'h6' }} />
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Chi tiết nhà cung cấp
                </Typography>
                <CodeBlock data={currentUser.providerData} height={120} />
                
                <Divider sx={{ my: 3 }} />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Phương thức đăng nhập
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {currentUser.providerData.map((provider) => (
                      <Chip 
                        key={provider.providerId}
                        label={provider.providerId.replace('.com', '')} 
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Thời gian đăng nhập gần nhất
                  </Typography>
                  <Typography>
                    {currentUser.metadata?.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={notification.onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={notification.onClose} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;