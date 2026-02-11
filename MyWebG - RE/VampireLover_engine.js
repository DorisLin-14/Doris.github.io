// --- 核心遊戲引擎 ---
const Game = {
    script: [],
    currentIndex: 0,
    isCenterBox: false,

    async start() {
        document.getElementById('title-screen').classList.add('hidden');
        await this.loadScript('VL_Chapter1.txt');
        this.next();
    },

    async loadScript(filename) {
        const response = await fetch(CONFIG.storyPath + filename);
        const text = await response.text();
        // 1. 過濾掉 ::標籤 2. 移除空白行 3. 保留劇情行
        this.script = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('::'));
        this.currentIndex = 0;
    },

    next() {
        if (this.currentIndex >= this.script.length) return;

        let line = this.script[this.currentIndex];
        
        // 處理指令 [tag]
        if (line.startsWith('[')) {
            this.handleCommand(line);
            this.currentIndex++;
            // 如果是跳轉或等待，由指令觸發下一次，否則自動執行下一行
            if (!line.includes('wait') && !line.includes('jump')) {
                this.next();
            }
            return;
        }

        // 處理對話或描述
        this.renderText(line);
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
                // 簡化處理：chara center Raph normal
                const charaImg = CONFIG.assets.chara + `${parts[2]}_${parts[3]}.png`;
                const layer = document.getElementById('chara-layer');
                if (parts.includes('in')) {
                    layer.innerHTML = `<img src="${charaImg}" id="active-chara">`;
                } else {
                    layer.innerHTML = '';
                }
                break;
            case 'name':
                const name = parts.slice(1).join(' ');
                this.isCenterBox = (name === ''); // 沒有名字時視為描述模式
                document.getElementById('name-tag').innerText = name;
                break;
            case 'wait':
                setTimeout(() => this.next(), parseInt(parts[1]));
                break;
            case 'jump':
                // 這裡簡化處理，實際可擴充跳轉邏輯
                this.next();
                break;
        }
    },

    renderText(text) {
        const centerBox = document.getElementById('center-box');
        const dialogueBox = document.getElementById('dialogue-box');

        if (this.isCenterBox) {
            dialogueBox.classList.add('hidden');
            centerBox.classList.remove('hidden');
            document.getElementById('center-text').innerText = text;
        } else {
            centerBox.classList.add('hidden');
            dialogueBox.classList.remove('hidden');
            document.getElementById('dialogue-text').innerText = text;
        }
    },

    load() {
        alert("讀取存檔功能開發中...");
    }
};

// 全域點擊事件：點擊畫面任何地方繼續
document.getElementById('game-container').addEventListener('mousedown', (e) => {
    // 防止點擊按鈕時觸發
    if (e.target.tagName !== 'BUTTON') {
        Game.next();
    }
});