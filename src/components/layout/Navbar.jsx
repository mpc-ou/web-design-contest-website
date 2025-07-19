import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

const Navbar = () => {
  const { currentUser, userInfo, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const menuItems = [
    { text: 'Home', path: '/' },
    ...(currentUser ? [{ text: 'Profile', path: '/profile' }] : []),
  ];

  const drawer = (
    <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {currentUser ? (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        ) : (
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/login">
              <LoginIcon sx={{ mr: 1 }} />
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 },
            }}
          >
            Web Design Contest
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                sx={{ color: 'inherit', display: 'block', mx: 1 }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Theme Toggle */}
          <IconButton onClick={toggleTheme} sx={{ ml: 1 }} color="inherit">
            {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* User Authentication */}
          {currentUser ? (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', ml: 2 }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {userInfo?.displayName || currentUser.email}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<LoginIcon />}
              sx={{ display: { xs: 'none', sm: 'flex' }, ml: 2 }}
            >
              Login
            </Button>
          )}

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ ml: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, 
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;