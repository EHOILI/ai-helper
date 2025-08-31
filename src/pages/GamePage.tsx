import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

function GamePage() {
  // The game is running on its own dev server for debugging
  const gameUrl = "https://fossil-leo.github.io/pasta/";
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <iframe
        src={gameUrl}
        title="Starlight Fever Game"
        style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
      />
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{ position: 'absolute', top: 16, right: 16 }}
      >
        나가기
      </Button>
    </div>
  );
}

export default GamePage;