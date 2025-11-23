import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext, ReputationLevel } from '../contexts/AppContext';
import Reputation from './Reputation';

function Lobby() {
  const context = useContext(AppContext);
  const [showReputation, setShowReputation] = useState(false);

  if (!context) {
    return <div>Loading...</div>; // 또는 에러 처리
  }

  const { reputation, setReputation, money, setMoney, learningProgress } = context;

  const levelUp = () => {
    const levels: ReputationLevel[] = ['스타터', '루키', '미들', '리더', '프로', '마스터'];
    const currentIndex = levels.indexOf(reputation);
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1];
      setReputation(nextLevel);
      // 평판 상승에 따른 머니 지급
      setMoney(prevMoney => prevMoney + (currentIndex + 1) * 100); // 예시: 레벨에 따라 100, 200, 300... 지급
    }
  };

  return (
    <div className="lobby-container">
      <h1 className="ai-assistant">AI 숙제 비서 로비</h1>
      <div className="lobby-content">
        <div className="user-info">
          <button onClick={() => setShowReputation(!showReputation)} className="ai-assistant">
            {showReputation ? '평판 숨기기' : '평판 보기'}
          </button>
          {showReputation && <Reputation level={reputation} />}
          <button onClick={levelUp} className="ai-assistant">평판 올리기 (임시)</button>
          <div className="money">
            <h2 className="ai-assistant">머니: {money}</h2>
          </div>
          <div className="learning-progress">
            <h2 className="ai-assistant">학습 진도</h2>
            <p>총 문제 풀이: {learningProgress.totalProblemsSolved}개</p>
            <p>정답 개수: {learningProgress.correctAnswers}개</p>
            <p>정답률: {learningProgress.totalProblemsSolved > 0 ? ((learningProgress.correctAnswers / learningProgress.totalProblemsSolved) * 100).toFixed(2) : 0}%</p>
          </div>
        </div>
        <nav className="main-navigation">
          <Link to="/chat"><button className="ai-assistant">AI 비서와 대화</button></Link>
          <Link to="/calendar"><button className="ai-assistant">일정 관리</button></Link>
          <Link to="/shop"><button className="ai-assistant">아이템 상점</button></Link>
        </nav>
      </div>
    </div>
  );
}

export default Lobby;