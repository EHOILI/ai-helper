import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import Tutor from '../components/Tutor';

const TutorPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ color: 'black', py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button variant="outlined" color="inherit" startIcon={<ExitToAppIcon />} onClick={() => navigate('/')}>
          나가기
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          AI 튜터
        </Typography>
        <Button variant="outlined" color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
          로그아웃
        </Button>
      </Box>
      <Tutor />
    </Container>
  );
};

export default TutorPage;

