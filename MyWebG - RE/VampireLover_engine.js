let storyLines = [];
let currentIndex = 0;
let isTyping = false;
let canAdvance = false;
let typingTimer = null;

const bgLayer = document.getElementById("bg-layer");
const charaLayer = document.getElementById("chara-layer");
const centerBox = document.getElementById("center-box");
const centerText = document.getElementById("center-text");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const nameTag = document.getElementById("name-tag");
const titleScreen = document.getElementById("title-screen");

document.getElementById("new-game").onclick = () => startGame();
document.getElementById("load-game").onclick = () => loadGame();

document.addEventListener("click", advance);
document.addEventListener("keydown", (e)=>{
    if(e.code === "Space") advance();
});

async function startGame(){
    titleScreen.classList.add("hidden");
    await loadStory("VL_Chapter1.txt");
    jumpTo("intro");
}

function loadGame(){
    let save = localStorage.getItem("VL_SAVE");
    if(save){
        currentIndex = parseInt(save);
        titleScreen.classList.add("hidden");
        loadStory("VL_Chapter1.txt").then(()=>{
            processLine();
        });
    }
}

async function loadStory(file){
    let res = await fetch(CONFIG.storyPath + file);
    let text = await res.text();
    storyLines = text.split("\n");
}

function jumpTo(label){
    currentIndex = storyLines.findIndex(l => l.trim() === "::" + label);
    processLine();
}

function processLine(){
    if(currentIndex >= storyLines.length) return;

    let line = storyLines[currentIndex].trim();

    if(line.startsWith("::")){
        currentIndex++;
        processLine();
        return;
    }

    if(line.startsWith("[bg")){
        handleBG(line);
        currentIndex++;
        return;
    }

    if(line.startsWith("[wait")){
        let time = parseInt(line.match(/\d+/)[0]);
        currentIndex++;
        setTimeout(processLine, time);
        return;
    }

    if(line.startsWith("[jump")){
        let label = line.split(" ")[1].replace("]","");
        jumpTo(label);
        return;
    }

    if(line.startsWith("[name")){
        let name = line.replace("[name","").replace("]","").trim();
        nameTag.textContent = name;
        currentIndex++;
        processLine();
        return;
    }

    if(line.startsWith("[chara")){
        handleChara(line);
        currentIndex++;
        return;
    }

    showText(line);
}

function handleBG(line){
    let parts = line.match(/\[bg (.+?) (fade in|fade out)\]/);
    if(!parts) return;

    let img = parts[1];
    let action = parts[2];

    if(action === "fade in"){
        bgLayer.style.backgroundImage = `url(${CONFIG.assets.bg}${img})`;
        bgLayer.style.opacity = 0;
        setTimeout(()=> bgLayer.style.opacity = 1, 50);
    } else {
        bgLayer.style.opacity = 0;
    }
}

function handleChara(line){
    let parts = line.match(/\[chara (left|center|right) (.+?) (fade in|fade out)\]/);
    if(!parts) return;

    let pos = parts[1];
    let name = parts[2].replace(" ","_") + ".png";
    let action = parts[3];

    if(action === "fade in"){
        let img = document.createElement("img");
        img.src = CONFIG.assets.chara + name;
        img.className = "chara-pos-" + pos;
        img.style.opacity = 0;
        charaLayer.appendChild(img);
        setTimeout(()=> img.style.opacity = 1,50);
    } else {
        charaLayer.innerHTML = "";
    }
}

function showText(text){

    dialogueBox.classList.remove("hidden");
    centerBox.classList.add("hidden");

    dialogueText.textContent = "";
    isTyping = true;
    canAdvance = false;

    let i = 0;

    typingTimer = setInterval(()=>{
        dialogueText.textContent += text[i];
        i++;
        if(i >= text.length){
            clearInterval(typingTimer);
            isTyping = false;
            setTimeout(()=> canAdvance = true, CONFIG.afterLineDelay);
        }
    }, CONFIG.textSpeed);
}

function advance(){

    if(isTyping){
        clearInterval(typingTimer);
        dialogueText.textContent = storyLines[currentIndex];
        isTyping = false;
        setTimeout(()=> canAdvance = true, CONFIG.afterLineDelay);
        return;
    }

    if(!canAdvance) return;

    localStorage.setItem("VL_SAVE", currentIndex);
    currentIndex++;
    processLine();
}
