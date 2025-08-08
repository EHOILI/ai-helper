import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Modal, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Alert } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAuth } from '../contexts/AuthContext';
import ImageIcon from '@mui/icons-material/Image'; // Placeholder Icon
import axios from 'axios';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  color: 'black'
};

const shopItems = [
  { name: '캐릭터 스킨 1', cost: 1000 },
  { name: 'XP 2배 부스터 (1일)', cost: 5000 },
];

function SelectionPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [reputationOpen, setReputationOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleBuyItem = async (itemName: string, itemCost: number) => {
    if (!user) return;

    try {
      const response = await axios.post('http://localhost:3001/api/shop/buy', {
        userId: user.user.id,
        itemName,
        itemCost,
      });
      updateUser(response.data.user);
      setAlertInfo({ open: true, message: '구매 완료!', severity: 'success' });
    } catch (error: any) {
      const message = error.response?.data?.message || '구매 중 오류가 발생했습니다.';
      setAlertInfo({ open: true, message, severity: 'error' });
    }
  };

  return (
    <Container maxWidth="sm">
      {alertInfo.open && (
        <Alert 
          severity={alertInfo.severity} 
          onClose={() => setAlertInfo({ ...alertInfo, open: false })}
          sx={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1500 }}
        >
          {alertInfo.message}
        </Alert>
      )}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: 'rgba(0, 0, 0, 0.87)',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          무엇을 하고 싶으신가요?
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2, width: '250px' }}>
          <Button variant="contained" size="large" startIcon={<ChatIcon />} onClick={() => navigate('/chat')} sx={{ py: 1.5, borderRadius: '50px', fontWeight: 'bold' }}>
            채팅하기
          </Button>
          <Button variant="contained" size="large" color="secondary" startIcon={<SportsEsportsIcon />} onClick={() => navigate('/game')} sx={{ py: 1.5, borderRadius: '50px', fontWeight: 'bold' }}>
            게임하기
          </Button>
          <Button variant="outlined" size="large" startIcon={<AccountCircleIcon />} onClick={() => setReputationOpen(true)} sx={{ py: 1.5, borderRadius: '50px', fontWeight: 'bold' }}>
            내 평판
          </Button>
          <Button variant="outlined" size="large" color="success" startIcon={<StorefrontIcon />} onClick={() => setShopOpen(true)} sx={{ py: 1.5, borderRadius: '50px', fontWeight: 'bold' }}>
            아이템 상점
          </Button>
        </Box>
      </Box>

      {/* Reputation Modal */}
      <Modal open={reputationOpen} onClose={() => setReputationOpen(false)}>
        <Paper sx={modalStyle}>
          <Typography variant="h6" component="h2">{user?.user.username}님의 정보</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography>평판: {user?.user.reputation || '스타터'}</Typography>
            <Typography>XP: {user?.user.xp || 0}</Typography>
            <Typography>게임 머니: {user?.user.money || 0}</Typography>
            <Typography>보유 아이템: {user?.user.inventory?.join(', ') || '없음'}</Typography>
          </Box>
        </Paper>
      </Modal>

      {/* Shop Modal */}
      <Modal open={shopOpen} onClose={() => setShopOpen(false)}>
        <Paper sx={modalStyle}>
          <Typography variant="h6" component="h2">아이템 상점</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>현재 보유 머니: {user?.user.money || 0}</Typography>
          <List>
            {shopItems.map((item) => {
              const isBooster = item.name.includes('부스터');
              const isBoosterActive = !!(isBooster && user?.user.xpBoosterExpires && user.user.xpBoosterExpires > Date.now());
              const isOwned = !!(!isBooster && user?.user.inventory?.includes(item.name));
              const canAfford = (user?.user.money || 0) >= item.cost;

              let buttonText = '구매';
              if (isOwned) buttonText = '보유중';
              if (isBoosterActive) buttonText = '활성 중';

              return (
                <React.Fragment key={item.name}>
                  <ListItem>
                    <ListItemAvatar><Avatar><ImageIcon /></Avatar></ListItemAvatar>
                    <ListItemText 
                      primary={item.name} 
                      secondary={isBoosterActive 
                        ? `만료: ${new Date(user!.user.xpBoosterExpires!).toLocaleString()}` 
                        : `${item.cost} 머니`
                      } 
                    />
                    <Button 
                      variant="contained" 
                      onClick={() => handleBuyItem(item.name, item.cost)}
                      disabled={!canAfford || isOwned || isBoosterActive}
                    >
                      {buttonText}
                    </Button>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      </Modal>
    </Container>
  );
}

export default SelectionPage;
