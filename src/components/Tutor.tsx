import React, { useState } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Tutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: '안녕하세요! 무엇이든 물어보세요.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <p><em>AI가 답변을 생각하고 있습니다...</em></p>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="AI 튜터에게 질문하기..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? '전송중...' : '전송'}
        </button>
      </div>
    </div>
  );
};

export default Tutor;
