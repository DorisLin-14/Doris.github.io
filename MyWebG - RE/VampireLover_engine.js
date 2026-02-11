// ================================
// Vampire Lover - Script Engine
// ================================

const Game = {

    rawLines: [],      // 原始全部腳本（保留 ::label）
    script: [],        // 真正執行腳本
    labelMap: {},

    currentIndex: 0,

    isTyping: false,
    typeTimer: null,
    currentFullText: "",

    isCenterBox: false,

    //--------------------------------
    // 初始化
    //--------------------------------
    init() {

        const container = document.getElementById('game-container');

        document.getElementById('btn-newgame')
            .addEventListener('click', e => {
                e.stopPropagation();
                this.start();
            });

        document.getElementById('btn-loadgame')
            .addEventListener('click', () => {
                alert("讀檔功能之後再做～");
            });

        container.addEventListener('click', () => {
            if (!document.getElementById('title-screen').classList.contains('hidden'))
                return;

            this.next();
        });

        console.log("Engine Ready");
    },

    //--------------------------------
    // 開始遊戲
    //--------------------------------
    async start() {

        document.getElementById('title-screen').classList.add('hidden');

        await this.loadScript("VL_Chapter1.txt");

        this.jumpTo("intro"); // 直接從 ::intro 開始
    },

    //--------------------------------
    // 載入腳本 + 建立 label map
    //--------------------------------
    async loadScript(filename) {

        const res = await fetch(CONFIG.storyPath + filename);
        const text = await res.text();

        this.rawLines = text.split('\n').map(l => l.trim());

        this.script = [];
        this.labelMap = {};

        let idx = 0;

        for (let line of this.rawLines) {

            if (!line) continue;

            // 記錄 label
            if (line.startsWith("::")) {
                const label = line.replace("::", "");
                this.labelMap[label] = idx;
                continue;
            }

            this.script.push(line);
            idx++;
        }

        this.currentIndex = 0;
    },

    //--------------------------------
    // 下一步
    //--------------------------------
    next() {

        // 打字中 → 直接顯示完整文字
        if (this.isTyping) {
            this.completeTyping();
            return;
        }

        if (this.currentIndex >= this.script.length)
            return;

        const line = this.script[this.currentIndex];

        // 指令
        if (line.startsWith("[")) {
            this.currentIndex++;
            this.handleCommand(line);
            return;
        }

        // 普通文字
        this.renderText(line);
        this.currentIndex++;
    },

    //--------------------------------
    // 指令解析
    //--------------------------------
    handleCommand(cmdLine) {

        const content = cmdLine.slice(1, -1);
        const parts = content.split(" ");

        const type = parts[0];

        switch (type) {

            //--------------------------------
            // 背景
            //--------------------------------
            case "bg": {
                const img = CONFIG.assets.bg + parts[1];
                const layer = document.getElementById('bg-layer');

                const fade = parts.includes("fade");

                if (fade) {
                    layer.style.opacity = 0;
                    setTimeout(() => {
                        layer.style.backgroundImage = `url('${img}')`;
                        layer.style.opacity = 1;
                    }, 100);
                } else {
                    layer.style.backgroundImage = `url('${img}')`;
                    layer.style.opacity = 1;
                }

                this.next();
                break;
            }

            //--------------------------------
            // 立繪
            //--------------------------------
            case "chara": {

                const layer = document.getElementById('chara-layer');

                if (parts.includes("in")) {

                    const name = parts[2];
                    const pose = parts[3];

                    const imgUrl =
                        `${CONFIG.assets.chara}${name}_${pose}.png`;

                    layer.innerHTML = `
                        <img src="${imgUrl}"
                             style="opacity:0; transition:0.5s;">
                    `;

                    setTimeout(() => {
                        layer.querySelector("img").style.opacity = 1;
                    }, 30);

                }
                else if (parts.includes("out")) {
                    layer.innerHTML = "";
                }

                this.next();
                break;
            }

            //--------------------------------
            // 名字 / 中央黑框判斷
            //--------------------------------
            case "name": {

                const nameStr = parts.slice(1).join(" ");

                // ⭐ 關鍵修正點（你原本的 bug 在這）
                this.isCenterBox = !nameStr;

                document.getElementById('name-tag').innerText = nameStr;

                this.next();
                break;
            }

            //--------------------------------
            // wait
            //--------------------------------
            case "wait":
                setTimeout(() => this.next(), parseInt(parts[1]));
                break;

            //--------------------------------
            // jump
            //--------------------------------
            case "jump":
                this.jumpTo(parts[1]);
                break;

            default:
                this.next();
        }
    },

    //--------------------------------
    // 跳轉
    //--------------------------------
    jumpTo(label) {

        if (this.labelMap[label] !== undefined) {
            this.currentIndex = this.labelMap[label];
        }

        this.next();
    },

    //--------------------------------
    // 顯示文字
    //--------------------------------
    renderText(text) {

        const centerBox = document.getElementById('center-box');
        const dialogueBox = document.getElementById('dialogue-box');

        centerBox.classList.toggle('hidden', !this.isCenterBox);
        dialogueBox.classList.toggle('hidden', this.isCenterBox);

        const el = document.getElementById(
            this.isCenterBox ? "center-text" : "dialogue-text"
        );

        this.currentFullText = text;
        el.innerText = "";

        let i = 0;
        this.isTyping = true;

        clearInterval(this.typeTimer);

        this.typeTimer = setInterval(() => {

            if (i < text.length) {
                el.innerText += text[i++];
            }
            else {
                this.completeTyping();
            }

        }, 28);
    },

    //--------------------------------
    // 完成打字
    //--------------------------------
    completeTyping() {

        clearInterval(this.typeTimer);

        const el = document.getElementById(
            this.isCenterBox ? "center-text" : "dialogue-text"
        );

        el.innerText = this.currentFullText;

        this.isTyping = false;
    }
};


// 啟動
window.onload = () => Game.init();
