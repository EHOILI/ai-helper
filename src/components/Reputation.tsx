import React from 'react';

interface ReputationProps {
  level: '스타터' | '루키' | '미들' | '리더' | '프로' | '마스터';
}

const Reputation: React.FC<ReputationProps> = ({ level }) => {
  const getCharacterImage = () => {
    switch (level) {
      case '스타터':
        return 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Level+1:+Starter';
      case '루키':
        return 'https://via.placeholder.com/150/FFA500/FFFFFF?text=Level+2:+Rookie';
      case '미들':
        return 'https://via.placeholder.com/150/FFFF00/000000?text=Level+3:+Middle';
      case '리더':
        return 'https://via.placeholder.com/150/008000/FFFFFF?text=Level+4:+Leader';
      case '프로':
        return 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Level+5:+Pro';
      case '마스터':
        return 'https://via.placeholder.com/150/800080/FFFFFF?text=Level+6:+Master';
      default:
        return '';
    }
  };

  return (
    <div className="reputation">
      <h2 className="ai-assistant">평판: {level}</h2>
      <img src={getCharacterImage()} alt={level} className={`reputation-character reputation-level-${level}`} />
    </div>
  );
};

export default Reputation;