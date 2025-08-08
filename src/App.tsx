import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import GamePage from './pages/GamePage';
import SelectionPage from './pages/SelectionPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/select" element={<SelectionPage />} />
    </Routes>
  );
}

export default App;
