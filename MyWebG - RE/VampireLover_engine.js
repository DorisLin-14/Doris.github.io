/* ===============================
   Vampire Lover VN Engine
================================ */

const bg = document.getElementById("bg");
const middleBox = document.getElementById("middleBox");
const dialogueBox = document.getElementById("dialogueBox");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");

const newGameBtn = document.getElementById("newGame");
const loadGameBtn = document.getElementById("loadGame");

/* ========= 音效 ========= */

const bgm = new Audio();
const se = new Audio();
bgm.loop = true;

/* ========= 角色層 ========= */

const charaLayer = {};
const charaPositions = ["left","center","right"];

charaPositions.forEach(pos=>{
  const img = document.createElement("img");
  img.className = "chara";
  img.style.position="absolute";
  img.style.bottom="0";
  img.style.width="40%";
  img.style.zIndex="2";
  img.style.opacity="0";

  if(pos==="left") img.style.left="0";
  if(pos==="center") img.style.left="30%";
  if(pos==="right") img.style.right="0";

  document.getElementById("game").appendChild(img);
  charaLayer[pos]=img;
});

/* ========= 狀態 ========= */

let lines=[];
let index=0;
let typing=false;
let auto=false;
let autoTimer=null;

/* ========= 打字機 ========= */

function typeWriter(text, cb){

  typing=true;
  textEl.innerText="";
  let i=0;

  function tick(){
    if(i<text.length){
      textEl.innerText+=text[i++];
      setTimeout(tick,18);
    }else{
      typing=false;
      cb && cb();
    }
  }

  tick();
}

/* ========= UI 切換 ========= */

function showMiddle(text){
  middleBox.classList.remove("hidden");
  dialogueBox.classList.add("hidden");
  middleBox.innerText=text;
}

function showDialogue(name,text){
  middleBox.classList.add("hidden");
  dialogueBox.classList.remove("hidden");

  nameEl.innerText=name;
  typeWriter(text);
}

/* ========= 讀取故事 ========= */

async function loadStory(file){
  const res = await fetch("story/"+file);
  const txt = await res.text();

  lines = txt.split("\n");
  index = 0;

  document.getElementById("menu").style.display="none";

  nextLine();
}

/* ========= 主流程 ========= */

function nextLine(){

  if(typing){
    typing=false;
    textEl.innerText=currentFullText;
    return;
  }

  if(index>=lines.length) return;

  let line = lines[index++].trim();

  if(!line) return nextLine();

  parseLine(line);
}

/* ========= 解析 ========= */

let currentFullText="";

function parseLine(line){

  // :: 區段標籤
  if(line.startsWith("::")) return nextLine();

  // 指令
  if(line.startsWith("[")){
    runCommand(line);
    return;
  }

  // 普通文字
  currentFullText=line;
  showMiddle(line);
}

/* ========= 指令系統 ========= */

function runCommand(cmd){

  /* wait */
  if(cmd.includes("wait")){
    let t=cmd.match(/\d+/)[0];
    setTimeout(nextLine,t);
    return;
  }

  /* 背景 */
  if(cmd.includes("bg")){
    const file=cmd.split(" ")[1];

    bg.style.opacity=0;

    setTimeout(()=>{
      bg.src="assets/bg/"+file;
      bg.style.transition="opacity 0.6s";
      bg.style.opacity=1;
    },50);

    return nextLine();
  }

  /* 名字 */
  if(cmd.includes("name")){
    let name=cmd.replace("[name","").replace("]","").trim();

    let text = lines[index++] || "";

    currentFullText=text;
    showDialogue(name,text);
    return;
  }

  /* 角色 */
  if(cmd.includes("chara")){
    const parts=cmd.replace("[","").replace("]","").split(" ");
    const pos=parts[1];
    const name=parts[2];
    const state=parts[3];

    const img=charaLayer[pos];

    img.src=`assets/chara/${name}_${state}.png`;
    img.style.transition="opacity .4s";

    if(cmd.includes("fade out")){
      img.style.opacity=0;
    }else{
      img.style.opacity=1;
    }

    return nextLine();
  }

  /* BGM */
  if(cmd.includes("bgm")){
    const file=cmd.split(" ")[1];
    bgm.src="assets/bgm/"+file;
    bgm.play();
    return nextLine();
  }

  /* SE */
  if(cmd.includes("se")){
    const file=cmd.split(" ")[1];
    se.src="assets/se/"+file;
    se.play();
    return nextLine();
  }

  /* choice 分歧 */
  if(cmd.includes("choice")){
    createChoice(cmd);
    return;
  }

  nextLine();
}

/* ========= 選項系統 ========= */

function createChoice(cmd){

  const data=cmd.replace("[choice ","").replace("]","");

  const list=data.split("|");

  const box=document.createElement("div");
  box.className="choiceBox";

  list.forEach(item=>{
    const [text,label]=item.split("->");

    const btn=document.createElement("button");
    btn.innerText=text;

    btn.onclick=()=>{
      box.remove();
      jumpTo(label.trim());
    }

    box.appendChild(btn);
  });

  document.getElementById("game").appendChild(box);
}

function jumpTo(label){
  index = lines.findIndex(l=>l.trim()==="::"+label);
  nextLine();
}

/* ========= 存檔 ========= */

function saveGame(){
  localStorage.setItem("vl_save",index);
}

function loadGame(){
  const s=localStorage.getItem("vl_save");
  if(!s) return;
  index=parseInt(s);
  nextLine();
}

/* ========= Auto Play ========= */

function toggleAuto(){

  auto=!auto;

  if(auto){
    autoTimer=setInterval(()=>nextLine(),1500);
  }else{
    clearInterval(autoTimer);
  }
}

/* ========= 快進 ========= */

document.addEventListener("keydown",e=>{
  if(e.key==="Control") nextLine();
});

/* ========= 點擊 ========= */

document.addEventListener("click",nextLine);

/* ========= 按鈕 ========= */

newGameBtn.onclick=()=>loadStory("VL_Chapter1.txt");
loadGameBtn.onclick=()=>loadGame();

/* ========= 全域存檔快捷鍵 ========= */

window.addEventListener("keydown",e=>{
  if(e.key==="s") saveGame();
});
