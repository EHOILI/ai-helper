import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, List, ListItem, Avatar, TextField, Button, CircularProgress, ListItemText } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Tutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: '안녕하세요! AI 튜터입니다. 무엇이든 물어보세요.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tutor/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage: Message = { sender: 'bot', text: data.response };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage: Message = { sender: 'bot', text: '죄송합니다. 답변을 가져오는 중 오류가 발생했습니다.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ height: '70vh', display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0, 0, 0, 0.3)' }}>
      <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((msg, index) => (
          <ListItem key={index} sx={{ flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <Avatar sx={{ bgcolor: msg.sender === 'bot' ? 'primary.main' : 'secondary.main', ml: msg.sender === 'user' ? 2 : 0, mr: msg.sender === 'bot' ? 2 : 0 }}>
              {msg.sender === 'bot' ? <SmartToyIcon /> : <PersonIcon />}
            </Avatar>
            <Paper elevation={1} sx={{ p: 1.5, borderRadius: '20px', bgcolor: msg.sender === 'user' ? '#1976d2' : '#424242', color: 'white', maxWidth: '70%' }}>
              <ListItemText primaryTypographyProps={{ sx: { whiteSpace: 'pre-wrap' } }} primary={msg.text} />
            </Paper>
          </ListItem>
        ))}
        {isLoading && <ListItem sx={{ justifyContent: 'center' }}><CircularProgress size={24} sx={{ color: 'white' }} /></ListItem>}
        <div ref={chatEndRef} />
      </List>
      <Box sx={{ p: 2, display: 'flex', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
          sx={{
            mr: 1,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& .Mui-disabled': { color: 'rgba(255, 255, 255, 0.5)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            },
          }}
        />
        <Button variant="contained" onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : '전송'}
        </Button>
      </Box>
    </Paper>
  );
};

export default Tutor;

