const Game = {

    script: [],
    labels: {},
    index: 0,

    typing: false,
    timer: null,
    mode: "dialogue",

    SAVE_KEY: "VL_SAVE",
    isLoading: false, // 判斷是否讀檔

    //--------------------------------
    init() {
        const container = document.getElementById("game-container");

        document.getElementById("btn-newgame").addEventListener("click", e => {
            e.stopPropagation();
            this.startNew();
        });

        document.getElementById("btn-loadgame").addEventListener("click", e => {
            e.stopPropagation();
            this.load();
        });

        container.addEventListener("pointerdown", () => {
            if (document.getElementById("title-screen").classList.contains("hidden") && !this.isLoading) {
                this.next();
            } else if (this.isLoading) {
                // 讀檔模式第一次點擊開始遊戲
                this.isLoading = false;
            }
        });
    },

    //--------------------------------
    async startNew() {
        localStorage.removeItem(this.SAVE_KEY);
        document.getElementById("title-screen").classList.add("hidden");
        await this.loadScript("VL_Chapter1.txt");
        this.setBG("black.png");
        // 等待玩家第一次點擊開始 intro
    },

    //--------------------------------
    async load() {
        const save = localStorage.getItem(this.SAVE_KEY);
        if (!save) return alert("沒有存檔");

        const data = JSON.parse(save);
        document.getElementById("title-screen").classList.add("hidden");
        await this.loadScript(data.file);
        this.index = data.index;
        this.isLoading = true; // 點擊才開始
    },

    save(file = "VL_Chapter1.txt") {
        localStorage.setItem(this.SAVE_KEY, JSON.stringify({
            file,
            index: this.index
        }));
    },

    //--------------------------------
    async loadScript(file) {
        const text = await (await fetch(CONFIG.storyPath + file)).text();
        this.script = text.split(/\r?\n/);
        this.labels = {};
        this.script.forEach((l, i) => {
            if (l.startsWith("::"))
                this.labels[l.replace("::", "").trim()] = i;
        });
        this.index = 0;
    },

    //--------------------------------
    next() {
        // 如果正在打字 → 完成文字
        if (this.typing) {
            this.finish();
            return;
        }

        // 讀檔模式第一次點擊開始
        if (this.isLoading) {
            this.isLoading = false;
            return;
        }

        if (this.index >= this.script.length) return;

        let line = this.script[this.index].trim();
        if (!line) { this.index++; this.next(); return; }

        // 遇到 :: 標籤
        if (line.startsWith("::")) {
            this.mode = (line === "::intro") ? "center" : "dialogue";
            this.index++; // 移到下一行，但不自動 next()
            return;
        }

        // 指令行
        if (line.startsWith("[")) {
            this.index++;
            this.command(line);
            return;
        }

        // 正常文字
        this.index++;
        this.showText(line);
        this.save();
    },

    //--------------------------------
    command(raw) {
        const p = raw.slice(1, -1).split(" ");
        switch (p[0]) {

            case "bg":
                this.setBG(p[1], p.includes("fade"));
                break;

            case "chara":
                this.setChara(p);
                break;

            case "name":
                document.getElementById("name-tag").innerText = p.slice(1).join(" ");
                break;

            case "wait":
                setTimeout(() => this.next(), Number(p[1]));
                return;

            case "jump":
                if (this.labels[p[1]] !== undefined)
                    this.index = this.labels[p[1]] + 1;
                break;
        }

        this.next();
    },

    //--------------------------------
    setBG(img, fade = false) {
        const el = document.getElementById("bg-layer");
        if (fade) el.style.opacity = 0;
        el.style.backgroundImage = `url(${CONFIG.assets.bg + img})`;
        if (fade) setTimeout(() => el.style.opacity = 1, 50);
    },

    //--------------------------------
    setChara(p) {
        const pos = p[1];
        const name = p[2];
        const pose = p[3];
        const fade = p.includes("fade");
        const out = p.includes("out");

        const layer = document.getElementById("chara-layer");

        if (out) {
            layer.innerHTML = "";
            return;
        }

        const img = document.createElement("img");
        img.src = `${CONFIG.assets.chara}${name}_${pose}.png`;
        img.className =
            pos === "left" ? "chara-pos-left" :
                pos === "right" ? "chara-pos-right" :
                    "chara-pos-center";
        img.style.opacity = 0;
        layer.appendChild(img);
        if (fade) setTimeout(() => img.style.opacity = 1, 50);
        else img.style.opacity = 1;
    },

    //--------------------------------
    showText(text) {
        this.typing = true;

        const el = (this.mode === "center")
            ? document.getElementById("center-text")
            : document.getElementById("dialogue-text");

        document.getElementById("center-box").classList.toggle("hidden", this.mode !== "center");
        document.getElementById("dialogue-box").classList.toggle("hidden", this.mode !== "dialogue");

        el.innerHTML = "";
        let i = 0;

        this.timer = setInterval(() => {
            if (i < text.length) el.innerHTML += text[i++];
            else this.finish();
        }, 22);
    },

    finish() {
        clearInterval(this.timer);
        this.typing = false;
    }

};

window.onload = () => Game.init();
