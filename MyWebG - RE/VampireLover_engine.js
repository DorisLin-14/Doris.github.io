// --- 核心遊戲引擎 ---
const Game = {
    rawScript: [],
    script: [],
    labels: {},
    currentIndex: 0,

    isTyping: false,
    typeTimer: null,
    currentFullText: "",
    currentMode: "center", // center / dialogue

    init() {
        document.getElementById('btn-newgame')
            .addEventListener('click', (e) => {
                e.stopPropagation();
                this.start();
            });

        document.getElementById('btn-loadgame')
            .addEventListener('click', (e) => {
                e.stopPropagation();
                alert("載入功能開發中");
            });

        document.getElementById('game-container')
            .addEventListener('click', () => {
                if (document.getElementById('title-screen')
                    .classList.contains('hidden')) {
                    this.next();
                }
            });
    },

    async start() {
        document.getElementById('title-screen').classList.add('hidden');
        await this.loadScript('VL_Chapter1.txt');
        this.jumpTo("intro"); // 強制從 intro 開始
    },

    async loadScript(filename) {
        const response = await fetch(CONFIG.storyPath + filename);
        const text = await response.text();

        this.rawScript = text.split('\n').map(l => l.trim());

        this.script = [];
        this.labels = {};

        this.rawScript.forEach((line) => {
            if (line.startsWith("::")) {
                const label = line.replace("::", "").trim();
                this.labels[label] = this.script.length;
            } else if (line.length > 0) {
                this.script.push(line);
            }
        });

        this.currentIndex = 0;
    },

    jumpTo(label) {
        if (this.labels[label] !== undefined) {
            this.currentIndex = this.labels[label];
            this.next();
        } else {
            console.warn("找不到標籤:", label);
        }
    },

    next() {
        if (this.isTyping) {
            this.completeTyping();
            return;
        }

        if (this.currentIndex >= this.script.length) return;

        const line = this.script[this.currentIndex];

        if (line.startsWith('[')) {
            this.handleCommand(line);
            this.currentIndex++;
            return;
        }

        this.renderText(line);
        this.currentIndex++;
    },

    handleCommand(cmdLine) {
        const content = cmdLine.slice(1, -1);
        const parts = content.split(' ');
        const type = parts[0];

        switch (type) {

            case 'bg':
                const bgLayer = document.getElementById('bg-layer');
                bgLayer.style.opacity = 0;
                bgLayer.style.backgroundImage =
                    `url('${CONFIG.assets.bg + parts[1]}')`;

                setTimeout(() => {
                    bgLayer.style.opacity = 1;
                }, 50);
                break;

            case 'chara':
                const layer = document.getElementById('chara-layer');

                if (parts.includes('in')) {
                    const file =
                        `${CONFIG.assets.chara}${parts[2]}_${parts[3]}.png`;

                    layer.innerHTML =
                        `<img src="${file}" style="opacity:0;">`;

                    setTimeout(() => {
                        layer.querySelector('img').style.opacity = 1;
                    }, 50);
                } else {
                    layer.innerHTML = '';
                }
                break;

            case 'name':
                const name = parts.slice(1).join(' ');
                document.getElementById('name-tag').innerText = name;

                if (name === "") {
                    this.currentMode = "center";
                } else {
                    this.currentMode = "dialogue";
                }
                break;

            case 'wait':
                setTimeout(() => this.next(), parseInt(parts[1]));
                break;

            case 'jump':
                this.jumpTo(parts[1]);
                break;
        }
    },

    renderText(text) {
        this.isTyping = true;
        this.currentFullText = text;

        const centerBox = document.getElementById('center-box');
        const dialogueBox = document.getElementById('dialogue-box');

        if (this.currentMode === "center") {
            centerBox.classList.remove('hidden');
            dialogueBox.classList.add('hidden');
        } else {
            centerBox.classList.add('hidden');
            dialogueBox.classList.remove('hidden');
        }

        const target =
            this.currentMode === "center"
                ? document.getElementById('center-text')
                : document.getElementById('dialogue-text');

        target.innerText = "";

        let i = 0;
        clearInterval(this.typeTimer);

        this.typeTimer = setInterval(() => {
            if (i < text.length) {
                target.innerText += text.charAt(i);
                i++;
            } else {
                this.completeTyping();
            }
        }, 35);
    },

    completeTyping() {
        clearInterval(this.typeTimer);

        const target =
            this.currentMode === "center"
                ? document.getElementById('center-text')
                : document.getElementById('dialogue-text');

        target.innerText = this.currentFullText;
        this.isTyping = false;
    }
};

window.onload = () => Game.init();
