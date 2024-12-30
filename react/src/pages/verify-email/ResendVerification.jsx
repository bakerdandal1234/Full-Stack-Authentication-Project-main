import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import api from '../../utils/axios';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({
    loading: false,
    error: '',
    success: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus(prev => ({ ...prev, error: 'Email is required' }));
      return;
    }

    setStatus({ loading: true, error: '', success: '' });

    try {
      const response = await api.post('/resend-verification', { email });
      setStatus({
        loading: false,
        error: '',
        success: response.data.message
      });
      setEmail('');
    } catch (error) {
      setStatus({
        loading: false,
        error: error.response?.data?.message || 'Error sending verification email',
        success: ''
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
      <Typography variant="body1" gutterBottom>
        Enter your email to resend the verification link
      </Typography>
      
      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status.loading}
        sx={{ mb: 2, mt: 1 }}
      />

      {status.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {status.error}
        </Alert>
      )}

      {status.success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {status.success}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={status.loading}
      >
        {status.loading ? 'Sending...' : 'Resend Verification Link'}
      </Button>
    </Box>
  );
};

export default ResendVerification;
