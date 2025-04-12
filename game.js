const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextBlockCanvas');
const nextCtx = nextCanvas.getContext('2d');

// 게임 설정
const BLOCK_SIZE = 30;
const COLS = 10;
const ROWS = 20;
const NEXT_BLOCK_SIZE = 25;

// 블록 색상을 파란색 계열로 변경
const COLORS = [
    { main: '#00a8ff', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // Light Blue
    { main: '#0097e6', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // Blue
    { main: '#00a8ff', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // Sky Blue
    { main: '#0984e3', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // Strong Blue
    { main: '#74b9ff', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // Soft Blue
    { main: '#48dbfb', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // Electric Blue
    { main: '#0abde3', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }  // Deep Sky Blue
];

// 게임 배경 색상 설정
const BACKGROUND_COLOR = 'rgba(0, 21, 43, 0.9)';
const GRID_COLOR = 'rgba(0, 168, 255, 0.1)';

// 테트리스 블록 모양 정의
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 1], [1, 1, 0]]  // S
];

// 블록 클래스
class Block {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.x = Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
        this.y = 0;
    }

    draw() {
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const xPos = (this.x + x) * BLOCK_SIZE;
                    const yPos = (this.y + y) * BLOCK_SIZE;
                    
                    // 메인 블록 면
                    ctx.fillStyle = this.color.main;
                    ctx.fillRect(xPos, yPos, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

                    // 나무 결 효과
                    const gradient = ctx.createLinearGradient(xPos, yPos, xPos + BLOCK_SIZE, yPos + BLOCK_SIZE);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(xPos, yPos, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

                    // 상단 하이라이트
                    ctx.fillStyle = this.color.light;
                    ctx.fillRect(xPos, yPos, BLOCK_SIZE - 1, 2);

                    // 좌측 하이라이트
                    ctx.fillStyle = this.color.light;
                    ctx.fillRect(xPos, yPos, 2, BLOCK_SIZE - 1);

                    // 우측 그림자
                    ctx.fillStyle = this.color.dark;
                    ctx.fillRect(xPos + BLOCK_SIZE - 3, yPos, 2, BLOCK_SIZE - 1);

                    // 하단 그림자
                    ctx.fillStyle = this.color.dark;
                    ctx.fillRect(xPos, yPos + BLOCK_SIZE - 3, BLOCK_SIZE - 1, 2);
                }
            });
        });
    }

    rotate() {
        const N = this.shape.length;
        const M = this.shape[0].length;
        const rotated = Array(M).fill().map(() => Array(N).fill(0));
        
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < M; x++) {
                rotated[x][N - 1 - y] = this.shape[y][x];
            }
        }
        
        // 회전 후 충돌 체크
        const originalShape = this.shape;
        this.shape = rotated;
        if (this.collision()) {
            this.shape = originalShape;
            return false;
        }
        return true;
    }

    collision() {
        return this.shape.some((row, y) => {
            return row.some((value, x) => {
                if (!value) return false;
                const newX = this.x + x;
                const newY = this.y + y;
                return (
                    newX < 0 ||
                    newX >= COLS ||
                    newY >= ROWS ||
                    (newY >= 0 && board[newY][newX])
                );
            });
        });
    }

    drawNext() {
        const offsetX = (nextCanvas.width - this.shape[0].length * NEXT_BLOCK_SIZE) / 2;
        const offsetY = (nextCanvas.height - this.shape.length * NEXT_BLOCK_SIZE) / 2;

        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const xPos = offsetX + x * NEXT_BLOCK_SIZE;
                    const yPos = offsetY + y * NEXT_BLOCK_SIZE;
                    
                    // 메인 블록 면
                    nextCtx.fillStyle = this.color.main;
                    nextCtx.fillRect(xPos, yPos, NEXT_BLOCK_SIZE - 1, NEXT_BLOCK_SIZE - 1);

                    // 상단 하이라이트
                    nextCtx.fillStyle = this.color.light;
                    nextCtx.fillRect(xPos, yPos, NEXT_BLOCK_SIZE - 1, 2);

                    // 좌측 하이라이트
                    nextCtx.fillStyle = this.color.light;
                    nextCtx.fillRect(xPos, yPos, 2, NEXT_BLOCK_SIZE - 1);

                    // 우측 그림자
                    nextCtx.fillStyle = this.color.dark;
                    nextCtx.fillRect(xPos + NEXT_BLOCK_SIZE - 3, yPos, 2, NEXT_BLOCK_SIZE - 1);

                    // 하단 그림자
                    nextCtx.fillStyle = this.color.dark;
                    nextCtx.fillRect(xPos, yPos + NEXT_BLOCK_SIZE - 3, NEXT_BLOCK_SIZE - 1, 2);
                }
            });
        });
    }
}

// 게임 상태
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentBlock = null;
let nextBlock = null;
let score = 0;
let gameOver = false;
let dropInterval = 1000;
let lastDrop = 0;
let startTime = Date.now();

// 게임 초기화 함수
function initGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    currentBlock = null;
    nextBlock = null;
    score = 0;
    gameOver = false;
    dropInterval = 1000;
    lastDrop = 0;
    startTime = Date.now();
    createNewBlock();
}

