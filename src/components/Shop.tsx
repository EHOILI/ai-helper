import React, { useContext } from 'react';
import { AppContext, Item } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트

const shopItems: Item[] = [
  { id: 'skin-1', name: '귀여운 아바타 스킨', description: 'AI 비서의 외형을 귀엽게 바꿔줍니다.', price: 500 },
  { id: 'hint-ticket', name: '문제 해설 힌트', description: '문제 해설 시 힌트를 얻을 수 있는 티켓입니다.', price: 100 },
];

function Shop() {
  const context = useContext(AppContext);
  const navigate = useNavigate(); // useNavigate 훅 사용

  if (!context) {
    return <div>Loading...</div>;
  }

  const { money, buyItem, inventory } = context;

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1 className="ai-assistant">아이템 상점</h1>
        <button onClick={() => navigate('/')} className="ai-assistant">나가기</button>
      </div>
      <p className="ai-assistant">현재 머니: {money}</p>
      <div className="item-list">
        {shopItems.map(item => (
          <div key={item.id} className="item-card">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>가격: {item.price}</p>
            <button onClick={() => buyItem(item)} disabled={money < item.price || inventory.some(i => i.id === item.id)}>
              {inventory.some(i => i.id === item.id) ? '구매 완료' : '구매하기'}
            </button>
          </div>
        ))}
      </div>
      <div className="inventory">
        <h2 className="ai-assistant">내 인벤토리</h2>
        {inventory.length === 0 ? (
          <p>보유한 아이템이 없습니다.</p>
        ) : (
          <ul>
            {inventory.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Shop;