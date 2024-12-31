import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  IconButton,
  Alert,
  InputAdornment,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Key as KeyIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Close as CloseIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const { login, forgotPassword } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    resetEmail: '',
    resetStatus: '',
    showPassword: false,
    showForgotPassword: false,
    errors: {}
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: '',
        general: ''
      }
    }));
  };

  const handleClickShowPassword = () => {
    setFormData(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      errors: {
        email: '',
        password: '',
        general: ''
      }
    }));

    try {
      const result = await login(formData.email, formData.password);
      console.log(result)
      if (!result.success) {
        if (result.errorEmail) {
          setFormData(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              email: result.errorEmail
            }
          }));
        } else if (result.errorPassword) {
          setFormData(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              password: result.errorPassword
            }
          }));
        } else if (!result.needsVerification) {
          setFormData(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              verification: result.message
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              general: result.message || 'An error occurred during login.'
            }
          }));
        }
        return;
      }
      navigate('/home');
    } catch (error) {
      console.error("Login error:", error);
      setFormData(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          general: "Failed to connect to the server. Please try again later."
        }
      }));
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:3000/auth/github';
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await forgotPassword(formData.resetEmail);
      console.log(result)
      setFormData(prev => ({
        ...prev,
        resetStatus: result.message,
        showForgotPassword: !result.success
      }));
    } catch (error) {
      console.error('Password reset error:', error);
      setFormData(prev => ({
        ...prev,
        resetStatus: 'Failed to connect to the server. Please try again later.'
      }));
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Fade in timeout={800}>
        <Paper elevation={6} sx={{
          p: { xs: 3, sm: 6 },
          width: '100%',
          borderRadius: 2,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}>
              <LoginIcon sx={{ 
                fontSize: 40, 
                color: 'primary.main',
                transform: 'rotate(-10deg)'
              }} />
              <Typography component="h1" variant="h4" fontWeight="bold">
                Welcome Back
              </Typography>
            </Box>

            {formData.errors.general && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {formData.errors.general}
              </Alert>
            )}

            {formData.errors.verification && (
              <Alert severity="warning" sx={{ width: '100%' }}>
                {formData.errors.verification}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', gap: 2.5, display: 'flex', flexDirection: 'column' }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formData.errors.email}
                helperText={formData.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={formData.showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!formData.errors.password}
                helperText={formData.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 1.5,
                  mt: 1,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                  }
                }}
              >
                Sign In
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Button
                  onClick={() => setFormData(prev => ({ ...prev, showForgotPassword: true }))}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  Forgot password?
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  sx={{ 
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    color: 'primary.main',
                    '&:hover': { color: 'primary.dark' }
                  }}
                >
                  Create account
                </Button>
              </Box>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleGoogleLogin}
                  startIcon={<GoogleIcon />}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    borderColor: '#EA4335',
                    color: '#EA4335',
                    '&:hover': {
                      borderColor: '#EA4335',
                      backgroundColor: 'rgba(234, 67, 53, 0.04)',
                    },
                  }}
                >
                  login with Google
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleGithubLogin}
                  startIcon={<GitHubIcon />}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    borderColor: '#24292E',
                    color: '#24292E',
                    '&:hover': {
                      borderColor: '#24292E',
                      backgroundColor: 'rgba(36, 41, 46, 0.04)',
                    },
                  }}
                >
                 login with GitHub
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Fade>

      <Modal
        open={formData.showForgotPassword}
        onClose={() => setFormData(prev => ({ ...prev, showForgotPassword: false }))}
        aria-labelledby="forgot-password-modal"
      >
        <Fade in={formData.showForgotPassword}>
          <Paper sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            p: 4,
            borderRadius: 2,
            outline: 'none',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">Reset Password</Typography>
              <IconButton 
                onClick={() => setFormData(prev => ({ ...prev, showForgotPassword: false }))}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {formData.resetStatus && (
              <Alert 
                severity={formData.resetStatus.includes('success') ? 'success' : 'error'}
                sx={{ mb: 2 }}
              >
                {formData.resetStatus}
              </Alert>
            )}

            <form onSubmit={handleForgotPasswordSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="resetEmail"
                type="email"
                value={formData.resetEmail}
                onChange={handleChange}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                  }
                }}
              >
                Send Reset Link
              </Button>
            </form>
          </Paper>
        </Fade>
      </Modal>
    </Container>
  );
};

export default Login;
