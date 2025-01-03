import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/login/Login';
import About from './pages/About';
import Signup from './pages/signup/Signup';
import Welcome from './pages/welcome/Welcome';
import VerifyEmail from './pages/verify-email/VerifyEmail';
import AuthSuccess from './pages/auth/AuthSuccess';
import Profile from './pages/profile/Profile';
import ResetPassword from './pages/reset-password/ResetPassword';

import { ColorModeContext, useMode } from './pages/theme';
import { CssBaseline, ThemeProvider } from '@mui/material';

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <Header />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
              
              {/* Protected Routes */}
              <Route path="/home" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/about" element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
