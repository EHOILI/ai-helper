import React from 'react';

function GamePage() {
  // The game is running on its own dev server for debugging
  const gameUrl = "https://fossil-leo.github.io/pasta/";

  return (
    <iframe
      src={gameUrl}
      title="Starlight Fever Game"
      style={{ border: 'none', width: '100vw', height: '100vh', margin: 0, padding: 0, display: 'block' }}
    />
  );
}

export default GamePage;