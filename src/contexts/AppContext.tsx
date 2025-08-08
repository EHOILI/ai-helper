import React, { createContext, useState, useEffect, ReactNode } from 'react';

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
  buyItem: (item: Item) => void;
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

  const buyItem = (item: Item) => {
    if (gameMoney >= item.price) {
      setGameMoney(gameMoney - item.price);
      setInventory([...inventory, item]);
      alert(`${item.name}을(를) 구매했습니다!`);
    } else {
      alert('게임 머니가 부족합니다.');
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