import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { ShopItem, shopItems } from '../data/shopItems'; // Import from central source

export type ReputationLevel = '스타터' | '루키' | '미들' | '리더' | '프로' | '마스터';

// Use the imported ShopItem interface
export type Item = ShopItem;

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
  buyItem: (item: Item) => void; // Add buyItem to props
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  solvedProblems: SolvedProblem[];
  addSolvedProblem: (problem: SolvedProblem) => void;
  learningProgress: LearningProgress;
  updateLearningProgress: (data: Partial<LearningProgress>) => void;
  userAge: number | null;
  setUserAge: React.Dispatch<React.SetStateAction<number | null>>;
  wormGameMoney: number;
  setWormGameMoney: React.Dispatch<React.SetStateAction<number>>;
  platformerGameMoney: number;
  setPlatformerGameMoney: React.Dispatch<React.SetStateAction<number>>;
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

  const [inventory, setInventory] = useState<Item[]>([]);

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
      // Now using the imported, authoritative shopItems list
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

  const buyItem = (item: Item) => {
    if (authUser && authUser.user && gameMoney >= item.cost) {
      const newMoney = gameMoney - item.cost;
      const newInventory = [...inventory, item];
      
      setGameMoney(newMoney);
      setInventory(newInventory);
      
      // Update the user data in AuthContext
      const updatedUserData = {
        ...authUser.user,
        money: newMoney,
        inventory: [...authUser.user.inventory, item.name], // Add item name to inventory
      };
      updateUser(updatedUserData);
    }
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