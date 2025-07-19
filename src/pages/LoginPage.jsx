import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Alert,
  Typography,
  CircularProgress
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await loginWithGoogle();
      navigate('/profile');
    } catch (error) {
      setError('Failed to log in with Google. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh' 
    }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" align="center" gutterBottom sx={{ mb: 3 }}>
            Login to Developer Portal
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading}
            color='primary'
            sx={{ 
              py: 1.2,
              textTransform: 'none',
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'grey.100',
                borderColor: 'grey.400'
              }
            }}
          >
            {loading ? 'Logging in...' : 'Continue with Google'}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;