const $=s=>document.querySelector(s);
const img=$("#fuggler"), msgs=$("#messages"), input=$("#input"), form=$("#form"), thought=$("#thought");
let voice=true, trust=35, energy=72, curiosity=82, busy=false;

const replies=[
 ["bot","О... ты опять здесь. Ррр... Я, конечно, не ждал.","happy"],
 ["bot","Ммм. Интересный вопрос. Дай мне подумать... ррр.","idle"],
 ["bot","Не знаю. Но если узнаю первым — расскажу тебе. Наверное.","idle"],
 ["bot","Эй! Не смотри на меня так. Я маленький, но кусаюсь. Р-р-р!","angry"],
 ["bot","Секрет? Подойди ближе... Я тебе ничего не скажу. Хе-хе.","idle"]
];

function add(text,who="bot"){
 const d=document.createElement("div"); d.className="msg "+who;
 d.innerHTML=who==="bot"?`<b>Fuggler</b><br>${text}`:text;
 msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
}
function animate(state="idle"){
 img.classList.remove("talk","happy","angry","sleep");
 if(state==="happy") img.classList.add("happy");
 if(state==="angry") img.classList.add("angry");
 if(state==="talk") img.classList.add("talk");
 setTimeout(()=>img.classList.remove("happy","angry"),700);
}
function speak(text){
 if(!voice || !("speechSynthesis" in window)) return;
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text.replace(/р-р-р|ррр+/gi,"р-р-р"));
 u.lang="ru-RU"; u.rate=.88; u.pitch=1.32; u.volume=.95;
 const vs=speechSynthesis.getVoices();
 const ru=vs.find(v=>v.lang?.toLowerCase().startsWith("ru"));
 if(ru) u.voice=ru;
 u.onstart=()=>animate("talk"); u.onend=()=>animate("idle");
 speechSynthesis.speak(u);
}
function respond(text){
 let lower=text.toLowerCase(), r;
 if(lower.includes("привет")) r=["О, привет! Ррр... Я уже думал, ты потерялся.","happy"];
 else if(lower.includes("люблю")||lower.includes("обнять")) {trust=Math.min(100,trust+4);r=["Эй... не делай так внезапно. Ррр... ладно, иди сюда.","happy"]}
 else if(lower.includes("секрет")) {curiosity=Math.min(100,curiosity+3);r=["Ладно. Я иногда разговариваю сам с собой, когда тебя нет. Только никому.","idle"]}
 else if(lower.includes("как ты")) r=["Живой. Сытый. Немного сонный. И подозреваю, что ты пришёл меня гладить.","idle"];
 else r=[...replies[Math.floor(Math.random()*replies.length)].slice(1)];
 trust=Math.min(100,trust+(Math.random()<.45?1:0)); $("#trust").textContent=trust; $("#curiosity").textContent=curiosity;
 add(r[0]); thought.textContent=r[0].replace(/<[^>]+>/g,"").slice(0,70);
 speak(r[0]);
}
form.addEventListener("submit",e=>{e.preventDefault();if(busy||!input.value.trim())return;let t=input.value.trim();input.value="";add(t,"user");busy=true;setTimeout(()=>{respond(t);busy=false},450)});
document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{input.value=b.dataset.q;form.requestSubmit()});
$("#voiceToggle").onclick=()=>{voice=!voice;$("#voiceToggle").textContent=voice?"🔊 Голос: включён":"🔇 Голос: выключен";if(!voice)speechSynthesis.cancel()};
setInterval(()=>{const idle=["ррр...","Мне скучно.","Ты ещё здесь?","*зевает*","Хмм...","Я за тобой слежу 👀"];thought.textContent=idle[Math.floor(Math.random()*idle.length)]},18000);
