import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Box, Typography, Button, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

function Lobby() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/select');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'rgba(0, 0, 0, 0.87)', // Set text color to black for better contrast on light background
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
        {user && (
          <Button
            variant="text"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={logout}
          >
            Logout
          </Button>
        )}
      </Box>

      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            AI Homework Helper
          </Typography>
          <Typography variant="h5" component="p" color="rgba(0, 0, 0, 0.6)" paragraph>
            숙제, 질문, 그리고 게임까지. 당신의 AI 학습 파트너와 함께하세요.
          </Typography>

          {user ? (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {user.user.username}님, 환영합니다!
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                평판: {user.user.reputation || '스타터'} | XP: {user.user.xp || 0} | 머니: {user.user.money || 0}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<SchoolIcon />}
                onClick={handleStart}
                sx={{ 
                  py: 2, 
                  px: 4, 
                  borderRadius: '50px', 
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
              >
                학습 시작하기
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{ 
                mt: 4, 
                py: 2, 
                px: 4, 
                borderRadius: '50px', 
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              로그인하여 시작
            </Button>
          )}
        </Box>
      </Container>

      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="body2" color="rgba(0, 0, 0, 0.6)">
          © 2024 AI Helper Project. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default Lobby;