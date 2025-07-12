class CivilServant2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('civilServant2048-bestScore') || 0;
        this.highestTile = parseInt(localStorage.getItem('civilServant2048-highestTile')) || 0;
        this.currentHighestTile = 0;
        this.size = 4;
        this.gameWon = false;
        this.gameOver = false;
        this.isMoving = false; // 防止快速连续操作
        this.lastMoveTime = 0;
        
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
            4096: '一级巡视员',
            8192: '二级国务员',
            16384: '一级国务员'
        };
        
        // 级别顺序数组，用于比较级别高低
        this.levelOrder = [0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384];
        
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
        let startTime = 0;
        let isSwiping = false;
        
        // 触摸开始
        gameContainer.addEventListener('touchstart', (e) => {
            if (this.gameOver || this.isMoving) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
            isSwiping = false;
            
            // 添加触摸反馈
            gameContainer.style.transform = 'scale(0.98)';
            gameContainer.style.transition = 'transform 0.1s ease';
        }, { passive: false });
        
        // 触摸移动
        gameContainer.addEventListener('touchmove', (e) => {
            if (this.gameOver || this.isMoving) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            const minMoveDistance = 10;
            
            // 检测是否开始滑动
            if (!isSwiping && (Math.abs(deltaX) > minMoveDistance || Math.abs(deltaY) > minMoveDistance)) {
                isSwiping = true;
            }
        }, { passive: false });
        
        // 触摸结束
        gameContainer.addEventListener('touchend', (e) => {
            if (this.gameOver || this.isMoving) return;
            e.preventDefault();
            
            // 恢复触摸反馈
            gameContainer.style.transform = 'scale(1)';
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // 计算滑动距离和速度
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const velocity = distance / deltaTime;
            
            // 动态调整最小滑动距离（根据速度）
            const minSwipeDistance = velocity > 0.5 ? 20 : 40;
            const maxSwipeTime = 500; // 最大滑动时间
            
            // 检查是否为有效滑动
            if (distance < minSwipeDistance || deltaTime > maxSwipeTime || !isSwiping) {
                return;
            }
            
            // 确定滑动方向（增加角度阈值，提高识别准确性）
            const angle = Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * 180 / Math.PI;
            
            if (angle < 30) {
                // 水平滑动
                if (deltaX > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            } else if (angle > 60) {
                // 垂直滑动
                if (deltaY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }
            // 45度左右的滑动忽略，避免误操作
        }, { passive: false });
        
        // 触摸取消
        gameContainer.addEventListener('touchcancel', (e) => {
            gameContainer.style.transform = 'scale(1)';
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
        if (this.isMoving || this.gameOver) return;
        
        this.isMoving = true;
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
            // 添加移动动画延迟
            setTimeout(() => {
                this.addRandomTile();
                this.updateDisplay();
                
                // 添加级别更新动画
                this.animateScoreUpdate();
                
                if (this.checkWin()) {
                    this.showMessage('恭喜！您已达到最高级别！');
                    this.gameWon = true;
                    this.addHapticFeedback('heavy');
                } else if (this.checkGameOver()) {
                    this.showMessage('游戏结束！');
                    this.gameOver = true;
                    this.addHapticFeedback('medium');
                } else {
                    // 添加触觉反馈
                    this.addHapticFeedback('light');
                }
                
                this.isMoving = false;
            }, 150);
        } else {
            this.isMoving = false;
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
        
        // 重置当前最高方块
        this.currentHighestTile = 0;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.style.left = `${j * (tileSize + tileSpacing)}px`;
                    tile.style.top = `${i * (tileSize + tileSpacing)}px`;
                    tile.textContent = this.levels[this.grid[i][j]] || this.grid[i][j];
                    
                    // 添加新方块动画类
                    if (this.grid[i][j] === 2 || this.grid[i][j] === 4) {
                        tile.classList.add('tile-new');
                    }
                    
                    container.appendChild(tile);
                    
                    // 更新当前最高方块
                    if (this.grid[i][j] > this.currentHighestTile) {
                        this.currentHighestTile = this.grid[i][j];
                    }
                }
            }
        }
        
        // 更新当前级别显示
        const currentLevel = this.levels[this.currentHighestTile] || '无';
        document.getElementById('score').textContent = currentLevel;
        
        // 更新历史最高级别
        if (this.currentHighestTile > this.highestTile) {
            this.highestTile = this.currentHighestTile;
            localStorage.setItem('civilServant2048-highestTile', this.highestTile);
        }
        
        const bestLevel = this.levels[this.highestTile] || '无';
        document.getElementById('best-score').textContent = bestLevel;
        
        // 更新传统分数（保留在localStorage中）
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('civilServant2048-bestScore', this.bestScore);
        }
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
                if (this.grid[i][j] >= 4096) {
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
        this.currentHighestTile = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.isMoving = false;
        this.hideMessage();
        this.init();
    }
    
    // 获取级别名称
    getLevelName(value) {
        return this.levels[value] || `等级${value}`;
    }
    
    // 比较两个级别的高低
    compareLevels(level1, level2) {
        const index1 = this.levelOrder.indexOf(level1);
        const index2 = this.levelOrder.indexOf(level2);
        return index1 - index2;
    }
    
    // 添加震动反馈
    addHapticFeedback(type = 'light') {
        if (navigator.vibrate) {
            switch(type) {
                case 'light':
                    navigator.vibrate(50);
                    break;
                case 'medium':
                    navigator.vibrate(100);
                    break;
                case 'heavy':
                    navigator.vibrate([100, 50, 100]);
                    break;
            }
        }
    }
    
    // 添加分数更新动画
    animateScoreUpdate() {
        const scoreElement = document.getElementById('score');
        const bestScoreElement = document.getElementById('best-score');
        
        scoreElement.classList.add('updated');
        if (this.currentHighestTile > this.highestTile) {
            bestScoreElement.classList.add('updated');
        }
        
        setTimeout(() => {
            scoreElement.classList.remove('updated');
            bestScoreElement.classList.remove('updated');
        }, 500);
    }
    
    // 优化方块移动动画
    animateTileMovement(fromPos, toPos, value) {
        const tileSize = this.getTileSize();
        const tileSpacing = this.getTileSpacing();
        
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.style.left = `${fromPos.y * (tileSize + tileSpacing)}px`;
        tile.style.top = `${fromPos.x * (tileSize + tileSpacing)}px`;
        tile.style.transition = 'all 0.15s ease-in-out';
        tile.textContent = this.levels[value] || value;
        
        document.getElementById('tile-container').appendChild(tile);
        
        // 触发动画
        requestAnimationFrame(() => {
            tile.style.left = `${toPos.y * (tileSize + tileSpacing)}px`;
            tile.style.top = `${toPos.x * (tileSize + tileSpacing)}px`;
        });
        
        // 清理动画元素
        setTimeout(() => {
            if (tile.parentNode) {
                tile.parentNode.removeChild(tile);
            }
        }, 150);
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new CivilServant2048();
});