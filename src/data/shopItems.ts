export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  type: 'skin' | 'booster' | 'theme' | 'ticket';
  description?: string; // Make description optional as it's not used everywhere
}

export const shopItems: ShopItem[] = [
  { id: 'skin-1', name: '캐릭터 스킨 1', cost: 1000, type: 'skin', description: 'AI 아바타의 스킨을 변경합니다.' },
  { id: 'xp-booster-1', name: 'XP 2배 부스터 (1일)', cost: 5000, type: 'booster', description: '하루 동안 획득하는 XP가 2배로 증가합니다.' },
  { id: 'theme-dark', name: '다크 테마', cost: 1000, type: 'theme', description: '앱의 테마를 다크 모드로 변경합니다.' },
  { id: 'theme-blue', name: '블루 테마', cost: 500, type: 'theme', description: '앱의 테마를 블루 모드로 변경합니다.' },
  { id: 'explanation-ticket', name: '해설권', cost: 50, type: 'ticket', description: '문제에 대한 자세한 해설을 볼 수 있는 티켓입니다.' },
];
