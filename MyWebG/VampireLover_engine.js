/* =========================
   VampireLover Engine v1.0
   ========================= */

const DEBUG = true;

/* ---------- 安全設定 ---------- */
const CONFIG = window.CONFIG || {
  textSpeed: 30,
  fadeTime: 1000,
  autoHideName: true
};

/* ---------- 全域狀態 ---------- */
let story = {};
let currentScene = "";
let affection = {};
let currentChapter = "";
let charaSlots = {};

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);

/* =========================
   初始化
   ========================= */
window.onload = () => {
  if (DEBUG) console.log("ENGINE LOADED");

  charaSlots = {
    left: $("chara-left"),
    center: $("chara-center"),
    right: $("chara-right")
  };

  document.documentElement.style.setProperty(
    "--fade-time",
    CONFIG.fadeTime + "ms"
  );

  $("new-game").onclick = startNewGame;
  $("load-game").onclick = () => alert("讀檔尚未實裝");

  setupScaling();
  window.addEventListener("resize", setupScaling);
};

/* =========================
   畫面縮放
   ========================= */
function setupScaling() {
  const game = $("game");
  const scale = Math.min(
    window.innerWidth / 960,
    window.innerHeight / 540
  );
  game.style.transform = `scale(${scale})`;
}

/* =========================
   新遊戲
   ========================= */
function startNewGame() {
  $("title-screen").style.display = "none";
  fadeInBlack(() => {
    loadChapter("VL_Chapter1", "intro");
  });
}

/* =========================
   載入章節
   ========================= */
function loadChapter(chapter, startScene) {
  currentChapter = chapter;

  fetch(`story/${chapter}.txt`)
    .then(r => {
      if (!r.ok) throw new Error("Story load failed");
      return r.text();
    })
    .then(text => {
      parseStory(text);
      fadeOutBlack(() => runScene(startScene));
    })
    .catch(err => {
      console.error(err);
      $("dialogue").innerText = "【錯誤】無法載入劇情檔案";
    });
}

/* =========================
   解析 TXT
   ========================= */
function parseStory(text) {
  story = {};
  let key = "";

  text.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    if (line.startsWith("::")) {
      key = line.slice(2);
      story[key] = [];
    } else if (key) {
      story[key].push(line);
    }
  });
}

/* =========================
   執行場景
   ========================= */
function runScene(scene) {
  currentScene = scene;
  document.title = `VL: ${scene}`;

  if (!story[scene]) {
    $("dialogue").innerText = `【錯誤】找不到場景：${scene}`;
    return;
  }

  clearChoices();
  let i = 0;
  const lines = story[scene];

  const isIntro = scene === "intro";

  if (isIntro) {
    hideTextbox();
    showOverlay();
  } else {
    showTextbox();
    hideOverlay();
  }

  function next() {
    if (i >= lines.length) {
      if (scene === "intro") {
        fadeOutOverlay(() => runScene("start"));
      }
      return;
    }

    const line = lines[i++];

    if (line.startsWith("[")) {
      handleCommand(line, next);
      return;
    }

    if (line.startsWith(">")) {
      showChoices(lines.slice(i - 1));
      return;
    }

    const box = isIntro ? $("overlay-text") : $("dialogue");
    typeText(box, line, next, isIntro);
  }

  next();
}

/* =========================
   指令處理
   ========================= */
function handleCommand(cmd, next) {
  if (DEBUG) console.log("CMD:", cmd);

  /* overlay */
  if (cmd === "[overlay in]" || cmd === "[overlay show]") {
    showOverlay();
    return next();
  }

  if (cmd === "[overlay out]") {
    hideOverlay();
    return next();
  }

  /* jump */
  if (cmd.startsWith("[jump")) {
    const target = cmd.replace("[jump", "").replace("]", "").trim();
    return runScene(target);
  }

  /* wait */
  if (cmd.startsWith("[wait")) {
    const t = parseInt(cmd.replace(/\D/g, ""));
    return setTimeout(next, t);
  }

  /* blackBG */
  if (cmd.startsWith("[blackBG")) {
    const bg = $("blackBG");
    bg.style.opacity = cmd.includes("in") ? 1 : 0;
    return setTimeout(next, CONFIG.fadeTime);
  }

  /* bg */
  if (cmd.startsWith("[bg")) {
    const file = cmd.split(" ")[1];
    const bg = $("background");
    bg.style.opacity = 0;
    setTimeout(() => {
      bg.style.backgroundImage = `url(assets/bg/${file})`;
      bg.style.opacity = 1;
      next();
    }, 300);
    return;
  }

  /* chara */
  if (cmd.startsWith("[chara")) {
    const parts = cmd.replace(/[[]]/g, "").split(" ");
    const slot = parts[1];
    const name = parts[2];
    const pose = parts[3];
    const fade = parts.includes("out") ? 0 : 1;

    const img = charaSlots[slot];
    img.src = `assets/chara/${name}_${pose}.png`;
    img.style.opacity = fade;
    return next();
  }

  /* name */
  if (cmd.startsWith("[name")) {
    const n = cmd.replace("[name", "").replace("]", "").trim();
    if (!n && CONFIG.autoHideName) {
      $("name").style.display = "none";
    } else {
      $("name").style.display = "block";
      $("name").innerText = n;
    }
    return next();
  }

  next();
}

/* =========================
   Overlay / Textbox
   ========================= */
function showOverlay() {
  const o = $("overlay");
  o.style.display = "block";
  o.style.opacity = 1;
}

function hideOverlay() {
  const o = $("overlay");
  o.style.opacity = 0;
  setTimeout(() => (o.style.display = "none"), 500);
}

function fadeOutOverlay(done) {
  const o = $("overlay");
  o.style.opacity = 0;
  setTimeout(() => {
    o.style.display = "none";
    done();
  }, 1000);
}

function showTextbox() {
  $("textbox").style.display = "block";
}

function hideTextbox() {
  $("textbox").style.display = "none";
}

/* =========================
   打字效果
   ========================= */
function typeText(box, text, done, isOverlay) {
  box.innerText = "";
  let i = 0;
  let finished = false;

  const timer = setInterval(() => {
    box.innerText += text[i++] || "";
    if (i >= text.length) {
      clearInterval(timer);
      finished = true;
    }
  }, CONFIG.textSpeed);

  const area = isOverlay ? $("overlay") : $("textbox");

  const click = () => {
    if (!finished) {
      clearInterval(timer);
      box.innerText = text;
      finished = true;
    } else {
      area.removeEventListener("click", click);
      done();
    }
  };

  area.addEventListener("click", click);
}

/* =========================
   黑幕
   ========================= */
function fadeInBlack(done) {
  $("fade").style.opacity = 1;
  setTimeout(done, CONFIG.fadeTime);
}

function fadeOutBlack(done) {
  $("fade").style.opacity = 0;
  setTimeout(done, CONFIG.fadeTime);
}

/* =========================
   選項
   ========================= */
function showChoices(lines) {
  const box = $("choices");
  box.innerHTML = "";

  lines.forEach(l => {
    if (!l.startsWith(">")) return;
    const [text, target] = l.replace(">", "").split("->");
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerText = text.trim();
    btn.onclick = () => runScene(target.trim());
    box.appendChild(btn);
  });
}

function clearChoices() {
  $("choices").innerHTML = "";
}
