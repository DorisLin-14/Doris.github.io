/* ============================================================
   VampireLover_engine.js - 核心遊戲引擎
   ============================================================ */

const gameEngine = {
    // --- 遊戲狀態管理 ---
    script: [],           // 儲存解析後的劇本行
    index: 0,             // 當前執行到的行數
    isWaiting: false,     // 是否處於等待狀態 (指令延遲或打字中)
    currentName: "",      // 當前說話者名稱

    // --- 初始化遊戲 ---
    async init() {
        console.log("遊戲引擎啟動中...");
        this.bindEvents();
    },

    bindEvents() {
        // 點擊容器任何地方前進下一行
        const container = document.getElementById('game-container');
        container.addEventListener('click', () => this.next());
    },

    async startGame() {
        document.getElementById('menu-screen').classList.add('hidden');
        await this.loadStory('VL_Chapter1.txt');
        this.render(); // 開始渲染第一行
    },

    // --- 讀取與預處理 txt 檔案 ---
    async loadStory(fileName) {
        try {
            const response = await fetch(`./story/${fileName}`);
            const rawText = await response.text();
            
            // 預處理：過濾掉空行、過濾掉標籤行 (::)
            // 但保留 [name] 指令來判斷對話狀態
            this.script = rawText.split('\n')
                .map(line => line.trim())
                .filter(line => line !== '' && !line.startsWith('::'));
            
            this.index = 0;
        } catch (error) {
            console.error("讀取劇本失敗:", error);
        }
    },

    // --- 核心邏輯：下一步 ---
    next() {
        if (this.isWaiting) return;

        if (this.index >= this.script.length) {
            console.log("劇本結束");
            return;
        }

        const currentLine = this.script[this.index];
        
        // 1. 如果是指令行 [...]
        if (currentLine.startsWith('[')) {
            this.executeCommand(currentLine);
        } 
        // 2. 如果是純對話文字
        else {
            this.displayText(currentLine);
        }
    },

    // --- 指令解析與執行 ---
    executeCommand(line) {
        // 使用 Regex 解析 [cmd key="val"] 或 [cmd value]
        const cmdMatch = line.match(/\[(\w+)\s*(.*?)\]/);
        if (!cmdMatch) return;

        const tag = cmdMatch[1];
        const paramsRaw = cmdMatch[2];
        const params = this.parseParams(paramsRaw);

        switch (tag) {
            case 'name':
                this.currentName = params.default || ""; // 如果只有 [name 拉斐爾] 則取 default
                this.index++;
                this.next(); // 自動執行下一行文字
                break;

            case 'bg':
                this.updateBackground(params);
                this.index++;
                this.next();
                break;

            case 'chara':
                this.updateCharacter(params);
                this.index++;
                this.next();
                break;

            case 'wait':
                this.isWaiting = true;
                const time = parseInt(params.default || params.time || 1000);
                setTimeout(() => {
                    this.isWaiting = false;
                    this.index++;
                    this.next();
                }, time);
                break;

            case 'scene_out': // 轉場擴充
                this.transitionOut();
                break;

            default:
                this.index++;
                this.next();
        }
    },

    // 將指令字串轉為物件，支援 key="value" 或單一數值
    parseParams(raw) {
        const params = { default: raw.split(' ')[0] };
        const regex = /(\w+)="?([^"\s]+)"?/g;
        let m;
        while ((m = regex.exec(raw)) !== null) {
            params[m[1]] = m[2];
        }
        return params;
    },

    // --- 畫面渲染邏輯 ---
    displayText(text) {
        const introBox = document.getElementById('intro-box');
        const dialogueBox = document.getElementById('dialogue-box');
        const nameTag = document.getElementById('name-tag');
        const msgText = document.getElementById('message-text');
        const introText = document.getElementById('intro-text');

        // 如果目前有名字 -> 使用下方對話框
        if (this.currentName !== "") {
            introBox.classList.add('hidden');
            dialogueBox.classList.remove('hidden');
            nameTag.innerText = this.currentName;
            msgText.innerText = text;
        } 
        // 無名字 -> 使用置中黑框 (前言模式)
        else {
            dialogueBox.classList.add('hidden');
            introBox.classList.remove('hidden');
            introText.innerText = text;
        }

        this.index++; // 準備好下一點擊時執行的行數
    },

    updateBackground(params) {
        const bgLayer = document.getElementById('bg-layer');
        const src = params.src || params.default;
        if (src) {
            bgLayer.style.backgroundImage = `url('./assets/bg/${src}')`;
            bgLayer.style.backgroundSize = 'cover';
            bgLayer.style.backgroundPosition = 'center';
            
            // 處理淡入效果
            if (params.fade !== 'false') {
                bgLayer.style.opacity = 0;
                setTimeout(() => bgLayer.style.opacity = 1, 50);
            }
        }
    },

    updateCharacter(params) {
        const charaLayer = document.getElementById('chara-layer');
        const charaId = `chara-${params.id || params.default}`;
        
        // 處理淡出/移除
        if (params.effect === 'fade_out' || params.default === 'out') {
            const existing = document.getElementById(charaId);
            if (existing) existing.remove();
            return;
        }

        // 處理淡入/新增
        let img = document.getElementById(charaId);
        if (!img) {
            img = document.createElement('img');
            img.id = charaId;
            img.className = 'chara-img';
            charaLayer.appendChild(img);
        }
        
        // 組合路徑: assets/chara/Raph_normal.png
        const face = params.face || 'normal';
        img.src = `./assets/chara/${params.id || params.default}_${face}.png`;
        
        // 位置控制
        if (params.pos === 'center') img.style.margin = '0 auto';
    }
};

// 網頁載入後啟動引擎
window.onload = () => gameEngine.init();