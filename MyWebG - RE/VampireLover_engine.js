const Game = {

    script: [],
    labels: {},
    index: 0,

    isTyping:false,
    timer:null,
    mode:"dialogue",

    SAVE_KEY:"VL_SAVE",

    init(){

        const c = document.getElementById("game-container");

        btn-newgame.onclick=()=>this.startNew();
        btn-loadgame.onclick=()=>this.load();

        c.addEventListener("pointerdown",()=>{
            if(title-screen.classList.contains("hidden"))
                this.next();
        });
    },

    async startNew(){
        localStorage.removeItem(this.SAVE_KEY);
        title-screen.classList.add("hidden");
        await this.loadScript("VL_Chapter1.txt");
        this.black();
        this.next();
    },

    async load(){

        const s=localStorage.getItem(this.SAVE_KEY);
        if(!s) return alert("沒有存檔");

        const d=JSON.parse(s);

        title-screen.classList.add("hidden");

        await this.loadScript(d.file);

        this.index=d.index;
        this.next();
    },

    save(file="VL_Chapter1.txt"){
        localStorage.setItem(this.SAVE_KEY,JSON.stringify({
            file,index:this.index
        }));
    },

    black(){
        bg-layer.style.backgroundImage=`url(${CONFIG.assets.bg}black.png)`;
    },

    async loadScript(file){

        const t=await (await fetch(CONFIG.storyPath+file)).text();

        this.script=t.split(/\r?\n/);

        this.labels={};

        this.script.forEach((l,i)=>{
            if(l.startsWith("::"))
                this.labels[l.replace("::","").trim()]=i;
        });

        this.index=0;
    },

    next(){

        if(this.isTyping){
            this.finish();
            return;
        }

        if(this.index>=this.script.length) return;

        let line=this.script[this.index++].trim();

        if(!line){ this.next(); return; }

        if(line.startsWith("::")){
            this.mode=line==="::intro"?"center":"dialogue";
            this.next();
            return;
        }

        if(line.startsWith("[")){
            this.command(line);
            return;
        }

        this.text(line);
        this.save();
    },

    //--------------------------------
    // 指令解析
    //--------------------------------

    command(raw){

        const p=raw.slice(1,-1).split(" ");

        const cmd=p[0];

        switch(cmd){

            case "bg":
                this.bg(p);
                break;

            case "chara":
                this.chara(p);
                break;

            case "name":
                name-tag.innerText=p.slice(1).join(" ");
                break;

            case "wait":
                setTimeout(()=>this.next(),Number(p[1]));
                break;

            case "jump":
                this.index=this.labels[p[1]]+1;
                break;
        }

        this.next();
    },

    //--------------------------------
    // 背景
    //--------------------------------
    bg(p){

        const img=p[1];
        const fade=p.includes("fade");

        if(fade) bg-layer.style.opacity=0;

        bg-layer.style.backgroundImage=
            `url(${CONFIG.assets.bg+img})`;

        if(fade)
            setTimeout(()=>bg-layer.style.opacity=1,50);
    },

    //--------------------------------
    // 角色
    //--------------------------------
    chara(p){

        const pos=p[1];
        const name=p[2];
        const pose=p[3];
        const fade=p.includes("fade");
        const out=p.includes("out");

        if(out){
            document.querySelectorAll(`.${pos}`)
                .forEach(e=>e.remove());
            return;
        }

        const img=document.createElement("img");

        img.src=`${CONFIG.assets.chara}${name}_${pose}.png`;
        img.className=`chara ${pos}`;

        chara-layer.appendChild(img);

        if(fade)
            setTimeout(()=>img.style.opacity=1,50);
        else
            img.style.opacity=1;
    },

    //--------------------------------
    // 文字
    //--------------------------------
    text(t){

        this.isTyping=true;

        const el=
            this.mode==="center"
                ? center-text
                : dialogue-text;

        center-box.classList.toggle("hidden",this.mode!=="center");
        dialogue-box.classList.toggle("hidden",this.mode!=="dialogue");

        el.innerHTML="";

        let i=0;

        this.timer=setInterval(()=>{
            if(i<t.length){
                el.innerHTML+=t[i++];
            }else this.finish();
        },22);
    },

    finish(){
        clearInterval(this.timer);
        this.isTyping=false;
    }

};

window.onload=()=>Game.init();
