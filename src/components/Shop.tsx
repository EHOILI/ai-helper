import React, { useContext } from 'react';
import { AppContext, Item } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { shopItems } from '../data/shopItems';

function Shop() {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) {
    return <div>Loading...</div>;
  }

  const { gameMoney, buyItem, inventory } = context;

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1 className="ai-assistant">아이템 상점</h1>
        <button onClick={() => navigate('/')} className="ai-assistant">나가기</button>
      </div>
      <p className="ai-assistant">현재 게임 머니: {gameMoney}</p>
      <div className="item-list">
        {shopItems.map(item => (
          <div key={item.id} className="item-card">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>가격: {item.cost}</p>
            <button onClick={() => buyItem(item)} disabled={gameMoney < item.cost || inventory.some(i => i.id === item.id)}>
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