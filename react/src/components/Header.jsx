import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from "../pages/theme";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Button,
  useTheme,
  Container,
  Stack,
  Divider
} from '@mui/material';
import {
  DarkModeOutlined,
  LightModeOutlined,
  Logout,
  Login
} from '@mui/icons-material';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  

  const privateLinks = [
    { text: 'Home', path: '/' },
    { text: 'About', path: '/about' },
    { text: 'Profile', path: '/profile' },
    { text: 'Contact', path: '/contact' }
  ];

  return (
    <AppBar 
      position="static" 
      elevation={1}
      sx={{
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        '& .MuiToolbar-root': {
          minHeight: '48px !important',
          padding: '0 16px'
        }
      }}
    >
      <Container maxWidth="xl">
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: '48px !important',
            justifyContent: 'space-between'
          }}
        >
          {/* Brand/Logo */}
          <Typography
            variant="subtitle1"
            component={Link}
            to="/"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              textDecoration: 'none',
              letterSpacing: 0.5
            }}
          >
            MyApp
          </Typography>

          {/* Navigation Links */}
          <Stack 
            direction="row" 
            spacing={0.5}
            divider={<Divider orientation="vertical" flexItem />}
            alignItems="center"
          >
            {/* Private Links - Only show when authenticated */}
            {isAuthenticated && (
              <>
                {privateLinks.map((link) => (
                  <Button
                    key={link.text}
                    component={Link}
                    to={link.path}
                    size="small"
                    sx={{ 
                      color: theme.palette.text.primary,
                      py: 0.5,
                      '&:hover': {
                        bgcolor: theme.palette.action.hover
                      }
                    }}
                  >
                    {link.text}
                  </Button>
                ))}
              </>
            )}

            {/* Theme Toggle */}
            <IconButton
              onClick={colorMode.toggleColorMode}
              color="inherit"
              size="small"
              sx={{ 
                color: theme.palette.text.primary,
                p: 0.5
              }}
            >
              {theme.palette.mode === 'dark' ? (
                <LightModeOutlined fontSize="small" />
              ) : (
                <DarkModeOutlined fontSize="small" />
              )}
            </IconButton>

            {/* Auth Buttons */}
            {isAuthenticated && <Button
              onClick={handleLogout}
              startIcon={<Logout fontSize="small" />}
              size="small"
              sx={{ 
                color: theme.palette.error.main,
                py: 0.5,
                '&:hover': {
                  bgcolor: theme.palette.error.lighter
                }
              }}
            >
              Logout
            </Button>}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
