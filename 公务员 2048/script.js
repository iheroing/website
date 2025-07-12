class CivilServant2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('civilServant2048-bestScore') || 0;
        this.size = 4;
        this.gameWon = false;
        this.gameOver = false;
        
        // 公务员等级映射
        this.levels = {
            2: '二级科员',
            4: '一级科员',
            8: '四级主任科员',
            16: '三级主任科员',
            32: '二级主任科员',
            64: '一级主任科员',
            128: '四级调研员',
            256: '三级调研员',
            512: '二级调研员',
            1024: '一级调研员',
            2048: '二级巡视员',
            4096: '一级巡视员'
        };
        
        this.init();
    }
    
    init() {
        this.setupGrid();
        this.updateDisplay();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.setupEventListeners();
    }
    
    setupGrid() {
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });
        
        // 触摸事件
        this.setupTouchEvents();
        
        // 窗口大小变化事件
        window.addEventListener('resize', () => {
            this.updateDisplay();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('try-again-btn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    setupTouchEvents() {
        const gameContainer = document.querySelector('.game-container');
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        gameContainer.addEventListener('touchstart', (e) => {
            if (this.gameOver) return;
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: false });
        
        gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        gameContainer.addEventListener('touchend', (e) => {
            if (this.gameOver) return;
            e.preventDefault();
            const touch = e.changedTouches[0];
            endX = touch.clientX;
            endY = touch.clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
                return;
            }
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (deltaX > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            } else {
                // 垂直滑动
                if (deltaY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }
        }, { passive: false });
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    move(direction) {
        const previousGrid = this.grid.map(row => [...row]);
        let moved = false;
        
        switch(direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            
            if (this.checkWin()) {
                this.showMessage('恭喜！您已达到一级巡视员！');
                this.gameWon = true;
            } else if (this.checkGameOver()) {
                this.showMessage('游戏结束！');
                this.gameOver = true;
            }
        }
    }
    
    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            while (row.length < this.size) {
                row.push(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== row[j]) {
                    moved = true;
                }
                this.grid[i][j] = row[j];
            }
        }
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            while (row.length < this.size) {
                row.unshift(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== row[j]) {
                    moved = true;
                }
                this.grid[i][j] = row[j];
            }
        }
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            
            while (column.length < this.size) {
                column.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    i--;
                }
            }
            
            while (column.length < this.size) {
                column.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        return moved;
    }
    
    updateDisplay() {
        const container = document.getElementById('tile-container');
        container.innerHTML = '';
        
        // 根据屏幕尺寸计算方块间距
        const tileSize = this.getTileSize();
        const tileSpacing = this.getTileSpacing();
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.style.left = `${j * (tileSize + tileSpacing)}px`;
                    tile.style.top = `${i * (tileSize + tileSpacing)}px`;
                    tile.textContent = this.levels[this.grid[i][j]] || this.grid[i][j];
                    container.appendChild(tile);
                }
            }
        }
        
        document.getElementById('score').textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('civilServant2048-bestScore', this.bestScore);
        }
        document.getElementById('best-score').textContent = this.bestScore;
    }
    
    getTileSize() {
        const width = window.innerWidth;
        if (width <= 360) return 55;
        if (width <= 480) return 65;
        if (width <= 768) return 80;
        return 100;
    }
    
    getTileSpacing() {
        const width = window.innerWidth;
        if (width <= 360) return 6;
        if (width <= 480) return 8;
        if (width <= 768) return 12;
        return 15;
    }
    
    checkWin() {
        if (this.gameWon) return false;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 4096) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        // 检查是否有空格
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否可以合并
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if ((i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    showMessage(text) {
        document.getElementById('message-text').textContent = text;
        document.getElementById('game-message').classList.add('show');
    }
    
    hideMessage() {
        document.getElementById('game-message').classList.remove('show');
    }
    
    restart() {
        this.grid = [];
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.hideMessage();
        this.init();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new CivilServant2048();
});