const DEBUG = true;

const SAFE_CONFIG = window.CONFIG || {
  textSpeed: 30,
  lineDelay: 300,
  fadeTime: 1000,
  autoHideName: true
};

console.log("ENGINE LOADED");

let story = {};
let currentScene = "";
let affection = {};
let currentChapter = "VL_Chapter1";
let charaSlots = {};

window.onload = () => {
  charaSlots = {
    left: document.getElementById("chara-left"),
    center: document.getElementById("chara-center"),
    right: document.getElementById("chara-right")
  };

  document.getElementById("new-game").onclick = () => {
    document.getElementById("title-screen").style.display = "none";
    fadeInBlack(() => loadChapter("VL_Chapter1", "intro"));
  };

  document.getElementById("load-game").onclick = () => {
    alert("讀檔功能暫未實作");
  };

  document.documentElement.style.setProperty("--fade-time", SAFE_CONFIG.fadeTime + "ms");

  setupScaling();
  window.addEventListener("resize", setupScaling);
};

// ---------- 自動比例縮放 ----------
function setupScaling() {
  const game = document.getElementById("game");
  const scale = Math.min(
    window.innerWidth / 960,
    window.innerHeight / 540
  );
  game.style.transform = `scale(${scale})`;
}

// ---------- 載入章節 ----------
function loadChapter(chapter, startScene) {
  currentChapter = chapter;
  fetch(`story/${chapter}.txt`)
    .then(r => {
      if (!r.ok) throw new Error("Story load failed");
      return r.text();
    })
    .then(text => {
      parseStory(text);
      run(startScene);
    })
    .catch(err => {
      console.error("讀取劇情失敗：", err);
      document.getElementById("dialogue").innerText =
        "【錯誤】無法載入劇情檔案";
    });
}

// ---------- 解析 txt ----------
function parseStory(text) {
  story = {};
  let key = "";

  text.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    if (line.startsWith("::")) {
      key = line.replace("::", "");
      story[key] = [];
    } else {
      story[key].push(line);
    }
  });
}

// ---------- 執行場景 ----------
function run(scene) {
  currentScene = scene;
  document.title = `VL: ${scene}`;

  if (!story[scene]) {
    console.error("Scene not found:", scene);
    document.getElementById("dialogue").innerText =
      `【錯誤】找不到場景: ${scene}`;
    return;
  }

  clearChoices();

  const lines = story[scene];
  let i = 0;

  function runNext() {
    if (i >= lines.length) return;

    const line = lines[i++];

    if (line.startsWith("[")) {
      handleCommand(line, runNext);
      return;
    }

    if (line.startsWith(">")) {
      showChoices(lines.slice(i - 1));
      return;
    }

    // 判斷 overlay 或對話框
    let displayBox;
    let isOverlay = false;

    if (scene === "intro") {
      displayBox = document.getElementById("overlay-text");
      isOverlay = true;
      showOverlay();
    } else {
      displayBox = document.getElementById("dialogue");
      hideOverlay();
      showTextbox();
    }

    typeText(displayBox, line, runNext, isOverlay);
  }

  runNext();
}

// ---------- 黑幕控制 ----------
function fadeInBlack(done) {
  const fade = document.getElementById("fade");
  fade.style.opacity = 1;
  setTimeout(done, SAFE_CONFIG.fadeTime);
}

function fadeOutBlack(done) {
  const fade = document.getElementById("fade");
  fade.style.opacity = 0;
  setTimeout(done, SAFE_CONFIG.fadeTime);
}

// ---------- Overlay / Textbox ----------
function showOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "block";
  overlay.style.opacity = 0;
  overlay.style.transition = "opacity 0.5s";
  requestAnimationFrame(() => overlay.style.opacity = 1);
}

function hideOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.style.transition = "opacity 0.5s";
  overlay.style.opacity = 0;
  setTimeout(() => overlay.style.display = "none", 500);
}

function showTextbox() {
  const textbox = document.getElementById("textbox");
  textbox.style.display = "block";
  textbox.style.opacity = 0;
  textbox.style.transition = "opacity 0.5s";
  requestAnimationFrame(() => textbox.style.opacity = 1);
}

