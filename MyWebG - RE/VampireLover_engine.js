let storyLines = [];
let currentIndex = 0;
let displayMode = "dialogue"; 

let isTyping = false;
let inputLocked = false;
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
    setTimeout(processLine, 0);
}

async function loadStory(file) {
    try {
        // 加上防呆：檢查 CONFIG 是否存在
        if (typeof CONFIG === 'undefined') {
            throw new Error("找不到 CONFIG 設定，請檢查 config.js 是否正確載入");
        }

        const fullPath = CONFIG.storyPath + file;
        console.log("正在嘗試讀取路徑：", fullPath); // 方便你在控制台檢查路徑對不對

        const res = await fetch(fullPath);

        if (!res.ok) {
            throw new Error(`伺服器回應錯誤 (${res.status})。請確認檔案是否存在於：${fullPath}`);
        }

        const text = await res.text();
        // 使用正則拆分換行，相容不同系統的換行符 (\r\n 或 \n)
        storyLines = text.split(/\r?\n/);
        
        console.log("劇情載入成功，總行數：", storyLines.length);

    } catch (err) {
        console.error("劇情讀取錯誤詳情：", err);
        alert(`【系統錯誤】\n${err.message}\n\n請打開 F12 控制台查看詳細內容。`);
    }
}

/* ============================= */
/*           劇情解析            */
/* ============================= */

function jumpTo(label) {
    const target = storyLines.findIndex(l => l.trim() === "::" + label);
    if (target !== -1) {
        currentLabel = label;
        currentIndex = target + 1;
        setTimeout(processLine, 0);
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
        setTimeout(processLine, 0);

        return;
    }

    let line = rawLine.trim();

    /* ---- 區塊標籤 ---- */
    if (line.startsWith("::")) {
        currentLabel = line.replace("::", "");
        currentIndex++;
        isProcessingLine = false;
        setTimeout(processLine, 0);

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
        inputLocked = true;   // 鎖住輸入
        canAdvance = false;
        currentIndex++;
        isProcessingLine = false;
        setTimeout(() => {
            inputLocked = false;   // 解鎖
            processLine();
        }, time);
        return;
    }

    /* ---- 跳轉 ---- */
    if (line.startsWith("[jump")) {
        let label = line.match(/\[jump (.+?)\]/)[1];

        await fadeOutDialogue();

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

        // ⭐ 重置中心模式
        isCenterMode = false;
        centerBox.classList.add("hidden");
        centerBox.style.opacity = 0;
        await wait(1000);
        currentIndex++;  // 先跳到下一行，不立即 processLine
        isProcessingLine = false;
        setTimeout(processLine, 0);
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
        setTimeout(processLine, 0);

        return;
    }

    /* ---- 角色 ---- */
    if (line.startsWith("[chara")) {
        handleChara(line);
        currentIndex++;
        isProcessingLine = false;
        setTimeout(processLine, 0);

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

    /* ---- 控制dialogue淡入淡出 ---- */

    if (line.startsWith("[dialogueFade")) {

        const match = line.match(/\[dialogueFade (on|off)\]/);

        if (match) {
            CONFIG.enableDialogueFade = match[1] === "on";
        }

        currentIndex++;
        isProcessingLine = false;
        setTimeout(processLine, 0);
        return;
    }

    showText(line);
    currentIndex++;
    isProcessingLine = false;
    setTimeout(processLine, 0);

}

/* ============================= */
/*           背景處理            */
/* ============================= */

async function handleBG(line) {

    const match = line.match(/\[bg (.+?) (fade in|fade out)\]/);
    if (!match) return;

    const file = match[1];
    const action = match[2];

    bgLayer.style.transition = `opacity ${CONFIG.bgFadeTime}ms`;

    if (action === "fade in") {

        bgLayer.style.opacity = 0;
        bgLayer.style.backgroundImage =
            `url(${CONFIG.assets.bg}${file})`;

        await wait(50);
        bgLayer.style.opacity = 1;

        await wait(CONFIG.bgFadeTime);
    }

    if (action === "fade out") {

        bgLayer.style.opacity = 0;
        await wait(CONFIG.bgFadeTime);
    }

    currentIndex++;
    isProcessingLine = false;
    setTimeout(processLine, 0);
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

        img.style.transition = `opacity ${CONFIG.charaFadeTime}ms`;
}

    if (action === "fade out") {
        const img = charaLayer.querySelector("img");
        if (img) {
            img.style.opacity = 0;
            await wait(CONFIG.charaFadeTime);
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
    fadeInDialogue();

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

/* 對話框淡入 */
async function fadeInDialogue() {
    dialogueBox.classList.remove("hidden");
    
    // 如果設定開啟淡入效果
    if (CONFIG.enableDialogueFade) {
        dialogueBox.style.transition = "opacity 0.5s";
        dialogueBox.style.opacity = 0;
        await wait(50); // 給瀏覽器一點時間反應
        dialogueBox.style.opacity = 1;
    } else {
        dialogueBox.style.opacity = 1;
    }
}

/* 對話框淡入淡出 */

async function fadeOutDialogue() {

    if (!CONFIG.enableDialogueFade) {
        dialogueBox.classList.add("hidden");
        return;
    }

    dialogueBox.style.opacity = 0;

    await wait(500);

    dialogueBox.classList.add("hidden");
    dialogueBox.style.opacity = 1; // 重置給下次用
}

/* ============================= */
/*           推進系統            */
/* ============================= */

function advance() {
    // 1. wait 期間禁止點擊
    if (inputLocked) return;

    // 2. 如果正在打字，強制完成打字
    if (isTyping) {
        clearInterval(typingTimer);
        if (isCenterMode) {
            centerText.textContent = currentFullText;
        } else {
            dialogueText.textContent = currentFullText;
        }
        isTyping = false;
        canAdvance = true;
        return;
    }

    // 3. 如果不能推進（例如打字還沒完），就直接結束
    if (!canAdvance) return;

    // 4. Center 模式的淡出邏輯
    if (isCenterMode) {
        centerBox.style.opacity = 0;
        setTimeout(() => {
            centerBox.classList.add("hidden");
            isCenterMode = false;
            canAdvance = false;
            currentIndex++;
            processLine(); // 直接呼叫處理下一行
        }, 800);
        return;
    }

    // 5. 一般對話模式：存檔並推進
    localStorage.setItem("VL_SAVE", currentIndex);
    canAdvance = false;
    currentIndex++;
    setTimeout(processLine, 0);
}