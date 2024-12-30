import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import api from '../../utils/axios';
import ResendVerification from './ResendVerification';

const VerifyEmail = () => {
  const [state, setState] = useState({
    status: 'verifying',
    message: '',
    isExpired: false
  });
  const { token } = useParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/verify-email/${token}`);
        setState({
          status: 'success',
          message: response.data.message,
          isExpired: false
        });
      } catch (error) {
        if (error.response) {
          setState({
            status: 'error',
            message: error.response.data.message,
            isExpired: error.response.data.isExpired || false
          });
        } else {
          setState({
            status: 'error',
            message: 'Error during verification',
            isExpired: false
          });
        }
      }
    };

    verifyEmail();
  }, [token]);

  const renderContent = () => {
    switch (state.status) {
      case 'verifying':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress />
            <Typography>Verifying your email...</Typography>
          </Box>
        );

      case 'success':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h6" textAlign="center">
              {state.message}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/login"
              sx={{ mt: 2 }}
            >
              Login Now
            </Button>
          </Box>
        );

      case 'error':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <ErrorIcon color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h6" textAlign="center" color="error">
              {state.message}
            </Typography>
            {state.isExpired && <ResendVerification />}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center'
        }}
      >
        {renderContent()}
      </Paper>
    </Box>
  );
};

export default VerifyEmail;