// ---------- 處理指令 ----------
function handleCommand(cmd, runNext) {
  if (DEBUG) console.log("CMD:", cmd);

  const nameBox = document.getElementById("name");

  // overlay 指令
  if (cmd === "[overlay in]") { showOverlay(); setTimeout(runNext,50); return; }
  if (cmd === "[overlay out]") { hideOverlay(); setTimeout(runNext,50); return; }

  // blackBG
  if (cmd.startsWith("[blackBG")) {
    const bg = document.getElementById("blackBG");
    if (cmd.includes("black in")) bg.style.opacity = 1;
    if (cmd.includes("black out")) bg.style.opacity = 0;
    setTimeout(runNext, SAFE_CONFIG.fadeTime);
    return;
  }

  // 背景
  if (cmd.startsWith("[bg")) {
    const parts = cmd.split(" ");
    const file = parts[1];
    const bg = document.getElementById("background");
    bg.style.transition = "opacity 1s";
    bg.style.opacity = 0;
    setTimeout(() => {
      bg.style.backgroundImage = `url(assets/bg/${file})`;
      bg.style.opacity = 1;
      runNext();
    }, 300);
    return;
  }

  // 立繪
  if (cmd.startsWith("[chara")) {
    let pos = "center";
    if (cmd.startsWith("[chara-left")) pos = "left";
    else if (cmd.startsWith("[chara-center")) pos = "center";
    else if (cmd.startsWith("[chara-right")) pos = "right";

    const parts = cmd.replace("[","").replace("]","").split(" ");
    const name = parts[1];
    const pose = parts[2];
    const fade = parts.includes("fade") ? parts[parts.length-1] : "in";

    const img = charaSlots[pos];
    if (!img) { console.error("Invalid chara position:", pos); runNext(); return; }

    img.src = `assets/chara/${name}_${pose}.png`;
    img.style.transition = "opacity 0.5s";
    img.style.opacity = fade === "out" ? 0 : 1;
    setTimeout(runNext, 100);
    return;
  }

  // 名稱
  if (cmd.startsWith("[name")) {
    const name = cmd.replace("[name","").replace("]","").trim();
    if (!name && SAFE_CONFIG.autoHideName) nameBox.style.display = "none";
    else { nameBox.style.display = "block"; nameBox.innerText = name; }
    setTimeout(runNext,50);
    return;
  }

  // 跳轉
  if (cmd.startsWith("[jump")) {
    const target = cmd.replace("[jump","").replace("]","").trim();
    setTimeout(() => run(target),50);
    return;
  }

  // wait
  if (cmd.startsWith("[wait")) {
    const time = parseInt(cmd.replace(/\D/g,"")) || 500;
    setTimeout(runNext,time);
    return;
  }

  // bgm
  if (cmd.startsWith("[bgm")) {
    const parts = cmd.split(" ");
    const bgm = document.getElementById("bgm");
    if (parts[1] === "stop") bgm.pause();
    else { bgm.src = `assets/bgm/${parts[1]}.mp3`; bgm.play(); }
    setTimeout(runNext,50);
    return;
  }

  // se
  if (cmd.startsWith("[se")) {
    const parts = cmd.split(" ");
    const se = document.getElementById("se");
    se.src = `assets/se/${parts[1]}.wav`;
    se.play();
    setTimeout(runNext,50);
    return;
  }
}

// ---------- 打字效果 ----------
function typeText(box, text, done, isOverlay) {
  box.innerText = "";
  let i = 0;
  let finished = false;

  const interval = setInterval(() => {
    if (i < text.length) box.innerText += text[i++];
    else finished = true;
  }, SAFE_CONFIG.textSpeed);

  const element = isOverlay ? document.getElementById("overlay") : document.getElementById("textbox");

  function clickHandler() {
    if (!finished) {
      clearInterval(interval);
      box.innerText = text;
      finished = true;
    } else {
      element.removeEventListener("click", clickHandler);
      element.removeEventListener("touchstart", clickHandler);
      done();
    }
  }

  element.addEventListener("click", clickHandler);
  element.addEventListener("touchstart", clickHandler);
}

// ---------- 選項 ----------
function showChoices(lines) {
  const box = document.getElementById("choices");
  box.innerHTML = "";

  lines.forEach(l => {
    if (!l.startsWith(">")) return;

    let [text, rest] = l.replace(">","").split("->");
    let [target, cond] = rest.split("?").map(s => s.trim());

    if (cond) {
      const [name, val] = cond.split(">=");
      if ((affection[name]||0) < parseInt(val)) return;
    }

    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerText = text.trim();
    btn.onclick = () => run(target);
    box.appendChild(btn);
  });
}

function clearChoices() {
  document.getElementById("choices").innerHTML = "";
}
