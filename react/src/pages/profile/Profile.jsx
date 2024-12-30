import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navigation from '../../components/Navigation';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Grid,
  Divider,
  CircularProgress,
  Button,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  GitHub as GitHubIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import api from '../../utils/axios';

const Profile = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/user/profile');
        setUser(response.data.user);
        setError(null);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <>
        <Navigation />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navigation />
        <Container sx={{ mt: 4 }}>
          <Alert severity="warning">No profile data available</Alert>
        </Container>
      </>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Profile Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 100, height: 100, mr: 3 }}
            />
            <Box>
              <Typography variant="h4" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Profile Details */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="body1">{user.email}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="body1">
                  Joined {formatDate(user.createdAt)}
                </Typography>
              </Box>
            </Grid>

            {/* OAuth Provider Info */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Connected Accounts
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                {user.githubId && (
                  <Button
                    startIcon={<GitHubIcon />}
                    variant="outlined"
                    disabled
                  >
                    GitHub Connected
                  </Button>
                )}
                {user.googleId && (
                  <Button
                    startIcon={<GoogleIcon />}
                    variant="outlined"
                    disabled
                  >
                    Google Connected
                  </Button>
                )}
                {!user.githubId && !user.googleId && (
                  <Typography color="text.secondary">
                    No connected accounts
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default Profile;