// 게임 오버 처리
function handleGameOver() {
    gameOver = true;
    const modal = document.getElementById('gameOverModal');
    const scoreDisplay = modal.querySelector('.score-display');
    scoreDisplay.textContent = score;
    modal.style.display = 'flex';
}

// 게임 재시작
function restartGame() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'none';
    initGame();
    requestAnimationFrame(gameLoop);
}

// 게임 종료
function quitGame() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'none';
    
    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 게임 컨테이너 숨기기
    const gameContainer = document.querySelector('.game-container');
    gameContainer.style.display = 'none';
    
    // 이벤트 리스너 제거
    document.removeEventListener('keydown', handleKeyDown);
    
    // 게임 루프 중지
    gameOver = true;
    
    // 종료 메시지 표시
    const body = document.body;
    const exitMessage = document.createElement('div');
    exitMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: white;
        font-size: 24px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    `;
    exitMessage.textContent = '게임이 종료되었습니다.';
    body.appendChild(exitMessage);
    
    // 새 게임 시작 버튼 추가
    const newGameButton = document.createElement('button');
    newGameButton.textContent = '새 게임 시작';
    newGameButton.style.cssText = `
        position: fixed;
        top: 60%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 18px;
        background: linear-gradient(45deg, #00ff00, #00cc00);
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
        transition: all 0.3s ease;
    `;
    newGameButton.addEventListener('mouseover', () => {
        newGameButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
    });
    newGameButton.addEventListener('mouseout', () => {
        newGameButton.style.transform = 'translate(-50%, -50%)';
    });
    newGameButton.addEventListener('click', () => {
        window.location.reload();
    });
    body.appendChild(newGameButton);
}

// 새로운 블록 생성
function createNewBlock() {
    if (!nextBlock) {
        const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        nextBlock = new Block(randomShape, randomColor);
    }
    
    currentBlock = nextBlock;
    
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    nextBlock = new Block(randomShape, randomColor);
    
    // 게임 오버 체크
    if (currentBlock.collision()) {
        handleGameOver();
    }
}

// 블록 이동
function moveBlock(dx, dy) {
    if (!currentBlock) return;
    
    const originalX = currentBlock.x;
    const originalY = currentBlock.y;
    
    currentBlock.x += dx;
    currentBlock.y += dy;
    
    if (currentBlock.collision()) {
        currentBlock.x = originalX;
        currentBlock.y = originalY;
        
        if (dy > 0) {
            currentBlock.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const boardY = currentBlock.y + y;
                        if (boardY >= 0) {
                            board[boardY][currentBlock.x + x] = currentBlock.color;
                        }
                    }
                });
            });
            checkLines();
            createNewBlock();
        }
        return false;
    }
    return true;
}

// 라인 체크 및 제거
function checkLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        score += linesCleared * 100;
        // 속도 증가
        dropInterval = Math.max(100, dropInterval - 50);
    }
}

// 게임 루프
function gameLoop(timestamp) {
    if (gameOver) return;
    
    // 시간 업데이트
    const currentTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    document.querySelector('.time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // 점수 업데이트
    document.querySelector('.score').innerHTML = `Score<br>${score}`;
    
    // 메인 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Next 블록 캔버스 클리어
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextCtx.fillStyle = BACKGROUND_COLOR;
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    // 격자 그리기
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
    
    // 보드 그리기
    board.forEach((row, y) => {
        row.forEach((color, x) => {
            if (color) {
                const xPos = x * BLOCK_SIZE;
                const yPos = y * BLOCK_SIZE;
                
                // 메인 블록 면
                ctx.fillStyle = color.main;
                ctx.fillRect(xPos, yPos, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

                // 상단 하이라이트
                ctx.fillStyle = color.light;
                ctx.fillRect(xPos, yPos, BLOCK_SIZE - 1, 2);

                // 좌측 하이라이트
                ctx.fillStyle = color.light;
                ctx.fillRect(xPos, yPos, 2, BLOCK_SIZE - 1);

                // 우측 그림자
                ctx.fillStyle = color.dark;
                ctx.fillRect(xPos + BLOCK_SIZE - 3, yPos, 2, BLOCK_SIZE - 1);

                // 하단 그림자
                ctx.fillStyle = color.dark;
                ctx.fillRect(xPos, yPos + BLOCK_SIZE - 3, BLOCK_SIZE - 1, 2);
            }
        });
    });
    
    // 현재 블록 그리기
    if (currentBlock) {
        currentBlock.draw();
    }
    
    // Next 블록 그리기
    if (nextBlock) {
        nextBlock.drawNext();
    }
    
    if (timestamp - lastDrop > dropInterval) {
        moveBlock(0, 1);
        lastDrop = timestamp;
    }
    
    requestAnimationFrame(gameLoop);
}

// 키보드 이벤트 핸들러를 별도 함수로 분리
function handleKeyDown(e) {
    if (gameOver) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            moveBlock(-1, 0);
            break;
        case 'ArrowRight':
            moveBlock(1, 0);
            break;
        case 'ArrowDown':
            moveBlock(0, 1);
            break;
        case 'ArrowUp':
            currentBlock.rotate();
            break;
        case ' ': // 스페이스바
            while (moveBlock(0, 1)) {}
            break;
    }
}

// 키보드 컨트롤 이벤트 리스너 등록
document.addEventListener('keydown', handleKeyDown);

// 게임 시작
initGame();
gameLoop(0); 