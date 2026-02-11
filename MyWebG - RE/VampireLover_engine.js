let storyLines = [];
let currentLine = 0;
let typing = false;
let currentName = '';

/* ========= DOM ========= */
const menu = document.getElementById('menu');
const newGameBtn = document.getElementById('newGameBtn');
const loadGameBtn = document.getElementById('loadGameBtn');

const bgLayer = document.getElementById('bgLayer');
const charaLayer = document.getElementById('charaLayer');

const narrationBox = document.getElementById('narrationBox');
const dialogBox = document.getElementById('dialogBox');
const nameTag = document.getElementById('nameTag');
const dialogText = document.getElementById('dialogText');

/* ========= Audio（安全載入） ========= */
const bgmAudio = new Audio();
bgmAudio.src = config.bgmFolder + 'calm.mp3';
bgmAudio.loop = true;

const clickAudio = new Audio();
clickAudio.src = config.seFolder + 'click.wav';


/* ========= 工具 ========= */
const sleep = ms => new Promise(r => setTimeout(r, ms));


async function typeTextTo(el, text){
    typing = true;
    el.textContent = '';

    for(let c of text){
        el.textContent += c;
        await sleep(25);
    }

    typing = false;
}


/* ========= 讀取txt ========= */
async function loadStory(file){
    const res = await fetch(config.storyFolder + file);
    const txt = await res.text();

    storyLines = txt.split('\n');
    currentLine = 0;
}


/* ========= 主解析 ========= */
async function showLine(){

    if(currentLine >= storyLines.length) return;

    let line = storyLines[currentLine].trim();


    /* ::scene label 不顯示 */
    if(line.startsWith('::')){
        currentLine++;
        return showLine();
    }


    /* wait */
    if(line.startsWith('[wait')){
        const t = parseInt(line.match(/\d+/)[0]);
        currentLine++;
        await sleep(t);
        return showLine();
    }


    /* jump */
    if(line.startsWith('[jump')){
        const target = line.match(/\s(\w+)/)[1];
        currentLine = storyLines.findIndex(l => l.trim() === `::${target}`);
        return showLine();
    }


    /* bg */
    if(line.startsWith('[bg')){
        const file = line.match(/bg\s+([\w\.\-_]+)/)[1];
        bgLayer.style.backgroundImage = `url('${config.bgFolder + file}')`;
        currentLine++;
        return showLine();
    }


    /* chara */
    if(line.startsWith('[chara')){
        const m = line.match(/\[chara\s+center\s+(\w+)\s+(\w+)/);
        if(m){
            const file = `${m[1]}_${m[2]}.png`;
            charaLayer.innerHTML = `<img src="${config.charaFolder + file}">`;
        }
        currentLine++;
        return showLine();
    }


    /* name */
    if(line.startsWith('[name')){
        currentName = line.replace('[name','').replace(']','').trim();
        currentLine++;
        return showLine();
    }


    /* ===== 顯示文字 ===== */
    narrationBox.style.display = 'none';
    dialogBox.style.display = 'none';

    if(currentName){
        dialogBox.style.display = 'block';
        nameTag.textContent = currentName;
        await typeTextTo(dialogText, line);
    }else{
        narrationBox.style.display = 'block';
        await typeTextTo(narrationBox, line);
    }

    /* 自動存檔 */
    localStorage.setItem('line', currentLine);

    currentLine++;
}


/* ========= 點擊前進 ========= */
document.getElementById('gameContainer').addEventListener('click', async ()=>{

    clickAudio.currentTime = 0;
    clickAudio.play().catch(()=>{});

    if(typing){
        typing = false;
        return;
    }

    await showLine();
});


/* ========= 新遊戲 ========= */
newGameBtn.onclick = async ()=>{
    menu.style.display = 'none';

    await loadStory(config.initialChapter);

    bgmAudio.play().catch(()=>{});

    showLine();
};


/* ========= 讀檔 ========= */
loadGameBtn.onclick = async ()=>{
    menu.style.display = 'none';

    await loadStory(config.initialChapter);

    currentLine = parseInt(localStorage.getItem('line')) || 0;

    bgmAudio.play().catch(()=>{});

    showLine();
};
