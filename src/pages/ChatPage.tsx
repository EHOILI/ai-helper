import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Container, TextField, Button, Paper, List, ListItem, ListItemText, Avatar, CircularProgress } from '@mui/material';
import { curriculum } from '../data/mathCurriculum';
import { useAuth } from '../contexts/AuthContext';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

interface Problem {
  problem: string;
  answer: string;
}

function ChatPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [semester, setSemester] = useState('');
  const [unit, setUnit] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [isWaitingForQuestion, setIsWaitingForQuestion] = useState(false);

  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (unit) {
      setIsWaitingForQuestion(false);
      setIsWaitingForAnswer(false);
      setCurrentProblem(null);
      setMessages([
        {
          sender: 'ai',
          text: `안녕하세요! '${unit}'을(를) 선택하셨네요! 무엇을 도와드릴까요? /해설 이라고 하시면 궁금하신 문제에 대해 알려드릴 수 있고, /문제 라고 하시면 단원에 알맞은 문제를 내드립니다! 맞히면 게임 머니도 드린답니다!`
        }
      ]);
    } else {
      setMessages([]);
    }
  }, [unit]);

  const triggerReward = async () => {
    if (!user) return;
    try {
      const response = await axios.post('http://localhost:3001/api/user/update-progress', { userId: user.user.id });
      updateUser(response.data.user);
      if (response.data.reputationChanged) {
        // Add a special message for rank up
        setTimeout(() => {
          setMessages(prev => [...prev, { sender: 'ai', text: `축하합니다! 평판이 ${response.data.user.reputation}(으)로 올랐습니다! 🌟` }]);
        }, 500);
      }
    } catch (error) {
      console.error("Failed to update user progress", error);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput.trim();
    setUserInput('');
    setIsLoading(true);

    try {
      if (currentInput === '//easter egg') {
        if (!user) return;
        const response = await axios.post('http://localhost:3001/api/user/easter-egg', { userId: user.user.id });
        updateUser(response.data.user);
        
        let messagesToAdd = [{ sender: 'ai' as const, text: "축하합니다! 이스터 에그를 발견하셨네요! 500 XP와 100,000 게임 머니를 드립니다! 💎" }];
        if (response.data.reputationChanged) {
          messagesToAdd.push({ sender: 'ai' as const, text: `엄청난 발견 덕분에 평판이 ${response.data.user.reputation}(으)로 올랐습니다! 🚀` });
        }
        setMessages(prev => [...prev, ...messagesToAdd]);

      } else if (isWaitingForAnswer && currentProblem) {
        // User is answering a problem
        const isCorrect = currentInput.replace(/\s+/g, '') === currentProblem.answer.replace(/\s+/g, '');
        let aiResponse = '';
        if (isCorrect) {
          aiResponse = `정답입니다! 100 게임 머니와 10 XP를 획득하셨어요! 🎉`;
          triggerReward();
        } else {
          aiResponse = `아쉽지만 틀렸어요. 정답은 '${currentProblem.answer}' 입니다. 다시 시도해보시겠어요?`;
        }
        setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        setCurrentProblem(null);
        setIsWaitingForAnswer(false);

      } else if (isWaitingForQuestion) {
        // User is asking for an explanation
        const response = await axios.post('http://localhost:3001/api/explain', {
          question: currentInput,
          context: { school, grade, semester, unit }
        });
        setMessages(prev => [...prev, { sender: 'ai', text: response.data.explanation }]);
        setIsWaitingForQuestion(false);
        triggerReward(); // Reward for asking a question

      } else if (currentInput === '/문제') {
        // User wants a problem
        const response = await axios.post('http://localhost:3001/api/generate-problem', {
          context: { school, grade, semester, unit }
        });
        const { problem, answer } = response.data;
        setCurrentProblem({ problem, answer });
        setMessages(prev => [...prev, { sender: 'ai', text: problem }]);
        setIsWaitingForAnswer(true);

      } else if (currentInput === '/해설') {
        // User wants to start an explanation
        setMessages(prev => [...prev, { sender: 'ai', text: '어떤 문제를 도와드릴까요?' }]);
        setIsWaitingForQuestion(true);

      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "죄송합니다. '/해설' 또는 '/문제' 명령어를 사용해주세요." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: '죄송해요, 요청을 처리하는 중에 오류가 발생했어요.' }]);
      setIsWaitingForAnswer(false);
      setIsWaitingForQuestion(false);
    } finally {
      setIsLoading(false);
    }
  };

  const gradeList = school ? Object.keys(curriculum[school]) : [];
  const semesterList = school && grade && curriculum[school][grade] ? Object.keys(curriculum[school][grade]) : [];
  const unitList = school && grade && semester && curriculum[school][grade]?.[semester] ? curriculum[school][grade][semester] : [];

  return (
    <Container maxWidth="md" sx={{ color: 'black', py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button variant="outlined" color="inherit" startIcon={<ExitToAppIcon />} onClick={() => navigate('/select')}>
          나가기
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          학습 내용 선택
        </Typography>
        <Button variant="outlined" color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
          로그아웃
        </Button>
      </Box>
      
      {!unit && (
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          아래에서 학습하고 싶은 단원을 선택해주세요.
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4, p: 3, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 2 }}>
        <FormControl fullWidth>
          <InputLabel>학교</InputLabel>
          <Select value={school} label="학교" onChange={(e) => { setSchool(e.target.value); setGrade(''); setSemester(''); setUnit(''); }}>
            {Object.keys(curriculum).map((sch) => <MenuItem key={sch} value={sch}>{sch}</MenuItem>)}
          </Select>
        </FormControl>

        {school && <FormControl fullWidth>
          <InputLabel>학년</InputLabel>
          <Select value={grade} label="학년" onChange={(e) => { setGrade(e.target.value); setSemester(''); setUnit(''); }}>
            {gradeList.map((gr) => <MenuItem key={gr} value={gr}>{gr}</MenuItem>)}
          </Select>
        </FormControl>}

        {grade && <FormControl fullWidth>
          <InputLabel>학기</InputLabel>
          <Select value={semester} label="학기" onChange={(e) => { setSemester(e.target.value); setUnit(''); }}>
            {semesterList.map((sem) => <MenuItem key={sem} value={sem}>{sem}</MenuItem>)}
          </Select>
        </FormControl>}

        {semester && <FormControl fullWidth>
          <InputLabel>단원</InputLabel>
          <Select value={unit} label="단원" onChange={(e) => setUnit(e.target.value)}>
            {unitList.map((un) => <MenuItem key={un} value={un}>{un}</MenuItem>)}
          </Select>
        </FormControl>}
      </Box>

      {unit && (
        <Paper elevation={3} sx={{ mt: 4, height: '60vh', display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0, 0, 0, 0.3)' }}>
          <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.map((msg, index) => (
              <ListItem key={index} sx={{ flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: msg.sender === 'ai' ? 'primary.main' : 'secondary.main', ml: msg.sender === 'user' ? 2 : 0, mr: msg.sender === 'ai' ? 2 : 0 }}>
                  {msg.sender === 'ai' ? <SmartToyIcon /> : <PersonIcon />}
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
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
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
      )}
    </Container>
  );
}

export default ChatPage;
