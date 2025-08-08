import React, { useState, useContext, useEffect } from 'react';
import { AppContext, SolvedProblem } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

function Chat() {
  const context = useContext(AppContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentProblem, setCurrentProblem] = useState<{ question: string; answer: number; explanation?: string } | null>(null);
  const [isQuitting, setIsQuitting] = useState(false);
  const [quittingQuizProblem, setQuittingQuizProblem] = useState<SolvedProblem | null>(null);
  const [currentUnitQuiz, setCurrentUnitQuiz] = useState<{ unit: string; problems: SolvedProblem[]; currentIndex: number } | null>(null);
  const navigate = useNavigate();

  // 모든 useEffect Hooks는 조건문보다 먼저 호출되어야 합니다.
  useEffect(() => {
    if (!context) { // context가 유효한지 먼저 확인
      return;
    }
    const { userAge } = context; // userAge를 구조 분해 할당
    // context가 유효하므로, userAge에 안전하게 접근할 수 있습니다.
    if (messages.length === 0 && userAge === null) {
      setMessages([{ sender: 'bot', text: '안녕하세요! AI 숙제 비서입니다. 몇 살이신가요?' }]);
    } else if (messages.length === 0 && userAge !== null) {
      setMessages([{ sender: 'bot', text: `안녕하세요! ${userAge}살이시군요. 무엇을 도와드릴까요?` }]);
    }
  }, [context, messages.length]); // 의존성 배열에 context 추가

  if (!context) {
    return <div>Loading...</div>;
  }
  // context에서 필요한 모든 변수를 구조 분해 할당
  const { setGameMoney, addCalendarEvent, solvedProblems, addSolvedProblem, updateLearningProgress, userAge, setUserAge, learningProgress } = context;

  // --- AI 비서의 지식 베이스 (확장 가능) ---
  const knowledgeBase: { [key: string]: string } = {
    'A가 뭐야?': 'A는 알파벳의 첫 번째 글자입니다.',
    '수학이란?': '수학은 수량, 구조, 공간, 변화 등의 개념을 다루는 학문입니다.',
    '과학이란?': '과학은 자연 현상을 탐구하고 이해하기 위한 체계적인 지식 체계입니다.',
    '역사란?': '역사는 과거의 사건들을 기록하고 해석하여 현재와 미래를 이해하는 학문입니다.',
    '오늘 날씨': '저는 AI 비서라서 실시간 날씨 정보는 알 수 없어요. 인터넷 검색을 이용해주세요!',
    '인공지능': '인공지능(AI)은 인간의 학습 능력, 추론 능력, 지각 능력 등을 컴퓨터 프로그램으로 구현한 기술입니다.',
    '공부 잘하는 법': '꾸준히 복습하고, 이해가 안 되는 부분은 질문하며, 충분한 휴식을 취하는 것이 중요해요!',
  };

  // --- 문제 생성 로직 (더 다양하게) ---
  const generateMathProblem = (level: 'easy' | 'medium' | 'hard' | 'fraction' | 'equation') => {
    let num1: number;
    let num2: number;
    let operator: string;
    let problemQuestion: string = ''; // 초기화
    let problemAnswer: number = 0; // 초기화
    let problemExplanation: string = ''; // 초기화

    if (level === 'easy') {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operator = Math.random() > 0.5 ? '+' : '-';
      if (operator === '+') {
        problemAnswer = num1 + num2;
        problemQuestion = `${num1} + ${num2} = ?`;
        problemExplanation = `${num1}에 ${num2}를 더하면 ${problemAnswer}이 됩니다.`;
      } else {
        problemAnswer = num1 - num2;
        problemQuestion = `${num1} - ${num2} = ?`;
        problemExplanation = `${num1}에서 ${num2}를 빼면 ${problemAnswer}이 됩니다.`;
      }
    } else if (level === 'medium') {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      const operators = ['+', '-', '*'];
      operator = operators[Math.floor(Math.random() * operators.length)];

      if (operator === '+') {
        problemAnswer = num1 + num2;
        problemQuestion = `${num1} + ${num2} = ?`;
        problemExplanation = `${num1}에 ${num2}를 더하면 ${problemAnswer}이 됩니다.`;
      } else if (operator === '-') {
        problemAnswer = num1 - num2;
        problemQuestion = `${num1} - ${num2} = ?`;
        problemExplanation = `${num1}에서 ${num2}를 빼면 ${problemAnswer}이 됩니다.`;
      } else {
        problemAnswer = num1 * num2;
        problemQuestion = `${num1} * ${num2} = ?`;
        problemExplanation = `${num1}과 ${num2}를 곱하면 ${problemAnswer}이 됩니다.`;
      }
    } else if (level === 'hard') {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      const operators = ['+', '-', '*', '/'];
      operator = operators[Math.floor(Math.random() * operators.length)];

      if (operator === '+') {
        problemAnswer = num1 + num2;
        problemQuestion = `${num1} + ${num2} = ?`;
        problemExplanation = `${num1}에 ${num2}를 더하면 ${problemAnswer}이 됩니다.`;
      } else if (operator === '-') {
        problemAnswer = num1 - num2;
        problemQuestion = `${num1} - ${num2} = ?`;
        problemExplanation = `${num1}에서 ${num2}를 빼면 ${problemAnswer}이 됩니다.`;
      } else if (operator === '*') { // Corrected: check operator, not level
        problemAnswer = num1 * num2;
        problemQuestion = `${num1} * ${num2} = ?`;
        problemExplanation = `${num1}과 ${num2}를 곱하면 ${problemAnswer}이 됩니다.`;
      } else { // This will be for '/'
        problemAnswer = Math.floor(num1 / num2);
        problemQuestion = `${num1} / ${num2} = ? (몫만 입력)`;
        problemExplanation = `${num1}을 ${num2}로 나누면 몫은 ${problemAnswer}이 됩니다.`;
      }
    } else if (level === 'fraction') {
      const denominator = Math.floor(Math.random() * 5) + 2;
      const numerator1 = Math.floor(Math.random() * (denominator - 1)) + 1;
      const numerator2 = Math.floor(Math.random() * (denominator - 1)) + 1;
      operator = Math.random() > 0.5 ? '+' : '-';

      if (operator === '+') {
        problemAnswer = numerator1 + numerator2;
        problemQuestion = `${numerator1}/${denominator} + ${numerator2}/${denominator} = ? (분자만 입력)`;
        problemExplanation = `두 분수의 분모가 같으므로 분자끼리 더하면 ${numerator1} + ${numerator2} = ${problemAnswer}이 됩니다. 따라서 답은 ${problemAnswer}/${denominator}입니다.`;
      } else {
        problemAnswer = numerator1 - numerator2;
        problemQuestion = `${numerator1}/${denominator} - ${numerator2}/${denominator} = ? (분자만 입력)`;
        problemExplanation = `두 분수의 분모가 같으므로 분자끼리 빼면 ${numerator1} - ${numerator2} = ${problemAnswer}이 됩니다. 따라서 답은 ${problemAnswer}/${denominator}입니다.`;
      }
    } else if (level === 'equation') {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      operator = Math.random() > 0.5 ? '+' : '-';

      if (operator === '+') {
        problemAnswer = b - a;
        problemQuestion = `x + ${a} = ${b}, x는?`;
        problemExplanation = `x를 구하려면 ${b}에서 ${a}를 빼면 됩니다. ${b} - ${a} = ${problemAnswer}이므로 x는 ${problemAnswer}입니다.`;
      } else {
        problemAnswer = b + a;
        problemQuestion = `x - ${a} = ${b}, x는?`;
        problemExplanation = `x를 구하려면 ${b}에 ${a}를 더하면 됩니다. ${b} + ${a} = ${problemAnswer}이므로 x는 ${problemAnswer}입니다.`;
      }
    }
    return { question: problemQuestion, answer: problemAnswer, explanation: problemExplanation };
  };

  // --- 단원 평가 문제 세트 (확장 가능) ---
  const unitProblems: { [unit: string]: SolvedProblem[] } = {
    '1단원': [
      { question: '5 + 3 = ?', answer: 8, explanation: '5에 3을 더하면 8입니다.' },
      { question: '10 - 4 = ?', answer: 6, explanation: '10에서 4를 빼면 6입니다.' },
      { question: '2 * 7 = ?', answer: 14, explanation: '2와 7을 곱하면 14입니다.' },
    ],
    '2단원': [
      { question: '15 / 3 = ? (몫만 입력)', answer: 5, explanation: '15를 3으로 나누면 몫은 5입니다.' },
      { question: '1/4 + 2/4 = ? (분자만 입력)', answer: 3, explanation: '분모가 같으므로 분자끼리 더하면 1+2=3입니다.' },
      { question: 'x + 7 = 12, x는?', answer: 5, explanation: '12에서 7을 빼면 5입니다.' },
    ],
  };

  const handleSendMessage = async () => { // async 함수로 변경
    if (input.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: input };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);

    let botResponseText = '';

    // --- 나이 입력 처리 ---
    if (userAge === null) {
      const age = parseInt(input.trim());
      if (!isNaN(age) && age > 0 && age < 100) { // 적절한 나이 범위 설정
        setUserAge(age);
        botResponseText = `${age}살이시군요! 이제 학습을 시작해볼까요?`;
      } else {
        botResponseText = '나이를 정확히 입력해주세요. (예: 10)';
      }
    } else if (isQuitting) {
      // --- '그만할래' 퀴즈 모드 처리 ---
      if (quittingQuizProblem) {
        const userAnswer = parseInt(input.trim());
        if (!isNaN(userAnswer) && userAnswer === quittingQuizProblem.answer) {
          botResponseText = '정답입니다! 오늘 하루도 수고했어요! 다음에 또 만나요!';
          setIsQuitting(false);
          setQuittingQuizProblem(null);
          navigate('/'); // 로비로 이동
        } else {
          botResponseText = '오답입니다. 다시 시도해보세요. 힌트: ' + (quittingQuizProblem.explanation || '해설 없음');
        }
      } else {
        botResponseText = '오류가 발생했습니다. 다시 시도해주세요.';
        setIsQuitting(false);
      }
    } else if (currentUnitQuiz) {
      // --- 단원 평가 퀴즈 모드 처리 ---
      const problem = currentUnitQuiz.problems[currentUnitQuiz.currentIndex];
      const userAnswer = parseInt(input.trim());

      if (!isNaN(userAnswer) && userAnswer === problem.answer) {
        botResponseText = '정답입니다!';
        addSolvedProblem(problem); // 풀었던 문제 저장
        updateLearningProgress({ correctAnswers: (learningProgress.correctAnswers || 0) + 1 });

        if (currentUnitQuiz.currentIndex < currentUnitQuiz.problems.length - 1) {
          const nextIndex = currentUnitQuiz.currentIndex + 1;
          setCurrentUnitQuiz({ ...currentUnitQuiz, currentIndex: nextIndex });
          botResponseText += ` 다음 문제: ${currentUnitQuiz.problems[nextIndex].question} (답변은 숫자로만 입력해주세요.)`;
        } else {
          botResponseText += ' 모든 단원 평가 문제를 다 풀었습니다! 수고했어요!';
          setCurrentUnitQuiz(null);
          // TODO: 단원 평가 완료 보상 지급
        }
      } else {
        botResponseText = '오답입니다. 다시 시도해보세요. 힌트: ' + (problem.explanation || '해설 없음');
      }
      updateLearningProgress({ totalProblemsSolved: (learningProgress.totalProblemsSolved || 0) + 1 });
    } else if (input.startsWith('/해설')) {
      if (currentProblem && currentProblem.explanation !== undefined) {
        botResponseText = `문제 해설: ${currentProblem.explanation}`; 
      } else {
        botResponseText = '현재 풀고 있는 문제가 없거나 해설을 제공할 수 없습니다.';
      }
    } else if (input.startsWith('/문제')) {
      let problemLevel: 'easy' | 'medium' | 'hard' | 'fraction' | 'equation' = 'easy';
      if (userAge !== null) {
        if (userAge <= 7) {
          problemLevel = 'easy';
        } else if (userAge <= 10) {
          problemLevel = 'medium';
        } else if (userAge <= 13) {
          problemLevel = 'hard';
        } else {
          problemLevel = 'equation'; // 14세 이상은 방정식
        }
      }
      const problem = generateMathProblem(problemLevel);
      setCurrentProblem(problem);
      botResponseText = `새로운 문제가 출제되었습니다: ${problem.question} (답변은 숫자로만 입력해주세요.)`;
    } else if (currentProblem) {
      updateLearningProgress({ totalProblemsSolved: (learningProgress.totalProblemsSolved || 0) + 1 });
      const userAnswer = parseInt(input.trim());
      if (!isNaN(userAnswer) && userAnswer === currentProblem.answer) {
        botResponseText = '정답입니다! 게임 머니 50을 획득했습니다.';
        setGameMoney(prevMoney => prevMoney + 50);
        addSolvedProblem({ question: currentProblem.question, answer: currentProblem.answer, explanation: currentProblem.explanation }); // 풀었던 문제 저장
        updateLearningProgress({ correctAnswers: (learningProgress.correctAnswers || 0) + 1 });
        setCurrentProblem(null);
      } else {
        if (currentProblem.explanation !== undefined) {
          botResponseText = '오답입니다. 다시 시도해보세요. 힌트: ' + currentProblem.explanation;
        } else {
          botResponseText = '오답입니다. 다시 시도해보세요.';
        }
      }
    } else if (input === '그만할래') {
      if (solvedProblems.length > 0) {
        setIsQuitting(true);
        const randomProblem = solvedProblems[Math.floor(Math.random() * solvedProblems.length)];
        setQuittingQuizProblem(randomProblem);
        botResponseText = `오늘 풀었던 문제 위주로 퀴즈를 낼 테니까 맞추면 보내 줄게! 문제: ${randomProblem.question} (답변은 숫자로만 입력해주세요.)`;
      } else {
        botResponseText = '아직 풀었던 문제가 없어서 퀴즈를 낼 수 없어요. 다음에 다시 시도해주세요!';
      }
    } else if (input.startsWith('/단원평가')) {
      const unit = input.split(' ')[1];
      if (unit && unitProblems[unit]) {
        setCurrentUnitQuiz({ unit, problems: unitProblems[unit], currentIndex: 0 });
        botResponseText = `${unit} 단원 평가를 시작합니다. 첫 번째 문제: ${unitProblems[unit][0].question} (답변은 숫자로만 입력해주세요.)`;
      } else {
        botResponseText = '해당 단원을 찾을 수 없습니다. (예: /단원평가 1단원)';
      }
    } else if (input.startsWith('/목표설정')) {
      const goal = input.substring(input.indexOf(' ') + 1).trim();
      if (goal) {
        botResponseText = `'${goal}'을(를) 학습 목표로 설정했습니다! 꾸준히 노력하면 달성할 수 있을 거예요!`;
        // TODO: 학습 목표를 AppContext에 저장하고 추적하는 로직 추가
      } else {
        botResponseText = '학습 목표를 입력해주세요. (예: /목표설정 매일 10문제 풀기)';
      }
    } else if (input.startsWith('/추천')) {
      const topic = input.substring(input.indexOf(' ') + 1).trim();
      if (topic) {
        botResponseText = `'${topic}'에 대한 학습 자료를 추천합니다: 
- [${topic} 개념 정리](https://example.com/concept/${topic})
- [${topic} 문제 풀이](https://example.com/problems/${topic})
- [${topic} 관련 영상](https://youtube.com/watch?v=${topic})`;
      } else {
        botResponseText = '추천받고 싶은 학습 주제를 입력해주세요. (예: /추천 수학)';
      }
    } else if (input.startsWith('/일정추가')) {
      const parts = input.split(' ');
      if (parts.length >= 3) {
        const date = parts[1];
        const title = parts.slice(2).join(' ');
        addCalendarEvent({ date, title });
        botResponseText = `'${date}'에 '${title}' 일정을 추가했습니다.`;
      } else {
        botResponseText = '일정 추가 형식이 올바르지 않습니다. /일정추가 [날짜] [내용] 형식으로 입력해주세요.';
      }
    } else if (input.includes('일정')) {
      botResponseText = '일정 관리 기능을 실행합니다. /일정추가 [날짜] [내용] 형식으로 입력해주세요.';
    } else if (input.includes('질문')) {
      const query = input.substring(input.indexOf('질문') + 2).trim();
      if (knowledgeBase[query]) {
        botResponseText = knowledgeBase[query];
      } else {
        // Gemini API 호출
        try {
          const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: input }),
          });
          const data = await response.json();
          botResponseText = data.reply || '죄송합니다. 답변을 가져올 수 없습니다.';
        } catch (error) {
          console.error('Error communicating with backend:', error);
          botResponseText = '죄송합니다. AI 비서와 통신하는 데 문제가 발생했습니다.';
        }
      }
    } else if (input.startsWith('/도움말')) {
      botResponseText = '제가 할 수 있는 명령어는 다음과 같습니다:\n- /문제 [easy|medium|hard|fraction|equation]: 난이도별 문제 출제\n- /해설: 현재 문제 해설\n- /단원평가 [단원명]: 단원 평가 시작\n- /일정추가 [날짜] [내용]: 일정 추가\n- /목표설정 [목표]: 학습 목표 설정\n- /추천 [주제]: 학습 자료 추천\n- /질문 [내용]: 지식 검색\n- /학습경로: 나이에 맞는 학습 경로 추천\n- 그만할래: 퀴즈 풀고 종료';
    } else if (input.startsWith('/학습경로')) {
      if (userAge !== null) {
        let pathText = '';
        if (userAge <= 7) {
          pathText = '초등 저학년을 위한 기초 연산 및 한글 학습';
        } else if (userAge <= 10) {
          pathText = '초등 고학년을 위한 심화 연산 및 독해력 향상';
        } else if (userAge <= 13) {
          pathText = '중학생을 위한 개념 이해 및 문제 해결 능력 강화';
        } else {
          pathText = '고등학생 이상을 위한 심화 학습 및 진로 탐색';
        }
        botResponseText = `${userAge}살이시군요! ${pathText}에 집중하는 것을 추천합니다.`;
      } else {
        botResponseText = '학습 경로를 추천해드리려면 나이를 먼저 알려주세요!';
      }
    } else if (input.startsWith('/학습진도')) {
      if (learningProgress.totalProblemsSolved > 0) {
        const accuracy = ((learningProgress.correctAnswers / learningProgress.totalProblemsSolved) * 100).toFixed(2);
        botResponseText = `현재까지 총 ${learningProgress.totalProblemsSolved}문제를 풀었고, ${learningProgress.correctAnswers}문제를 맞혔습니다. 정답률은 ${accuracy}%입니다. 정말 잘하고 있어요!`;
      } else {
        botResponseText = '아직 풀었던 문제가 없어서 학습 진도를 알려드릴 수 없어요. 문제를 풀어보세요!';
      }
    } else if (input.startsWith('/칭찬해줘')) {
      const compliments = [
        '정말 대단해요! 당신의 노력은 빛을 발할 거예요!',
        '최고예요! 이대로만 하면 못할 게 없을 거예요!',
        '아주 잘하고 있어요! 당신의 잠재력은 무한합니다!',
        '훌륭해요! 당신의 열정이 저를 감동시키네요!',
        '멋져요! 당신은 이미 충분히 잘하고 있습니다!',
      ];
      botResponseText = compliments[Math.floor(Math.random() * compliments.length)];
    } else {
      // 일반적인 대화 처리 (Gemini-like AI 시뮬레이션)
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('안녕') || lowerInput.includes('하이')) {
        botResponseText = '안녕하세요! 무엇을 도와드릴까요?';
      } else if (lowerInput.includes('고마워') || lowerInput.includes('감사')) {
        botResponseText = '천만에요! 언제든지 도와드릴 준비가 되어있습니다. 정말 잘하고 있어요!';
      } else if (lowerInput.includes('잘가') || lowerInput.includes('안녕히')) {
        botResponseText = '다음에 또 만나요! 즐거운 학습 시간 되세요! 오늘 하루도 최고였어요!';
      } else {
        const encouragingMessages = [
          `'${input}'이라고 하셨네요! 정말 멋진 질문이에요!`, 
          `'${input}'이 궁금하시군요! 궁금증을 해결하려는 모습이 정말 대단해요!`, 
          `'${input}'에 대해 더 자세히 알아볼까요? 당신의 열정을 응원합니다!`, 
          `'${input}'이라고 하셨네요! 포기하지 않는 모습이 정말 자랑스러워요!`, 
          `'${input}'이라고 하셨네요! 당신은 할 수 있어요!`, 
        ];
        botResponseText = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      }
    }

    setInput('');

    setTimeout(() => {
      setMessages([...newMessages, { sender: 'bot', text: botResponseText }]);
    }, 500);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2 className="ai-assistant">AI 비서</h2>
        <button onClick={() => navigate('/')} className="ai-assistant">나가기</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>전송</button>
      </div>
    </div>
  );
}

export default Chat;