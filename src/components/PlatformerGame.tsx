import React, { useRef, useEffect, useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Stage {
  platforms: GameObject[];
  thorns: GameObject[];
  pitfalls: GameObject[];
}

const stages: Stage[] = [
  // Stage 1: Basic platforms
  {
    platforms: [
      { x: 0, y: 380, width: 400, height: 20 },
      { x: 100, y: 320, width: 100, height: 20 },
      { x: 250, y: 260, width: 100, height: 20 },
    ],
    thorns: [{ x: 150, y: 360, width: 20, height: 20 }],
    pitfalls: [],
  },
  // Stage 2: More platforms, one pitfall
  {
    platforms: [
      { x: 0, y: 380, width: 80, height: 20 },
      { x: 150, y: 320, width: 100, height: 20 },
      { x: 300, y: 260, width: 100, height: 20 },
      { x: 50, y: 200, width: 120, height: 20 },
    ],
    thorns: [{ x: 200, y: 300, width: 20, height: 20 }],
    pitfalls: [{ x: 90, y: 390, width: 50, height: 10 }],
  },
  // Stage 3: Pitfalls with traversable platforms
  {
    platforms: [
      { x: 0, y: 380, width: 60, height: 20 }, // Starting platform
      { x: 120, y: 340, width: 60, height: 20 },
      { x: 240, y: 300, width: 60, height: 20 },
      { x: 350, y: 260, width: 50, height: 20 }, // Ending platform
    ],
    thorns: [],
    pitfalls: [
      { x: 60, y: 390, width: 60, height: 10 }, // Pitfall between platforms
      { x: 180, y: 390, width: 60, height: 10 },
      { x: 300, y: 390, width: 50, height: 10 },
    ],
  },
  // Stage 4: Mixed, with more complex layout
  {
    platforms: [
      { x: 0, y: 380, width: 100, height: 20 },
      { x: 150, y: 300, width: 80, height: 20 },
      { x: 280, y: 220, width: 120, height: 20 },
    ],
    thorns: [{ x: 50, y: 360, width: 20, height: 20 }],
    pitfalls: [{ x: 110, y: 390, width: 30, height: 10 }],
  },
];

function PlatformerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [gameMode, setGameMode] = useState<'normal' | 'endless'>('normal'); // 게임 모드 상태

  useEffect(() => {
    const canvas = canvasRef.current;
    const context2d = canvas?.getContext('2d');

    if (canvas && context2d) {
      let lives = 3; // 기본 목숨

      // 아이템 적용: 플랫포머 추가 목숨
      if (context && context.inventory.some(item => item.id === 'extra-life')) {
        lives += 1; // 추가 목숨 적용
      }

      let player = {
        x: 50,
        y: 50,
        width: 20,
        height: 20,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
      };

      let currentStage = stages[currentStageIndex];

      const resetPlayer = () => {
        player.x = 50;
        player.y = 50;
        player.velocityX = 0;
        player.velocityY = 0;
        player.isJumping = false;
      };

      const gravity = 0.5;
      const jumpStrength = -10;
      const moveSpeed = 5;

      const keys: { [key: string]: boolean } = {};

      const draw = () => {
        context2d.clearRect(0, 0, canvas.width, canvas.height);

        // 플레이어 그리기
        context2d.fillStyle = 'blue';
        context2d.fillRect(player.x, player.y, player.width, player.height);

        // 플랫폼 그리기
        context2d.fillStyle = 'green';
        currentStage.platforms.forEach(platform => {
          context2d.fillRect(platform.x, platform.y, platform.width, platform.height);
        });

        // 가시 그리기
        context2d.fillStyle = 'red'; // 가시 색상
        currentStage.thorns.forEach(thorn => {
          context2d.fillRect(thorn.x, thorn.y, thorn.width, thorn.height);
        });

        // 낭떠러지 그리기 (시각적으로는 그리지 않지만 충돌 판정을 위해 존재)
        context2d.fillStyle = 'darkgray'; // 낭떠러지 색상 (디버깅용)
        currentStage.pitfalls.forEach(pitfall => {
          context2d.fillRect(pitfall.x, pitfall.y, pitfall.width, pitfall.height);
        });

        // 목숨 표시
        context2d.fillStyle = 'black'; // 목숨 글자색을 검정색으로
        context2d.font = '16px Arial';
        context2d.fillText(`목숨: ${lives}`, 10, 20);
        context2d.fillText(`스테이지: ${currentStageIndex + 1}`, 10, 40);
        // 플랫포머 게임 머니 표시
        if (context) {
          context2d.fillText(`게임 머니: ${context.platformerGameMoney}`, 10, 60);
        }
      }

      const update = () => {
        // 키보드 입력에 따른 플레이어 이동
        if (keys['ArrowLeft']) {
          player.velocityX = -moveSpeed;
        } else if (keys['ArrowRight']) {
          player.velocityX = moveSpeed;
        } else {
          player.velocityX = 0;
        }

        // 중력 적용
        player.velocityY += gravity;
        player.x += player.velocityX;
        player.y += player.velocityY;

        // 바닥 충돌 확인 (캔버스 바닥)
        if (player.y + player.height > canvas.height) {
          lives--;
          if (lives <= 0) {
            alert('게임 오버!');
            navigate('/'); // 로비로 이동
            return;
          }
          resetPlayer();
        }

        // 플랫폼 충돌 확인
        player.isJumping = true; // 플랫폼에 닿기 전까지는 점프 상태로 간주
        currentStage.platforms.forEach(platform => {
          if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.velocityY >= 0
          ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
          }
        });

        // 가시 충돌 확인
        currentStage.thorns.forEach(thorn => {
          if (
            player.x < thorn.x + thorn.width &&
            player.x + player.width > thorn.x &&
            player.y < thorn.y + thorn.height &&
            player.y + player.height > thorn.y
          ) {
            lives--;
            if (lives <= 0) {
              alert('게임 오버!');
              navigate('/'); // 로비로 이동
              return;
            }
            resetPlayer();
          }
        });

        // 낭떠러지 충돌 확인 (낭떠러지 영역에 완전히 진입하면 사망)
        currentStage.pitfalls.forEach(pitfall => {
          if (
            player.x < pitfall.x + pitfall.width &&
            player.x + player.width > pitfall.x &&
            player.y + player.height > pitfall.y
          ) {
            lives--;
            if (lives <= 0) {
              alert('게임 오버!');
              navigate('/'); // 로비로 이동
              return;
            }
            resetPlayer();
          }
        });

        // 스테이지 클리어 조건 (예: 플레이어가 화면 오른쪽 끝에 도달)
        if (player.x > canvas.width - player.width) {
          if (gameMode === 'normal') {
            if (currentStageIndex < stages.length - 1) {
              setCurrentStageIndex(prevIndex => prevIndex + 1);
              resetPlayer();
            } else {
              alert('모든 스테이지 클리어!');
              navigate('/'); // 로비로 이동
            }
          } else { // endless mode
            // 무한 모드에서는 새로운 스테이지를 랜덤으로 생성하거나, 기존 스테이지를 재활용
            setCurrentStageIndex(Math.floor(Math.random() * stages.length));
            resetPlayer();
          }
        }
      }

      let animationFrameId: number;

      const gameLoop = () => {
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        keys[e.key] = true;
        if (e.key === 'ArrowUp' && !player.isJumping) {
          player.velocityY = jumpStrength;
          player.isJumping = true;
        }
      }

      const handleKeyUp = (e: KeyboardEvent) => {
        keys[e.key] = false;
      }

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);

      gameLoop();

      return () => {
        cancelAnimationFrame(animationFrameId);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [currentStageIndex, gameMode, context, navigate]); // 의존성 배열에 추가

  return (
    <div>
      <h1 className="game">플랫포머 게임</h1>
      <div>
        <button onClick={() => setGameMode('normal')}>일반 모드</button>
        <button onClick={() => setGameMode('endless')}>엔드리스 모드</button>
      </div>
      <canvas ref={canvasRef} width="400" height="400" style={{ border: '1px solid black' }} />
    </div>
  );
}

export default PlatformerGame;