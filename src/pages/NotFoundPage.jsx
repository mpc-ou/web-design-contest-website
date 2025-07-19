import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          py: 8,
          px: 4,
          mt: 6,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12}>
            <ErrorOutlineIcon
              sx={{
                fontSize: 100,
                color: 'error.main',
                mb: 2,
              }}
            />
            
            <Typography variant="h2" component="h1" gutterBottom>
              404
            </Typography>
            
            <Typography variant="h4" component="h2" gutterBottom>
              Not Found
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
              The page you are looking for does not exist or has been moved.
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/"
                startIcon={<HomeIcon />}
                size="large"
              >
                Go to Home
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          If you believe this is an error, please contact the administrator.
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFoundPage;