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
    startNewGame();
  };

  document.documentElement.style.setProperty("--fade-time", SAFE_CONFIG.fadeTime + "ms");

  setupScaling();
  window.addEventListener("resize", setupScaling);

  loadChapter("VL_Chapter1", "intro");
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

// ---------- 導演入口 ----------

function startNewGame() {
  fadeInBlack(() => {
    loadChapter("VL_Chapter1", "intro");
  });

  if (cmd === "[endIntro]") {
    fadeOutBlack(() => run("start"));
    return;
  }
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

    const isIntro = scene === "intro";

    if (isIntro) {
      hideTextbox();
      showOverlay();
      displayBox = overlayText;
      isOverlay = true;
    } else {
      showTextbox();
      hideOverlay();
      displayBox = dialogueBox;
      isOverlay = false;
    }

    if (i >= lines.length) {
      if (scene === "intro") {
        displayBox = document.getElementById("dialogue");
        isOverlay = false;
      }
        const overlay = document.getElementById("overlay");
        overlay.style.transition = "opacity 1s";
        overlay.style.opacity = 0;
        setTimeout(() => {
          overlay.style.display = "none";
          run("start");
        }, 1000);
      }
      return;
    }

    const line = lines[i++];

    if (line.startsWith("[")) {
      handleCommand(line, runNext);
      return;
    }

    if (line.startsWith(">")) {
      showChoices(lines.slice(i - 1));
      return;
    }

    let displayBox;
    let isOverlay = false;

    if (scene === "intro" || scene === "start") {
      displayBox = document.getElementById("overlay-text");
      displayBox.classList.add("center");

      isOverlay = true;
      const overlay = document.getElementById("overlay");
      overlay.style.display = "block";
      overlay.style.opacity = 0;
      overlay.style.transition = "opacity 1s";
      requestAnimationFrame(() => overlay.style.opacity = 1);
    } else {
      displayBox = document.getElementById("dialogue");
      displayBox.classList.remove("center");

      const overlay = document.getElementById("overlay");
      overlay.style.display = "none";
      overlay.style.opacity = 0;
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

// ---------- 處理指令 ----------
function handleCommand(cmd, runNext) {
  if (DEBUG) console.log("CMD:", cmd);

  const nameBox = document.getElementById("name");

  if (cmd === "[overlay show]") {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";
    overlay.style.opacity = 0;
    overlay.style.transition = "opacity 1s";
    requestAnimationFrame(() => overlay.style.opacity = 1);
    setTimeout(runNext, 50);
    return;
  }

  if (cmd === "[overlay off]") {
    const overlay = document.getElementById("overlay");
    overlay.style.transition = "opacity 1s";
    overlay.style.opacity = 0;
    setTimeout(() => {
      overlay.style.display = "none";
      runNext();
    }, 1000);
    return;
  }

  if (cmd === "[overlay out]") {
    hideOverlay();
    showTextbox();
    runNext();
  }

  if (cmd.startsWith("[jump")) {
    const target = cmd.replace("[jump", "").replace("]", "").trim();
    setTimeout(() => run(target), 50);
    return;
  }

  if (cmd.startsWith("[wait")) {
    const time = parseInt(cmd.replace(/\D/g, ""));
    setTimeout(runNext, time);
    return;
  }

  if (cmd.startsWith("[fade")) {
    const fade = document.getElementById("fade");
    if (cmd.includes("black in")) fade.style.opacity = 1;
    if (cmd.includes("black out")) fade.style.opacity = 0;
    setTimeout(runNext, SAFE_CONFIG.fadeTime);
    return;
  }

  if (cmd.startsWith("[blackBG")) {
    const bg = document.getElementById("blackBG");
    if (cmd.includes("black in")) bg.style.opacity = 1;
    if (cmd.includes("black out")) bg.style.opacity = 0;
    setTimeout(runNext, SAFE_CONFIG.fadeTime);
    return;
  }

  if (cmd.startsWith("[bg")) {
    const file = cmd.split(" ")[1];
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

  if (cmd.startsWith("[chara")) {
    const parts = cmd.replace("[", "").replace("]", "").split(" ");
    const name = parts[1];
    const pose = parts[2];
    const pos = parts[3];
    const fade = parts.includes("fade") ? parts[parts.length - 1] : "in";

    const img = charaSlots[pos];
    img.src = `assets/chara/${name}_${pose}.png`;
    img.style.transition = "opacity 0.5s";
    img.style.opacity = fade === "out" ? 0 : 1;
    return runNext();
  }

  if (cmd.startsWith("[name")) {
    const name = cmd.replace("[name", "").replace("]", "").trim();
    if (!name && SAFE_CONFIG.autoHideName) {
      nameBox.style.display = "none";
    } else {
      nameBox.style.display = "block";
      nameBox.innerText = name;
    }
    return runNext();
  }

  if (cmd.startsWith("[affection")) {
    const [_, chara, value] = cmd.replace("[", "").replace("]", "").split(" ");
    affection[chara] = (affection[chara] || 0) + parseInt(value);
    return runNext();
  }

  if (cmd.startsWith("[bgm")) {
    const bgm = document.getElementById("bgm");
    const file = cmd.split(" ")[1];
    if (cmd.includes("stop")) bgm.pause();
    else {
      bgm.src = `assets/bgm/${file}.mp3`;
      bgm.play();
    }
    return runNext();
  }

  if (cmd.startsWith("[se")) {
    const se = document.getElementById("se");
    const file = cmd.split(" ")[1];
    se.src = `assets/se/${file}.wav`;
    se.play();
    return runNext();
  }
}

// ---------- 顯示選項 ----------
function showChoices(lines) {
  const box = document.getElementById("choices");
  box.innerHTML = "";

  lines.forEach(l => {
    if (!l.startsWith(">")) return;

    let [text, rest] = l.replace(">", "").split("->");
    let [target, cond] = rest.split("?").map(s => s.trim());

    if (cond) {
      const [name, val] = cond.split(">=");
      if ((affection[name] || 0) < parseInt(val)) return;
    }

    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerText = text.trim();
    btn.onclick = () => run(target);
    box.appendChild(btn);
  });
}

// ---------- 打字 + 點擊觸發 ----------
const clickArea = document.getElementById("game");

function typeText(box, text, done, isOverlay) {
  box.innerText = "";
  let i = 0;
  let interval = null;
  let finished = false;

  function nextChar() {
    if (i < text.length) {
      box.innerText += text[i++];
    } else {
      clearInterval(interval);
      finished = true;
    }
  }

  interval = setInterval(nextChar, SAFE_CONFIG.textSpeed);

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

// ---------- 清除選項 ----------
function clearChoices() {
  document.getElementById("choices").innerHTML = "";
}
