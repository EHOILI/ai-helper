require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

// --- AI Model Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- In-memory database for debugging ---
const users = [];
const JWT_SECRET = 'your-super-secret-key-change-it-later';

// --- Middlewares ---
app.use(cors());
app.use(express.json());

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
      3.  **요청사항**: 위 학습 단원의 핵심 개념을 활용하는, 너무 쉽지도 어렵지도 않은 적당한 난이도의 서술형 또는 단답형 문제를 출제해주세요.
      4.  **출력 형식**: 반드시 다음 JSON 형식에 맞춰 문제와 정답(풀이과정 없이 답만)을 각각의 필드에 담아 출력해주세요.
          \`\`\`json
          {
            "problem": "여기에 문제를 작성하세요.",
            "answer": "여기에 정답을 작성하세요."
          }
          \`\`\`
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response to make sure it's valid JSON
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const problemData = JSON.parse(text);

    res.status(200).json(problemData);

  } catch (error) {
    console.error('Error in /api/generate-problem:', error);
    res.status(500).json({ message: 'AI 문제 생성 중 오류가 발생했습니다.' });
  }
});


// --- User Progress Update Route ---
app.post('/api/user/update-progress', (req, res) => {
  try {
    const { userId } = req.body;
    if (userId === undefined) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isBoosterActive = user.xpBoosterExpires && user.xpBoosterExpires > Date.now();
    const xpGained = isBoosterActive ? 20 : 10;

    user.money += 100;
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

    res.status(200).json({
      message: 'Progress updated successfully',
      user: {
        id: user.id,
        username: user.username,
        xp: user.xp,
        money: user.money,
        reputation: user.reputation,
        inventory: user.inventory,
        xpBoosterExpires: user.xpBoosterExpires,
      },
      reputationChanged,
    });

  } catch (error) {
    console.error('Error in /api/user/update-progress:', error);
    res.status(500).json({ message: 'Failed to update user progress' });
  }
});


// --- Easter Egg Route ---
app.post('/api/user/easter-egg', (req, res) => {
  try {
    const { userId } = req.body;
    if (userId === undefined) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = users.find(u => u.id === userId);
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

    res.status(200).json({
      message: 'Easter egg reward granted!',
      user: {
        id: user.id,
        username: user.username,
        xp: user.xp,
        money: user.money,
        reputation: user.reputation,
        inventory: user.inventory,
        xpBoosterExpires: user.xpBoosterExpires,
      },
      reputationChanged,
    });

  } catch (error) {
    console.error('Error in /api/user/easter-egg:', error);
    res.status(500).json({ message: 'Failed to grant easter egg reward' });
  }
});

// --- Shop Route ---
app.post('/api/shop/buy', (req, res) => {
  try {
    const { userId, itemName, itemCost } = req.body;
    if (userId === undefined || !itemName || itemCost === undefined) {
      return res.status(400).json({ message: 'User ID, item name, and item cost are required' });
    }

    const user = users.find(u => u.id === userId);
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

    res.status(200).json({
      message: 'Purchase successful!',
      user: {
        id: user.id,
        username: user.username,
        xp: user.xp,
        money: user.money,
        reputation: user.reputation,
        inventory: user.inventory,
        xpBoosterExpires: user.xpBoosterExpires,
      },
    });

  } catch (error) {
    console.error('Error in /api/shop/buy:', error);
    res.status(500).json({ message: 'Failed to process purchase' });
  }
});


// --- Auth Routes ---

app.get('/api/status', (req, res) => {
  res.send('AI Homework Helper Backend is running!');
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const userExists = users.find((user) => user.username === username);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = { 
      id: users.length + 1, 
      username, 
      password: hashedPassword,
      xp: 0,
      money: 0,
      reputation: '스타터',
      inventory: [],
      xpBoosterExpires: null,
    };
    users.push(user);
    console.log('User registered:', user); // Log for debugging

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: { 
        id: user.id, 
        username: user.username,
        xp: user.xp,
        money: user.money,
        reputation: user.reputation,
        inventory: user.inventory,
        xpBoosterExpires: user.xpBoosterExpires,
      },
    });
  } catch (error) {
    console.error('Error in /api/users/register:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      token,
      user: { 
        id: user.id, 
        username: user.username,
        xp: user.xp || 0,
        money: user.money || 0,
        reputation: user.reputation || '스타터',
        inventory: user.inventory || [],
        xpBoosterExpires: user.xpBoosterExpires || null,
      },
    });
  } catch (error) {
    console.error('Error in /api/users/login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});