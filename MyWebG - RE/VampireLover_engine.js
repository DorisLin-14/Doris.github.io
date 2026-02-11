// 簡單的腳本引擎
const gameEngine = {
    currentScript: [],
    currentIndex: 0,
    isWaiting: false,

    async startGame() {
        document.getElementById('menu-screen').classList.add('hidden');
        await this.loadStory('VL_Chapter1.txt');
        this.render();
    },

    async loadStory(fileName) {
        const response = await fetch(`./story/${fileName}`);
        const text = await response.text();
        // 解析文本：過濾掉 :: 標籤行，保留內容
        this.currentScript = text.split('\n').filter(line => {
            return line.trim() !== '' && !line.startsWith('::');
        });
        this.currentIndex = 0;
    },

    next() {
        if (this.isWaiting) return;
        this.currentIndex++;
        if (this.currentIndex < this.currentScript.length) {
            this.render();
        }
    },

    render() {
        let line = this.currentScript[this.currentIndex].trim();

        // 處理指令 [wait], [bg], [chara], [name], [start]...
        if (line.startsWith('[')) {
            this.handleCommand(line);
            return;
        }

        // 判斷該顯示在哪個框
        // 邏輯：如果有 [name] 標籤且非空，用下方框；若是純文字且在特定章節，用中間框
        this.displayText(line);
    },

    handleCommand(line) {
        const cmd = line.match(/\[(.*?)\]/)[1];
        const parts = cmd.split(' ');

        switch (parts[0]) {
            case 'wait':
                this.isWaiting = true;
                setTimeout(() => { 
                    this.isWaiting = false; 
                    this.next(); 
                }, parseInt(parts[1]));
                break;
            case 'bg':
                document.getElementById('bg-layer').style.backgroundImage = `url('./assets/bg/${parts[1]}')`;
                document.getElementById('bg-layer').style.backgroundSize = 'cover';
                this.next();
                break;
            case 'chara':
                this.handleChara(parts);
                this.next();
                break;
            case 'name':
                this.currentName = parts[1] || "";
                this.next();
                break;
            default:
                this.next();
        }
    },

    displayText(text) {
        const introBox = document.getElementById('intro-box');
        const dialogueBox = document.getElementById('dialogue-box');
        const nameTag = document.getElementById('name-tag');
        const msgText = document.getElementById('message-text');
        const introText = document.getElementById('intro-text');

        // 如果目前有名字，顯示下方對話框
        if (this.currentName) {
            introBox.classList.add('hidden');
            dialogueBox.classList.remove('hidden');
            nameTag.innerText = this.currentName;
            msgText.innerText = text;
        } else {
            // 無名字時，視為前言或旁白，顯示中央框
            dialogueBox.classList.add('hidden');
            introBox.classList.remove('hidden');
            introText.innerText = text;
        }
    },

    handleChara(parts) {
        const charaLayer = document.getElementById('chara-layer');
        if (parts[4] === 'in') {
            const img = document.createElement('img');
            img.src = `./assets/chara/${parts[2]}_${parts[3]}.png`;
            img.className = 'chara-img';
            img.id = `chara-${parts[2]}`;
            charaLayer.appendChild(img);
        } else if (parts[4] === 'out') {
            const img = document.getElementById(`chara-${parts[2]}`);
            if (img) img.remove();
        }
    }
};

// 全域點擊偵測
document.getElementById('game-container').addEventListener('click', () => {
    gameEngine.next();
});