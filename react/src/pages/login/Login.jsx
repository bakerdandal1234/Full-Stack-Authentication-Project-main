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
  Avatar,
  InputAdornment,
  Divider,
  Stack,
  Grid
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Key as KeyIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
        }else if (!result.needsVerification) {
          setFormData(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              verification: result.message
            }
          }));
        }
         else {
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
      const response = await fetch('http://localhost:3000/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.resetEmail }),
      });

      const data = await response.json();
      console.log('Server response message:', data.message);
      
      setFormData(prev => ({
        ...prev,
        resetStatus: data.message
      }));

      if (response.ok) {
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            showForgotPassword: false,
            resetEmail: '',
            resetStatus: ''
          }));
        }, 3000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setFormData(prev => ({
        ...prev,
        resetStatus: 'Failed to connect to the server'
      }));
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Modal
        open={formData.showForgotPassword}
        onClose={() => setFormData(prev => ({ ...prev, showForgotPassword: false }))}
        aria-labelledby="forgot-password-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Reset Password</Typography>
            <IconButton onClick={() => setFormData(prev => ({ ...prev, showForgotPassword: false }))} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
         
          <form onSubmit={handleForgotPasswordSubmit}>
            <Box sx={{ 
              mb: 2, 
              p: 2.5,
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              color: '#6366f1',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease-in-out',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)'
              },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 40px 0 rgba(99, 102, 241, 0.4)',
                bgcolor: 'rgba(255, 255, 255, 0.15)'
              }
            }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  fontSize: '0.95rem',
                  animation: 'fadeIn 0.5s ease-in-out',
                  '@keyframes fadeIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(10px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}
              >
                {formData.resetStatus || 'Enter your email to reset password'}
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Email Address"
              name="resetEmail"
              type="email"
              required
              value={formData.resetEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, resetEmail: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.2)',
                    transition: 'all 0.3s ease-in-out',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: '2px',
                  },
                },
                '& label.Mui-focused': {
                  color: 'primary.main',
                },
                '& .MuiInputBase-input': {
                  padding: '16px 14px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease-in-out',
                  '&:focus': {
                    transform: 'translateY(-2px)',
                  },
                },
                animation: 'fadeIn 0.5s ease-in-out',
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(10px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.3)',
                  background: 'linear-gradient(90deg, #4338ca 0%, #4f46e5 100%)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                },
              }}
            >
              Reset Password
            </Button>
          </form>
        </Box>
      </Modal>

      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.13) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          p: 4,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Avatar
          sx={{
            m: 1,
            bgcolor: 'secondary.main',
            width: 56,
            height: 56,
            transform: 'scale(1)',
            transition: 'transform 0.3s ease-in-out',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
            },
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Avatar>

        <Typography
          component="h1"
          variant="h5"
          sx={{
            mb: 3,
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Welcome Back!
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!formData.errors.email}
            helperText={formData.errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={formData.showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formData.errors.password}
            helperText={formData.errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {formData.errors.general && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formData.errors.general}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                transform: 'scale(1.02)',
                boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .3)',
              },
            }}
          >
            Sign In
          </Button>

          <Grid container>
            <Grid item xs>
              <Button
                onClick={() => setFormData(prev => ({ ...prev, showForgotPassword: true }))}
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  }
                }}
              >
                Forgot Password?
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                borderColor: '#dd4b39',
                color: '#dd4b39',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: '#dd4b39',
                  bgcolor: 'rgba(221, 75, 57, 0.04)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(221, 75, 57, 0.2)',
                }
              }}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHubIcon />}
              onClick={handleGithubLogin}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                borderColor: '#333',
                color: '#333',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: '#333',
                  bgcolor: 'rgba(51, 51, 51, 0.04)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(51, 51, 51, 0.2)',
                }
              }}
            >
              GitHub
            </Button>
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                style={{ 
                  color: '#1976d2', 
                  textDecoration: 'none', 
                  fontWeight: 500 
                }}
              >
                Sign up here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
