let storyLines = [];
let currentIndex = 0;
let displayMode = "dialogue"; 

let isTyping = false;
let canAdvance = false;
let typingTimer = null;
let currentFullText = "";
let isProcessingLine = false;
let isCenterMode = false;

let currentLabel = "";

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

document.getElementById("game-container")
    .addEventListener("click", advance);
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
        currentLabel = label;
        currentIndex = target + 1;
        processLine();
    }
}

async function processLine() {

    if (isProcessingLine) return; // 正在處理中就不再進入
    isProcessingLine = true;

    if (currentIndex >= storyLines.length) {
        isProcessingLine = false;
        return;
    }

    let rawLine = storyLines[currentIndex];
    if (!rawLine || rawLine.trim() === "") {
        currentIndex++;
        isProcessingLine = false;
        processLine();
        return;
    }

    let line = rawLine.trim();

    /* ---- 區塊標籤 ---- */
    if (line.startsWith("::")) {
        currentLabel = line.replace("::", "");
        currentIndex++;
        isProcessingLine = false;
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
        isProcessingLine = false;
        setTimeout(processLine, time);
        return;
    }

    /* ---- 跳轉 ---- */
    if (line.startsWith("[jump")) {
        let label = line.match(/\[jump (.+?)\]/)[1];
        isProcessingLine = false;
        jumpTo(label);
        return;
    }

    /* ---- 顯示模式切換 ---- */
    if (line.startsWith("[mode")) {
        const match = line.match(/\[mode (.+?)\]/);
        if (match) {
            displayMode = match[1];
        }

        currentIndex++;  // 先跳到下一行，不立即 processLine
        isProcessingLine = false;
        return;
    }

    /* ---- 中央敘事區塊 ---- */
    if (line === "[center]") {

        isCenterMode = true;

        currentIndex++;

        let blockText = "";

        while (currentIndex < storyLines.length &&
            storyLines[currentIndex].trim() !== "[/center]") {

        blockText += storyLines[currentIndex] + "\n";
        currentIndex++;
    }

        // 跳過 [/center]
        currentIndex++;

        showCenterText(blockText.trim());

        isProcessingLine = false;
        return;
    }

    /* ---- 名字 ---- */
    if (line.startsWith("[name")) {
        let match = line.match(/\[name\s*(.*?)\]/); // 用正則抓名字
        let name = match ? match[1] : "";           // 如果沒有，給空字串
        nameTag.textContent = name; // 空名字也正常
        currentIndex++;
        isProcessingLine = false;
        processLine();
        return;
    }

    /* ---- 角色 ---- */
    if (line.startsWith("[chara")) {
        handleChara(line);
        currentIndex++;
        isProcessingLine = false;
        processLine();
        return;
    }

    /* ---- 只處理純文字，不是 [xxx] 標籤 ---- */

    if (!line.startsWith("[") && line.length > 0) {

        if (displayMode === "center") {
           showCenterText(line);
        } else {
           showText(line);
        }

        isProcessingLine = false;
        return;
    }

    currentIndex++;
    isProcessingLine = false;
    processLine();
}

/* ============================= */
/*           背景處理            */
/* ============================= */

async function handleBG(line) {

    const match = line.match(/\[bg (.+?) (fade in|fade out)\]/);
    if (!match) return;

    const file = match[1];
    const action = match[2];

    if (action === "fade in") {

        bgLayer.style.transition = "opacity 1s";
        bgLayer.style.opacity = 0;
        bgLayer.style.backgroundImage = `url(${CONFIG.assets.bg}${file})`;

        await wait(50);
        bgLayer.style.opacity = 1;

        await wait(1000); // 等淡入完成
    }

    if (action === "fade out") {

        bgLayer.style.transition = "opacity 1s";
        bgLayer.style.opacity = 0;

        await wait(1000);
    }

    currentIndex++;
    isProcessingLine = false;
    processLine();
}


/* ---- 共用wait函式 ---- */

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ============================= */
/*           角色處理            */
/* ============================= */

async function handleChara(line) {

    const match = line.match(/\[chara (left|center|right) (.+?) (fade in|fade out)\]/);
    if (!match) return;

    const position = match[1];
    const imgName = match[2].replaceAll(" ", "_") + ".png"; // 替換所有空格
    const action = match[3];

    if (action === "fade in") {
        const img = document.createElement("img");   // 先建立元素
        img.src = CONFIG.assets.chara + imgName;     // 再設定 src
        img.className = "chara-pos-" + position;
        img.style.opacity = 0;
        charaLayer.appendChild(img);

        setTimeout(() => { img.style.opacity = 1; }, 50);
}

    if (action === "fade out") {
        const img = charaLayer.querySelector("img");
        if (img) {
            img.style.opacity = 0;
            await wait(800);
            charaLayer.innerHTML = "";
        }
    }
}

/* ============================= */
/*           中央敘事            */
/* ============================= */

async function showCenterText(text) {

    dialogueBox.classList.add("hidden");

    centerBox.classList.remove("hidden");
    centerBox.style.opacity = 1;

    currentFullText = text;
    centerText.textContent = "";

    isTyping = true;
    canAdvance = false;

    let i = 0;

    typingTimer = setInterval(() => {
        centerText.textContent += text[i];
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


async function typeCenterText(text) {

    centerText.textContent = "";
    isTyping = true;
    canAdvance = false;

    for (let i = 0; i < text.length; i++) {
        centerText.textContent += text[i];
        await wait(CONFIG.textSpeed);
    }

    isTyping = false;
}

/* ============================= */
/*           打字系統            */
/* ============================= */

function showText(text) {

    if (isTyping) return; // 避免重複呼叫

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
                canAdvance = true; // 完成後直接允許點擊
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

        if (isCenterMode) {
            centerText.textContent = currentFullText;
        }

        isTyping = false;

        setTimeout(() => {
            canAdvance = true;
        }, CONFIG.afterLineDelay);

        return;
    }

    if (!centerBox.classList.contains("hidden")) {

        centerBox.style.opacity = 0;

        setTimeout(() => {
            centerBox.classList.add("hidden");
            canAdvance = false;
            processLine();
        }, 800);

        return;
    }

    // 如果不能推進，就直接結束函數
    if (!canAdvance) {
        return;
    }

    // center淡出邏輯
    if (isCenterMode && canAdvance) {

        centerBox.style.opacity = 0;

        setTimeout(() => {
            centerBox.classList.add("hidden");
            isCenterMode = false;
            canAdvance = false;
            currentIndex++;
            processLine();
        }, 800);

        return;
    }

    // 可以推進時，存檔並處理下一行
    localStorage.setItem("VL_SAVE", currentIndex);

    canAdvance = false;
    currentIndex++;
    processLine();
}