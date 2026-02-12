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
        currentIndex++;
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
        let match = line.match(/\[name\s*(.*?)\]/); // 用正則抓名字
        let name = match ? match[1] : "";           // 如果沒有，給空字串
        nameTag.textContent = name;
        currentIndex++;
        processLine();
        return;
    }

    /* ---- 角色 ---- */
    if (line.startsWith("[chara")) {
        handleChara(line);
        currentIndex++;
        return;
    }

    /* ---- 只處理純文字，不是 [xxx] 標籤 ---- */

    if (!line.startsWith("[") && line.length > 0) {
        showText(line);
        return;
    } else {

        // 如果是其他標籤但未被捕捉，跳過
        currentIndex++;
        processLine();
    }


/* ============================= */
/*           背景處理            */
/* ============================= */

function handleBG(line) {

    const match = line.match(/\[bg (.+?) (fade in|fade out)\]/);
    if (!match) return;

    const file = match[1];
    const action = match[2];

    if (action === "fade in") {
        bgLayer.style.backgroundImage = `url(${CONFIG.assets.bg}${file})`;
        bgLayer.style.opacity = 0;

        setTimeout(() => {
            bgLayer.style.opacity = 1;

            // 如果是黑幕，等 3 秒再進下一行
            let delay = file.includes("black") ? 3000 : 0;
            setTimeout(() => {
                currentIndex++;
                processLine();
            }, delay);

        }, 50);
     } else {
        bgLayer.style.opacity = 0;
        currentIndex++;
        processLine();
    }

/* ============================= */
/*           角色處理            */
/* ============================= */

function handleChara(line) {

    const match = line.match(/\[chara (left|center|right) (.+?) (fade in|fade out)\]/);
    if (!match) return;

    const position = match[1];
    const imgName = match[2].replaceAll(" ", "_") + ".png"; // 替換所有空格
    const action = match[3];

    if (action === "fade in") {
        const img = document.createElement("img");
        img.src = CONFIG.assets.chara + name;
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

    currentFullText = text;

    centerBox.classList.add("hidden");
    dialogueBox.classList.remove("hidden");

    dialogueText.textContent = "";

    isTyping = true;
    canAdvance = false;

    let i = 0;

    typingTimer = setInterval(() => {
        dialogueText.textContent += text[i];
        i++;

        if (i >= text.length) {
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

    // 強制完成打字
    if (isTyping) {
        clearInterval(typingTimer);
        dialogueText.textContent = currentFullText;
        isTyping = false;

        setTimeout(() => {
            canAdvance = true;
        }, CONFIG.afterLineDelay);

        return;
    }

    // 如果不能推進，就直接結束函數
    if (!canAdvance) {
        return;
    }

    // 可以推進時，存檔並處理下一行
    localStorage.setItem("VL_SAVE", currentIndex);

    currentIndex++;
    processLine();
}