import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth
import api from '../api'; // Import your API instance

export type ReputationLevel = '스타터' | '루키' | '미들' | '리더' | '프로' | '마스터';

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
}

export interface SolvedProblem {
  question: string;
  answer: number;
  explanation?: string; // 해설 추가
}

export interface LearningProgress {
  totalProblemsSolved: number;
  correctAnswers: number;
  // 기타 학습 관련 지표 추가 가능
}

interface AppContextProps {
  reputation: ReputationLevel;
  setReputation: React.Dispatch<React.SetStateAction<ReputationLevel>>;
  gameMoney: number;
  setGameMoney: React.Dispatch<React.SetStateAction<number>>;
  inventory: Item[];
  buyItem: (item: Item) => Promise<void>; // Change to async function
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  solvedProblems: SolvedProblem[];
  addSolvedProblem: (problem: SolvedProblem) => void;
  learningProgress: LearningProgress;
  updateLearningProgress: (data: Partial<LearningProgress>) => void;
  userAge: number | null; // 사용자 나이 추가
  setUserAge: React.Dispatch<React.SetStateAction<number | null>>; // 사용자 나이 설정 함수 추가
  wormGameMoney: number; // 지렁이 게임 머니
  setWormGameMoney: React.Dispatch<React.SetStateAction<number>>; // 지렁이 게임 머니 설정 함수
  platformerGameMoney: number; // 플랫포머 게임 머니
  setPlatformerGameMoney: React.Dispatch<React.SetStateAction<number>>; // 플랫포머 게임 머니 설정 함수
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, updateUser } = useAuth(); // Get user and updateUser from AuthContext

  const [reputation, setReputation] = useState<ReputationLevel>(() => {
    const savedReputation = localStorage.getItem('reputation');
    return (savedReputation as ReputationLevel) || '스타터';
  });

  const [gameMoney, setGameMoney] = useState<number>(() => {
    const savedGameMoney = localStorage.getItem('gameMoney');
    return savedGameMoney ? parseInt(savedGameMoney, 10) : 0;
  });

  const [inventory, setInventory] = useState<Item[]>(() => {
    const savedInventory = localStorage.getItem('inventory');
    return savedInventory ? JSON.parse(savedInventory) : [];
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  const [solvedProblems, setSolvedProblems] = useState<SolvedProblem[]>(() => {
    const savedProblems = localStorage.getItem('solvedProblems');
    return savedProblems ? JSON.parse(savedProblems) : [];
  });

  const [learningProgress, setLearningProgress] = useState<LearningProgress>(() => {
    const savedProgress = localStorage.getItem('learningProgress');
    return savedProgress ? JSON.parse(savedProgress) : { totalProblemsSolved: 0, correctAnswers: 0 };
  });

  const [userAge, setUserAge] = useState<number | null>(() => {
    const savedAge = localStorage.getItem('userAge');
    return savedAge ? parseInt(savedAge, 10) : null;
  });

  const [wormGameMoney, setWormGameMoney] = useState<number>(() => {
    const savedWormGameMoney = localStorage.getItem('wormGameMoney');
    return savedWormGameMoney ? parseInt(savedWormGameMoney, 10) : 0;
  });

  const [platformerGameMoney, setPlatformerGameMoney] = useState<number>(() => {
    const savedPlatformerGameMoney = localStorage.getItem('platformerGameMoney');
    return savedPlatformerGameMoney ? parseInt(savedPlatformerGameMoney, 10) : 0;
  });

  // --- Sync with AuthContext user data ---
  useEffect(() => {
    if (authUser && authUser.user) {
      setGameMoney(authUser.user.money);
      const authInventoryItems: Item[] = shopItems.filter(shopItem => authUser.user.inventory.includes(shopItem.name));
      setInventory(authInventoryItems);
    } else {
      setGameMoney(0);
      setInventory([]);
    }
  }, [authUser]);

  useEffect(() => {
    localStorage.setItem('reputation', reputation);
  }, [reputation]);

  useEffect(() => {
    localStorage.setItem('gameMoney', gameMoney.toString());
  }, [gameMoney]);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('solvedProblems', JSON.stringify(solvedProblems));
  }, [solvedProblems]);

  useEffect(() => {
    localStorage.setItem('learningProgress', JSON.stringify(learningProgress));
  }, [learningProgress]);

  useEffect(() => {
    if (userAge !== null) {
      localStorage.setItem('userAge', userAge.toString());
    } else {
      localStorage.removeItem('userAge');
    }
  }, [userAge]);

  useEffect(() => {
    localStorage.setItem('wormGameMoney', wormGameMoney.toString());
  }, [wormGameMoney]);

  useEffect(() => {
    localStorage.setItem('platformerGameMoney', platformerGameMoney.toString());
  }, [platformerGameMoney]);

  const shopItems: Item[] = [
    { id: 'skin-1', name: '귀여운 아바타 스킨', description: 'AI 비서의 외형을 귀엽게 바꿔줍니다.', price: 500 },
    { id: 'speed-boost', name: '지렁이 속도 부스터', description: '지렁이 게임에서 지렁이의 속도를 일시적으로 증가시킵니다.', price: 200 },
    { id: 'extra-life', name: '플랫포머 추가 목숨', description: '플랫포머 게임에서 추가 목숨을 얻습니다.', price: 300 },
    { id: 'hint-ticket', name: '문제 해설 힌트', description: '문제 해설 시 힌트를 얻을 수 있는 티켓입니다.', price: 100 },
  ];

  const buyItem = async (item: Item) => { // Make buyItem async
    if (!authUser || !authUser.user || !authUser.token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await api.post('/api/shop/buy', {
        userId: authUser.user.id,
        itemName: item.name, // Send item.name as itemName
        itemCost: item.price,
      }, {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      });

      if (response.status === 200) {
        const updatedUser = response.data.user; // Backend should return updated user
        updateUser(updatedUser); // Update user in AuthContext

        // AppContext states will be synced via useEffect on authUser change
        alert(`${item.name}을(를) 구매했습니다!`);
      } else {
        alert(response.data.message || '아이템 구매에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Failed to buy item:', error);
      alert(error.response?.data?.message || '아이템 구매 중 오류가 발생했습니다.');
    }
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: Date.now().toString() };
    setCalendarEvents(prevEvents => [...prevEvents, newEvent]);
  };

  const addSolvedProblem = (problem: SolvedProblem) => {
    setSolvedProblems(prevProblems => [...prevProblems, problem]);
  };

  const updateLearningProgress = (data: Partial<LearningProgress>) => {
    setLearningProgress(prevProgress => ({ ...prevProgress, ...data }));
  };

  return (
    <AppContext.Provider value={{
      reputation, setReputation,
      gameMoney, setGameMoney,
      inventory, buyItem,
      calendarEvents, addCalendarEvent,
      solvedProblems, addSolvedProblem,
      learningProgress, updateLearningProgress,
      userAge, setUserAge,
      wormGameMoney, setWormGameMoney,
      platformerGameMoney, setPlatformerGameMoney
    }}>
      {children}
    </AppContext.Provider>
  );
};