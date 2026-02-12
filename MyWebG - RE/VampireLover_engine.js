let storyLines = [];
let currentIndex = 0;

let isTyping = false;
let canAdvance = false;
let typingTimer = null;
let currentFullText = "";

const bgLayer = document.getElementById("bg-layer");
const charaLayer = document.getElementById("chara-layer");
const centerBox = document.getElementById("center-box");
const centerText = document.getElementById("center-text");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const nameTag = document.getElementById("name-tag");
const titleScreen = document.getElementById("title-screen");

document.getElementById("new-game").onclick = startGame;
document.getElementById("load-game").onclick = loadGame;

document.addEventListener("click", advance);
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") advance();
});

/* ============================= */
/*           開始遊戲            */
/* ============================= */

async function startGame() {
    titleScreen.classList.add("hidden");
    await loadStory("VL_Chapter1.txt");
    jumpTo("intro");
}

async function loadGame() {
    let save = localStorage.getItem("VL_SAVE");
    if (!save) return;

    titleScreen.classList.add("hidden");
    await loadStory("VL_Chapter1.txt");
    currentIndex = parseInt(save);
    processLine();
}

async function loadStory(file) {
    const res = await fetch(CONFIG.storyPath + file);
    const text = await res.text();
    storyLines = text.split("\n");
}

/* ============================= */
/*           劇情解析            */
/* ============================= */

function jumpTo(label) {
    const target = storyLines.findIndex(l => l.trim() === "::" + label);
    if (target !== -1) {
        currentIndex = target + 1;
        processLine();
    }
}

function processLine() {

    if (currentIndex >= storyLines.length) return;

    let rawLine = storyLines[currentIndex];
    if (!rawLine) {
        currentIndex++;
        processLine();
        return;
    }

    let line = rawLine.trim();

    /* ---- 區塊標籤 ---- */
    if (line.startsWith("::")) {
        currentIndex++;
        processLine();
        return;
    }

    /* ---- 背景 ---- */
    if (line.startsWith("[bg")) {
        handleBG(line);
        return;
    }

    /* ---- 等待 ---- */
    if (line.startsWith("[wait")) {
        let time = parseInt(line.match(/\d+/)[0]);
        currentIndex++;
        setTimeout(processLine, time);
        return;
    }

    /* ---- 跳轉 ---- */
    if (line.startsWith("[jump")) {
        let label = line.match(/\[jump (.+?)\]/)[1];
        jumpTo(label);
        return;
    }

    /* ---- 名字 ---- */
    if (line.startsWith("[name")) {
        let name = line.replace("[name", "").replace("]", "").trim();
        nameTag.textContent = name;
        currentIndex++;
        processLine();
        return;
    }

    /* ---- 角色 ---- */
    if (line.startsWith("[chara")) {
        handleChara(line);
        currentIndex++;
        processLine();
        return;
    }

    /* ---- 純文字 ---- */
    showText(line);
}

/* ============================= */
/*           背景處理            */
/* ============================= */

function handleBG(line) {

    const match = line.match(/\[bg (.+?) (fade in|fade out)\]/);

    if (!match) {
        console.warn("BG 指令格式錯誤：", line);
        return;
    }

    const file = match[1];
    const action = match[2];

        if (action === "fade in") {

            bgLayer.style.backgroundImage = `url(${CONFIG.assets.bg}${file})`;
            bgLayer.style.opacity = 0;

            setTimeout(() => {
                bgLayer.style.opacity = 1;
            }, 50);

        } else {
            bgLayer.style.opacity = 0;
        }
    }

        // intro黑幕特例：淡入後停3秒
        if (file.includes("black")) {
            setTimeout(() => {
                currentIndex++;
                processLine();
            }, 3000);
        } else {
            bgLayer.style.opacity = 0;
            currentIndex++;
            processLine();
        }
    }

/* ============================= */
/*           角色處理            */
/* ============================= */

function handleChara(line) {

    const match = line.match(/\[chara (left|center|right) (\S+) (\S+) (fade in|fade out)\]/);

    if (!match) {
        console.warn("Chara 指令格式錯誤：", line);
        return;
    }

    const position = match[1];
    const charName = match[2].replace(" ", "_") + ".png";
    const expression = match[3];
    const action = match[4];

    const fileName = `${charName}_${expression}.png`;

    if (action === "fade in") {

        const img = document.createElement("img");
        img.src = CONFIG.assets.chara + fileName;
        img.className = "chara-pos-" + position;
        img.style.opacity = 0;

        charaLayer.appendChild(img);

        setTimeout(() => {
            img.style.opacity = 1;
        }, 50);
    }

    if (action === "fade out") {
        charaLayer.innerHTML = "";
    }
}

/* ============================= */
/*           打字系統            */
/* ============================= */

function showText(text) {

    if (!text || text.startsWith("[")) {
        currentIndex++;
        processLine();
        return;
    }

    currentFullText = text;

    centerBox.classList.add("hidden");
    dialogueBox.classList.remove("hidden");

    dialogueText.textContent = "";

    isTyping = true;
    canAdvance = false;

    let i = 0;

    typingTimer = setInterval(() => {

        if (i < text.length) {
            dialogueText.textContent += text[i];
            i++;
        } else {
            clearInterval(typingTimer);
            isTyping = false;

            setTimeout(() => {
                canAdvance = true;
            }, CONFIG.afterLineDelay);
        }

    }, CONFIG.textSpeed);
}

/* ============================= */
/*           推進系統            */
/* ============================= */

function advance() {

    // 強制完成
    if (isTyping) {
        clearInterval(typingTimer);
        dialogueText.textContent = currentFullText;
        isTyping = false;

        setTimeout(() => {
            canAdvance = true;
        }, CONFIG.afterLineDelay);

        return;
    }

    if (!canAdvance) return;

    localStorage.setItem("VL_SAVE", currentIndex);

    currentIndex++;
    processLine();
}
