// --- 核心遊戲引擎 (含打字機特效) ---
const Game = {
    script: [],
    currentIndex: 0,
    isCenterBox: false,
    isTyping: false,       // 紀錄是否正在打字中
    typeTimer: null,       // 打字機計時器
    currentFullText: "",   // 儲存當前完整句子
    typingSpeed: 50,       // 打字速度 (毫秒)

    async start() {
        console.log("Game Starting...");
        document.getElementById('title-screen').classList.add('hidden');
        await this.loadScript('VL_Chapter1.txt');
        this.next();
    },

    async loadScript(filename) {
        try {
            const response = await fetch(CONFIG.storyPath + filename);
            const text = await response.text();
            // 過濾掉 :: 標籤與空行
            this.script = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0 && !line.startsWith('::'));
            this.currentIndex = 0;
        } catch (e) {
            console.error("腳本載入失敗:", e);
        }
    },

    next() {
        // 如果正在打字，點擊則立即顯示全部文字
        if (this.isTyping) {
            this.completeTyping();
            return;
        }

        if (this.currentIndex >= this.script.length) return;

        let line = this.script[this.currentIndex];
        
        // 處理指令 [tag]
        if (line.startsWith('[')) {
            this.handleCommand(line);
            this.currentIndex++;
            // 只有當指令不是等待或跳轉時，才自動跑下一行
            if (!line.includes('wait') && !line.includes('jump')) {
                this.next();
            }
            return;
        }

        // 處理對話或描述
        this.renderTextWithEffect(line);
        this.currentIndex++;
    },

    handleCommand(cmdLine) {
        const content = cmdLine.replace('[', '').replace(']', '');
        const parts = content.split(' ');
        const type = parts[0];

        switch(type) {
            case 'bg':
                const bgImg = CONFIG.assets.bg + parts[1];
                document.getElementById('bg-layer').style.backgroundImage = `url('${bgImg}')`;
                break;
            case 'chara':
                const charaImg = CONFIG.assets.chara + `${parts[2]}_${parts[3]}.png`;
                const layer = document.getElementById('chara-layer');
                if (parts.includes('in')) {
                    layer.innerHTML = `<img src="${charaImg}" style="opacity:1">`;
                } else {
                    layer.innerHTML = '';
                }
                break;
            case 'name':
                const name = parts.slice(1).join(' ');
                this.isCenterBox = (name === "" || parts.length === 1);
                document.getElementById('name-tag').innerText = name || "";
                break;
            case 'wait':
                setTimeout(() => this.next(), parseInt(parts[1]));
                break;
            case 'jump':
                this.next();
                break;
        }
    },

    // --- 打字機特效實作 ---
    renderTextWithEffect(text) {
        this.isTyping = true;
        this.currentFullText = text;
        
        const targetId = this.isCenterBox ? 'center-text' : 'dialogue-text';
        const targetElement = document.getElementById(targetId);
        
        // 切換顯示框
        document.getElementById('center-box').classList.toggle('hidden', !this.isCenterBox);
        document.getElementById('dialogue-box').classList.toggle('hidden', this.isCenterBox);
        
        targetElement.innerText = "";
        let charIndex = 0;

        clearInterval(this.typeTimer);
        this.typeTimer = setInterval(() => {
            if (charIndex < text.length) {
                targetElement.innerText += text.charAt(charIndex);
                charIndex++;
            } else {
                this.completeTyping();
            }
        }, this.typingSpeed);
    },

    completeTyping() {
        clearInterval(this.typeTimer);
        const targetId = this.isCenterBox ? 'center-text' : 'dialogue-text';
        document.getElementById(targetId).innerText = this.currentFullText;
        this.isTyping = false;
    },

    load() {
        alert("存檔載入中... (功能開發中)");
    }
};

// 全域監聽：改用 click 以確保與按鈕邏輯不衝突
document.getElementById('game-container').addEventListener('click', (e) => {
    // 只有當點擊的不是按鈕時，才執行下一句
    if (e.target.tagName !== 'BUTTON') {
        Game.next();
    }
});