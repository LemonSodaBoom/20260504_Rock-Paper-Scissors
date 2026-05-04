// --- 1. 遊戲初始狀態與設定 ---
let playerHP = 2;   // 兩顆心 = 兩勝制
let compHP = 2;
let isAnimating = false; // 防止動畫中重複點擊

const options = [
    { id: 'rock', emoji: '👊', text: '石頭' },
    { id: 'paper', emoji: '🖐️', text: '布' },
    { id: 'scissors', emoji: '✌️', text: '剪刀' }
];

// 抓取 HTML 元素
const playerHpDisp = document.getElementById('player-hp');
const compHpDisp = document.getElementById('comp-hp');
const compChar = document.getElementById('comp-character');
const compBubble = document.getElementById('comp-bubble');
const compEmoji = document.getElementById('comp-choice-emoji');
const compText = document.getElementById('comp-choice-text');
const playerHand = document.querySelector('.player-hand');
const compCharImg = document.getElementById('comp-character');

// 建立音效物件，並指定檔案路徑
const openSound = new Audio('./music/open.mp3')
const winSound = new Audio('./music/win.mp3');
const loseSound = new Audio('./music/lose.mp3');
const drawSound = new Audio('./music/draw.mp3');

const fin_winSound = new Audio('./music/win-2.mp3');
const fin_loseSound = new Audio('./music/lose-2.mp3');

// 可以預設調整音量 (0.0 到 1.0)
winSound.volume = 0.5;
loseSound.volume = 0.5;


// --- 2. 核心遊戲邏輯 ---
function playRound(playerChoiceId, cardElement) {
    if (isAnimating || playerHP === 0 || compHP === 0) return; // 鎖定狀態
    isAnimating = true;

    // 視覺回饋：處理卡牌樣式
    playerHand.classList.add('has-selection');
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    cardElement.classList.add('selected');

    // 電腦隨機出拳
    const compChoice = options[Math.floor(Math.random() * 3)];

    // 顯示電腦出拳泡泡
    compEmoji.innerText = compChoice.emoji;
    compText.innerText = compChoice.text + '！';
    compBubble.classList.remove('hidden');

    // 勝負判定邏輯
    setTimeout(() => {
        if (playerChoiceId === compChoice.id) {
            handleResult('draw');
        } else if (
            (playerChoiceId === 'rock' && compChoice.id === 'scissors') ||
            (playerChoiceId === 'paper' && compChoice.id === 'rock') ||
            (playerChoiceId === 'scissors' && compChoice.id === 'paper')
        ) {
            handleResult('win'); // 玩家贏
        } else {
            handleResult('lose'); // 玩家輸
        }
    }, 800); // 延遲一點點時間增加期待感
    compChar.src = `./img/${compChoice.id}.png`; // 動態抓取 ID 來換圖
}

// --- 3. 處理回合結果 ---
function handleResult(result) {
    if (result === 'win') {
        compHP--;       // 電腦扣血
        // --- 這裡加入輸的音效 ---
        loseSound.currentTime = 0; // 讓聲音回到開頭，防止連續點擊時沒聲音
        loseSound.play();
        compChar.src = `./img/lose.png`; // 對手輸的表情
        compChar.classList.add('shake'); // 對手受傷震動
        compText.innerText = '可惡啊啊啊啊!!!';
        compBubble.classList.remove('hidden');
    } else if (result === 'lose') {
        playerHP--;     // 玩家扣血
        // --- 這裡加入贏的音效 ---
        winSound.currentTime = 0; // 讓聲音回到開頭，防止連續點擊時沒聲音
        winSound.play();
        compChar.src = `./img/win.png`; // 對手贏的得意表情
        compText.innerText = '哈哈哈哈雜魚!!!';
        compBubble.classList.remove('hidden');
    } else {
        // --- 這裡加入贏的音效 ---
        drawSound.currentTime = 0; // 讓聲音回到開頭，防止連續點擊時沒聲音
        drawSound.play();
        compChar.src = `./img/draw.png`; // 平手表情
        compText.innerText = 'ロリコンを、享受しろ';
        compBubble.classList.remove('hidden');
    }

    // 更新生命值畫面
    updateHPDisplay();

    // 檢查是否結束，如果沒結束則重置回合
    setTimeout(() => {
        compChar.classList.remove('shake');
        if (playerHP === 0 || compHP === 0) {
            showGameOver();
        } else {
            resetRound();
        }
    }, 1500); // 讓玩家有時間看表情和扣血
}

// 根據血量更新愛心
function updateHPDisplay() {
    playerHpDisp.innerText = '❤️'.repeat(playerHP) + '🖤'.repeat(2 - playerHP);
    compHpDisp.innerText = '❤️'.repeat(compHP) + '🖤'.repeat(2 - compHP);
}

// 重置單一回合的視覺
function resetRound() {
    compBubble.classList.add('hidden');
    compChar.src = `./img/01.png`; // 恢復預設表情
    playerHand.classList.remove('has-selection');
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    isAnimating = false;
}

// --- 4. 結算與重新開始 ---
function showGameOver() {
    const overlay = document.getElementById('result-overlay');
    const finalTitle = document.getElementById('final-title');
    const finalDesc = document.getElementById('final-desc');

    if (compHP === 0) {
        finalTitle.innerText = "🏆 YOU WIN!";
        finalTitle.style.color = "#2ecc71";
        finalDesc.innerText = "太神啦！你打敗了野生刀也！";
        compChar.innerText = '😭'; // 最終戰敗表情
        fin_loseSound.currentTime = 0; // 讓聲音回到開頭，防止連續點擊時沒聲音
        fin_loseSound.play();
    } else {
        finalTitle.innerText = "💀 YOU LOSE!";
        finalTitle.style.color = "#e74c3c";
        finalDesc.innerText = "你被擊敗了，再挑戰一次吧！";
        compChar.innerText = '😆'; // 最終勝利表情
        fin_winSound.currentTime = 0; // 讓聲音回到開頭，防止連續點擊時沒聲音
        fin_winSound.play();
    }

    overlay.classList.add('active');
}

function resetGame() {
    playerHP = 2;
    compHP = 2;
    updateHPDisplay();
    resetRound();
    document.getElementById('result-overlay').classList.remove('active');
    openSound.currentTime = 0; // 讓聲音回到開頭，防止連續點擊時沒聲音
    openSound.play();
}