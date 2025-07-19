import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Link, Typography } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box component="footer" sx={{ 
      py: 3, 
      mt: 'auto', 
      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.100' 
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" component="p" sx={{ mb: 1 }}>
            <Link component={RouterLink} to="/" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
              Web Design Contest
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;