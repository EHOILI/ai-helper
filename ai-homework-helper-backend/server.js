console.log('Server code version 2 running');
require('dotenv').config();
const connectDB = require('./config/db');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('./models/userModel'); // Import User model

const app = express();
const port = 3001;

// --- AI Model Setup -- -
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Connect to database
connectDB();

// --- Middlewares ---
app.use(cors({ origin: ['https://ehoili.github.io', 'https://ehoili.github.io/'] }));
app.use(express.json());

// --- Routes ---
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const rankingRoutes = require('./routes/rankingRoutes');
app.use('/api/ranking', rankingRoutes);

const schoolRoutes = require('./routes/schoolRoutes');
app.use('/api/schools', schoolRoutes);


// --- AI Tutor Route ---
app.post('/api/tutor/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: '질문이 필요합니다.' });
    }

    const prompt = `
      당신은 지식이 풍부하고 친절한 AI 튜터입니다. 학생의 질문에 대해 명확하고 이해하기 쉽게 설명해주세요.

      질문: "${question}"

      답변:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });

  } catch (error) {
    console.error('Error in /api/tutor/ask:', error);
    res.status(500).json({ message: 'AI 튜터 응답 생성 중 오류가 발생했습니다.' });
  }
});



// --- AI Explanation Route ---
app.post('/api/explain', async (req, res) => {
  try {
    const { question, context } = req.body;
    const { school, grade, semester, unit } = context;

    if (!question || !context) {
      return res.status(400).json({ message: '질문과 학습 단원 정보가 필요합니다.' });
    }

    const prompt = `
      당신은 친절하고 유능한 초중고 수학 학습 도우미입니다. 다음 내용을 반드시 지켜서 답변해주세요.

      1.  **역할**: ${school} ${grade} 학생을 가르치는 수학 선생님
      2.  **학습 단원**: ${semester} '${unit}'
      3.  **질문**: "${question}"
      4.  **요청사항**: 위 질문에 대해, 해당 학년 학생의 눈높이에 맞춰 단계별로 친절하고 자세하게 설명해주세요. 핵심 개념을 먼저 짚어주고, 예시를 들어 이해를 도와주세요.

      답변:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ explanation: text });

  } catch (error) {
    console.error('Error in /api/explain:', error);
    res.status(500).json({ message: 'AI 해설 생성 중 오류가 발생했습니다.' });
  }
});


// --- AI Problem Generation Route ---
app.post('/api/generate-problem', async (req, res) => {
  try {
    const { context } = req.body;
    const { school, grade, semester, unit } = context;

    if (!context) {
      return res.status(400).json({ message: '학습 단원 정보가 필요합니다.' });
    }

    const prompt = `
      당신은 유능한 초중고 수학 문제 출제자입니다. 다음 조건에 맞춰 수학 문제를 하나 출제해주세요.

      1.  **역할**: ${school} ${grade} 학생을 위한 수학 문제 출제
      2.  **학습 단원**: ${semester} '${unit}'
      3.  **요청사항**: 위 학습 단원의 핵심 개념을 활용하는, 너무 쉽지도 어렵지도 않은 적당한 난이도의 **객관식 문제**를 출제해주세요. 4개의 선택지를 포함해야 하며, 그 중 하나만 정답이어야 합니다.
      4.  **출력 형식**: 반드시 다음 JSON 형식에 맞춰 문제, 4개의 선택지(options), 그리고 정답(answer)을 각각의 필드에 담아 출력해주세요.
          // {
          //   "problem": "여기에 문제를 작성하세요.",
          //   "options": ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
          //   "answer": "정답에 해당하는 선택지"
          // }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response to make sure it's valid JSON
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let problemData;
    try {
      problemData = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse JSON from AI response:', text);
      // Send a structured error to the frontend
      return res.status(500).json({ 
        message: 'AI 응답을 처리하는 중 오류가 발생했습니다.',
        error: 'Invalid JSON format from AI.'
      });
    }

    res.status(200).json(problemData);

  } catch (error) {
    console.error('Error in /api/generate-problem:', error);
    res.status(500).json({ message: 'AI 문제 생성 중 오류가 발생했습니다.' });
  }
});


// --- Easter Egg Route ---
app.post('/api/user/easter-egg', async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId === undefined) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isBoosterActive = user.xpBoosterExpires && user.xpBoosterExpires > Date.now();
    const xpGained = isBoosterActive ? 1000 : 500;

    user.money += 100000;
    user.xp += xpGained;

    // Update reputation based on XP
    const oldReputation = user.reputation;
    if (user.xp >= 500) {
      user.reputation = '프로';
    } else if (user.xp >= 250) {
      user.reputation = '미들';
    } else if (user.xp >= 50) {
      user.reputation = '루키';
    }

    const reputationChanged = oldReputation !== user.reputation;

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Easter egg reward granted!',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        xp: updatedUser.xp,
        money: updatedUser.money,
        reputation: updatedUser.reputation,
        inventory: updatedUser.inventory,
        xpBoosterExpires: updatedUser.xpBoosterExpires,
      },
      reputationChanged,
    });

  } catch (error) {
    console.error('Error in /api/user/easter-egg:', error);
    res.status(500).json({ message: 'Failed to grant easter egg reward' });
  }
});

// --- Shop Route ---
app.post('/api/shop/buy', async (req, res) => {
  try {
    const { userId, itemName, itemCost } = req.body;
    if (userId === undefined || !itemName || itemCost === undefined) {
      return res.status(400).json({ message: 'User ID, item name, and item cost are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.money < itemCost) {
      return res.status(400).json({ message: '머니가 부족합니다.' });
    }

    // Handle item effect
    if (itemName === 'XP 2배 부스터 (1일)') {
      const isBoosterActive = user.xpBoosterExpires && user.xpBoosterExpires > Date.now();
      if (isBoosterActive) {
        return res.status(400).json({ message: '이미 부스터가 활성화되어 있습니다.' });
      }
      user.xpBoosterExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
    } else {
      if (user.inventory.includes(itemName)) {
        return res.status(400).json({ message: '이미 보유한 아이템입니다.' });
      }
      user.inventory.push(itemName);
    }

    user.money -= itemCost;

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Purchase successful!',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        xp: updatedUser.xp,
        money: updatedUser.money,
        reputation: updatedUser.reputation,
        inventory: updatedUser.inventory,
        xpBoosterExpires: updatedUser.xpBoosterExpires,
      },
    });

  } catch (error) {
    console.error('Error in /api/shop/buy:', error);
    res.status(500).json({ message: 'Failed to process purchase' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});