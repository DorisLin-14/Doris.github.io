let storyLines = [];
let currentLine = 0;
let typing = false;

const menu = document.getElementById('menu');
const newGameBtn = document.getElementById('newGameBtn');
const loadGameBtn = document.getElementById('loadGameBtn');

const bgLayer = document.getElementById('bgLayer');
const charaLayer = document.getElementById('charaLayer');
const narrationBox = document.getElementById('narrationBox');
const dialogBox = document.getElementById('dialogBox');
const nameTag = document.getElementById('nameTag');
const dialogText = document.getElementById('dialogText');

let currentName = '';

const bgmAudio = new Audio(config.bgmFolder + 'calm.mp3');
bgmAudio.loop = true;

const clickAudio = new Audio(config.seFolder + 'click.wav');

async function loadStory(chapterFile) {
    const response = await fetch(config.storyFolder + chapterFile);
    const text = await response.text();
    storyLines = text.split('\n').filter(line => line.trim() !== '');
    currentLine = 0;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function showLine(){

    if(currentLine >= storyLines.length) return;

    let line = storyLines[currentLine].trim();

    /* ========= ::scene 隱藏 ========= */
    if(line.startsWith('::')){
        currentLine++;
        showLine();
        return;
    }

    /* ========= wait ========= */
    if(line.startsWith('[wait')){
        const t = parseInt(line.match(/\d+/)[0]);
        currentLine++;
        await sleep(t);
        showLine();
        return;
    }

    /* ========= jump ========= */
    if(line.startsWith('[jump')){
        const target = line.match(/\s(\w+)/)[1];
        currentLine = storyLines.findIndex(l => l.trim() === `::${target}`);
        showLine();
        return;
    }

    /* ========= name ========= */
    if(line.startsWith('[name')){
        currentName = line.replace('[name','').replace(']','').trim();
        currentLine++;
        showLine();
        return;
    }

    /* ========= 顯示文字 ========= */
    narrationBox.style.display = 'none';
    dialogBox.style.display = 'none';

    if(currentName){ 
        // 對話框
        dialogBox.style.display = 'block';
        nameTag.textContent = currentName;
        await typeTextTo(dialogText, line);

    }else{
        // 旁白框
        narrationBox.style.display = 'block';
        await typeTextTo(narrationBox, line);
    }

    currentLine++;
}

// 逐字效果
async function typeText(line) {
    typing = true;
    textContent.textContent = '';
    for(let i=0; i<line.length; i++){
        textContent.textContent += line[i];
        await sleep(30); // 打字速度
    }
    typing = false;
}

// 解析 txt 指令
async function showLine() {
    if(currentLine >= storyLines.length) {
        textContent.textContent = '本章結束';
        return;
    }

    let line = storyLines[currentLine].trim();

    // 空行跳過
    if(line === '') {
        currentLine++;
        showLine();
        return;
    }

    // [wait 1500]
    if(line.startsWith('[wait')) {
        const time = parseInt(line.match(/\d+/)[0]);
        currentLine++;
        await sleep(time);
        showLine();
        return;
    }

    // [jump xxx]
    if(line.startsWith('[jump')) {
        const target = line.match(/\s(\w+)/)[1];
        currentLine = storyLines.findIndex(l => l.trim() === `::${target}`);
        showLine();
        return;
    }

    // [bg xxx fade in]
    if(line.startsWith('[bg')) {
        const bgFile = line.match(/bg\s+([\w\.\-_]+)/)[1];
        bgLayer.style.backgroundImage = `url('${config.bgFolder + bgFile}')`;
        currentLine++;
        showLine();
        return;
    }

    // [chara center Raph normal fade in]
    if(line.startsWith('[chara')) {
        const match = line.match(/\[chara\s+center\s+(\w+)\s+(\w+)/);
        if(match){
            const charaFile = match[1] + '_' + match[2] + '.png';
            charaLayer.innerHTML = `<img src="${config.charaFolder + charaFile}">`;
        }
        currentLine++;
        showLine();
        return;
    }

    // [name xxx] 或空名字
    if(line.startsWith('[name')) {
        currentLine++;
        line = storyLines[currentLine].trim();
    }

    // 顯示文字
    await typeText(line);

    // 存檔進度
    localStorage.setItem('chapter', 'VL_Chapter1.txt'); // 可擴展為多章
    localStorage.setItem('line', currentLine);
    currentLine++;
}

// 點擊畫面繼續
document.getElementById('gameContainer').addEventListener('click', async () => {
    clickAudio.currentTime = 0;
    clickAudio.play();
    if(typing) { // 若正在打字，直接顯示完整
        const fullLine = storyLines[currentLine-1];
        textContent.textContent = fullLine;
        typing = false;
    } else {
        await showLine();
    }
});

// 新遊戲
newGameBtn.addEventListener('click', async () => {
    menu.style.display = 'none';
    textBox.style.display = 'block';
    bgLayer.style.backgroundImage = ''; // 黑幕
    charaLayer.innerHTML = '';
    await loadStory(config.initialChapter);
    bgmAudio.play();
    showLine();
});

// 讀取存檔
loadGameBtn.addEventListener('click', async () => {
    menu.style.display = 'none';
    textBox.style.display = 'block';
    charaLayer.innerHTML = '';
    await loadStory(config.initialChapter);
    const savedLine = parseInt(localStorage.getItem('line')) || 0;
    currentLine = savedLine;
    bgmAudio.play();
    showLine();
});
