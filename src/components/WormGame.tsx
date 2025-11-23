
import React, { useRef, useEffect, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

function WormGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const context = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      // 게임 로직 초기화
      let snake = [{ x: 10, y: 10 }];
      let food = { x: 0, y: 0 };
      let direction = 'right';
      let score = 0;
      let gameSpeed = 100; // 기본 게임 속도

      // 아이템 적용: 지렁이 속도 부스터
      if (context && context.inventory.some(item => item.id === 'speed-boost')) {
        gameSpeed = 50; // 속도 부스터 적용 시 더 빠르게
        // TODO: 일정 시간 후 속도 원래대로 되돌리는 로직 추가
      }

      const generateFood = () => {
        food.x = Math.floor(Math.random() * (canvas.width / 10));
        food.y = Math.floor(Math.random() * (canvas.height / 10));
      }

      const draw = () => {
        // 배경 그리기
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 지렁이 그리기
        ctx.fillStyle = 'lime';
        snake.forEach(segment => {
          ctx.fillRect(segment.x * 10, segment.y * 10, 10, 10);
        });

        // 음식 그리기
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * 10, food.y * 10, 10, 10);

        // 점수 표시
        ctx.fillStyle = 'black'; // 점수 글자색을 검정색으로
        ctx.font = '16px Arial';
        ctx.fillText(`점수: ${score}`, 10, 20);
        // 지렁이 게임 머니 표시
        if (context) {
          ctx.fillText(`게임 머니: ${context.wormGameMoney}`, 10, 40);
        }
      }

      const update = () => {
        // 지렁이 머리 이동
        const head = { x: snake[0].x, y: snake[0].y };
        switch (direction) {
          case 'up':
            head.y--;
            break;
          case 'down':
            head.y++;
            break;
          case 'left':
            head.x--;
            break;
          case 'right':
            head.x++;
            break;
        }

        // 벽 충돌 확인
        if (head.x < 0 || head.x >= canvas.width / 10 || head.y < 0 || head.y >= canvas.height / 10) {
          // 게임 오버 처리
          alert('게임 오버!'); // 사용자에게 알림
          navigate('/'); // 로비로 이동
          return; // 게임 루프 중단
        }

        // 음식 섭취 확인
        if (head.x === food.x && head.y === food.y) {
          score++;
          generateFood();
        } else {
          snake.pop();
        }

        snake.unshift(head);
      }

      const gameLoop = () => {
        update();
        draw();
      }

      generateFood();
      const gameInterval = setInterval(gameLoop, gameSpeed);

      // 키보드 이벤트 처리
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
          case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
          case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
          case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
        }
      }

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        clearInterval(gameInterval);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [context, navigate]); // 의존성 배열에 navigate 추가

  return (
    <div>
      <h1 className="game">지렁이 게임</h1>
      <canvas ref={canvasRef} width="400" height="400" style={{ border: '1px solid black' }} />
    </div>
  );
}

export default WormGame;
