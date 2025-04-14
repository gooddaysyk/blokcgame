const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextBlockCanvas');
const nextCtx = nextCanvas.getContext('2d');

// 게임 설정
const BLOCK_SIZE = 30;
const COLS = 10;
const ROWS = 20;
const NEXT_BLOCK_SIZE = 25;

// 캔버스 크기 설정
function resizeCanvas() {
    // 메인 게임 캔버스
    canvas.style.width = `${BLOCK_SIZE * COLS}px`;
    canvas.style.height = `${BLOCK_SIZE * ROWS}px`;
    canvas.width = BLOCK_SIZE * COLS;
    canvas.height = BLOCK_SIZE * ROWS;
    
    // Next 블록 캔버스
    nextCanvas.style.width = `${NEXT_BLOCK_SIZE * 4}px`;
    nextCanvas.style.height = `${NEXT_BLOCK_SIZE * 4}px`;
    nextCanvas.width = NEXT_BLOCK_SIZE * 4;
    nextCanvas.height = NEXT_BLOCK_SIZE * 4;
}

// 초기 캔버스 크기 설정
resizeCanvas();

// 블록 색상 정의
const COLORS = [
    { main: '#8B4513', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // 새들 브라운
    { main: '#A0522D', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // 시에나
    { main: '#CD853F', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // 페루
    { main: '#DEB887', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // 버블우드
    { main: '#D2691E', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }, // 초콜릿
    { main: '#B8860B', light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(0, 0, 0, 0.2)' }  // 다크골든로드
];

// 게임 배경 색상 설정
const BACKGROUND_COLOR = 'rgba(28, 15, 8, 0.95)';  // 어두운 우드톤
const GRID_COLOR = 'rgba(139, 94, 60, 0.2)';  // 우드톤 그리드

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
        try {
            return this.shape.some((row, dy) => {
                return row.some((value, dx) => {
                    if (!value) return false;
                    
                    const newX = this.x + dx;
                    const newY = this.y + dy;
                    
                    // 경계 체크
                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true;
                    }
                    
                    // 다른 블록과의 충돌 체크
                    if (newY >= 0 && board[newY][newX]) {
                        return true;
                    }
                    
                    return false;
                });
            });
        } catch (error) {
            console.error('Collision check error:', error);
            return true; // 에러 발생 시 충돌로 처리
        }
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
let dropInterval = 1500;
let lastDrop = performance.now();
let startTime = performance.now();
let lastTimeUpdate = performance.now();
let lastScore = 0;
let animationFrameId = null;
let isGameRunning = false;
let lockDelay = 500;
let lastLockTime = 0;
let touchActive = false;

// 게임 초기화 함수
function initGame() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    currentBlock = null;
    nextBlock = null;
    score = 0;
    lastScore = 0;
    gameOver = false;
    dropInterval = 1500;
    touchActive = false;
    
    const now = performance.now();
    lastDrop = now;
    startTime = now;
    lastTimeUpdate = now;
    
    isGameRunning = true;
    
    // 점수 초기화
    updateScore();
    
    createNewBlock();
    
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// 점수 업데이트 함수
function updateScore() {
    const scoreElement = document.querySelector('.score');
    scoreElement.innerHTML = `점수<br>${score}`;
}

// 게임 오버 처리
function handleGameOver() {
    isGameRunning = false;
    gameOver = true;
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    const modal = document.getElementById('gameOverModal');
    const scoreDisplay = modal.querySelector('.score-display');
    scoreDisplay.textContent = score;
    modal.style.display = 'flex';
}

// 게임 재시작
function restartGame() {
    const modal = document.getElementById('gameOverModal');
    if (modal) {
        modal.style.display = 'none';
    }
    initGame();
}

// 게임 종료
function quitGame() {
    const modal = document.getElementById('gameOverModal');
    if (modal) {
        modal.style.display = 'none';
    }
    gameOver = true;
    isGameRunning = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // 게임 종료 후 초기 상태로
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    currentBlock = null;
    nextBlock = null;
    score = 0;
    updateScore();
    render();
}

// 새로운 블록 생성
function createNewBlock() {
    try {
        if (!nextBlock) {
            const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            nextBlock = new Block(randomShape, randomColor);
        }
        
        currentBlock = nextBlock;
        
        const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        nextBlock = new Block(randomShape, randomColor);
        
        // 게임 오버 체크 - 새로운 블록이 생성되는 위치에 이미 블록이 있는 경우에만
        if (currentBlock.collision()) {
            handleGameOver();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error creating new block:', error);
        handleGameOver();
        return false;
    }
}

// 블록 이동
function moveBlock(dx, dy) {
    if (!currentBlock || gameOver || !isGameRunning) return false;

    const newX = currentBlock.x + dx;
    const newY = currentBlock.y + dy;

    // 이동 전에 경계 체크
    if (newX < 0 || newX + currentBlock.shape[0].length > COLS || 
        newY + currentBlock.shape.length > ROWS) {
        // 바닥에 닿았을 때
        if (dy > 0 && newY + currentBlock.shape.length > ROWS) {
            lastLockTime = performance.now();
            return false;
        }
        return false;
    }

    currentBlock.x = newX;
    currentBlock.y = newY;

    if (currentBlock.collision()) {
        currentBlock.x -= dx;
        currentBlock.y -= dy;
        
        // 바닥에 닿았을 때
        if (dy > 0) {
            lastLockTime = performance.now();
            return false;
        }
        return false;
    }
    return true;
}

// 블록 배치 함수 분리
function placeBlock() {
    if (!currentBlock) return;
    
    // 상단 충돌 체크
    if (currentBlock.y <= 1) {
        handleGameOver();
        return;
    }
    
    // 보드에 블록 배치
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
        updateScore(); // 점수 업데이트
        dropInterval = Math.max(200, dropInterval - 25);
    }
}

// 보드 그리기 함수 추가
function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((color, x) => {
            if (color) {
                const xPos = x * BLOCK_SIZE;
                const yPos = y * BLOCK_SIZE;
                
                // 메인 블록 면
                ctx.fillStyle = color.main;
                ctx.fillRect(xPos, yPos, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

                // 나무 결 효과
                const gradient = ctx.createLinearGradient(xPos, yPos, xPos + BLOCK_SIZE, yPos + BLOCK_SIZE);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = gradient;
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
}

// 게임 루프
function gameLoop(timestamp) {
    if (!isGameRunning) return;

    const deltaTime = timestamp - lastDrop;

    // 시간 업데이트
    if (timestamp - lastTimeUpdate >= 1000) {
        const timeElement = document.querySelector('.time');
        const seconds = Math.floor((timestamp - startTime) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        lastTimeUpdate = timestamp;
    }

    if (currentBlock) {
        // 블록이 바닥에 닿았는지 확인
        const wouldCollide = !moveBlock(0, 1);
        
        if (wouldCollide) {
            // 바닥에 닿은 후 lockDelay 시간이 지났는지 확인
            if (timestamp - lastLockTime >= lockDelay) {
                placeBlock();
                if (!gameOver) {
                    createNewBlock();
                }
                lastDrop = timestamp;
            }
        } else {
            lastDrop = timestamp;
            lastLockTime = 0; // 블록이 이동했으므로 락 타이머 리셋
        }
    }

    render();
    if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// 렌더링 함수 분리
function render() {
    // 메인 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Next 블록 캔버스 클리어
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextCtx.fillStyle = BACKGROUND_COLOR;
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    // 격자 그리기
    drawGrid();
    
    // 보드 그리기
    drawBoard();
    
    // 현재 블록 그리기
    if (currentBlock) {
        currentBlock.draw();
    }
    
    // Next 블록 그리기
    if (nextBlock) {
        nextBlock.drawNext();
    }
}

// 모바일 컨트롤 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const dropBtn = document.getElementById('dropBtn');

    // 터치 이벤트 처리
    function handleTouch(action) {
        if (!gameOver && isGameRunning && !touchActive) {
            switch(action) {
                case 'left':
                    moveBlock(-1, 0);
                    break;
                case 'right':
                    moveBlock(1, 0);
                    break;
                case 'rotate':
                    if (currentBlock) {
                        currentBlock.rotate();
                    }
                    break;
                case 'drop':
                    let dropCount = 0;
                    while (moveBlock(0, 1) && dropCount < ROWS) {
                        dropCount++;
                    }
                    break;
            }
        }
    }

    let touchInterval = null;
    const touchDelay = 150;

    function startTouchInterval(action) {
        if (!touchActive) {
            touchActive = true;
            handleTouch(action);
            touchInterval = setInterval(() => handleTouch(action), touchDelay);
        }
    }

    function clearTouchInterval() {
        if (touchInterval) {
            clearInterval(touchInterval);
            touchInterval = null;
        }
        touchActive = false;
    }

    // 터치 이벤트 리스너 추가
    const addTouchListeners = (btn, action) => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!touchActive) {
                startTouchInterval(action);
            }
        });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            clearTouchInterval();
        });

        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            clearTouchInterval();
        });
    };

    addTouchListeners(leftBtn, 'left');
    addTouchListeners(rightBtn, 'right');
    addTouchListeners(rotateBtn, 'rotate');
    addTouchListeners(dropBtn, 'drop');
});

function drawGrid() {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= canvas.width; x += BLOCK_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += BLOCK_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 게임 시작
initGame();
gameLoop(0); 