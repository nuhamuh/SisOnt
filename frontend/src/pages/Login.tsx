import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%',
            maxWidth: 400,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
          }}
        >
          <Typography 
            component="h1" 
            variant="h4"
            sx={{ 
              textAlign: 'center',
              fontWeight: 500,
              mb: 3,
              color: '#333'
            }}
          >
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 1, 
                fontWeight: 500,
                color: '#333'
              }}
            >
              Username
            </Typography>
            <TextField
              required
              fullWidth
              id="username"
              name="username"
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 14px',
                },
              }}
            />
            
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 1, 
                fontWeight: 500,
                color: '#333'
              }}
            >
              Password
            </Typography>
            <TextField
              required
              fullWidth
              name="password"
              type="password"
              id="password"
              placeholder="Enter password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 14px',
                },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: '#333',
                color: 'white',
                fontSize: '16px',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: '#555',
                },
                '&:disabled': {
                  backgroundColor: '#ccc',
                },
              }}
            >
              {loading ? 'Loading...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;