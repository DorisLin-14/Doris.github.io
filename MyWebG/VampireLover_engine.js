const DEBUG = true; // 全域開關，方便之後關閉

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

  loadChapter("VL_Chapter1", "intro");
};

document.documentElement.style.setProperty(
  "--fade-time",
  SAFE_CONFIG.fadeTime + "ms"
);

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
  let lines = story[scene];
  let i = 0;

  function runNext() {
    if (i >= lines.length) return;
    const line = lines[i++];

    if (line.startsWith("[")) {
      handleCommand(line, runNext);
    } 
    else if (line.startsWith(">")) {
      showChoices(lines.slice(i - 1));
    } 
    else {
      typeText(line, runNext);
    }
  }

  runNext();
}

function handleCommand(cmd, runNext) {
  if (DEBUG) console.log("CMD:", cmd);

  const nameBox = document.getElementById("name");

    if (cmd === "[overlay show]") {
    document.getElementById("overlay").style.display = "block";
  }
  
  if (cmd === "[overlay off]") {
    document.getElementById("overlay").style.display = "none";
  }

  if (cmd.startsWith("[jump")) {
    const target = cmd.replace("[jump", "").replace("]", "").trim();
    run(target);
  }

  if (cmd.startsWith("[wait")) {
    const time = parseInt(cmd.replace("[wait", "").replace("]", "").trim());
    setTimeout(() => {
      runNext();
    }, time);
    return; //
  }

  if (cmd.startsWith("[fade")) {
    const fade = document.getElementById("fade");
    if (cmd.includes("black in")) fade.style.opacity = 1;
    if (cmd.includes("black out")) fade.style.opacity = 0;
    runNext();
    return;
  }


  if (cmd.startsWith("[bg")) {
    const file = cmd.split(" ")[1];
    const bg = document.getElementById("background");
    bg.style.backgroundImage = `url(assets/bg/${file})`;
  }

  if (cmd.startsWith("[chara")) {
    const parts = cmd.replace("[", "").replace("]", "").split(" ");
    const name = parts[1];
    const pose = parts[2];
    const pos = parts[3];
    const fade = parts.includes("fade") ? parts[parts.length - 1] : "in";

    const img = charaSlots[pos];
    img.src = `assets/chara/${name}_${pose}.png`;
    img.style.opacity = fade === "out" ? 0 : 1;
  }

   if (cmd.startsWith("[name")) {
    const name = cmd.replace("[name", "").replace("]", "").trim();

    if (!name && SAFE_CONFIG.autoHideName) {
      nameBox.style.display = "none";
    } else {
      nameBox.style.display = "block";
      nameBox.innerText = name;
    }
  }

  if (cmd.startsWith("[affection")) {
    const [_, chara, value] = cmd.replace("[", "").replace("]", "").split(" ");
    affection[chara] = (affection[chara] || 0) + parseInt(value);
  }

  if (cmd.startsWith("[bgm")) {
    const bgm = document.getElementById("bgm");
    const file = cmd.split(" ")[1];
    if (cmd.includes("stop")) bgm.pause();
    else {
      bgm.src = `assets/bgm/${file}.mp3`;
      bgm.play();
    }
  }

  if (cmd.startsWith("[se")) {
    const se = document.getElementById("se");
    const file = cmd.split(" ")[1];
    se.src = `assets/se/${file}.wav`;
    se.play();
  }

  if (cmd.startsWith("[save")) {
    localStorage.setItem("vn_save", JSON.stringify({
      chapter: currentChapter,
      scene: currentScene,
      affection
    }));
  }

  if (cmd.startsWith("[load chapter")) {
    const [, , chapter, scene] = cmd.replace("[", "").replace("]", "").split(" ");
    loadChapter(chapter, scene);
  }

  if (cmd.startsWith("[load]")) {
    const data = JSON.parse(localStorage.getItem("vn_save"));
    if (data) {
      affection = data.affection;
      loadChapter(data.chapter, data.scene);
    }
  }
}

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

function typeText(text, done) {
  const box = document.getElementById("dialogue");
  box.innerText = "";
  let i = 0;

  const t = setInterval(() => {
    box.innerText += text[i++];
    if (i >= text.length) {
      clearInterval(t);
      setTimeout(done, SAFE_CONFIG.lineDelay);
    }
  }, SAFE_CONFIG.textSpeed);
}

function clearChoices() {
  document.getElementById("choices").innerHTML = "";
}
