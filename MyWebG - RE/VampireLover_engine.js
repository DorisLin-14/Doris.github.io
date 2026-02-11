// --- 核心遊戲引擎 ---
const Game = {
    script: [],
    currentIndex: 0,
    isTyping: false,
    typeTimer: null,
    currentFullText: "",
    isCenterBox: false,

    init() {
        console.log("Engine Initialized.");
        // 綁定按鈕事件
        document.getElementById('btn-newgame').addEventListener('click', (e) => {
            e.stopPropagation(); // 防止點擊事件傳遞到 container
            this.start();
        });

        document.getElementById('btn-loadgame').addEventListener('click', (e) => {
            e.stopPropagation();
            alert("載入功能開發中");
        });

        // 綁定全域點擊（用於推進劇情）
        document.getElementById('game-container').addEventListener('click', () => {
            // 只有標題畫面消失後，點擊才有效
            if (document.getElementById('title-screen').classList.contains('hidden')) {
                this.next();
            }
        });
    },

    async start() {
        document.getElementById('title-screen').classList.add('hidden');
        await this.loadScript('VL_Chapter1.txt');
        this.next();
    },

    async loadScript(filename) {
        try {
            const response = await fetch(CONFIG.storyPath + filename);
            const text = await response.text();
            // 解析標籤與內容
            this.script = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0 && !line.startsWith('::'));
            this.currentIndex = 0;
        } catch (err) {
            console.error("腳本讀取失敗", err);
        }
    },

    next() {
        if (this.isTyping) {
            this.completeTyping();
            return;
        }

        if (this.currentIndex >= this.script.length) return;

        let line = this.script[this.currentIndex];

        if (line.startsWith('[')) {
            this.handleCommand(line);
            this.currentIndex++;
            // 立即執行下一行，除非是 wait 指令
            if (!line.includes('wait')) this.next();
            return;
        }

        this.renderText(line);
        this.currentIndex++;
    },

    handleCommand(cmdLine) {
        const content = cmdLine.replace('[', '').replace(']', '');
        const parts = content.split(' ');
        const type = parts[0];

        switch (type) {
            case 'bg':
                document.getElementById('bg-layer').style.backgroundImage = `url('${CONFIG.assets.bg + parts[1]}')`;
                break;
            case 'chara':
                const layer = document.getElementById('chara-layer');
                if (parts.includes('in')) {
                    const imgUrl = `${CONFIG.assets.chara}${parts[2]}_${parts[3]}.png`;
                    layer.innerHTML = `<img src="${imgUrl}" style="position:absolute; bottom:0; left:50%; transform:translateX(-50%); height:90%;">`;
                } else {
                    layer.innerHTML = '';
                }
                break;
            case 'name':
                const nameStr = parts.slice(1).join(' ');
                this.isCenterBox = (nameStr === "" || parts.length === 1);
                document.getElementById('name-tag').innerText = nameStr;
                break;
            case 'wait':
                setTimeout(() => this.next(), parseInt(parts[1]));
                break;
        }
    },

    renderText(text) {
        this.isTyping = true;
        this.currentFullText = text;
        const targetId = this.isCenterBox ? 'center-text' : 'dialogue-text';
        
        document.getElementById('center-box').classList.toggle('hidden', !this.isCenterBox);
        document.getElementById('dialogue-box').classList.toggle('hidden', this.isCenterBox);

        const el = document.getElementById(targetId);
        el.innerText = "";
        let i = 0;
        clearInterval(this.typeTimer);
        this.typeTimer = setInterval(() => {
            if (i < text.length) {
                el.innerText += text.charAt(i);
                i++;
            } else {
                this.completeTyping();
            }
        }, 50);
    },

    completeTyping() {
        clearInterval(this.typeTimer);
        const targetId = this.isCenterBox ? 'center-text' : 'dialogue-text';
        document.getElementById(targetId).innerText = this.currentFullText;
        this.isTyping = false;
    }
};

// 網頁載入後啟動引擎
window.onload = () => Game.init();