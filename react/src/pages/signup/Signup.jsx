import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import {
  PersonAddOutlined as PersonAddIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Key as KeyIcon,
  Person as PersonIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    errors: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      general: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: ''
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setFormData(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          confirmPassword: 'Passwords do not match!'
        }
      }));
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const result = await response.json();
      console.log("Server response:", result);

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          const newErrors = { ...formData.errors };
          
          result.errors.forEach(item => {
            switch(item.path) {
              case 'email':
                newErrors.email = "Please provide a valid email";
                break;
              case 'username':
                newErrors.username = "Username is required";
                break;
              case 'password':
                newErrors.password = "Password must be at least 6 characters";
                break;
              default:
                break;
            }
          });

          setFormData(prev => ({
            ...prev,
            errors: newErrors
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              general: result.message || "Error during signup"
            }
          }));
        }
        return;
      }

      console.log("Signup successful:", result);
      navigate('/login');

    } catch (error) {
      console.error("Signup error:", error);
      setFormData(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          general: "Failed to sign up. Please try again."
        }
      }));
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:3000/auth/github';
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={8}
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3,
          background: 'linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(240,242,245,1) 100%)',
        }}
      >
        <Avatar 
          sx={{ 
            m: 1, 
            bgcolor: 'secondary.main',
            width: 56,
            height: 56,
            boxShadow: 3
          }}
        >
          <PersonAddIcon />
        </Avatar>

        <Typography 
          component="h1" 
          variant="h4" 
          sx={{ 
            mb: 1,
            fontWeight: 600,
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          Create Account
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Fill in your information to get started
        </Typography>

        {formData.errors.general && (
          <Alert 
            severity="error" 
            sx={{ width: '100%', mb: 2, borderRadius: 2 }}
            variant="filled"
          >
            {formData.errors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            error={!!formData.errors.username}
            helperText={formData.errors.username}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
                borderRadius: 2,
              }
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
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
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!formData.errors.confirmPassword}
            helperText={formData.errors.confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowConfirmPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              }
            }}
          >
            Create Account
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              startIcon={<GoogleIcon />}
              sx={{ 
                py: 1,
                borderRadius: 2,
                borderColor: '#dd4b39',
                color: '#dd4b39',
                '&:hover': {
                  borderColor: '#dd4b39',
                  bgcolor: 'rgba(221, 75, 57, 0.04)',
                }
              }}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGithubLogin}
              startIcon={<GitHubIcon />}
              sx={{ 
                py: 1,
                borderRadius: 2,
                borderColor: '#333',
                color: '#333',
                '&:hover': {
                  borderColor: '#333',
                  bgcolor: 'rgba(51, 51, 51, 0.04)',
                }
              }}
            >
              GitHub
            </Button>
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#1976d2', 
                  textDecoration: 'none', 
                  fontWeight: 500 
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;
